/**
 * 서버사이드 Figma 플러그인 통신
 * API Route에서 Supabase Realtime을 통해 플러그인과 통신한다.
 * 기존 ws-manager.ts('use client')의 서버 전용 버전.
 */

import 'server-only';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type {
  FigmaCommand,
  FigmaCommandResult,
  FigmaRestNode,
  TreeNode,
  CreateTreeResult,
} from '../types';

const DEFAULT_TIMEOUT = 120000;
const COMMAND_TIMEOUT = 30000;

interface PendingRequest {
  resolve: (result: FigmaCommandResult) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

export class ServerFigmaTransport {
  private client: SupabaseClient;
  private channel: ReturnType<SupabaseClient['channel']> | null = null;
  private pendingRequests = new Map<string, PendingRequest>();
  private connected = false;

  constructor(private config: { supabaseUrl: string; supabaseKey: string }) {
    this.client = createClient(config.supabaseUrl, config.supabaseKey);
  }

  async connect(channelName: string): Promise<void> {
    if (this.connected) return;

    return new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('연결 타임아웃'));
      }, DEFAULT_TIMEOUT);

      this.channel = this.client.channel(channelName, {
        config: { broadcast: { self: false } },
      });

      this.channel
        .on('broadcast', { event: 'figma-result' }, (payload) => {
          this.handleResult(payload.payload as FigmaCommandResult);
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            clearTimeout(timer);
            this.connected = true;
            resolve();
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            clearTimeout(timer);
            this.connected = false;
            reject(new Error(`채널 연결 실패: ${status}`));
          }
        });
    });
  }

  private handleResult(result: FigmaCommandResult): void {
    const pending = this.pendingRequests.get(result.id);
    if (!pending) return;

    clearTimeout(pending.timer);
    this.pendingRequests.delete(result.id);
    pending.resolve(result);
  }

  async sendCommand(command: FigmaCommand, timeoutMs: number = COMMAND_TIMEOUT): Promise<FigmaCommandResult> {
    if (!this.channel || !this.connected) {
      throw new Error('플러그인 연결 안됨');
    }

    return new Promise<FigmaCommandResult>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingRequests.delete(command.id);
        reject(new Error(`커맨드 타임아웃: ${command.command} (${timeoutMs}ms)`));
      }, timeoutMs);

      this.pendingRequests.set(command.id, { resolve, reject, timer });

      this.channel!.send({
        type: 'broadcast',
        event: 'figma-command',
        payload: command,
      });
    });
  }

  async sendTree(
    tree: TreeNode,
    parentId?: string,
    offsetX?: number,
    offsetY?: number,
  ): Promise<CreateTreeResult> {
    const command: FigmaCommand = {
      id: `tree_${Date.now()}`,
      command: 'create_tree',
      params: { tree, parentId, offsetX, offsetY },
      description: 'create_tree 실행',
    };

    const result = await this.sendCommand(command, DEFAULT_TIMEOUT);
    if (result.error) {
      throw new Error(`create_tree 실패: ${result.error}`);
    }

    return result.result as unknown as CreateTreeResult;
  }

  async getNodeInfo(nodeId: string): Promise<FigmaRestNode> {
    const command: FigmaCommand = {
      id: `scan_${Date.now()}`,
      command: 'get_node_info',
      params: { nodeId },
      description: '노드 스캔',
    };

    const result = await this.sendCommand(command, COMMAND_TIMEOUT);
    if (result.error) {
      throw new Error(`get_node_info 실패: ${result.error}`);
    }

    return result.result as unknown as FigmaRestNode;
  }

  async moveNode(nodeId: string, x: number, y: number): Promise<void> {
    const command: FigmaCommand = {
      id: `move_${Date.now()}`,
      command: 'move_node',
      params: { nodeId, x, y },
      description: `노드 이동: (${x}, ${y})`,
    };

    const result = await this.sendCommand(command);
    if (result.error) {
      throw new Error(`move_node 실패: ${result.error}`);
    }
  }

  async sendCommands(commands: FigmaCommand[]): Promise<void> {
    for (const cmd of commands) {
      await this.sendCommand(cmd);
    }
  }

  disconnect(): void {
    for (const [, pending] of this.pendingRequests) {
      clearTimeout(pending.timer);
      pending.reject(new Error('연결 종료'));
    }
    this.pendingRequests.clear();

    if (this.channel) {
      this.client.removeChannel(this.channel);
      this.channel = null;
    }
    this.connected = false;
  }
}
