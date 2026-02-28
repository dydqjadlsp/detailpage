'use client';

import { useParams, useRouter } from 'next/navigation';
import { useReducer, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, Sparkles, Loader2, Ruler, Layers } from 'lucide-react';
import Link from 'next/link';
import { getCategoryById, CATEGORY_ICONS } from '@/lib/categories';
import type { SectionConfig } from '@/types';
import SectionBuilderCard from '@/components/blocks/view/SectionBuilderCard';

const CATEGORY_COLORS: Record<string, string> = {
    ecommerce: '#F59E0B', realestate: '#3B82F6', medical: '#10B981',
    education: '#8B5CF6', restaurant: '#EF4444', travel: '#06B6D4',
    wedding: '#EC4899', legal: '#6366F1', fitness: '#F97316',
    saas: '#7C3AED', personal: '#14B8A6',
};

const MAX_SECTIONS = 50;

// --- Reducer ---

interface BuilderState {
    sections: SectionConfig[];
    expandedId: string | null;
}

type BuilderAction =
    | { type: 'ADD_SECTION' }
    | { type: 'REMOVE_SECTION'; id: string }
    | { type: 'UPDATE_SECTION'; id: string; field: keyof SectionConfig; value: string | undefined }
    | { type: 'SET_EXPANDED'; id: string | null };

function createSection(): SectionConfig {
    return {
        id: `sec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: '',
    };
}

function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
    switch (action.type) {
        case 'ADD_SECTION': {
            if (state.sections.length >= MAX_SECTIONS) return state;
            const newSection = createSection();
            return {
                sections: [...state.sections, newSection],
                expandedId: newSection.id,
            };
        }
        case 'REMOVE_SECTION': {
            const filtered = state.sections.filter((s) => s.id !== action.id);
            return {
                sections: filtered,
                expandedId: state.expandedId === action.id ? null : state.expandedId,
            };
        }
        case 'UPDATE_SECTION': {
            return {
                ...state,
                sections: state.sections.map((s) =>
                    s.id === action.id ? { ...s, [action.field]: action.value } : s,
                ),
            };
        }
        case 'SET_EXPANDED': {
            return {
                ...state,
                expandedId: state.expandedId === action.id ? null : action.id,
            };
        }
        default:
            return state;
    }
}

// --- Page ---

export default function SectionBuilderPage() {
    const params = useParams();
    const router = useRouter();
    const categoryId = params.category as string;
    const category = getCategoryById(categoryId);

    const [state, dispatch] = useReducer(builderReducer, {
        sections: [{ ...createSection(), type: 'Hero' }],
        expandedId: null,
    });

    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');
    const [pixelHeight, setPixelHeight] = useState('8000');
    const [canvasWidth, setCanvasWidth] = useState(860);

    const handleAdd = useCallback(() => {
        dispatch({ type: 'ADD_SECTION' });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validSections = state.sections.filter((s) => s.type);
        if (validSections.length === 0) {
            setError('최소 1개 이상의 섹션에 타입을 지정해주세요');
            return;
        }

        setIsGenerating(true);
        setError('');

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category: categoryId,
                    inputData: {},
                    pixelHeight,
                    canvasWidth,
                    sectionConfigs: validSections,
                }),
            });

            const result = await response.json();

            if (result.ok && result.data?.projectId) {
                router.push(`/editor/${result.data.projectId}`);
            } else {
                const errMsg = typeof result.error === 'string'
                    ? result.error
                    : result.error?.message || 'AI 생성에 실패했습니다';
                setError(errMsg);
            }
        } catch {
            setError('네트워크 오류가 발생했습니다');
        } finally {
            setIsGenerating(false);
        }
    };

    if (!category) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-20 text-center">
                <h1 className="text-2xl font-bold mb-4">카테고리를 찾을 수 없습니다</h1>
                <Link href="/new" className="btn-primary">
                    카테고리 선택으로 돌아가기
                </Link>
            </div>
        );
    }

    const Icon = CATEGORY_ICONS[category.icon];
    const color = CATEGORY_COLORS[category.id] ?? '#7C3AED';

    return (
        <div className="min-h-screen">
            <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
                {/* Header */}
                <Link
                    href={`/new/${categoryId}`}
                    className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    기본 입력으로 돌아가기
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center gap-4 mb-8">
                        <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${color}15`, color }}
                        >
                            {Icon && <Icon className="w-7 h-7" />}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold">섹션 빌더</h1>
                            <p className="text-neutral-400 text-sm">
                                {category.name} - 섹션별로 텍스트와 참고 이미지를 지정하세요
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Section count + Add button */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-sm text-neutral-400">
                                <Layers className="w-4 h-4" />
                                <span>
                                    섹션 {state.sections.length}개 / 최대 {MAX_SECTIONS}개
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={handleAdd}
                                disabled={state.sections.length >= MAX_SECTIONS}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{
                                    borderColor: `${color}40`,
                                    color,
                                    backgroundColor: `${color}10`,
                                }}
                            >
                                <Plus className="w-3.5 h-3.5" />
                                섹션 추가
                            </button>
                        </div>

                        {/* Section cards */}
                        <div className="space-y-2 mb-6">
                            <AnimatePresence mode="popLayout">
                                {state.sections.map((section, index) => (
                                    <SectionBuilderCard
                                        key={section.id}
                                        section={section}
                                        index={index}
                                        isExpanded={state.expandedId === section.id}
                                        onToggle={() =>
                                            dispatch({ type: 'SET_EXPANDED', id: section.id })
                                        }
                                        onUpdate={(field, value) =>
                                            dispatch({
                                                type: 'UPDATE_SECTION',
                                                id: section.id,
                                                field,
                                                value,
                                            })
                                        }
                                        onRemove={() =>
                                            dispatch({ type: 'REMOVE_SECTION', id: section.id })
                                        }
                                        accentColor={color}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Add button bottom */}
                        {state.sections.length < MAX_SECTIONS && (
                            <button
                                type="button"
                                onClick={handleAdd}
                                className="w-full py-3 rounded-xl border-2 border-dashed border-white/10 hover:border-white/20 text-neutral-500 hover:text-neutral-300 text-sm transition-colors flex items-center justify-center gap-2 mb-6"
                            >
                                <Plus className="w-4 h-4" />
                                섹션 추가
                            </button>
                        )}

                        {/* Options */}
                        <div className="glass-card rounded-2xl p-6 space-y-4 mb-6">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold mb-3">
                                    <Ruler className="w-4 h-4" style={{ color }} />
                                    페이지 높이
                                </label>
                                <div className="grid grid-cols-5 gap-2">
                                    {[
                                        { value: '4000', label: '4K' },
                                        { value: '8000', label: '8K' },
                                        { value: '12000', label: '12K' },
                                        { value: '20000', label: '20K' },
                                        { value: '40000', label: '40K' },
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setPixelHeight(opt.value)}
                                            className={`p-2 rounded-lg text-center transition-all border text-sm font-bold ${
                                                pixelHeight === opt.value
                                                    ? 'border-current bg-current/10'
                                                    : 'border-white/10 hover:border-white/20 bg-white/5'
                                            }`}
                                            style={
                                                pixelHeight === opt.value
                                                    ? { borderColor: color, color }
                                                    : undefined
                                            }
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold mb-3">
                                    <Ruler className="w-4 h-4" style={{ color }} />
                                    가로 폭
                                </label>
                                <div className="grid grid-cols-5 gap-2">
                                    {[
                                        { value: 790, label: '790' },
                                        { value: 800, label: '800' },
                                        { value: 860, label: '860' },
                                        { value: 1200, label: '1200' },
                                        { value: 1440, label: '1440' },
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setCanvasWidth(opt.value)}
                                            className={`p-2 rounded-lg text-center transition-all border text-sm font-bold ${
                                                canvasWidth === opt.value
                                                    ? 'border-current bg-current/10'
                                                    : 'border-white/10 hover:border-white/20 bg-white/5'
                                            }`}
                                            style={
                                                canvasWidth === opt.value
                                                    ? { borderColor: color, color }
                                                    : undefined
                                            }
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isGenerating}
                            className="btn-primary w-full py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    AI가 페이지를 생성하고 있습니다...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    AI로 상세페이지 생성하기
                                </>
                            )}
                        </button>

                        {error && (
                            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                                {error}
                            </div>
                        )}
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
