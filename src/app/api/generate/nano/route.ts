
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { unauthorizedError, internalError } from '@/lib/errors';

const NANO_BANANA_FALLBACK = {
    hero: {
        title: "Nano Banana",
        subtitle: "Nano Banana, 압도적인 성능과 만족도를 자랑합니다.",
        cta: "지금 시작하기",
        imagePrompt: "futuristic nano banana device, glowing, high tech, minimal background, 8k resolution"
    },
    features: {
        title: "압도적인 기능",
        items: [
            { title: "최고의 성능", description: "Nano Banana의 혁신적인 기술을 경험하세요." },
            { title: "검증된 만족도", description: "수많은 사용자가 증명하는 압도적 품질." },
            { title: "초소형 디자인", description: "주머니에 쏙 들어가는 완벽한 휴대성." }
        ]
    },
    reviews: {
        title: "실제 사용자들의 리얼 후기",
        items: [
            { user: "김철수", comment: "정말 놀라운 제품입니다. 강력 추천합니다!" },
            { user: "이영희", comment: "디자인도 예쁘고 성능도 확실하네요." },
            { user: "박민수", comment: "기대 이상입니다. Nano Banana 최고!" }
        ]
    },
    stats: {
        items: [
            { label: "사용자 만족도", value: "99%" },
            { label: "재구매율", value: "95%" },
            { label: "누적 판매", value: "100만+" }
        ]
    }
};

async function generateContentWithGemini(apiKey: string) {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
    You are a professional UX copywriter.
    Create a JSON structure for a landing page for a product called "Nano Banana".
    The product is a futuristic, premium device.
    
    CRITICAL: You MUST use the following text phrases exactly:
    1. "Nano Banana, 압도적인 성능과 만족도를 자랑합니다."
    2. "실제 사용자들의 리얼 후기"

    Structure the response as a JSON object with:
    - hero: { title: string, subtitle: string, cta: string, imagePrompt: string }
    - features: { title: string, items: { title: string, description: string }[] }
    - reviews: { title: string, items: { user: string, comment: string }[] }
    - stats: { items: { label: string, value: string }[] }
    `;

    try {
        const result = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
        });
        const text = result.text ?? '';
        // Simple cleanup for code blocks if Gemini returns them
        const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error('Gemini generation failed:', error);
        return null;
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_request: Request) {
    try {
        const supabase = createClient();
        if (!supabase) return unauthorizedError();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return unauthorizedError();

        // 1. Get API Key
        const { data: settings } = await supabase
            .from('user_settings')
            .select('gemini_api_key')
            .eq('user_id', user.id)
            .single();

        const apiKey = settings?.gemini_api_key;
        let content = NANO_BANANA_FALLBACK;

        // 2. Try generation if key exists
        if (apiKey) {
            const generated = await generateContentWithGemini(apiKey);
            if (generated) {
                content = { ...NANO_BANANA_FALLBACK, ...generated };
            }
        }

        // 3. Construct Puck Data
        const puckData = {
            content: [
                {
                    type: 'Hero',
                    props: {
                        id: 'Hero-1',
                        title: content.hero.title,
                        subtitle: content.hero.subtitle,
                        ctaText: content.hero.cta,
                        imageUrl: 'https://picsum.photos/1920/1080', // Placeholder
                        imagePrompt: content.hero.imagePrompt,
                        backgroundColor: '#111111',
                        textColor: '#ffffff'
                    }
                },
                {
                    type: 'Stats',
                    props: {
                        id: 'Stats-1',
                        items: content.stats.items,
                        backgroundColor: '#1a1a1a',
                        textColor: '#ffffff'
                    }
                },
                {
                    type: 'Features',
                    props: {
                        id: 'Features-1',
                        title: content.features.title,
                        items: content.features.items,
                        backgroundColor: '#ffffff',
                        textColor: '#1a1a1a'
                    }
                },
                {
                    type: 'Gallery',
                    props: {
                        id: 'Gallery-1',
                        title: content.reviews.title,
                        items: content.reviews.items.map((item: { user: string; comment: string }) => ({
                            title: item.user,
                            description: item.comment
                        })),
                        backgroundColor: '#f5f5f5',
                        textColor: '#1a1a1a'
                    }
                },
                {
                    type: 'CTA',
                    props: {
                        id: 'CTA-1',
                        title: "지금 바로 시작하세요",
                        subtitle: "Nano Banana가 당신의 삶을 바꿉니다.",
                        ctaText: "구매하기",
                        backgroundColor: '#000000',
                        textColor: '#ffffff'
                    }
                }
            ],
            root: { props: { title: 'Nano Banana Detail Page' } }
        };

        // 4. Create Project
        const { data: project, error } = await supabase
            .from('projects')
            .insert({
                user_id: user.id,
                title: 'Nano Banana',
                category: 'ecommerce',
                status: 'published', // Automatically publish for visibility
                puck_data: puckData,
                input_data: { type: 'auto-generated', target: 'nano-banana' },
                thumbnail_url: 'https://picsum.photos/800/600'
            })
            .select()
            .single();

        if (error) {
            console.error('Project creation failed:', error);
            return internalError(error.message);
        }

        return NextResponse.json({
            ok: true,
            data: { projectId: project.id }
        });

    } catch (error) {
        console.error('Nano generation error:', error);
        return internalError();
    }
}
