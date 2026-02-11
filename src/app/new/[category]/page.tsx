'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Loader2, X, Plus, CheckCircle, Layers, Type, Star, MessageSquare, Megaphone, Image as ImageIcon, Ruler } from 'lucide-react';
import Link from 'next/link';
import { getCategoryById, CATEGORY_ICONS } from '@/lib/categories';
import type { CategoryInputField } from '@/types';

const CATEGORY_COLORS: Record<string, string> = {
    ecommerce: '#F59E0B', realestate: '#3B82F6', medical: '#10B981',
    education: '#8B5CF6', restaurant: '#EF4444', travel: '#06B6D4',
    wedding: '#EC4899', legal: '#6366F1', fitness: '#F97316',
    saas: '#7C3AED', personal: '#14B8A6',
};

const GENERATION_STEPS = [
    { id: 'analyze', label: '입력 데이터 분석', icon: Layers, duration: 1500 },
    { id: 'hero', label: 'Hero 섹션 생성', icon: Type, duration: 2000 },
    { id: 'features', label: '핵심 특징 섹션 생성', icon: Star, duration: 2500 },
    { id: 'images', label: '이미지 생성 중', icon: ImageIcon, duration: 3000 },
    { id: 'testimonials', label: '고객 후기 섹션 생성', icon: MessageSquare, duration: 2000 },
    { id: 'cta', label: 'CTA 섹션 생성', icon: Megaphone, duration: 1500 },
    { id: 'finalize', label: '최종 조합 및 최적화', icon: CheckCircle, duration: 1000 },
];

interface GeneratedSection {
    type: string;
    title: string;
    subtitle?: string;
}

export default function CategoryInputPage() {
    const params = useParams();
    const router = useRouter();
    const categoryId = params.category as string;
    const category = getCategoryById(categoryId);

    const [formData, setFormData] = useState<Record<string, string | string[]>>({});
    const [tagInput, setTagInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentStep, setCurrentStep] = useState(-1);
    const [completedSteps, setCompletedSteps] = useState<string[]>([]);
    const [generatedSections, setGeneratedSections] = useState<GeneratedSection[]>([]);
    const [error, setError] = useState('');
    const [pixelHeight, setPixelHeight] = useState('8000');

    const simulateSteps = useCallback((): Promise<void> => {
        return new Promise((resolve) => {
            let stepIndex = 0;

            const runStep = () => {
                if (stepIndex >= GENERATION_STEPS.length) {
                    resolve();
                    return;
                }

                setCurrentStep(stepIndex);
                const step = GENERATION_STEPS[stepIndex];

                setTimeout(() => {
                    setCompletedSteps((prev) => [...prev, step.id]);

                    if (step.id === 'hero') {
                        setGeneratedSections((prev) => [...prev, {
                            type: 'Hero',
                            title: '히어로 섹션',
                            subtitle: 'AI 생성 헤드라인',
                        }]);
                    } else if (step.id === 'features') {
                        setGeneratedSections((prev) => [...prev, {
                            type: 'Features',
                            title: '핵심 특징',
                        }]);
                    } else if (step.id === 'testimonials') {
                        setGeneratedSections((prev) => [...prev, {
                            type: 'Testimonials',
                            title: '고객 후기',
                        }]);
                    } else if (step.id === 'cta') {
                        setGeneratedSections((prev) => [...prev, {
                            type: 'CTA',
                            title: '행동 유도',
                        }]);
                    }

                    stepIndex++;
                    runStep();
                }, step.duration);
            };

            runStep();
        });
    }, []);

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

    const handleChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleTagAdd = (name: string) => {
        if (!tagInput.trim()) return;
        const current = (formData[name] as string[]) || [];
        setFormData((prev) => ({ ...prev, [name]: [...current, tagInput.trim()] }));
        setTagInput('');
    };

    const handleTagRemove = (name: string, index: number) => {
        const current = (formData[name] as string[]) || [];
        setFormData((prev) => ({
            ...prev,
            [name]: current.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsGenerating(true);
        setCurrentStep(0);
        setCompletedSteps([]);
        setGeneratedSections([]);
        setError('');

        const stepAnimation = simulateSteps();

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category: category.id,
                    inputData: formData,
                    pixelHeight,
                }),
            });

            const result = await response.json();

            await stepAnimation;
            setCurrentStep(GENERATION_STEPS.length);
            setCompletedSteps(GENERATION_STEPS.map((s) => s.id));

            if (result.ok && result.data?.puckData) {
                const sections = result.data.puckData.content || [];
                setGeneratedSections(
                    sections.map((s: Record<string, unknown>) => ({
                        type: String(s.type),
                        title: String((s.props as Record<string, unknown>)?.title || s.type),
                        subtitle: String((s.props as Record<string, unknown>)?.subtitle || ''),
                    }))
                );

                setTimeout(() => {
                    router.push(`/editor/${result.data.projectId}`);
                }, 1500);
            } else {
                const errMsg = typeof result.error === 'string'
                    ? result.error
                    : result.error?.message || 'AI 생성에 실패했습니다. 다시 시도해주세요.';
                setError(errMsg);
                setIsGenerating(false);
            }
        } catch {
            await stepAnimation;
            setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
            setIsGenerating(false);
        }
    };

    const renderField = (field: CategoryInputField) => {
        switch (field.type) {
            case 'textarea':
                return (
                    <textarea
                        className="input-field min-h-[120px] resize-none"
                        placeholder={field.placeholder}
                        required={field.required}
                        value={(formData[field.name] as string) || ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                    />
                );
            case 'select':
                return (
                    <select
                        className="input-field"
                        required={field.required}
                        value={(formData[field.name] as string) || ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                    >
                        <option value="">선택해주세요</option>
                        {field.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                );
            case 'tags':
                return (
                    <div>
                        <div className="flex gap-2">
                            <input
                                className="input-field flex-1"
                                placeholder={field.placeholder}
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleTagAdd(field.name);
                                    }
                                }}
                            />
                            <button
                                type="button"
                                className="btn-secondary px-3"
                                onClick={() => handleTagAdd(field.name)}
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        {((formData[field.name] as string[]) || []).length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {((formData[field.name] as string[]) || []).map((tag, i) => (
                                    <span
                                        key={`${tag}-${i}`}
                                        className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleTagRemove(field.name, i)}
                                            className="hover:text-red-400 transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                );
            default:
                return (
                    <input
                        type="text"
                        className="input-field"
                        placeholder={field.placeholder}
                        required={field.required}
                        value={(formData[field.name] as string) || ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                    />
                );
        }
    };

    const progressPercent = isGenerating
        ? Math.round(((completedSteps.length) / GENERATION_STEPS.length) * 100)
        : 0;

    return (
        <div className={`min-h-screen transition-all duration-500 ${isGenerating ? 'flex' : ''}`}>
            {/* Left: Form */}
            <div className={`transition-all duration-500 ${isGenerating ? 'w-1/2 border-r border-white/5' : 'w-full'}`}>
                <div className={`mx-auto px-4 py-8 sm:py-12 ${isGenerating ? 'max-w-xl' : 'max-w-2xl'}`}>
                    <Link
                        href="/new"
                        className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors mb-8"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        카테고리 선택
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
                            <div>
                                <h1 className="text-2xl font-bold">{category.name}</h1>
                                <p className="text-neutral-400 text-sm">
                                    {category.description}
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 sm:p-8 space-y-6">
                            {category.inputSchema.map((field) => (
                                <div key={field.name}>
                                    <label className="block text-sm font-semibold mb-2">
                                        {field.label}
                                        {field.required && (
                                            <span className="text-red-400 ml-1">*</span>
                                        )}
                                    </label>
                                    {renderField(field)}
                                </div>
                            ))}

                            <div className="pt-2 border-t border-white/5">
                                <label className="flex items-center gap-2 text-sm font-semibold mb-3">
                                    <Ruler className="w-4 h-4" style={{ color }} />
                                    페이지 높이
                                </label>
                                <div className="grid grid-cols-5 gap-2">
                                    {[
                                        { value: '4000', label: '4K', desc: '4개 섹션' },
                                        { value: '8000', label: '8K', desc: '6개 섹션' },
                                        { value: '12000', label: '12K', desc: '8개 섹션' },
                                        { value: '20000', label: '20K', desc: '12개 섹션' },
                                        { value: '40000', label: '40K', desc: '20개 섹션' },
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setPixelHeight(opt.value)}
                                            className={`p-2 rounded-lg text-center transition-all border ${pixelHeight === opt.value
                                                ? 'border-current bg-current/10'
                                                : 'border-white/10 hover:border-white/20 bg-white/5'
                                                }`}
                                            style={pixelHeight === opt.value ? { borderColor: color, color } : undefined}
                                        >
                                            <div className="text-sm font-bold">{opt.label}</div>
                                            <div className="text-[10px] text-neutral-500">{opt.desc}</div>
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-neutral-500 mt-2">
                                    {Number(pixelHeight).toLocaleString()}px 높이 / 섹션이 많을수록 더 많은 이미지가 생성됩니다
                                </p>
                            </div>

                            <div className="pt-4">
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
                            </div>

                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                                    {error}
                                </div>
                            )}
                        </form>
                    </motion.div>
                </div>
            </div>

            {/* Right: Preview Panel */}
            <AnimatePresence>
                {isGenerating && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: '50%', opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                        className="h-screen sticky top-0 overflow-y-auto bg-[rgb(var(--color-surface))]"
                    >
                        <div className="p-6 sm:p-8">
                            {/* Preview Header */}
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-bold text-white">
                                        Preview
                                    </h2>
                                    <span className="text-xs font-mono text-violet-400 bg-violet-500/10 px-2 py-1 rounded">
                                        {progressPercent}%
                                    </span>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full rounded-full"
                                        style={{
                                            background: `linear-gradient(90deg, ${color}, #8B5CF6)`,
                                        }}
                                        initial={{ width: '0%' }}
                                        animate={{ width: `${progressPercent}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                            </div>

                            {/* Generation Steps */}
                            <div className="space-y-3 mb-8">
                                {GENERATION_STEPS.map((step, index) => {
                                    const StepIcon = step.icon;
                                    const isCompleted = completedSteps.includes(step.id);
                                    const isCurrent = currentStep === index;

                                    return (
                                        <motion.div
                                            key={step.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{
                                                opacity: index <= currentStep ? 1 : 0.3,
                                                x: 0,
                                            }}
                                            transition={{ delay: index * 0.1, duration: 0.3 }}
                                            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isCurrent
                                                ? 'bg-violet-500/10 border border-violet-500/20'
                                                : isCompleted
                                                    ? 'bg-white/5 border border-white/5'
                                                    : 'border border-transparent'
                                                }`}
                                        >
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isCompleted
                                                ? 'bg-emerald-500/20 text-emerald-400'
                                                : isCurrent
                                                    ? 'bg-violet-500/20 text-violet-400'
                                                    : 'bg-white/5 text-neutral-600'
                                                }`}>
                                                {isCompleted ? (
                                                    <CheckCircle className="w-4 h-4" />
                                                ) : isCurrent ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <StepIcon className="w-4 h-4" />
                                                )}
                                            </div>
                                            <span className={`text-sm font-medium ${isCompleted
                                                ? 'text-emerald-400'
                                                : isCurrent
                                                    ? 'text-white'
                                                    : 'text-neutral-600'
                                                }`}>
                                                {step.label}
                                            </span>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Section Preview Cards */}
                            {generatedSections.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-neutral-400 mb-3">
                                        생성된 섹션
                                    </h3>
                                    <div className="space-y-3">
                                        {generatedSections.map((section, index) => (
                                            <motion.div
                                                key={`${section.type}-${index}`}
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                transition={{ duration: 0.4 }}
                                                className="glass-card rounded-xl p-4"
                                            >
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span
                                                        className="px-2 py-0.5 text-xs font-mono rounded"
                                                        style={{
                                                            backgroundColor: `${color}15`,
                                                            color,
                                                        }}
                                                    >
                                                        {section.type}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-white font-medium">
                                                    {section.title}
                                                </p>
                                                {section.subtitle && (
                                                    <p className="text-xs text-neutral-500 mt-1">
                                                        {section.subtitle}
                                                    </p>
                                                )}
                                                {/* Section skeleton */}
                                                <div className="mt-3 space-y-2">
                                                    <div className="h-2 bg-white/5 rounded-full w-3/4" />
                                                    <div className="h-2 bg-white/5 rounded-full w-1/2" />
                                                    <div className="h-2 bg-white/5 rounded-full w-5/6" />
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Completion State */}
                            {completedSteps.length === GENERATION_STEPS.length && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="mt-8 text-center p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20"
                                >
                                    <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                                    <p className="text-lg font-semibold text-emerald-400">
                                        Generation Complete
                                    </p>
                                    <p className="text-sm text-neutral-400 mt-1">
                                        Moving to editor...
                                    </p>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
