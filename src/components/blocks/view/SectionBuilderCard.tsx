'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Trash2, GripVertical } from 'lucide-react';
import type { SectionConfig } from '@/types';
import SectionTypeSelector from './SectionTypeSelector';
import SectionImageUpload from './SectionImageUpload';

interface SectionBuilderCardProps {
    section: SectionConfig;
    index: number;
    isExpanded: boolean;
    onToggle: () => void;
    onUpdate: (field: keyof SectionConfig, value: string | undefined) => void;
    onRemove: () => void;
    accentColor?: string;
}

export default function SectionBuilderCard({
    section,
    index,
    isExpanded,
    onToggle,
    onUpdate,
    onRemove,
    accentColor = '#7C3AED',
}: SectionBuilderCardProps) {
    const typeLabel = section.type || '미지정';
    const previewText = section.title || section.subtitle || '내용 없음';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2 }}
            className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden"
        >
            {/* 접힌 상태 헤더 */}
            <button
                type="button"
                onClick={onToggle}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors text-left"
            >
                <GripVertical className="w-4 h-4 text-neutral-600 shrink-0" />
                <span className="text-xs font-mono text-neutral-500 shrink-0 w-6">
                    {String(index + 1).padStart(2, '0')}
                </span>
                <span
                    className="text-xs font-medium px-2 py-0.5 rounded shrink-0"
                    style={{
                        backgroundColor: `${accentColor}15`,
                        color: accentColor,
                    }}
                >
                    {typeLabel}
                </span>
                <span className="text-sm text-neutral-400 truncate flex-1">
                    {previewText}
                </span>
                {section.referenceImageUrl && (
                    <span className="text-[10px] text-emerald-400 shrink-0">
                        IMG
                    </span>
                )}
                <ChevronDown
                    className={`w-4 h-4 text-neutral-500 shrink-0 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                    }`}
                />
            </button>

            {/* 펼친 상태 */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
                            {/* 타입 선택 */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-400 mb-1">
                                    섹션 타입
                                </label>
                                <SectionTypeSelector
                                    value={section.type}
                                    onChange={(v) => onUpdate('type', v)}
                                    accentColor={accentColor}
                                />
                            </div>

                            {/* 제목 */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-400 mb-1">
                                    제목
                                </label>
                                <input
                                    type="text"
                                    className="input-field text-sm"
                                    placeholder="섹션 제목 (선택)"
                                    value={section.title || ''}
                                    onChange={(e) => onUpdate('title', e.target.value)}
                                />
                            </div>

                            {/* 부제목 */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-400 mb-1">
                                    부제목
                                </label>
                                <input
                                    type="text"
                                    className="input-field text-sm"
                                    placeholder="부제목 (선택)"
                                    value={section.subtitle || ''}
                                    onChange={(e) => onUpdate('subtitle', e.target.value)}
                                />
                            </div>

                            {/* 설명 */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-400 mb-1">
                                    설명
                                </label>
                                <textarea
                                    className="input-field text-sm min-h-[80px] resize-none"
                                    placeholder="이 섹션에 들어갈 설명 텍스트 (선택)"
                                    value={section.description || ''}
                                    onChange={(e) => onUpdate('description', e.target.value)}
                                />
                            </div>

                            {/* 참고 이미지 */}
                            <div>
                                <label className="block text-xs font-medium text-neutral-400 mb-1">
                                    참고 이미지
                                </label>
                                <SectionImageUpload
                                    imageUrl={section.referenceImageUrl}
                                    onUpload={(url) => onUpdate('referenceImageUrl', url)}
                                    onRemove={() => onUpdate('referenceImageUrl', undefined)}
                                    accentColor={accentColor}
                                />
                            </div>

                            {/* 삭제 */}
                            <div className="flex justify-end pt-1">
                                <button
                                    type="button"
                                    onClick={onRemove}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    섹션 삭제
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
