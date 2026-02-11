'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import {
    Terminal,
    Key,
    Eye,
    EyeOff,
    Save,
    Trash2,
    ArrowLeft,
    CheckCircle,
    AlertCircle,
    LogOut,
    User as UserIcon,
    Mail,
} from 'lucide-react';

interface UserProfile {
    email: string;
    name: string;
    createdAt: string;
}

interface ApiKeyState {
    hasApiKey: boolean;
    maskedKey: string | null;
}

export default function MyPage() {
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [apiKeyState, setApiKeyState] = useState<ApiKeyState>({ hasApiKey: false, maskedKey: null });
    const [newApiKey, setNewApiKey] = useState('');
    const [showApiKey, setShowApiKey] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const loadUserData = useCallback(async () => {
        const supabase = createClient();
        if (!supabase) {
            router.push('/login');
            return;
        }

        const { data: { user: authUser }, error } = await supabase.auth.getUser();
        if (error || !authUser) {
            router.push('/login');
            return;
        }

        setUser({
            email: authUser.email || '',
            name: authUser.user_metadata?.name || '',
            createdAt: new Date(authUser.created_at).toLocaleDateString('ko-KR'),
        });

        try {
            const res = await fetch('/api/settings');
            if (res.ok) {
                const data = await res.json();
                setApiKeyState(data);
            }
        } catch {
            // Settings table may not exist yet
        }

        setIsLoading(false);
    }, [router]);

    useEffect(() => {
        loadUserData();
    }, [loadUserData]);

    const handleSaveApiKey = async () => {
        if (!newApiKey.trim()) return;
        setIsSaving(true);
        setMessage(null);

        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey: newApiKey.trim() }),
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'API 키가 저장되었습니다.' });
                setNewApiKey('');
                setApiKeyState({
                    hasApiKey: true,
                    maskedKey: newApiKey.trim().slice(0, 6) + '...' + newApiKey.trim().slice(-4),
                });
            } else {
                const data = await res.json();
                setMessage({ type: 'error', text: data.error || 'API 키 저장에 실패했습니다.' });
            }
        } catch {
            setMessage({ type: 'error', text: '네트워크 오류가 발생했습니다.' });
        }
        setIsSaving(false);
    };

    const handleDeleteApiKey = async () => {
        if (!confirm('API 키를 삭제하시겠습니까?')) return;
        setIsSaving(true);

        try {
            const res = await fetch('/api/settings', { method: 'DELETE' });
            if (res.ok) {
                setMessage({ type: 'success', text: 'API 키가 삭제되었습니다.' });
                setApiKeyState({ hasApiKey: false, maskedKey: null });
            }
        } catch {
            setMessage({ type: 'error', text: '삭제에 실패했습니다.' });
        }
        setIsSaving(false);
    };

    const handleLogout = async () => {
        const supabase = createClient();
        if (supabase) {
            await supabase.auth.signOut();
        }
        router.push('/');
        router.refresh();
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen py-20 px-4">
            <div className="max-w-2xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard"
                            className="p-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-white">마이페이지</h1>
                            <p className="text-sm text-neutral-400">계정 정보 및 API 키 관리</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-400 hover:text-white border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        로그아웃
                    </button>
                </div>

                {/* Profile Card */}
                <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                            <UserIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">{user?.name || '사용자'}</h2>
                            <p className="text-sm text-neutral-400">{user?.email}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                            <div className="flex items-center gap-2 mb-1">
                                <Mail className="w-3.5 h-3.5 text-neutral-500" />
                                <span className="text-xs text-neutral-500">이메일</span>
                            </div>
                            <p className="text-sm text-white font-medium">{user?.email}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                            <div className="flex items-center gap-2 mb-1">
                                <Terminal className="w-3.5 h-3.5 text-neutral-500" />
                                <span className="text-xs text-neutral-500">가입일</span>
                            </div>
                            <p className="text-sm text-white font-medium">{user?.createdAt}</p>
                        </div>
                    </div>
                </div>

                {/* API Key Management */}
                <div className="glass-card rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
                            <Key className="w-5 h-5 text-violet-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Gemini API Key</h2>
                            <p className="text-sm text-neutral-400">
                                AI 상세페이지 생성에 필요한 API 키를 등록해주세요.
                            </p>
                        </div>
                    </div>

                    {/* Status Message */}
                    {message && (
                        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${message.type === 'success'
                            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/10 border border-red-500/20 text-red-400'
                            }`}>
                            {message.type === 'success'
                                ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                            {message.text}
                        </div>
                    )}

                    {/* Current Key */}
                    {apiKeyState.hasApiKey && (
                        <div className="mb-4 p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                            <div>
                                <span className="text-xs text-neutral-500 block mb-1">현재 등록된 키</span>
                                <span className="text-sm text-white font-mono">{apiKeyState.maskedKey}</span>
                            </div>
                            <button
                                onClick={handleDeleteApiKey}
                                disabled={isSaving}
                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="API 키 삭제"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Input */}
                    <div className="space-y-3">
                        <label className="block text-xs font-medium text-neutral-400">
                            {apiKeyState.hasApiKey ? '새 API 키로 변경' : 'API 키 입력'}
                        </label>
                        <div className="relative">
                            <input
                                type={showApiKey ? 'text' : 'password'}
                                value={newApiKey}
                                onChange={(e) => setNewApiKey(e.target.value)}
                                placeholder="AIza..."
                                className="input-field pr-10 font-mono"
                            />
                            <button
                                type="button"
                                onClick={() => setShowApiKey(!showApiKey)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
                            >
                                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        <button
                            onClick={handleSaveApiKey}
                            disabled={!newApiKey.trim() || isSaving}
                            className="btn-primary w-full justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-4 h-4" />
                            {isSaving ? '저장 중...' : 'API 키 저장'}
                        </button>
                    </div>

                    {/* Help */}
                    <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/5">
                        <p className="text-xs text-neutral-500 leading-relaxed">
                            Gemini API 키는{' '}
                            <a
                                href="https://aistudio.google.com/apikey"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-violet-400 hover:underline"
                            >
                                Google AI Studio
                            </a>
                            에서 무료로 발급받을 수 있습니다.
                            키는 안전하게 서버에 암호화 저장되며, AI 페이지 생성 시에만 사용됩니다.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
