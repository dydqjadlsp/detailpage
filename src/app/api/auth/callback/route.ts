import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// 허용된 리다이렉트 경로 (상대 경로만, 외부 URL 차단)
const ALLOWED_REDIRECT_PATHS = ['/dashboard', '/projects', '/editor', '/new', '/settings'];

function sanitizeRedirectPath(path: string | null): string {
    if (!path) return '/dashboard';
    // 상대 경로만 허용, 프로토콜/외부 URL 차단
    if (!path.startsWith('/') || path.startsWith('//')) return '/dashboard';
    // 허용 목록의 prefix 매칭
    const isAllowed = ALLOWED_REDIRECT_PATHS.some((p) => path === p || path.startsWith(`${p}/`));
    return isAllowed ? path : '/dashboard';
}

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = sanitizeRedirectPath(searchParams.get('next'));

    if (code) {
        const supabase = await createClient();
        if (!supabase) {
            return NextResponse.redirect(`${origin}/login?error=no_supabase`);
        }

        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
