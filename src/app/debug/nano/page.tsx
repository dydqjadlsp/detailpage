
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function NanoDebugPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/generate/nano', {
                method: 'POST',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to generate project');
            }

            const { data } = await response.json();

            // Redirect to the new project
            router.push(`/projects/${data.projectId}`);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 text-white p-4">
            <h1 className="text-3xl font-bold mb-8">Nano Banana Generator (Debug)</h1>

            <div className="bg-neutral-800 p-8 rounded-xl shadow-2xl max-w-md w-full border border-neutral-700">
                <p className="text-neutral-400 mb-6 text-center">
                    Click below to generate the Nano Banana project with your currently logged-in user credentials.
                </p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg mb-6 text-sm">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        'Generate Nano Banana'
                    )}
                </button>
            </div>
        </div>
    );
}
