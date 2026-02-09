import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { unauthorizedError, forbiddenError, notFoundError, internalError } from '@/lib/errors';

export async function GET(
    _request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = createClient();
        if (!supabase) return unauthorizedError();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return unauthorizedError();

        const { data: project, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', params.id)
            .single();

        if (error || !project) return notFoundError('프로젝트를 찾을 수 없습니다');
        if (project.user_id !== user.id) return forbiddenError();

        return NextResponse.json({
            ok: true,
            data: {
                id: project.id,
                userId: project.user_id,
                title: project.title,
                category: project.category,
                status: project.status,
                puckData: project.puck_data,
                inputData: project.input_data,
                thumbnailUrl: project.thumbnail_url,
                createdAt: project.created_at,
                updatedAt: project.updated_at,
            },
        });
    } catch {
        return internalError();
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = createClient();
        if (!supabase) return unauthorizedError();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return unauthorizedError();

        const { data: existing } = await supabase
            .from('projects')
            .select('user_id')
            .eq('id', params.id)
            .single();

        if (!existing) return notFoundError('프로젝트를 찾을 수 없습니다');
        if (existing.user_id !== user.id) return forbiddenError();

        const body = await request.json();
        const updates: Record<string, unknown> = {};

        if (body.title !== undefined) updates.title = body.title;
        if (body.puckData !== undefined) updates.puck_data = body.puckData;
        if (body.status !== undefined) updates.status = body.status;
        updates.updated_at = new Date().toISOString();

        const { data: project, error } = await supabase
            .from('projects')
            .update(updates)
            .eq('id', params.id)
            .select()
            .single();

        if (error) return internalError(error.message);

        return NextResponse.json({
            ok: true,
            data: {
                id: project.id,
                title: project.title,
                status: project.status,
                updatedAt: project.updated_at,
            },
        });
    } catch {
        return internalError();
    }
}

export async function DELETE(
    _request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const supabase = createClient();
        if (!supabase) return unauthorizedError();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return unauthorizedError();

        const { data: existing } = await supabase
            .from('projects')
            .select('user_id')
            .eq('id', params.id)
            .single();

        if (!existing) return notFoundError('프로젝트를 찾을 수 없습니다');
        if (existing.user_id !== user.id) return forbiddenError();

        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', params.id);

        if (error) return internalError(error.message);

        return NextResponse.json({ ok: true, data: { deleted: true } });
    } catch {
        return internalError();
    }
}
