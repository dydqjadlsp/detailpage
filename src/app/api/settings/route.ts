import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = createClient();
    if (!supabase) {
        return NextResponse.json({ error: '서비스를 이용할 수 없습니다' }, { status: 503 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const { data, error } = await supabase
        .from('user_settings')
        .select('gemini_api_key')
        .eq('user_id', user.id)
        .single();

    if (error && error.code !== 'PGRST116') {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
        hasApiKey: !!(data?.gemini_api_key),
        maskedKey: data?.gemini_api_key
            ? data.gemini_api_key.slice(0, 6) + '...' + data.gemini_api_key.slice(-4)
            : null,
    });
}

export async function POST(request: Request) {
    const supabase = createClient();
    if (!supabase) {
        return NextResponse.json({ error: '서비스를 이용할 수 없습니다' }, { status: 503 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const { apiKey } = await request.json();

    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 10) {
        return NextResponse.json({ error: '유효하지 않은 API 키입니다' }, { status: 400 });
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

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}

export async function DELETE() {
    const supabase = createClient();
    if (!supabase) {
        return NextResponse.json({ error: '서비스를 이용할 수 없습니다' }, { status: 503 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
    }

    const { error } = await supabase
        .from('user_settings')
        .delete()
        .eq('user_id', user.id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
