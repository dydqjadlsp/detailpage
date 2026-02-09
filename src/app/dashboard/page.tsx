'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ProjectCard {
    id: string;
    title: string;
    category: string;
    status: 'draft' | 'published';
    thumbnailUrl: string | null;
    updatedAt: string;
}

const CATEGORY_LABELS: Record<string, string> = {
    ecommerce: '이커머스', realestate: '부동산', medical: '병원/의료',
    education: '학원/교육', restaurant: '음식점/카페', travel: '여행/숙박',
    wedding: '웨딩/이벤트', legal: '법률/세무', fitness: '피트니스',
    saas: '스타트업/SaaS', personal: '개인 브랜딩',
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    draft: { label: '작성 중', color: 'var(--color-warning)' },
    published: { label: '완성', color: 'var(--color-success)' },
};

export default function DashboardPage() {
    const [projects, setProjects] = useState<ProjectCard[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadProjects() {
            try {
                const response = await fetch('/api/projects');
                const result = await response.json();
                if (result.ok) {
                    setProjects(result.data.projects);
                }
            } catch {
                // Handled silently
            } finally {
                setIsLoading(false);
            }
        }
        loadProjects();
    }, []);

    const handleDelete = async (id: string) => {
        const confirmed = window.confirm('프로젝트를 삭제하시겠습니까?');
        if (!confirmed) return;

        try {
            await fetch(`/api/projects/${id}`, { method: 'DELETE' });
            setProjects((prev) => prev.filter((p) => p.id !== id));
        } catch {
            // Handled silently
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">내 프로젝트</h1>
                    <p className="text-[rgb(var(--color-text-secondary))] mt-1">
                        {projects.length}개의 프로젝트
                    </p>
                </div>
                <Link href="/new" className="btn-primary">
                    <Plus className="w-4 h-4" />
                    새 프로젝트
                </Link>
            </div>

            {isLoading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="card p-0 overflow-hidden animate-pulse">
                            <div className="h-40 bg-[rgb(var(--color-border)/0.3)]" />
                            <div className="p-5 space-y-3">
                                <div className="h-5 bg-[rgb(var(--color-border)/0.3)] rounded w-2/3" />
                                <div className="h-4 bg-[rgb(var(--color-border)/0.3)] rounded w-1/3" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : projects.length === 0 ? (
                <motion.div
                    className="card p-12 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
                        <Plus className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">
                        첫 번째 프로젝트를 시작해봐요
                    </h3>
                    <p className="text-[rgb(var(--color-text-secondary))] mb-6">
                        카테고리를 선택하고 정보를 입력하면 AI가 상세페이지를 만들어줍니다
                    </p>
                    <Link href="/new" className="btn-primary">
                        <Plus className="w-4 h-4" />
                        새 프로젝트 만들기
                    </Link>
                </motion.div>
            ) : (
                <motion.div
                    className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
                    initial="initial"
                    animate="animate"
                    variants={{
                        animate: { transition: { staggerChildren: 0.05 } },
                    }}
                >
                    {projects.map((project) => {
                        const status = STATUS_LABELS[project.status];
                        return (
                            <motion.div
                                key={project.id}
                                className="card p-0 overflow-hidden group"
                                variants={{
                                    initial: { opacity: 0, y: 20 },
                                    animate: { opacity: 1, y: 0 },
                                }}
                            >
                                <div className="h-40 bg-gradient-to-br from-[rgb(var(--color-primary)/0.05)] to-[rgb(var(--color-secondary)/0.08)] flex items-center justify-center">
                                    {project.thumbnailUrl ? (
                                        <img
                                            src={project.thumbnailUrl}
                                            alt={project.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-4xl font-bold text-[rgb(var(--color-primary)/0.15)]">
                                            {project.title.charAt(0)}
                                        </span>
                                    )}
                                </div>
                                <div className="p-5">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <h3 className="font-bold truncate">{project.title}</h3>
                                            <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                                                {CATEGORY_LABELS[project.category] || project.category}
                                            </p>
                                        </div>
                                        <span
                                            className="text-xs font-medium px-2.5 py-1 rounded-full shrink-0"
                                            style={{
                                                backgroundColor: `rgb(${status.color} / 0.1)`,
                                                color: `rgb(${status.color})`,
                                            }}
                                        >
                                            {status.label}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-[rgb(var(--color-border))]">
                                        <span className="flex items-center gap-1 text-xs text-[rgb(var(--color-text-tertiary))]">
                                            <Clock className="w-3 h-3" />
                                            {new Date(project.updatedAt).toLocaleDateString('ko-KR')}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <Link
                                                href={`/editor/${project.id}`}
                                                className="p-1.5 rounded-lg hover:bg-[rgb(var(--color-surface-hover))] transition-colors"
                                                title="편집"
                                            >
                                                <Edit3 className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(project.id)}
                                                className="p-1.5 rounded-lg hover:bg-[rgb(var(--color-error)/0.08)] transition-colors"
                                                title="삭제"
                                            >
                                                <Trash2 className="w-4 h-4 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-error))]" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}
        </div>
    );
}
