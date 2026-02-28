import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { unauthorizedError, validationError, internalError } from '@/lib/errors';

export async function GET() {
    const supabase = await createClient();
    if (!supabase) return internalError('서비스를 이용할 수 없습니다');

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return unauthorizedError();

    const { data, error } = await supabase
        .from('user_settings')
        .select('gemini_api_key')
        .eq('user_id', user.id)
        .single();

    if (error && error.code !== 'PGRST116') return internalError();

    return NextResponse.json({
        ok: true,
        data: {
            hasApiKey: !!(data?.gemini_api_key),
            maskedKey: data?.gemini_api_key
                ? data.gemini_api_key.slice(0, 6) + '...' + data.gemini_api_key.slice(-4)
                : null,
        },
    });
}

export async function POST(request: Request) {
    const supabase = await createClient();
    if (!supabase) return internalError('서비스를 이용할 수 없습니다');

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return unauthorizedError();

    const { apiKey } = await request.json();

    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 10) {
        return validationError('유효하지 않은 API 키입니다');
    }

    const { error } = await supabase
        .from('user_settings')
        .upsert({
            user_id: user.id,
            gemini_api_key: apiKey.trim(),
            updated_at: new Date().toISOString(),
        }, {
            onConflict: 'user_id',
        });

    if (error) return internalError();

    return NextResponse.json({ ok: true, data: { saved: true } });
}

export async function DELETE() {
    const supabase = await createClient();
    if (!supabase) return internalError('서비스를 이용할 수 없습니다');

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return unauthorizedError();

    const { error } = await supabase
        .from('user_settings')
        .delete()
        .eq('user_id', user.id);

    if (error) return internalError();

    return NextResponse.json({ ok: true, data: { deleted: true } });
}
