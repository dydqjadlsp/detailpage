'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  Globe,
  ImageIcon,
  Upload,
  Loader2,
  X,
  Eye,
  AlertCircle,
  Palette,
  LayoutList,
} from 'lucide-react';
import type { ReferenceAnalysis } from '@/lib/figma/types';

interface ReferenceInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartFromFigma: () => void;
  onStartFromAnalysis: (analysis: ReferenceAnalysis) => void;
  isGenerating: boolean;
}

type SourceTab = 'figma' | 'url' | 'image';

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export default function ReferenceInputModal({
  isOpen,
  onClose,
  onStartFromFigma,
  onStartFromAnalysis,
  isGenerating,
}: ReferenceInputModalProps) {
  const [activeTab, setActiveTab] = useState<SourceTab>('figma');
  const [url, setUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ReferenceAnalysis | null>(null);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = useCallback((file: File) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError('PNG, JPG, WebP 이미지만 업로드 가능합니다.');
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`파일 크기는 ${MAX_FILE_SIZE_MB}MB 이하만 가능합니다.`);
      return;
    }

    setImageFile(file);
    setError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleImageSelect(file);
    },
    [handleImageSelect]
  );

  const handleAnalyze = useCallback(async () => {
    if (activeTab === 'url' && !url.trim()) {
      setError('URL을 입력해주세요.');
      return;
    }
    if (activeTab === 'image' && !imageFile) {
      setError('이미지를 업로드해주세요.');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setAnalysis(null);

    try {
      let response: Response;

      if (activeTab === 'url') {
        response = await fetch('/api/reference/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: url.trim() }),
        });
      } else {
        const formData = new FormData();
        formData.append('image', imageFile!);
        response = await fetch('/api/reference/analyze', {
          method: 'POST',
          body: formData,
        });
      }

      const result = await response.json();

      if (!result.ok) {
        throw new Error(result.error?.message || '분석에 실패했습니다.');
      }

      setAnalysis(result.data as ReferenceAnalysis);
    } catch (err) {
      const message = err instanceof Error ? err.message : '분석 중 오류가 발생했습니다.';
      setError(message);
    } finally {
      setIsAnalyzing(false);
    }
  }, [activeTab, url, imageFile]);

  const handleStartFromAnalysis = useCallback(() => {
    if (!analysis) return;
    onStartFromAnalysis(analysis);
  }, [analysis, onStartFromAnalysis]);

  const handleClose = useCallback(() => {
    if (isAnalyzing || isGenerating) return;
    setAnalysis(null);
    setError('');
    setUrl('');
    setImageFile(null);
    setImagePreview(null);
    onClose();
  }, [isAnalyzing, isGenerating, onClose]);

  const hasExternalInput = activeTab === 'url' ? url.trim().length > 0 : imageFile !== null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={handleClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))] shadow-2xl"
      >
        {/* 헤더 */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]/95 backdrop-blur px-6 py-4">
          <h2 className="text-lg font-bold text-[rgb(var(--color-text-primary))]">레퍼런스 복제</h2>
          <button
            type="button"
            onClick={handleClose}
            disabled={isAnalyzing || isGenerating}
            className="rounded-lg p-1.5 text-[rgb(var(--color-text-tertiary))] transition-colors hover:bg-[rgb(var(--color-surface-hover))] hover:text-[rgb(var(--color-text-primary))] disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* 소스 탭 */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setActiveTab('figma'); setError(''); setAnalysis(null); }}
              disabled={isAnalyzing}
              className={
                'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ' +
                (activeTab === 'figma'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-[rgb(var(--color-surface-hover))]/50 text-[rgb(var(--color-text-secondary))] border border-[rgb(var(--color-border))] hover:border-[rgb(var(--color-border))]/80')
              }
            >
              <Layers className="w-4 h-4" />
              피그마에서 선택
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('url'); setError(''); setAnalysis(null); }}
              disabled={isAnalyzing}
              className={
                'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ' +
                (activeTab === 'url'
                  ? 'bg-amber-500/10 text-amber-600 border border-amber-500/30'
                  : 'bg-[rgb(var(--color-surface-hover))]/50 text-[rgb(var(--color-text-secondary))] border border-[rgb(var(--color-border))] hover:border-[rgb(var(--color-border))]/80')
              }
            >
              <Globe className="w-4 h-4" />
              URL
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('image'); setError(''); setAnalysis(null); }}
              disabled={isAnalyzing}
              className={
                'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ' +
                (activeTab === 'image'
                  ? 'bg-amber-500/10 text-amber-600 border border-amber-500/30'
                  : 'bg-[rgb(var(--color-surface-hover))]/50 text-[rgb(var(--color-text-secondary))] border border-[rgb(var(--color-border))] hover:border-[rgb(var(--color-border))]/80')
              }
            >
              <ImageIcon className="w-4 h-4" />
              이미지
            </button>
          </div>

          <AnimatePresence mode="wait">
            {/* 피그마에서 선택 */}
            {activeTab === 'figma' && (
              <motion.div
                key="figma"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <div className="rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-hover))]/50 p-5">
                  <h4 className="text-sm font-semibold text-[rgb(var(--color-text-primary))] mb-3">사용 방법</h4>
                  <ol className="space-y-2.5 text-sm text-[rgb(var(--color-text-secondary))]">
                    <li className="flex gap-2">
                      <span className="shrink-0 w-5 h-5 rounded-md bg-emerald-500/15 text-emerald-400 text-xs font-bold flex items-center justify-center">1</span>
                      피그마에서 참고할 상세페이지 프레임을 선택
                    </li>
                    <li className="flex gap-2">
                      <span className="shrink-0 w-5 h-5 rounded-md bg-emerald-500/15 text-emerald-400 text-xs font-bold flex items-center justify-center">2</span>
                      여러 섹션이면 Shift+클릭으로 다중 선택
                    </li>
                    <li className="flex gap-2">
                      <span className="shrink-0 w-5 h-5 rounded-md bg-emerald-500/15 text-emerald-400 text-xs font-bold flex items-center justify-center">3</span>
                      아래 버튼을 누르면 구조 복제 + 텍스트/이미지 교체
                    </li>
                  </ol>
                </div>

                <button
                  type="button"
                  onClick={onStartFromFigma}
                  disabled={isGenerating}
                  className={
                    'w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold transition-colors ' +
                    (isGenerating
                      ? 'cursor-not-allowed bg-[rgb(var(--color-surface-hover))]/50 text-[rgb(var(--color-text-tertiary))]'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700')
                  }
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      복제 중...
                    </>
                  ) : (
                    <>
                      <Layers className="w-4 h-4" />
                      선택한 프레임으로 복제 시작
                    </>
                  )}
                </button>
              </motion.div>
            )}

            {/* URL 입력 */}
            {activeTab === 'url' && !analysis && (
              <motion.div
                key="url"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[rgb(var(--color-text-secondary))]">
                    참고할 상세페이지 URL
                  </label>
                  <input
                    type="url"
                    className="input-field"
                    placeholder="https://smartstore.naver.com/브랜드/products/12345"
                    value={url}
                    onChange={(e) => { setUrl(e.target.value); setError(''); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAnalyze(); } }}
                    disabled={isAnalyzing}
                  />
                  <p className="text-xs text-[rgb(var(--color-text-tertiary))] mt-2">
                    쿠팡, 스마트스토어, 일반 웹사이트 등 참고할 상세페이지 주소
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={!hasExternalInput || isAnalyzing}
                  className={
                    'w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ' +
                    (hasExternalInput && !isAnalyzing
                      ? 'bg-amber-500 text-white hover:bg-amber-600'
                      : 'cursor-not-allowed bg-[rgb(var(--color-surface-hover))]/50 text-[rgb(var(--color-text-tertiary))]')
                  }
                >
                  {isAnalyzing ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> 분석 중...</>
                  ) : (
                    <><Eye className="w-4 h-4" /> 분석하기</>
                  )}
                </button>
              </motion.div>
            )}

            {/* 이미지 업로드 */}
            {activeTab === 'image' && !analysis && (
              <motion.div
                key="image"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[rgb(var(--color-text-secondary))]">
                    참고할 상세페이지 캡처 이미지
                  </label>
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => !isAnalyzing && fileInputRef.current?.click()}
                    className={
                      'relative flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all ' +
                      (imagePreview
                        ? 'border-amber-500/30 bg-amber-500/5'
                        : 'border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-hover))]/30 hover:border-[rgb(var(--color-border))]/80 hover:bg-[rgb(var(--color-surface-hover))]/50')
                    }
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageSelect(file);
                      }}
                    />
                    {imagePreview ? (
                      <div className="w-full">
                        <img src={imagePreview} alt="업로드된 이미지" className="max-h-36 mx-auto rounded-lg object-contain" />
                        <p className="text-xs text-[rgb(var(--color-text-secondary))] text-center mt-2">{imageFile?.name}</p>
                        <p className="text-xs text-amber-500 text-center mt-1">클릭하여 변경</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-7 h-7 text-[rgb(var(--color-text-tertiary))]" />
                        <p className="text-sm text-[rgb(var(--color-text-secondary))]">이미지를 드래그하거나 클릭하여 업로드</p>
                        <p className="text-xs text-[rgb(var(--color-text-tertiary))]">PNG, JPG, WebP / 최대 {MAX_FILE_SIZE_MB}MB</p>
                      </>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={!hasExternalInput || isAnalyzing}
                  className={
                    'w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ' +
                    (hasExternalInput && !isAnalyzing
                      ? 'bg-amber-500 text-white hover:bg-amber-600'
                      : 'cursor-not-allowed bg-[rgb(var(--color-surface-hover))]/50 text-[rgb(var(--color-text-tertiary))]')
                  }
                >
                  {isAnalyzing ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> 분석 중...</>
                  ) : (
                    <><Eye className="w-4 h-4" /> 분석하기</>
                  )}
                </button>
              </motion.div>
            )}

            {/* 분석 결과 (URL/이미지 탭에서만) */}
            {analysis && (activeTab === 'url' || activeTab === 'image') && (
              <motion.div
                key="analysis"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-hover))]/50 p-4">
                  <h4 className="text-xs font-semibold text-[rgb(var(--color-text-tertiary))] mb-3 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-amber-500" />
                    색상 팔레트
                  </h4>
                  <div className="flex gap-2">
                    {Object.entries(analysis.colorPalette)
                      .filter(([, color]) => typeof color === 'string')
                      .slice(0, 6)
                      .map(([name, color]) => (
                        <div key={name} className="text-center flex-1">
                          <div className="w-full aspect-square rounded-lg border border-[rgb(var(--color-border))]" style={{ backgroundColor: color as string }} />
                          <p className="text-[9px] text-[rgb(var(--color-text-tertiary))] mt-1 truncate">{name}</p>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="rounded-xl border border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface-hover))]/50 p-4">
                  <h4 className="text-xs font-semibold text-[rgb(var(--color-text-tertiary))] mb-3 flex items-center gap-1.5">
                    <LayoutList className="w-3.5 h-3.5 text-amber-500" />
                    섹션 구조 ({analysis.sections.length}개)
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.sections.map((section, i) => (
                      <span key={`${section.type}-${i}`} className="px-2 py-1 rounded-md bg-[rgb(var(--color-surface-hover))]/50 border border-[rgb(var(--color-border))]/50 text-xs text-[rgb(var(--color-text-secondary))]">
                        {i + 1}. {section.type}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-[rgb(var(--color-text-tertiary))]">
                  <span className="px-2 py-1 rounded-md bg-amber-500/10 text-amber-600 border border-amber-500/20 font-medium">
                    {analysis.overallStyle}
                  </span>
                  <span>{analysis.totalHeight.toLocaleString()}px</span>
                </div>

                <button
                  type="button"
                  onClick={handleStartFromAnalysis}
                  disabled={isGenerating}
                  className={
                    'w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold transition-colors ' +
                    (isGenerating
                      ? 'cursor-not-allowed bg-[rgb(var(--color-surface-hover))]/50 text-[rgb(var(--color-text-tertiary))]'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700')
                  }
                >
                  {isGenerating ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> 생성 중...</>
                  ) : (
                    '이 스타일로 상세페이지 만들기'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setAnalysis(null)}
                  disabled={isGenerating}
                  className="w-full text-center text-xs text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-text-primary))] transition-colors disabled:opacity-50"
                >
                  다른 상세페이지로 다시 분석
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 에러 메시지 */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
