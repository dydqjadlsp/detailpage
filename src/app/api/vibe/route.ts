import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { unauthorizedError, validationError, internalError, externalApiError } from '@/lib/errors';

export async function POST(request: Request) {
    try {
        const supabase = createClient();
        if (!supabase) return unauthorizedError();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return unauthorizedError();

        const body = await request.json();
        const { projectId, message, currentPuckData } = body;

        if (!projectId || !message || !currentPuckData) {
            return validationError('프로젝트 ID, 메시지, 현재 데이터가 필요합니다');
        }

        const { data: project } = await supabase
            .from('projects')
            .select('user_id')
            .eq('id', projectId)
            .single();

        if (!project || project.user_id !== user.id) {
            return unauthorizedError('프로젝트에 대한 권한이 없습니다');
        }

        const { data: settings } = await supabase
            .from('user_settings')
            .select('gemini_api_key')
            .eq('user_id', user.id)
            .single();

        const apiKey = settings?.gemini_api_key;
        if (!apiKey) return validationError('마이페이지에서 Gemini API 키를 먼저 등록해주세요');

        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey });


        const prompt = `당신은 웹 페이지 디자인 수정 전문가입니다.

사용자가 현재 페이지에 대해 수정을 요청했습니다.

[사용자 요청]
${message}

[현재 페이지 데이터]
${JSON.stringify(currentPuckData, null, 2)}

[지시사항]
1. 사용자의 요청을 반영하여 수정된 페이지 데이터를 출력하세요
2. 기존 구조를 최대한 유지하면서 요청된 부분만 수정하세요
3. 각 컴포넌트의 id는 변경하지 마세요
4. JSON 형식으로만 출력하세요 (다른 텍스트 없이)
5. 변경 요약을 "changes_summary" 필드에 한국어로 포함하세요

출력 형식:
{
  "puckData": { 수정된 content와 root },
  "changes_summary": "변경 사항 요약"
}`;

        const result = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';

        let parsed;
        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('JSON 파싱 실패');
            parsed = JSON.parse(jsonMatch[0]);
        } catch {
            return externalApiError('AI 응답을 파싱할 수 없습니다');
        }

        await supabase.from('vibe_sessions').insert({
            project_id: projectId,
            user_id: user.id,
            message,
            response: parsed.changes_summary || '',
            changes_applied: parsed.puckData || {},
        });

        return NextResponse.json({
            ok: true,
            data: {
                updatedPuckData: parsed.puckData,
                changesSummary: parsed.changes_summary || '수정 완료',
            },
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : '알 수 없는 오류';
        return internalError(message);
    }
}
