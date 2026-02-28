'use client';

/**
 * 피그마 통신 매니저
 * 브라우저에서 Supabase Realtime 또는 WebSocket으로 피그마 플러그인과 통신
 * 확장성: FigmaTransport 인터페이스로 통신 레이어 교체 가능
 */

import type {
  FigmaTransport,
  TransportConfig,
  TransportEvents,
  ConnectionStatus,
  FigmaCommand,
  FigmaCommandResult,
  ProgressUpdate,
  ScannedTextNode,
  ScannedImageNode,
  TextReplacement,
  TreeNode,
  CreateTreeResult,
  ExecuteCodeResult,
} from './types';

// ===== Supabase Realtime Transport =====

class SupabaseTransport implements FigmaTransport {
  private client: ReturnType<typeof import('@supabase/supabase-js').createClient> | null = null;
  private channel: ReturnType<NonNullable<typeof this.client>['channel']> | null = null;
  private status: ConnectionStatus = 'disconnected';
  private events: TransportEvents | null = null;
  private keepaliveTimer: ReturnType<typeof setInterval> | null = null;
  private channelName: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isReconnecting = false;
  private pendingRequests = new Map<string, {
    resolve: (result: FigmaCommandResult) => void;
    reject: (error: Error) => void;
    timer: ReturnType<typeof setTimeout>;
  }>();

  constructor(private config: { url: string; anonKey: string }) {}

  async connect(channelName: string, events: TransportEvents): Promise<void> {
    this.events = events;
    this.channelName = channelName;
    this.manualDisconnect = false;
    this.reconnectAttempts = 0;
    this.setStatus('connecting');

    try {
      const { createClient } = await import('@supabase/supabase-js');
      this.client = createClient(this.config.url, this.config.anonKey);
      await this.setupChannel(channelName);
    } catch (error) {
      this.setStatus('error');
      throw error;
    }
  }

  private async setupChannel(channelName: string): Promise<void> {
    if (this.channel && this.client) {
      this.client.removeChannel(this.channel);
    }

    this.channel = this.client!.channel(channelName, {
      config: { broadcast: { self: false } },
    });

    this.channel.on('broadcast', { event: 'figma-result' }, (payload) => {
      this.handleResult(payload.payload as FigmaCommandResult);
    });

    this.channel.on('broadcast', { event: 'figma-progress' }, (payload) => {
      if (this.events?.onProgress) {
        this.events.onProgress(payload.payload as ProgressUpdate);
      }
    });

    this.channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        this.setStatus('connected');
        this.reconnectAttempts = 0;
        this.isReconnecting = false;
        this.startKeepalive();
      } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        this.stopKeepalive();
        // 자동 재연결 시도
        this.attemptReconnect();
      }
    });
  }

  private reconnectResolvers: Array<() => void> = [];
  private manualDisconnect = false;

  private async attemptReconnect(): Promise<void> {
    if (this.isReconnecting || !this.channelName || this.manualDisconnect) return;
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.setStatus('error');
      this.events?.onError?.('Supabase channel: 재연결 실패 (최대 시도 초과)');
      this.reconnectResolvers.forEach(r => r());
      this.reconnectResolvers = [];
      return;
    }

    this.isReconnecting = true;
    this.reconnectAttempts++;
    const delay = Math.min(2000 * this.reconnectAttempts, 10000);

    this.setStatus('connecting');

    await new Promise(resolve => setTimeout(resolve, delay));

    try {
      await this.setupChannel(this.channelName);
      // 재연결 성공 → 대기 중인 호출자들 해제
      this.reconnectResolvers.forEach(r => r());
      this.reconnectResolvers = [];
    } catch {
      this.isReconnecting = false;
      this.attemptReconnect();
    }
  }

  /**
   * 연결이 끊겼으면 재연결 완료까지 대기 (최대 15초)
   * 이미 연결 중이면 그대로 반환
   */
  async waitForReconnect(timeoutMs = 15000): Promise<boolean> {
    if (this.status === 'connected') return true;
    if (this.manualDisconnect || !this.channelName) return false;

    // 재연결이 아직 시작 안 됐으면 시작
    if (!this.isReconnecting) {
      this.reconnectAttempts = 0;
      this.attemptReconnect();
    }

    return new Promise<boolean>((resolve) => {
      const timer = setTimeout(() => {
        resolve(this.status === 'connected');
      }, timeoutMs);

      this.reconnectResolvers.push(() => {
        clearTimeout(timer);
        resolve(this.status === 'connected');
      });
    });
  }

  async sendCommand(command: FigmaCommand, timeoutMs = 30000): Promise<FigmaCommandResult> {
    // 연결이 끊겼으면 재연결 시도 후 전송
    if (this.status !== 'connected') {
      const reconnected = await this.waitForReconnect();
      if (!reconnected) {
        throw new Error('피그마 연결이 끊어졌습니다. 연결 코드를 다시 생성해주세요.');
      }
    }
    if (!this.channel) {
      throw new Error('피그마 연결이 끊어졌습니다. 연결 코드를 다시 생성해주세요.');
    }

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingRequests.delete(command.id);
        reject(new Error('Command timed out: ' + command.command));
      }, timeoutMs);

      this.pendingRequests.set(command.id, { resolve, reject, timer });

      this.channel!.send({
        type: 'broadcast',
        event: 'figma-command',
        payload: {
          id: command.id,
          command: command.command,
          params: command.params,
        },
      });
    });
  }

  disconnect(): void {
    this.manualDisconnect = true;
    this.stopKeepalive();
    this.pendingRequests.forEach((req) => {
      clearTimeout(req.timer);
      req.reject(new Error('Disconnected'));
    });
    this.pendingRequests.clear();
    this.reconnectResolvers.forEach(r => r());
    this.reconnectResolvers = [];

    if (this.channel && this.client) {
      this.client.removeChannel(this.channel);
    }
    this.channel = null;
    this.client = null;
    this.setStatus('disconnected');
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  private startKeepalive(): void {
    this.stopKeepalive();
    // 5초마다 heartbeat를 보내서 채널 idle timeout 방지
    this.keepaliveTimer = setInterval(() => {
      if (this.channel && this.status === 'connected') {
        this.channel.send({
          type: 'broadcast',
          event: 'heartbeat',
          payload: { ts: Date.now() },
        }).catch(() => {
          // broadcast 전송 실패 → 연결이 끊긴 상태
          this.stopKeepalive();
          this.attemptReconnect();
        });
      }
    }, 5000);
  }

  private stopKeepalive(): void {
    if (this.keepaliveTimer) {
      clearInterval(this.keepaliveTimer);
      this.keepaliveTimer = null;
    }
  }

  private setStatus(status: ConnectionStatus): void {
    this.status = status;
    this.events?.onStatusChange?.(status);
  }

  private handleResult(result: FigmaCommandResult): void {
    const pending = this.pendingRequests.get(result.id);
    if (pending) {
      clearTimeout(pending.timer);
      this.pendingRequests.delete(result.id);

      if (result.error) {
        pending.reject(new Error(result.error));
      } else {
        pending.resolve(result);
      }
    }

    this.events?.onCommandResult?.(result.id, result);
  }
}

// ===== WebSocket Transport (Fallback) =====

class WebSocketTransport implements FigmaTransport {
  private socket: WebSocket | null = null;
  private status: ConnectionStatus = 'disconnected';
  private events: TransportEvents | null = null;
  private channelName: string | null = null;
  private pendingRequests = new Map<string, {
    resolve: (result: FigmaCommandResult) => void;
    reject: (error: Error) => void;
    timer: ReturnType<typeof setTimeout>;
  }>();

  constructor(private config: { host: string; port: number }) {}

  async connect(channelName: string, events: TransportEvents): Promise<void> {
    this.events = events;
    this.channelName = channelName;
    this.setStatus('connecting');

    return new Promise((resolve, reject) => {
      const wsUrl = `ws://${this.config.host}:${this.config.port}`;
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        this.socket!.send(JSON.stringify({ type: 'join', channel: channelName }));
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'system' && data.message?.result) {
            this.setStatus('connected');
            resolve();
          } else if (data.type === 'error') {
            this.setStatus('error');
            reject(new Error(data.message));
          }

          this.handleWsMessage(data);
        } catch {
          // ignore parse errors
        }
      };

      this.socket.onclose = () => {
        this.setStatus('disconnected');
      };

      this.socket.onerror = () => {
        this.setStatus('error');
        reject(new Error('WebSocket connection failed'));
      };
    });
  }

  async sendCommand(command: FigmaCommand, timeoutMs = 30000): Promise<FigmaCommandResult> {
    if (!this.socket || this.status !== 'connected') {
      throw new Error('Not connected to WebSocket');
    }

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingRequests.delete(command.id);
        reject(new Error('Command timed out: ' + command.command));
      }, timeoutMs);

      this.pendingRequests.set(command.id, { resolve, reject, timer });

      this.socket!.send(JSON.stringify({
        id: command.id,
        type: 'message',
        channel: this.channelName,
        message: {
          id: command.id,
          command: command.command,
          params: command.params,
        },
      }));
    });
  }

  disconnect(): void {
    this.pendingRequests.forEach((req) => {
      clearTimeout(req.timer);
      req.reject(new Error('Disconnected'));
    });
    this.pendingRequests.clear();

    if (this.socket) {
      this.socket.close();
    }
    this.socket = null;
    this.setStatus('disconnected');
  }

  getStatus(): ConnectionStatus {
    return this.status;
  }

  private setStatus(status: ConnectionStatus): void {
    this.status = status;
    this.events?.onStatusChange?.(status);
  }

  private handleWsMessage(payload: Record<string, unknown>): void {
    const data = payload.message as Record<string, unknown> | undefined;
    if (!data) return;

    const id = data.id as string;
    if (id && this.pendingRequests.has(id)) {
      const pending = this.pendingRequests.get(id)!;
      clearTimeout(pending.timer);
      this.pendingRequests.delete(id);

      if (data.error) {
        pending.reject(new Error(data.error as string));
      } else {
        pending.resolve({ id, result: data.result as Record<string, unknown> });
      }
    }
  }
}

// ===== FigmaManager: 커맨드 시퀀스 실행기 =====

export interface FigmaManagerEvents {
  onStatusChange?: (status: ConnectionStatus) => void;
  onProgress?: (progress: ProgressUpdate) => void;
  onError?: (error: string) => void;
}

export class FigmaManager {
  private transport: FigmaTransport | null = null;
  private nodeIdMap = new Map<string, string>();
  // 재연결용 설정 저장
  private savedConfig: TransportConfig | null = null;
  private savedChannel: string | null = null;
  private savedEvents: FigmaManagerEvents | null = null;

  createTransport(config: TransportConfig): FigmaTransport {
    if (config.type === 'supabase' && config.supabase) {
      return new SupabaseTransport(config.supabase);
    }
    if (config.type === 'websocket' && config.websocket) {
      return new WebSocketTransport(config.websocket);
    }
    throw new Error('Invalid transport config');
  }

  async connect(
    config: TransportConfig,
    channel: string,
    events: FigmaManagerEvents
  ): Promise<void> {
    // 재연결에 사용할 설정 저장
    this.savedConfig = config;
    this.savedChannel = channel;
    this.savedEvents = events;

    this.transport = this.createTransport(config);

    await this.transport.connect(channel, {
      onStatusChange: (status) => events.onStatusChange?.(status),
      onCommandResult: () => {},
      onProgress: (progress) => events.onProgress?.(progress),
      onError: (error) => events.onError?.(error),
    });
  }

  disconnect(): void {
    this.transport?.disconnect();
    this.transport = null;
    this.nodeIdMap.clear();
    this.savedConfig = null;
    this.savedChannel = null;
    this.savedEvents = null;
  }

  getStatus(): ConnectionStatus {
    return this.transport?.getStatus() ?? 'disconnected';
  }

  /**
   * 연결 상태를 확인하고, 끊겼으면 재연결을 시도한다.
   * - transport 레벨 재연결 대기 (Supabase 자체 reconnect)
   * - 그래도 안 되면 새 transport 생성 후 재연결
   * 수동 해제(disconnect) 했으면 재연결하지 않는다.
   */
  async ensureConnected(): Promise<void> {
    if (this.transport?.getStatus() === 'connected') return;

    // 저장된 설정이 없으면 재연결 불가
    if (!this.savedConfig || !this.savedChannel || !this.savedEvents) {
      throw new Error('피그마 연결이 끊어졌습니다. 연결 코드를 다시 생성해주세요.');
    }

    // 1단계: transport의 자체 재연결 대기 (Supabase reconnect)
    if (this.transport && 'waitForReconnect' in this.transport) {
      const reconnected = await (this.transport as SupabaseTransport).waitForReconnect(10000);
      if (reconnected) {
        return;
      }
    }

    // 2단계: 새 transport 생성 후 재연결
    try {
      this.transport?.disconnect();
      this.transport = this.createTransport(this.savedConfig);

      await this.transport.connect(this.savedChannel, {
        onStatusChange: (status) => this.savedEvents!.onStatusChange?.(status),
        onCommandResult: () => {},
        onProgress: (progress) => this.savedEvents!.onProgress?.(progress),
        onError: (error) => this.savedEvents!.onError?.(error),
      });

    } catch (err) {
      console.error('[figma-manager] 재연결 실패:', err);
      throw new Error('피그마 연결이 끊어졌습니다. 연결 코드를 다시 생성해주세요.');
    }

    if (!this.transport) {
      throw new Error('피그마 연결이 끊어졌습니다. 연결 코드를 다시 생성해주세요.');
    }
  }

  /** ensureConnected 이후 안전하게 transport를 반환 */
  private getTransport(): FigmaTransport {
    if (!this.transport) throw new Error('피그마 연결이 끊어졌습니다. 연결 코드를 다시 생성해주세요.');
    return this.transport;
  }

  /**
   * 커맨드 시퀀스를 순차 실행한다.
   * $cmd_xxx 형태의 참조를 실제 피그마 nodeId로 치환한다.
   */
  async executeCommands(
    commands: FigmaCommand[],
    onProgress?: (progress: ProgressUpdate) => void
  ): Promise<Map<string, string>> {
    await this.ensureConnected();

    this.nodeIdMap.clear();
    const total = commands.length;

    for (let i = 0; i < total; i++) {
      const cmd = commands[i];

      const resolvedParams = this.resolveReferences(cmd.params);

      const resolvedCommand: FigmaCommand = {
        ...cmd,
        params: resolvedParams,
      };

      onProgress?.({
        step: cmd.group || 'executing',
        progress: Math.round(((i + 1) / total) * 100),
        detail: cmd.description || cmd.command,
        totalCommands: total,
        completedCommands: i + 1,
      });

      try {
        const result = await this.getTransport().sendCommand(resolvedCommand);

        if (result.result?.id) {
          this.nodeIdMap.set(cmd.id, result.result.id as string);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        // create_frame/create_text 등 노드 생성 실패는 치명적 → 중단
        // 스타일/레이아웃 설정 실패는 건너뛰고 계속 진행
        const isCreateCommand = cmd.command.startsWith('create_');
        if (isCreateCommand) {
          onProgress?.({
            step: 'error',
            progress: Math.round(((i + 1) / total) * 100),
            detail: 'Error: ' + errorMessage,
            totalCommands: total,
            completedCommands: i,
          });
          throw error;
        }
        // 비치명적 에러: 건너뛰고 계속 진행
      }
    }

    return this.nodeIdMap;
  }

  /**
   * 피그마에서 현재 선택된 노드의 ID를 가져온다.
   */
  async getSelectionId(): Promise<string | null> {
    const ids = await this.getSelectionIds();
    return ids.length > 0 ? ids[0] : null;
  }

  /**
   * 피그마에서 현재 선택된 모든 노드의 ID를 가져온다.
   */
  async getSelectionIds(): Promise<string[]> {
    const info = await this.getSelectionInfo();
    return info.map(s => s.id);
  }

  /**
   * 피그마에서 현재 선택된 모든 노드의 ID + 위치/크기를 가져온다.
   */
  async getSelectionInfo(): Promise<Array<{ id: string; name: string; x: number; y: number; width: number; height: number }>> {
    await this.ensureConnected();

    const result = await this.getTransport().sendCommand({
      id: `sel_${Date.now()}`,
      command: 'get_selection',
      params: {},
    });

    const selection = result.result?.selection as Array<{
      id: string; name: string; x: number; y: number; width: number; height: number;
    }> | undefined;
    if (!selection || selection.length === 0) return [];
    return selection.map(s => ({
      id: s.id,
      name: s.name || '',
      x: s.x || 0,
      y: s.y || 0,
      width: s.width || 0,
      height: s.height || 0,
    }));
  }

  /**
   * 선택된 노드를 이미지(Base64)로 내보낸다.
   * scale: 큰 프레임은 0.1~0.2로 줄여서 내보낸다.
   */
  async exportNodeAsImage(nodeId: string, scale = 1): Promise<string> {
    await this.ensureConnected();

    const result = await this.getTransport().sendCommand(
      {
        id: `exp_${Date.now()}`,
        command: 'export_node_as_image',
        params: {
          nodeId,
          format: 'PNG',
          scale,
        },
      },
      120000, // 대형 프레임 내보내기는 시간이 오래 걸림
    );

    const imageData = result.result?.imageData as string | undefined;
    if (!imageData) {
      throw new Error('이미지 내보내기에 실패했습니다');
    }

    return imageData;
  }

  /**
   * 노드를 삭제한다.
   */
  async deleteNode(nodeId: string): Promise<void> {
    await this.ensureConnected();

    await this.getTransport().sendCommand({
      id: `del_${Date.now()}`,
      command: 'delete_node',
      params: { nodeId },
    });
  }

  /**
   * 캔버스에 새 루트 프레임을 생성한다.
   */
  async createRootFrame(
    name: string,
    width: number,
    x?: number,
    y?: number,
  ): Promise<string> {
    await this.ensureConnected();

    const result = await this.getTransport().sendCommand({
      id: `root_${Date.now()}`,
      command: 'create_frame',
      params: {
        name,
        width,
        height: 100,
        layoutMode: 'VERTICAL',
        primaryAxisAlignItems: 'MIN',
        counterAxisAlignItems: 'CENTER',
        layoutSizingHorizontal: 'FIXED',
        layoutSizingVertical: 'HUG',
        itemSpacing: 0,
        ...(x !== undefined && y !== undefined ? { x, y } : {}),
      },
    });

    if (!result.result?.id) {
      throw new Error('루트 프레임 생성에 실패했습니다');
    }

    return result.result.id as string;
  }

  /**
   * 노드를 복제하고 복제본 ID를 반환한다.
   * parentId를 지정하면 복제본이 해당 프레임 안으로 들어간다.
   */
  async cloneNode(
    nodeId: string,
    parentId?: string,
    offsetX?: number,
    offsetY?: number,
  ): Promise<{ id: string; name: string; width: number; height: number }> {
    await this.ensureConnected();

    const result = await this.getTransport().sendCommand({
      id: `clone_${Date.now()}`,
      command: 'clone_node',
      params: {
        nodeId,
        ...(parentId ? { parentId } : {}),
        ...(offsetX !== undefined && offsetY !== undefined ? { x: offsetX, y: offsetY } : {}),
      },
    });

    if (!result.result?.id) {
      throw new Error('노드 복제에 실패했습니다');
    }

    return {
      id: result.result.id as string,
      name: (result.result.name as string) || '',
      width: (result.result.width as number) || 0,
      height: (result.result.height as number) || 0,
    };
  }

  /**
   * 노드 하위의 모든 텍스트 노드를 스캔한다.
   * 대형 프레임은 시간이 오래 걸릴 수 있으므로 타임아웃을 길게 잡는다.
   */
  async scanTextNodes(nodeId: string): Promise<ScannedTextNode[]> {
    await this.ensureConnected();

    const result = await this.getTransport().sendCommand(
      {
        id: `scan_text_${Date.now()}`,
        command: 'scan_text_nodes',
        params: { nodeId, useChunking: false },
      },
      120000, // 2분 타임아웃 (대형 프레임은 오래 걸림)
    );

    const textNodes = result.result?.textNodes as ScannedTextNode[] | undefined;
    return textNodes || [];
  }

  /**
   * 노드 하위에서 이미지 역할을 하는 노드를 스캔한다.
   * RECTANGLE, FRAME, ELLIPSE 모두 이미지 fill을 가질 수 있다.
   */
  async scanImageNodes(nodeId: string): Promise<ScannedImageNode[]> {
    await this.ensureConnected();

    const result = await this.getTransport().sendCommand(
      {
        id: `scan_img_${Date.now()}`,
        command: 'scan_nodes_by_types',
        params: { nodeId, types: ['RECTANGLE', 'FRAME', 'ELLIPSE'] },
      },
      60000,
    );

    const matchingNodes = result.result?.matchingNodes as ScannedImageNode[] | undefined;
    return matchingNodes || [];
  }

  /**
   * 여러 텍스트 노드의 내용을 일괄 교체한다.
   */
  async replaceTexts(nodeId: string, replacements: TextReplacement[]): Promise<void> {
    await this.ensureConnected();

    if (replacements.length === 0) return;

    await this.getTransport().sendCommand(
      {
        id: `replace_text_${Date.now()}`,
        command: 'set_multiple_text_contents',
        params: {
          nodeId,
          text: replacements,
        },
      },
      120000, // 2분 타임아웃
    );
  }

  /**
   * 노드에 이미지를 설정한다.
   */
  async setImageFill(nodeId: string, imageUrl: string): Promise<void> {
    await this.ensureConnected();

    await this.getTransport().sendCommand({
      id: `img_fill_${Date.now()}`,
      command: 'set_image_fill',
      params: { nodeId, imageUrl, scaleMode: 'FILL' },
    });
  }

  /**
   * 중첩 JSON 트리를 create_tree 커맨드로 일괄 생성한다.
   * 네트워크 왕복 1회로 전체 구조를 생성.
   */
  async executeTree(
    tree: TreeNode,
    parentId?: string,
    onProgress?: (progress: ProgressUpdate) => void
  ): Promise<CreateTreeResult> {
    await this.ensureConnected();

    onProgress?.({ step: 'create_tree', progress: 10, detail: '트리 구조 생성 시작' });

    const result = await this.getTransport().sendCommand(
      {
        id: `tree_${Date.now()}`,
        command: 'create_tree',
        params: { tree, parentId },
      },
      120000,
    );

    if (!result.result?.rootId) {
      throw new Error('트리 생성에 실패했습니다');
    }

    onProgress?.({
      step: 'create_tree',
      progress: 100,
      detail: `${result.result.totalCreated}개 노드 생성 완료`,
    });

    return {
      rootId: result.result.rootId as string,
      nodeMap: (result.result.nodeMap as Record<string, string>) || {},
      totalCreated: (result.result.totalCreated as number) || 0,
    };
  }

  /**
   * Plugin API 코드를 실행한다.
   * 복잡한 후처리(Auto Layout 미세 조정, 스타일 일괄 변경)에 사용.
   */
  async executeCode(code: string, timeout = 10000): Promise<ExecuteCodeResult> {
    await this.ensureConnected();

    const result = await this.getTransport().sendCommand(
      {
        id: `exec_${Date.now()}`,
        command: 'execute_code',
        params: { code, timeout },
      },
      timeout + 5000,
    );

    return {
      result: result.result?.result ?? null,
      logs: (result.result?.logs as string[]) || [],
      executionTime: (result.result?.executionTime as number) || 0,
    };
  }

  /**
   * 하이브리드 실행: 트리 생성 + 후처리 코드.
   */
  async executeHybrid(
    tree: TreeNode,
    postProcessCode?: string,
    onProgress?: (progress: ProgressUpdate) => void
  ): Promise<{ treeResult: CreateTreeResult; codeResult?: ExecuteCodeResult }> {
    onProgress?.({ step: 'hybrid', progress: 5, detail: '트리 구조 생성 중...' });
    const treeResult = await this.executeTree(tree, undefined, onProgress);

    let codeResult: ExecuteCodeResult | undefined;
    if (postProcessCode) {
      onProgress?.({ step: 'hybrid', progress: 80, detail: '후처리 코드 실행 중...' });

      const injectedCode = `const NODE_MAP = ${JSON.stringify(treeResult.nodeMap)};\nconst ROOT_ID = "${treeResult.rootId}";\n${postProcessCode}`;
      codeResult = await this.executeCode(injectedCode);
    }

    onProgress?.({ step: 'hybrid', progress: 100, detail: '완료' });
    return { treeResult, codeResult };
  }

  /**
   * $cmd_xxx 형태의 참조를 실제 nodeId로 치환
   */
  private resolveReferences(params: Record<string, unknown>): Record<string, unknown> {
    const resolved: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'string' && value.startsWith('$')) {
        const refId = value.substring(1);
        const actualId = this.nodeIdMap.get(refId);
        resolved[key] = actualId || value;
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        resolved[key] = this.resolveReferences(value as Record<string, unknown>);
      } else {
        resolved[key] = value;
      }
    }

    return resolved;
  }
}
