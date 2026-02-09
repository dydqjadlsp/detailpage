'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Terminal, Menu, X, LogOut, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

const NAV_ITEMS = [
    { href: '/dashboard', label: '대시보드' },
    { href: '/new', label: '새 프로젝트' },
];

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const supabase = createClient();
        if (!supabase) {
            setIsLoading(false);
            return;
        }

        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user);
            setIsLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null);
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleSignOut = async () => {
        const supabase = createClient();
        if (!supabase) return;
        await supabase.auth.signOut();
        setUser(null);
        router.push('/');
        router.refresh();
    };

    const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || '';

    return (
        <header className="glass-technical sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-7 h-7 bg-white rounded flex items-center justify-center">
                            <Terminal className="w-3.5 h-3.5 text-[rgb(var(--color-background))]" />
                        </div>
                        <span className="font-bold text-[15px] tracking-tight text-white">
                            AutoPage
                        </span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-8">
                        {user ? (
                            NAV_ITEMS.map((item) => {
                                const isActive = pathname.startsWith(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`text-sm transition-colors ${isActive
                                            ? 'text-white'
                                            : 'text-[rgb(var(--color-text-secondary))] hover:text-white'
                                            }`}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })
                        ) : (
                            <>
                                <Link href="#features" className="text-sm text-[rgb(var(--color-text-secondary))] hover:text-white transition-colors">
                                    서비스
                                </Link>
                                <Link href="#cases" className="text-sm text-[rgb(var(--color-text-secondary))] hover:text-white transition-colors">
                                    활용 사례
                                </Link>
                                <Link href="#security" className="text-sm text-[rgb(var(--color-text-secondary))] hover:text-white transition-colors">
                                    보안
                                </Link>
                            </>
                        )}
                    </nav>

                    <div className="hidden md:flex items-center gap-3">
                        {isLoading ? (
                            <div className="w-16 h-8 rounded bg-[rgb(var(--color-surface))] animate-pulse" />
                        ) : user ? (
                            <>
                                <div className="flex items-center gap-2 text-sm text-[rgb(var(--color-text-secondary))]">
                                    <User className="w-3.5 h-3.5" />
                                    <span className="max-w-[100px] truncate">{displayName}</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleSignOut}
                                    className="text-sm text-[rgb(var(--color-text-secondary))] hover:text-white transition-colors flex items-center gap-1.5"
                                >
                                    <LogOut className="w-3.5 h-3.5" />
                                    로그아웃
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="text-sm text-[rgb(var(--color-text-secondary))] hover:text-white transition-colors">
                                    로그인
                                </Link>
                                <Link href="/signup" className="btn-primary px-5 py-2 text-sm">
                                    시작하기
                                </Link>
                            </>
                        )}
                    </div>

                    <button
                        type="button"
                        className="md:hidden p-2 text-[rgb(var(--color-text-secondary))] hover:text-white transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-[rgb(var(--color-border))] bg-[rgb(var(--color-background))]">
                    <div className="px-6 py-4 space-y-1">
                        {user ? (
                            NAV_ITEMS.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="block py-2.5 text-sm text-[rgb(var(--color-text-secondary))] hover:text-white transition-colors"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {item.label}
                                </Link>
                            ))
                        ) : (
                            <>
                                <Link href="#features" className="block py-2.5 text-sm text-[rgb(var(--color-text-secondary))]" onClick={() => setIsMobileMenuOpen(false)}>서비스</Link>
                                <Link href="#cases" className="block py-2.5 text-sm text-[rgb(var(--color-text-secondary))]" onClick={() => setIsMobileMenuOpen(false)}>활용 사례</Link>
                                <Link href="#security" className="block py-2.5 text-sm text-[rgb(var(--color-text-secondary))]" onClick={() => setIsMobileMenuOpen(false)}>보안</Link>
                            </>
                        )}
                        <div className="pt-4 border-t border-[rgb(var(--color-border))] space-y-2">
                            {user ? (
                                <button type="button" onClick={() => { handleSignOut(); setIsMobileMenuOpen(false); }} className="w-full text-left py-2.5 text-sm text-[rgb(var(--color-text-secondary))]">
                                    로그아웃
                                </button>
                            ) : (
                                <>
                                    <Link href="/login" className="block py-2.5 text-sm text-[rgb(var(--color-text-secondary))]" onClick={() => setIsMobileMenuOpen(false)}>로그인</Link>
                                    <Link href="/signup" className="btn-primary w-full justify-center text-sm mt-2" onClick={() => setIsMobileMenuOpen(false)}>시작하기</Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
