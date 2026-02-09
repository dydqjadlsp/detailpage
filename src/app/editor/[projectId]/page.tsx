'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Save, ArrowLeft, Monitor, Smartphone, Loader2 } from 'lucide-react';
import Link from 'next/link';
import type { PuckData } from '@/types';
import { PUCK_COMPONENTS } from '@/components/puck/PuckComponents';

type ViewMode = 'desktop' | 'mobile';

export default function EditorPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.projectId as string;

    const [puckData, setPuckData] = useState<PuckData | null>(null);
    const [title, setTitle] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('desktop');

    useEffect(() => {
        async function loadProject() {
            try {
                const response = await fetch(`/api/projects/${projectId}`);
                const result = await response.json();
                if (result.ok) {
                    setPuckData(result.data.puckData);
                    setTitle(result.data.title);
                } else {
                    router.push('/dashboard');
                }
            } catch {
                router.push('/dashboard');
            } finally {
                setIsLoading(false);
            }
        }
        loadProject();
    }, [projectId, router]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await fetch(`/api/projects/${projectId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ puckData }),
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[rgb(var(--color-primary))]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-[rgb(var(--color-background))]">
            <div className="glass-strong border-b border-[rgb(var(--color-border))] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="p-2 rounded-lg hover:bg-[rgb(var(--color-surface-hover))] transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="font-bold text-lg truncate max-w-[200px] sm:max-w-none">
                        {title}
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-1 p-1 rounded-lg bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))]">
                        <button
                            type="button"
                            onClick={() => setViewMode('desktop')}
                            className={`p-1.5 rounded-md transition-colors ${viewMode === 'desktop'
                                ? 'bg-[rgb(var(--color-primary)/0.1)] text-[rgb(var(--color-primary))]'
                                : 'text-[rgb(var(--color-text-secondary))]'
                                }`}
                        >
                            <Monitor className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('mobile')}
                            className={`p-1.5 rounded-md transition-colors ${viewMode === 'mobile'
                                ? 'bg-[rgb(var(--color-primary)/0.1)] text-[rgb(var(--color-primary))]'
                                : 'text-[rgb(var(--color-text-secondary))]'
                                }`}
                        >
                            <Smartphone className="w-4 h-4" />
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="btn-primary text-sm px-4 py-2"
                    >
                        {isSaving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        저장
                    </button>
                </div>
            </div>

            <div className="flex-1 p-4 sm:p-8 flex justify-center">
                <div
                    className={`bg-white rounded-xl shadow-xl overflow-y-auto transition-all duration-300 ${viewMode === 'mobile' ? 'max-w-[375px]' : 'max-w-[1200px]'
                        } w-full`}
                    style={{ maxHeight: 'calc(100vh - 120px)' }}
                >
                    {puckData?.content?.map((component) => {
                        const Component = PUCK_COMPONENTS[component.type];
                        if (!Component) return null;
                        return (
                            <div key={component.props.id}>
                                {Component.render(component.props)}
                            </div>
                        );
                    })}

                    {(!puckData?.content || puckData.content.length === 0) && (
                        <div className="p-20 text-center text-[rgb(var(--color-text-tertiary))]">
                            생성된 콘텐츠가 없습니다
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
