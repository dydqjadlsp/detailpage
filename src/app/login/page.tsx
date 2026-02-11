'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Terminal, Mail, Lock, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const urlError = searchParams.get('error');

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const supabase = createClient();
        if (!supabase) {
            setError('서비스 연결에 실패했습니다. 잠시 후 다시 시도해주세요.');
            setIsLoading(false);
            return;
        }

        const { error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            if (authError.message.includes('Invalid login credentials')) {
                setError('이메일 또는 비밀번호가 올바르지 않습니다.');
            } else if (authError.message.includes('Email not confirmed')) {
                setError('이메일 인증이 완료되지 않았습니다. 메일함을 확인해주세요.');
            } else {
                setError(authError.message);
            }
            setIsLoading(false);
            return;
        }

        router.push('/dashboard');
        router.refresh();
    };

    const handleSocialLogin = async (provider: 'kakao' | 'google') => {
        const supabase = createClient();
        if (!supabase) {
            setError('서비스 연결에 실패했습니다.');
            return;
        }

        await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${window.location.origin}/api/auth/callback`,
            },
        });
    };

    const displayError = error || (urlError === 'auth_failed' ? '인증에 실패했습니다. 다시 시도해주세요.' : urlError === 'no_supabase' ? '서비스 연결에 실패했습니다.' : '');

    return (
        <div className="min-h-screen flex items-center justify-center px-6 py-20">
            <div className="w-full max-w-sm">
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center gap-2.5 mb-8">
                        <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                            <Terminal className="w-4 h-4 text-[rgb(var(--color-background))]" />
                        </div>
                        <span className="font-bold text-lg tracking-tight text-white">DetailPage</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-white">다시 오신 것을 환영합니다</h1>
                    <p className="text-sm text-[rgb(var(--color-text-secondary))] mt-2">
                        계속하려면 로그인해주세요
                    </p>
                </div>

                <div className="space-y-3 mb-8">
                    <button
                        type="button"
                        onClick={() => handleSocialLogin('google')}
                        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-[rgb(var(--color-border))] rounded-lg text-sm font-medium text-white hover:bg-[rgb(var(--color-surface))] transition-colors"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                        Google로 계속하기
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSocialLogin('kakao')}
                        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-[#FEE500] rounded-lg text-sm font-medium text-[#191919] hover:bg-[#FDD835] transition-colors"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#191919" d="M12 3C6.48 3 2 6.48 2 10.8c0 2.76 1.84 5.18 4.6 6.56-.2.72-.74 2.62-.84 3.02-.14.52.18.52.4.38.16-.1 2.56-1.74 3.6-2.44.72.1 1.48.16 2.24.16 5.52 0 10-3.48 10-7.78S17.52 3 12 3z" /></svg>
                        카카오로 계속하기
                    </button>
                </div>

                <div className="flex items-center gap-4 mb-8">
                    <div className="flex-1 h-px bg-[rgb(var(--color-border))]" />
                    <span className="text-xs text-[rgb(var(--color-text-tertiary))]">또는</span>
                    <div className="flex-1 h-px bg-[rgb(var(--color-border))]" />
                </div>

                {displayError && (
                    <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                        {displayError}
                    </div>
                )}

                <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1.5">
                            이메일
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@company.com"
                                required
                                className="input-field pl-10"
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-xs font-medium text-[rgb(var(--color-text-secondary))] mb-1.5">
                            비밀번호
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--color-text-tertiary))]" />
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="8자 이상"
                                required
                                minLength={8}
                                className="input-field pl-10"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary w-full justify-center py-3 mt-2"
                    >
                        {isLoading ? '로그인 중...' : '로그인'}
                        {!isLoading && <ArrowRight className="w-4 h-4" />}
                    </button>
                </form>

                <p className="text-center text-sm text-[rgb(var(--color-text-secondary))] mt-8">
                    계정이 없으신가요?{' '}
                    <Link href="/signup" className="text-white hover:underline font-medium">
                        회원가입
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
