'use client';

import { useState, useCallback, useRef } from 'react';
import { FigmaManager } from '@/lib/figma/ws-manager';
import FigmaConnectionPanel from './FigmaConnectionPanel';
import FigmaProgressModal from './FigmaProgressModal';
import ReferenceInputModal from './ReferenceInputModal';
import type {
  TransportType,
  ConnectionStatus,
  ProgressUpdate,
  FigmaGenerateResponse,
  TransportConfig,
  ReferenceAnalysis,
} from '@/lib/figma/types';

interface FigmaExportButtonProps {
  category: string;
  inputData: Record<string, unknown>;
  mode?: 'detail-page' | 'web-design' | 'reference-clone';
  pixelHeight?: string;
  canvasWidth?: number;
  className?: string;
  referenceAnalysis?: Record<string, unknown> | null;
}

export default function FigmaExportButton({
  category,
  inputData,
  mode = 'detail-page',
  pixelHeight = '8000',
  canvasWidth = 1440,
  className,
  referenceAnalysis,
}: FigmaExportButtonProps) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState<ProgressUpdate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showReferenceModal, setShowReferenceModal] = useState(false);

  const managerRef = useRef<FigmaManager | null>(null);

  const handleConnect = useCallback(async (config: {
    type: TransportType;
    channelCode: string;
    supabaseUrl?: string;
    supabaseAnonKey?: string;
    wsHost?: string;
    wsPort?: number;
  }) => {
    try {
      const manager = new FigmaManager();
      managerRef.current = manager;

      const transportConfig: TransportConfig = config.type === 'supabase'
        ? {
            type: 'supabase',
            supabase: {
              url: config.supabaseUrl || '',
              anonKey: config.supabaseAnonKey || '',
            },
          }
        : {
            type: 'websocket',
            websocket: {
              host: config.wsHost || 'localhost',
              port: config.wsPort || 3055,
            },
          };

      await manager.connect(transportConfig, config.channelCode, {
        onStatusChange: setConnectionStatus,
        onProgress: setProgress,
        onError: (err) => setError(err),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : '연결 실패';
      setError(msg);
      setConnectionStatus('error');
    }
  }, []);

  const handleDisconnect = useCallback(() => {
    managerRef.current?.disconnect();
    managerRef.current = null;
    setConnectionStatus('disconnected');
  }, []);

  // 선택된 프레임 오른쪽에 배치하도록 커맨드에 오프셋 주입
  const injectOffset = useCallback((
    commands: FigmaGenerateResponse['commands'],
    selections: Array<{ x: number; y: number; width: number; height: number }>,
  ) => {
    if (selections.length === 0) return;
    const ref = selections[0];
    const newX = Math.round(ref.x + ref.width + 100);
    const newY = Math.round(ref.y);

    for (const cmd of commands) {
      if (cmd.command === 'create_tree' && cmd.params.tree) {
        cmd.params.offsetX = newX;
        cmd.params.offsetY = newY;
      } else if (cmd.command === 'create_frame' && !cmd.params.parentId) {
        cmd.params.x = newX;
        cmd.params.y = newY;
      }
    }
  }, []);

  // 새로 만들기: AI가 트리 생성 → flat 커맨드 변환 → 피그마 전송
  const handleExport = useCallback(async () => {
    if (connectionStatus !== 'connected' || !managerRef.current) {
      setError('피그마에 먼저 연결해주세요');
      return;
    }

    const manager = managerRef.current;

    setIsGenerating(true);
    setShowProgress(true);
    setError(null);
    setProgress({ step: 'generating', progress: 5, detail: 'AI가 디자인 구조를 생성하고 있습니다...' });

    try {
      // 커맨드 전송 전 연결 상태 확인 (API 호출 전에 미리 체크)
      await manager.ensureConnected();

      // 선택된 프레임이 있으면 그 오른쪽에 배치
      const selections = await manager.getSelectionInfo().catch(() => [] as Array<{ id: string; name: string; x: number; y: number; width: number; height: number }>);

      const actualMode = referenceAnalysis ? 'reference-clone' : mode;

      const response = await fetch('/api/figma/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: actualMode,
          category,
          inputData,
          pixelHeight,
          canvasWidth,
          outputFormat: 'tree',
          ...(referenceAnalysis ? { referenceAnalysis } : {}),
        }),
      });

      const result = await response.json();

      if (!result.ok) {
        throw new Error(result.error?.message || '커맨드 생성에 실패했습니다');
      }

      const generateResult = result.data as FigmaGenerateResponse;
      const { commands } = generateResult;

      // 선택된 프레임 오른쪽에 배치
      injectOffset(commands, selections);

      setProgress({
        step: 'sending',
        progress: 20,
        detail: `${commands.length}개 커맨드를 피그마로 전송합니다...`,
        totalCommands: commands.length,
        completedCommands: 0,
      });

      await manager.executeCommands(commands, (update) => {
        const mappedProgress = 20 + Math.round((update.progress / 100) * 80);
        setProgress({ ...update, progress: mappedProgress });
      });

      setProgress({
        step: 'complete',
        progress: 100,
        detail: '피그마에 디자인이 생성되었습니다',
        totalCommands: commands.length,
        completedCommands: commands.length,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : '생성 실패';
      setError(msg);
      // 연결 끊김 에러인 경우 상태를 업데이트
      if (msg.includes('연결이 끊어') || msg.includes('Not connected')) {
        setConnectionStatus('disconnected');
      }
    } finally {
      setIsGenerating(false);
    }
  }, [connectionStatus, mode, category, inputData, pixelHeight, canvasWidth, referenceAnalysis, injectOffset]);

  const handleRetry = useCallback(() => {
    setError(null);
    handleExport();
  }, [handleExport]);

  // 레퍼런스 복제 버튼 → 모달 열기
  const handleReferenceClick = useCallback(() => {
    if (connectionStatus !== 'connected') {
      setError('피그마에 먼저 연결해주세요');
      return;
    }
    setShowReferenceModal(true);
  }, [connectionStatus]);

  // 모달 > "피그마에서 선택" 탭: 선택한 프레임을 캡처 → AI 분석 → 카테고리에 맞는 새 상세페이지 생성
  const handleReferenceFromFigma = useCallback(async () => {
    if (connectionStatus !== 'connected' || !managerRef.current) return;

    const manager = managerRef.current;

    setShowReferenceModal(false);
    setIsGenerating(true);
    setShowProgress(true);
    setError(null);
    setProgress({ step: 'selection', progress: 3, detail: '피그마에서 선택된 프레임을 확인하는 중...' });

    try {
      // 1. 선택된 프레임 정보 가져오기
      const selections = await manager.getSelectionInfo();
      if (selections.length === 0) {
        throw new Error('피그마에서 레퍼런스 프레임을 먼저 선택해주세요.');
      }

      // 2. 선택된 프레임을 이미지로 캡처 (AI 분석용)
      setProgress({ step: 'capture', progress: 8, detail: '선택한 프레임을 캡처하는 중...' });
      const imageBase64 = await manager.exportNodeAsImage(selections[0].id, 0.25);

      // 3. AI 비전으로 레퍼런스 구조 분석
      setProgress({ step: 'analyzing', progress: 15, detail: 'AI가 레퍼런스 디자인을 분석하는 중... (색상, 레이아웃, 구조)' });

      const analyzeResponse = await fetch('/api/reference/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, mimeType: 'image/png', twoStage: true }),
      });
      const analyzeResult = await analyzeResponse.json();

      if (!analyzeResult.ok) {
        throw new Error(analyzeResult.error?.message || '디자인 분석에 실패했습니다');
      }

      const analysisData = analyzeResult.data.analysis as ReferenceAnalysis;

      // 4. 분석 결과 + 카테고리 inputData로 새 상세페이지 생성
      setProgress({ step: 'generating', progress: 35, detail: '레퍼런스 스타일로 새 상세페이지를 생성하는 중...' });

      const generateResponse = await fetch('/api/figma/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'reference-clone',
          category,
          inputData: {
            ...inputData,
            colorPalette: analysisData.colorPalette,
            sections: analysisData.sections,
            typography: analysisData.typography,
            overallStyle: analysisData.overallStyle,
          },
          pixelHeight: String(analysisData.totalHeight || pixelHeight),
          canvasWidth,
          outputFormat: 'tree',
          referenceAnalysis: analysisData,
        }),
      });

      const generateResult = await generateResponse.json();

      if (!generateResult.ok) {
        throw new Error(generateResult.error?.message || '디자인 생성에 실패했습니다');
      }

      const { commands } = generateResult.data as FigmaGenerateResponse;

      // 5. 원본 프레임 오른쪽에 배치
      injectOffset(commands, selections);

      // 6. 피그마로 전송
      setProgress({
        step: 'sending',
        progress: 50,
        detail: `${commands.length}개 커맨드를 피그마로 전송합니다...`,
        totalCommands: commands.length,
        completedCommands: 0,
      });

      await manager.executeCommands(commands, (update) => {
        const mappedProgress = 50 + Math.round((update.progress / 100) * 50);
        setProgress({ ...update, progress: mappedProgress });
      });

      setProgress({
        step: 'complete',
        progress: 100,
        detail: `완료: 레퍼런스 분석 → 새 상세페이지 생성 (${commands.length}개 요소)`,
        totalCommands: commands.length,
        completedCommands: commands.length,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : '레퍼런스 복제 실패';
      setError(msg);
      if (msg.includes('연결이 끊어') || msg.includes('Not connected')) {
        setConnectionStatus('disconnected');
      }
    } finally {
      setIsGenerating(false);
    }
  }, [connectionStatus, category, inputData, pixelHeight, canvasWidth, injectOffset]);

  // 모달 > URL/이미지 분석 완료 → 분석 결과 기반으로 피그마에 생성
  const handleReferenceFromAnalysis = useCallback(async (analysisData: ReferenceAnalysis) => {
    if (!managerRef.current) return;

    const manager = managerRef.current;

    setShowReferenceModal(false);
    setIsGenerating(true);
    setShowProgress(true);
    setError(null);
    setProgress({ step: 'generating', progress: 5, detail: '분석 결과를 바탕으로 디자인을 생성합니다...' });

    try {
      // 선택된 프레임이 있으면 그 오른쪽에 배치
      const selections = await manager.getSelectionInfo().catch(() => [] as Array<{ id: string; name: string; x: number; y: number; width: number; height: number }>);

      const response = await fetch('/api/figma/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'reference-clone',
          category,
          inputData: {
            ...inputData,
            colorPalette: analysisData.colorPalette,
            sections: analysisData.sections,
            typography: analysisData.typography,
            overallStyle: analysisData.overallStyle,
          },
          pixelHeight: String(analysisData.totalHeight || pixelHeight),
          canvasWidth,
          outputFormat: 'tree',
          referenceAnalysis: analysisData,
        }),
      });

      const result = await response.json();

      if (!result.ok) {
        throw new Error(result.error?.message || '디자인 생성에 실패했습니다');
      }

      const generateResult = result.data as FigmaGenerateResponse;
      const { commands } = generateResult;

      // 선택된 프레임 오른쪽에 배치
      injectOffset(commands, selections);

      setProgress({
        step: 'sending',
        progress: 20,
        detail: `${commands.length}개 커맨드를 피그마로 전송합니다...`,
        totalCommands: commands.length,
        completedCommands: 0,
      });

      await manager.executeCommands(commands, (update) => {
        const mappedProgress = 20 + Math.round((update.progress / 100) * 80);
        setProgress({ ...update, progress: mappedProgress });
      });

      setProgress({
        step: 'complete',
        progress: 100,
        detail: `레퍼런스 기반 디자인 생성 완료 (${commands.length}개 요소)`,
        totalCommands: commands.length,
        completedCommands: commands.length,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : '레퍼런스 복제 실패';
      setError(msg);
      if (msg.includes('연결이 끊어') || msg.includes('Not connected')) {
        setConnectionStatus('disconnected');
      }
    } finally {
      setIsGenerating(false);
    }
  }, [category, inputData, pixelHeight, canvasWidth, injectOffset]);

  const handleCloseProgress = useCallback(() => {
    setShowProgress(false);
    setProgress(null);
    setError(null);
  }, []);

  const isConnected = connectionStatus === 'connected';

  return (
    <div className={className}>
      <FigmaConnectionPanel
        status={connectionStatus}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={handleExport}
          disabled={!isConnected || isGenerating}
          className={
            'flex-1 rounded-lg px-4 py-3 text-sm font-semibold transition-colors ' +
            (isConnected && !isGenerating
              ? 'bg-amber-500 text-white hover:bg-amber-600'
              : 'cursor-not-allowed bg-[rgb(var(--color-surface-hover))]/50 text-[rgb(var(--color-text-tertiary))]')
          }
        >
          {isGenerating
            ? '생성 중...'
            : isConnected
              ? '새로 만들기'
              : '피그마 연결 필요'}
        </button>

        <button
          type="button"
          onClick={handleReferenceClick}
          disabled={!isConnected || isGenerating}
          className={
            'flex-1 rounded-lg px-4 py-3 text-sm font-semibold transition-colors ' +
            (isConnected && !isGenerating
              ? 'bg-emerald-500 text-white hover:bg-emerald-600'
              : 'cursor-not-allowed bg-[rgb(var(--color-surface-hover))]/50 text-[rgb(var(--color-text-tertiary))]')
          }
        >
          {isConnected
            ? '레퍼런스 복제'
            : '피그마 연결 필요'}
        </button>
      </div>

      <ReferenceInputModal
        isOpen={showReferenceModal}
        onClose={() => setShowReferenceModal(false)}
        onStartFromFigma={handleReferenceFromFigma}
        onStartFromAnalysis={handleReferenceFromAnalysis}
        isGenerating={isGenerating}
      />

      <FigmaProgressModal
        isOpen={showProgress}
        progress={progress}
        error={error}
        onClose={handleCloseProgress}
        onRetry={handleRetry}
      />
    </div>
  );
}
