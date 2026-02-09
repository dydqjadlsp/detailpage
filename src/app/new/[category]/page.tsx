'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Loader2, X, Plus } from 'lucide-react';
import Link from 'next/link';
import { getCategoryById, CATEGORY_ICONS } from '@/lib/categories';
import type { CategoryInputField } from '@/types';

const CATEGORY_COLORS: Record<string, string> = {
    ecommerce: '#F59E0B', realestate: '#3B82F6', medical: '#10B981',
    education: '#8B5CF6', restaurant: '#EF4444', travel: '#06B6D4',
    wedding: '#EC4899', legal: '#6366F1', fitness: '#F97316',
    saas: '#7C3AED', personal: '#14B8A6',
};

export default function CategoryInputPage() {
    const params = useParams();
    const router = useRouter();
    const categoryId = params.category as string;
    const category = getCategoryById(categoryId);

    const [formData, setFormData] = useState<Record<string, string | string[]>>({});
    const [tagInput, setTagInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

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

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category: category.id,
                    inputData: formData,
                }),
            });

            const result = await response.json();
            if (result.ok) {
                router.push(`/editor/${result.data.projectId}`);
            }
        } catch {
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
                                        className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full bg-[rgb(var(--color-primary)/0.08)] text-[rgb(var(--color-primary))]"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleTagRemove(field.name, i)}
                                            className="hover:text-[rgb(var(--color-error))] transition-colors"
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

    return (
        <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
            <Link
                href="/new"
                className="inline-flex items-center gap-2 text-sm text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] transition-colors mb-8"
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
                        <p className="text-[rgb(var(--color-text-secondary))] text-sm">
                            {category.description}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-6">
                    {category.inputSchema.map((field) => (
                        <div key={field.name}>
                            <label className="block text-sm font-semibold mb-2">
                                {field.label}
                                {field.required && (
                                    <span className="text-[rgb(var(--color-error))] ml-1">*</span>
                                )}
                            </label>
                            {renderField(field)}
                        </div>
                    ))}

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
                </form>
            </motion.div>
        </div>
    );
}
