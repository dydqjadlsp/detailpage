'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  ImageIcon,
  Upload,
  Loader2,
  Palette,
  LayoutList,
  Type,
  Eye,
  Paintbrush,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';
import { FigmaExportButton } from '@/components/figma';
import type { ReferenceAnalysis } from '@/lib/figma/types';

type InputTab = 'url' | 'image';

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export default function ReferencePage() {
  const [activeTab, setActiveTab] = useState<InputTab>('url');
  const [url, setUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ReferenceAnalysis | null>(null);
  const [error, setError] = useState('');

  const [brandName, setBrandName] = useState('');
  const [brandColor, setBrandColor] = useState('#7C3AED');
  const [replaceText, setReplaceText] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetAnalysis = useCallback(() => {
    setAnalysis(null);
    setError('');
  }, []);

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

  const buildInputData = useCallback((): Record<string, unknown> => {
    return {
      analysisId: analysis?.analysisId,
      brandName: brandName.trim() || undefined,
      brandColor,
      replaceText,
      colorPalette: analysis?.colorPalette,
      sections: analysis?.sections,
      typography: analysis?.typography,
      overallStyle: analysis?.overallStyle,
    };
  }, [analysis, brandName, brandColor, replaceText]);

  const hasInput = activeTab === 'url' ? url.trim().length > 0 : imageFile !== null;

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <Link
          href="/new"
          className="inline-flex items-center gap-2 text-sm text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          돌아가기
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold">참고 상세페이지로 만들기</h1>
            <p className="text-[rgb(var(--color-text-secondary))] text-sm mt-2">
              잘 만들어진 상세페이지 URL이나 스크린샷을 넣으면 비슷한 스타일로 새로 만들어줍니다.
            </p>
          </div>

          {/* 입력 영역 */}
          <div className="glass-card rounded-2xl p-6 sm:p-8">
            {/* 탭 전환 */}
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('url');
                  resetAnalysis();
                }}
                className={
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ' +
                  (activeTab === 'url'
                    ? 'bg-amber-500/15 text-amber-600 border border-amber-500/30'
                    : 'bg-[rgb(var(--color-surface))]/50 text-[rgb(var(--color-text-secondary))] border border-[rgb(var(--color-border))] hover:border-[rgb(var(--color-border))]/80')
                }
              >
                <Globe className="w-4 h-4" />
                URL 입력
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('image');
                  resetAnalysis();
                }}
                className={
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ' +
                  (activeTab === 'image'
                    ? 'bg-amber-500/15 text-amber-600 border border-amber-500/30'
                    : 'bg-[rgb(var(--color-surface))]/50 text-[rgb(var(--color-text-secondary))] border border-[rgb(var(--color-border))] hover:border-[rgb(var(--color-border))]/80')
                }
              >
                <ImageIcon className="w-4 h-4" />
                이미지 업로드
              </button>
            </div>

            {/* URL 입력 */}
            <AnimatePresence mode="wait">
              {activeTab === 'url' && (
                <motion.div
                  key="url"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-sm font-semibold mb-2">참고할 상세페이지 URL</label>
                  <input
                    type="url"
                    className="input-field"
                    placeholder="https://smartstore.naver.com/브랜드/products/12345"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      setError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAnalyze();
                      }
                    }}
                  />
                </motion.div>
              )}

              {activeTab === 'image' && (
                <motion.div
                  key="image"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-sm font-semibold mb-2">참고할 상세페이지 캡처 이미지</label>
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={
                      'relative flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all ' +
                      (imagePreview
                        ? 'border-amber-500/30 bg-amber-500/5'
                        : 'border-[rgb(var(--color-border))] bg-[rgb(var(--color-surface))]/50 hover:border-[rgb(var(--color-border))]/80 hover:bg-[rgb(var(--color-surface))]/70')
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
                        <img
                          src={imagePreview}
                          alt="업로드된 이미지 미리보기"
                          className="max-h-48 mx-auto rounded-lg object-contain"
                        />
                        <p className="text-xs text-[rgb(var(--color-text-secondary))] text-center mt-3">
                          {imageFile?.name} ({(imageFile!.size / 1024 / 1024).toFixed(1)}MB)
                        </p>
                        <p className="text-xs text-amber-600 text-center mt-1">
                          클릭하여 다른 이미지 선택
                        </p>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-[rgb(var(--color-text-tertiary))]" />
                        <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                          이미지를 드래그하거나 클릭하여 업로드
                        </p>
                        <p className="text-xs text-[rgb(var(--color-text-tertiary))]">
                          PNG, JPG, WebP / 최대 {MAX_FILE_SIZE_MB}MB
                        </p>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 에러 메시지 */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}

            {/* 분석 버튼 */}
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={!hasInput || isAnalyzing}
              className="btn-primary w-full mt-6 py-3.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  분석 중...
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  분석하기
                </>
              )}
            </button>
          </div>

          {/* 분석 결과 */}
          <AnimatePresence>
            {analysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="mt-6 space-y-6"
              >
                {/* 스크린샷 프리뷰 */}
                {analysis.screenshot && (
                  <div className="glass-card rounded-2xl p-6">
                    <h3 className="text-sm font-semibold text-[rgb(var(--color-text-secondary))] mb-4 flex items-center gap-2">
                      <Eye className="w-4 h-4 text-amber-600" />
                      스크린샷
                    </h3>
                    <img
                      src={analysis.screenshot}
                      alt="분석된 페이지 스크린샷"
                      className="w-full rounded-lg border border-[rgb(var(--color-border))]"
                    />
                  </div>
                )}

                {/* 색상 팔레트 */}
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="text-sm font-semibold text-[rgb(var(--color-text-secondary))] mb-4 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-amber-600" />
                    색상 팔레트
                  </h3>
                  <div className="grid grid-cols-5 gap-3">
                    {Object.entries(analysis.colorPalette)
                      .filter(([, color]) => typeof color === 'string')
                      .map(([name, color]) => (
                      <div key={name} className="text-center">
                        <div
                          className="w-full aspect-square rounded-xl border border-[rgb(var(--color-border))] mb-2"
                          style={{ backgroundColor: color as string }}
                        />
                        <p className="text-xs text-[rgb(var(--color-text-secondary))] capitalize">{name}</p>
                        <p className="text-[10px] text-[rgb(var(--color-text-tertiary))] font-mono">{color as string}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 섹션 목록 + 타이포그래피 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 섹션 목록 */}
                  <div className="glass-card rounded-2xl p-6">
                    <h3 className="text-sm font-semibold text-[rgb(var(--color-text-secondary))] mb-4 flex items-center gap-2">
                      <LayoutList className="w-4 h-4 text-amber-600" />
                      섹션 구조 ({analysis.sections.length}개)
                    </h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {analysis.sections.map((section, index) => (
                        <div
                          key={`${section.type}-${index}`}
                          className="flex items-center justify-between p-3 rounded-xl bg-[rgb(var(--color-surface))]/50 border border-[rgb(var(--color-border))]/50"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-lg bg-amber-500/15 text-amber-600 text-xs font-bold flex items-center justify-center">
                              {index + 1}
                            </span>
                            <div>
                              <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">{section.type}</p>
                              <p className="text-[10px] text-[rgb(var(--color-text-tertiary))]">{section.layout}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {section.hasImage && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-600 border border-sky-500/20">
                                IMG
                              </span>
                            )}
                            {section.hasText && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-200">
                                TXT
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 타이포그래피 + 스타일 */}
                  <div className="space-y-6">
                    <div className="glass-card rounded-2xl p-6">
                      <h3 className="text-sm font-semibold text-[rgb(var(--color-text-secondary))] mb-4 flex items-center gap-2">
                        <Type className="w-4 h-4 text-amber-600" />
                        타이포그래피
                      </h3>
                      <div className="space-y-3">
                        <div className="p-3 rounded-xl bg-[rgb(var(--color-surface))]/50 border border-[rgb(var(--color-border))]/50">
                          <p className="text-xs text-[rgb(var(--color-text-tertiary))] mb-1">Heading</p>
                          <p className="text-sm text-[rgb(var(--color-text-primary))] font-medium">
                            {analysis.typography.headingStyle} / {analysis.typography.headingSize}px
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-[rgb(var(--color-surface))]/50 border border-[rgb(var(--color-border))]/50">
                          <p className="text-xs text-[rgb(var(--color-text-tertiary))] mb-1">Body</p>
                          <p className="text-sm text-[rgb(var(--color-text-primary))] font-medium">
                            {analysis.typography.bodyStyle} / {analysis.typography.bodySize}px
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="glass-card rounded-2xl p-6">
                      <h3 className="text-sm font-semibold text-[rgb(var(--color-text-secondary))] mb-4 flex items-center gap-2">
                        <Paintbrush className="w-4 h-4 text-amber-600" />
                        전체 스타일
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 text-sm font-medium border border-amber-200">
                          {analysis.overallStyle}
                        </span>
                        <span className="text-xs text-[rgb(var(--color-text-tertiary))]">
                          {analysis.totalHeight.toLocaleString()}px
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 커스터마이징 */}
                <div className="glass-card rounded-2xl p-6 sm:p-8">
                  <h3 className="text-sm font-semibold text-[rgb(var(--color-text-secondary))] mb-6">
                    커스터마이징 옵션
                  </h3>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-[rgb(var(--color-text-secondary))]">
                        브랜드명
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="브랜드명을 입력하면 텍스트에 반영됩니다"
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-[rgb(var(--color-text-secondary))]">
                        브랜드 색상
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={brandColor}
                          onChange={(e) => setBrandColor(e.target.value)}
                          className="w-10 h-10 rounded-lg border border-[rgb(var(--color-border))] cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          className="input-field flex-1"
                          value={brandColor}
                          onChange={(e) => setBrandColor(e.target.value)}
                          placeholder="#7C3AED"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-[rgb(var(--color-surface))]/50 border border-[rgb(var(--color-border))]/50">
                      <div>
                        <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">텍스트 자동 교체</p>
                        <p className="text-xs text-[rgb(var(--color-text-tertiary))] mt-0.5">
                          원본 텍스트를 브랜드에 맞게 변환합니다
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setReplaceText(!replaceText)}
                        className={
                          'relative w-11 h-6 rounded-full transition-colors ' +
                          (replaceText ? 'bg-amber-500' : 'bg-[rgb(var(--color-border))]')
                        }
                      >
                        <span
                          className={
                            'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ' +
                            (replaceText ? 'translate-x-5' : 'translate-x-0')
                          }
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 피그마 내보내기 */}
                <div className="glass-card rounded-2xl p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[rgb(var(--color-text-secondary))]">
                        피그마에 복제하기
                      </h3>
                      <p className="text-xs text-[rgb(var(--color-text-tertiary))]">
                        분석 결과를 바탕으로 피그마에 디자인을 생성합니다
                      </p>
                    </div>
                  </div>
                  <FigmaExportButton
                    category="reference"
                    inputData={buildInputData()}
                    mode="reference-clone"
                    pixelHeight={String(analysis.totalHeight)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
