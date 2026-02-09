import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { unauthorizedError, internalError } from '@/lib/errors';

export async function GET() {
    try {
        const supabase = createClient();
        if (!supabase) return unauthorizedError();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return unauthorizedError();

        const { data: projects, error } = await supabase
            .from('projects')
            .select('id, title, category, status, thumbnail_url, created_at, updated_at')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false });

        if (error) return internalError(error.message);

        return NextResponse.json({
            ok: true,
            data: {
                projects: (projects || []).map((p) => ({
                    id: p.id,
                    title: p.title,
                    category: p.category,
                    status: p.status,
                    thumbnailUrl: p.thumbnail_url,
                    createdAt: p.created_at,
                    updatedAt: p.updated_at,
                })),
                total: projects?.length || 0,
            },
        });
    } catch {
        return internalError();
    }
}

export async function POST(request: Request) {
    try {
        const supabase = createClient();
        if (!supabase) return unauthorizedError();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return unauthorizedError();

        const body = await request.json();
        const { title, category, puckData, inputData } = body;

        if (!title || !category) {
            return NextResponse.json({ ok: false, message: '제목과 카테고리는 필수입니다' }, { status: 400 });
        }

        const { data: project, error } = await supabase
            .from('projects')
            .insert({
                user_id: user.id,
                title,
                category,
                status: 'draft',
                puck_data: puckData || null,
                input_data: inputData || null,
            })
            .select()
            .single();

        if (error) return internalError(error.message);

        return NextResponse.json({
            ok: true,
            data: {
                id: project.id,
                title: project.title,
                category: project.category,
                status: project.status,
            },
        }, { status: 201 });
    } catch {
        return internalError();
    }
}
