'use client';

import { cn } from '@/lib/utils';
import type { ProgressUpdate } from '@/lib/figma/types';

interface FigmaProgressModalProps {
  isOpen: boolean;
  progress: ProgressUpdate | null;
  error: string | null;
  onClose: () => void;
  onRetry?: () => void;
}

export default function FigmaProgressModal({
  isOpen,
  progress,
  error,
  onClose,
  onRetry,
}: FigmaProgressModalProps) {
  if (!isOpen) return null;

  const progressPercent = progress?.progress || 0;
  const isComplete = progressPercent >= 100 && !error;
  const isError = !!error;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] p-6 shadow-2xl">
        <h3 className="mb-4 text-lg font-semibold text-[rgb(var(--color-text-primary))]">
          {isError
            ? '오류 발생'
            : isComplete
              ? '생성 완료'
              : '피그마에 디자인 생성 중'}
        </h3>

        {!isError && (
          <div className="mb-3">
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-[rgb(var(--color-text-secondary))]">
                {progress?.detail || '준비 중...'}
              </span>
              <span className="font-mono text-[rgb(var(--color-text-tertiary))]">{progressPercent}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-[rgb(var(--color-border))]/30">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-300',
                  isComplete ? 'bg-emerald-500' : 'bg-amber-500'
                )}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {!isError && progress && (
          <div className="mb-4 space-y-1 text-sm text-[rgb(var(--color-text-tertiary))]">
            {progress.totalCommands && (
              <p>
                커맨드: {progress.completedCommands || 0} / {progress.totalCommands}
              </p>
            )}
            {progress.step && progress.step !== 'error' && (
              <p>단계: {progress.step}</p>
            )}
          </div>
        )}

        {isError && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {isComplete && (
          <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 p-3">
            <p className="text-sm text-emerald-600">
              피그마에서 생성된 디자인을 확인하세요.
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2">
          {isError && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 transition-colors"
            >
              재시도
            </button>
          )}
          {(isComplete || isError) && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[rgb(var(--color-border))] px-4 py-2 text-sm font-medium text-[rgb(var(--color-text-secondary))] hover:bg-[rgb(var(--color-surface-hover))] transition-colors"
            >
              닫기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
