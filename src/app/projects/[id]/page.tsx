'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import type { PuckData } from '@/types';
import { PUCK_COMPONENTS, getFallbackComponent } from '@/components/puck';

export default function ProjectPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [puckData, setPuckData] = useState<PuckData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadProject() {
            try {
                const response = await fetch(`/api/projects/${id}`);
                if (!response.ok) throw new Error('Failed to load');

                const result = await response.json();
                if (result.ok) {
                    setPuckData(result.data.puckData);
                } else {
                    router.push('/404');
                }
            } catch {
                router.push('/404');
            } finally {
                setIsLoading(false);
            }
        }
        loadProject();
    }, [id, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--color-background))]">
                <Loader2 className="w-8 h-8 animate-spin text-[rgb(var(--color-primary))]" />
            </div>
        );
    }

    if (!puckData?.content) {
        return null;
    }

    return (
        <main className="min-h-screen bg-[rgb(var(--color-background))]">
            {puckData.content.map((component: { type: string; props: Record<string, unknown> }, i: number) => {
                const Component = PUCK_COMPONENTS[component.type] || getFallbackComponent();
                // Ensure unique key
                const key = (component.props.id as string) || `component-${i}`;
                return (
                    <div key={key}>
                        {Component.render(component.props)}
                    </div>
                );
            })}
        </main>
    );
}
