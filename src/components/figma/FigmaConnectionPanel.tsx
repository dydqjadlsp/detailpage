'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Loader2, Wifi, WifiOff, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { TransportType, ConnectionStatus } from '@/lib/figma/types';
import type { User } from '@supabase/supabase-js';
import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';

interface FigmaConnectionPanelProps {
  status: ConnectionStatus;
  onConnect: (config: {
    type: TransportType;
    channelCode: string;
    supabaseUrl?: string;
    supabaseAnonKey?: string;
    wsHost?: string;
    wsPort?: number;
  }) => void;
  onDisconnect: () => void;
}

const STATUS_STYLES: Record<ConnectionStatus, { label: string; dot: string }> = {
  disconnected: { label: '연결 안됨', dot: 'bg-neutral-400' },
  connecting: { label: '연결 중...', dot: 'bg-yellow-400 animate-pulse' },
  connected: { label: '피그마 연결됨', dot: 'bg-green-500' },
  error: { label: '연결 오류', dot: 'bg-red-500' },
};

const PAIR_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const PAIR_TIMEOUT_MS = 5 * 60 * 1000;

function generateChannelName(userId: string): string {
  return `figma_ch_${userId.replace(/-/g, '').slice(0, 12)}`;
}

function generatePairCode(): string {
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += PAIR_CODE_CHARS.charAt(Math.floor(Math.random() * PAIR_CODE_CHARS.length));
  }
  return code;
}

export default function FigmaConnectionPanel({
  status,
  onConnect,
  onDisconnect,
}: FigmaConnectionPanelProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [pairCode, setPairCode] = useState<string | null>(null);
  const [isPairing, setIsPairing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDevOptions, setShowDevOptions] = useState(false);
  const [devWsPort, setDevWsPort] = useState(3055);

  const pairChannelRef = useRef<RealtimeChannel | null>(null);
  const supabaseRef = useRef<SupabaseClient | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabaseRef.current = supabase;
    if (!supabase) {
      setIsLoadingUser(false);
      return;
    }
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setIsLoadingUser(false);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (pairChannelRef.current && supabaseRef.current) {
        supabaseRef.current.removeChannel(pairChannelRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const cleanupPairing = useCallback(() => {
    if (pairChannelRef.current && supabaseRef.current) {
      supabaseRef.current.removeChannel(pairChannelRef.current);
      pairChannelRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsPairing(false);
    setPairCode(null);
  }, []);

  const handleGenerateCode = useCallback(() => {
    if (!user || !supabaseRef.current) return;

    cleanupPairing();

    const code = generatePairCode();
    setPairCode(code);
    setIsPairing(true);

    const supabase = supabaseRef.current;
    const actualChannel = generateChannelName(user.id);
    const pairChannelName = `figma_pair_${code}`;

    const pairChannel = supabase.channel(pairChannelName, {
      config: { broadcast: { self: false } },
    });

    pairChannel.on('broadcast', { event: 'pair-request' }, () => {
      pairChannel.send({
        type: 'broadcast',
        event: 'pair-response',
        payload: { channel: actualChannel },
      });

      setTimeout(() => {
        if (pairChannelRef.current === pairChannel) {
          supabase.removeChannel(pairChannel);
          pairChannelRef.current = null;
        }
      }, 2000);

      setIsPairing(false);
      onConnect({
        type: 'supabase',
        channelCode: actualChannel,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      });
    });

    pairChannel.subscribe();
    pairChannelRef.current = pairChannel;

    timeoutRef.current = setTimeout(() => {
      if (pairChannelRef.current === pairChannel) {
        cleanupPairing();
      }
    }, PAIR_TIMEOUT_MS);
  }, [user, onConnect, cleanupPairing]);

  const handleCopyCode = useCallback(() => {
    if (!pairCode) return;
    navigator.clipboard.writeText(pairCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [pairCode]);

  const handleDevWsConnect = useCallback(() => {
    onConnect({
      type: 'websocket',
      channelCode: `dev_${Date.now().toString(36)}`,
      wsHost: 'localhost',
      wsPort: devWsPort,
    });
  }, [devWsPort, onConnect]);

  const statusInfo = STATUS_STYLES[status];
  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';

  if (isLoadingUser) {
    return (
      <div className="rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-hover))]/50 p-4">
        <div className="flex items-center gap-2 text-sm text-[rgb(var(--color-text-secondary))]">
          <Loader2 className="h-4 w-4 animate-spin" />
          로딩 중...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-hover))]/50 p-4">
        <p className="text-sm text-[rgb(var(--color-text-secondary))]">
          로그인 후 피그마 연결을 사용할 수 있습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-hover))]/50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`h-2.5 w-2.5 rounded-full ${statusInfo.dot}`} />
          <span className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
            {statusInfo.label}
          </span>
        </div>
      </div>

      {isConnected ? (
        <button
          type="button"
          onClick={onDisconnect}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
        >
          <WifiOff className="h-4 w-4" />
          연결 해제
        </button>
      ) : isPairing && pairCode ? (
        <div className="space-y-3">
          <p className="text-xs text-[rgb(var(--color-text-secondary))]">
            피그마 플러그인에서 아래 코드를 입력하세요
          </p>
          <div className="flex items-center justify-center gap-3 rounded-lg bg-[rgb(var(--color-surface-hover))]/70 py-4">
            <span className="font-mono text-2xl font-bold tracking-[0.3em] text-amber-600">
              {pairCode}
            </span>
            <button
              type="button"
              onClick={handleCopyCode}
              className="rounded-md p-1.5 text-[rgb(var(--color-text-tertiary))] hover:bg-[rgb(var(--color-surface-hover))] hover:text-[rgb(var(--color-text-primary))] transition-colors"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs text-[rgb(var(--color-text-tertiary))]">
            <Loader2 className="h-3 w-3 animate-spin" />
            플러그인 연결 대기 중... (5분 후 만료)
          </div>
          <button
            type="button"
            onClick={cleanupPairing}
            className="w-full rounded-lg border border-[rgb(var(--color-border))] px-4 py-2 text-sm text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-surface-hover))] transition-colors"
          >
            취소
          </button>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={handleGenerateCode}
            disabled={isConnecting}
            className={
              'flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ' +
              (isConnecting
                ? 'cursor-not-allowed bg-[rgb(var(--color-surface-hover))]/50 text-[rgb(var(--color-text-tertiary))]'
                : 'bg-amber-500 text-white hover:bg-amber-600')
            }
          >
            <Wifi className="h-4 w-4" />
            연결 코드 생성
          </button>
          <p className="text-xs text-[rgb(var(--color-text-tertiary))]">
            코드를 생성한 후 피그마 플러그인에 입력하면 자동 연결됩니다.
          </p>
        </>
      )}

      <div className="border-t border-[rgb(var(--color-border))]/50 pt-2">
        <button
          type="button"
          onClick={() => setShowDevOptions(!showDevOptions)}
          className="flex w-full items-center justify-between text-xs text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-secondary))] transition-colors"
        >
          개발자 옵션
          {showDevOptions ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </button>

        {showDevOptions && (
          <div className="mt-2 space-y-2">
            <div>
              <label className="mb-1 block text-xs text-[rgb(var(--color-text-tertiary))]">
                WebSocket 포트 (로컬 개발용)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={devWsPort}
                  onChange={(e) => setDevWsPort(Number(e.target.value))}
                  className="input-field flex-1 py-1.5 text-sm"
                  disabled={isConnected}
                />
                <button
                  type="button"
                  onClick={handleDevWsConnect}
                  disabled={isConnected || isConnecting}
                  className="rounded-md border border-[rgb(var(--color-border))] px-3 py-1.5 text-xs text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-surface-hover))] disabled:opacity-50"
                >
                  WS 연결
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
