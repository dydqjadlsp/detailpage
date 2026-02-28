import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
    unauthorizedError,
    validationError,
    internalError,
} from '@/lib/errors';

const TEXT_MODELS = ['gemini-3-pro-preview', 'gemini-2.5-pro', 'gemini-2.5-flash'] as const;

function isServerOverloadError(err: unknown): boolean {
    const msg = err instanceof Error ? err.message : String(err);
    return /503|429|500|502|504|UNAVAILABLE|overloaded|quota|rate.?limit|resource.?exhausted/i.test(msg);
}

const CATEGORY_CONTEXT: Record<string, string> = {
    ecommerce: '이커머스 상품',
    realestate: '부동산 매물',
    medical: '병원/의료기관',
    education: '학원/교육기관',
    restaurant: '음식점/카페',
    travel: '여행/숙박 상품',
    wedding: '웨딩/이벤트',
    legal: '법률/세무 사무소',
    fitness: '피트니스/요가 센터',
    saas: 'SaaS/스타트업 제품',
    personal: '개인 브랜딩/포트폴리오',
};

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        if (!supabase) return unauthorizedError();
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return unauthorizedError();

        const body = await request.json();
        const { category, fieldName, currentData } = body;

        if (!category || !fieldName) {
            return validationError('카테고리와 필드 정보는 필수입니다');
        }

        const { data: settings } = await supabase
            .from('user_settings')
            .select('gemini_api_key')
            .eq('user_id', user.id)
            .single();

        const apiKey = settings?.gemini_api_key;
        if (!apiKey) {
            return validationError(
                '마이페이지에서 Gemini API 키를 먼저 등록해주세요'
            );
        }

        const contextLabel = CATEGORY_CONTEXT[category] || category;
        const existingInfo = Object.entries(currentData || {})
            .filter(([key, value]) => key !== fieldName && value)
            .map(([key, value]) => {
                if (Array.isArray(value)) return `${key}: ${value.join(', ')}`;
                return `${key}: ${value}`;
            })
            .join('\n');

        const prompt = `당신은 ${contextLabel} 분야의 전문 카피라이터입니다.

아래 정보를 바탕으로 상세페이지에 사용할 매력적인 소개 글(설명)을 작성해주세요.

[이미 입력된 정보]
${existingInfo || '(아직 입력된 정보가 없습니다)'}

[작성 규칙]
1. 3-5문장으로 작성하세요.
2. ${contextLabel}의 핵심 매력과 차별점을 강조하세요.
3. 잠재 고객의 방문/구매/이용 욕구를 자극하는 설득력 있는 카피를 작성하세요.
4. 자연스럽고 전문적인 한국어를 사용하세요.
5. 과장이나 허위 표현은 피하세요.
6. 설명 텍스트만 출력하세요. 따옴표, 마크다운, 제목 등 추가 포맷 없이 순수 텍스트만 반환하세요.`;

        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey });

        let text: string | undefined;
        let lastErr: Error | null = null;

        for (const model of TEXT_MODELS) {
            try {
                const result = await ai.models.generateContent({
                    model,
                    contents: prompt,
                });
                text = result.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) break;
                throw new Error('설명 생성 결과가 비어 있습니다');
            } catch (err) {
                lastErr = err instanceof Error ? err : new Error(String(err));
                if (isServerOverloadError(err)) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    continue;
                }
                break;
            }
        }

        if (!text) {
            return internalError(lastErr?.message || '설명 생성 결과가 비어 있습니다');
        }

        return NextResponse.json({
            ok: true,
            data: { text: text.trim() },
        });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return internalError(message);
    }
}
