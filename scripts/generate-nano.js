
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manual .env loading
try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const parts = line.split('=');
            const key = parts[0]?.trim();
            const val = parts.slice(1).join('=')?.trim();
            if (key && val) process.env[key] = val;
        });
    }
} catch (e) {
    console.log('Env load error', e);
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const MODEL_NAME = 'gemini-2.0-flash-exp';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('Missing Supabase env vars');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

// 1. Get API Key & User
async function getContext() {
    // Try to get from user_settings first (simulating the user who has the key)
    const { data: settings, error } = await supabase
        .from('user_settings')
        .select('user_id, gemini_api_key')
        .order('created_at', { ascending: false }) // Get most recent user or specific logic
        .limit(1)
        .single();

    if (error || !settings) {
        console.warn('⚠️ No user_settings found. Creating dummy user...');
        const { data: newUser, error: createError } = await supabase
            .from('user_settings')
            .insert({})
            .select()
            .single();

        if (createError) throw new Error(createError.message);
        return { userId: newUser.user_id, apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY };
    }

    const apiKey = settings.gemini_api_key || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
        console.warn('⚠️ No Gemini API Key found in DB or .env. Using fallback content.');
    } else {
        console.log('✅ Found Gemini API Key from DB/Env');
    }

    return { userId: settings.user_id, apiKey };
}
async function generateContent() {
    if (!API_KEY) {
        console.log('⚠️ No Gemini API Key found. Using fallback content.');
        return {
            hero: {
                title: "Nano Banana",
                subtitle: "압도적인 성능과 만족도를 자랑합니다.",
                cta: "지금 시작하기",
                imagePrompt: "placeholder"
            },
            features: {
                title: "압도적인 기능",
                items: [
                    { title: "최고의 성능", description: "Nano Banana의 혁신적인 기술을 경험하세요." },
                    { title: "검증된 만족도", description: "수많은 사용자가 증명하는 압도적 품질." }
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
    }

    console.log('🚀 Generating Nano Banana content with Gemini 2.0 (REST)...');

    const prompt = `
    You are a professional UX copywriter.
    Create a JSON structure for a landing page for a product called "Nano Banana".
    The product is a futuristic, premium device.
    
    CRITICAL: You MUST use the following text phrases:
    1. "Nano Banana, 압도적인 성능과 만족도를 자랑합니다."
    2. "실제 사용자들의 리얼 후기"

    Structure the response as a JSON object with:
    - hero: { title: string, subtitle: string, cta: string, imagePrompt: string }
    - features: { title: string, items: { title: string, description: string }[] }
    - reviews: { title: string, items: { user: string, comment: string }[] }
    - stats: { items: { label: string, value: string }[] }
  `;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { response_mime_type: 'application/json' }
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Gemini API Error: ${response.status} ${errorText}`);
            throw new Error(`Gemini API Error`);
        }

        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;
        console.log('✅ Content generated');
        return JSON.parse(text);
    } catch (err) {
        console.error('Gemini Generate Content Error, falling back:', err);
        return {
            hero: {
                title: "Nano Banana",
                subtitle: "압도적인 성능과 만족도를 자랑합니다.",
                cta: "지금 시작하기",
                imagePrompt: "placeholder"
            },
            features: {
                title: "압도적인 기능",
                items: [
                    { title: "최고의 성능", description: "Nano Banana의 혁신적인 기술을 경험하세요." },
                    { title: "검증된 만족도", description: "수많은 사용자가 증명하는 압도적 품질." }
                ]
            },
            reviews: {
                title: "실제 사용자들의 리얼 후기",
                items: [
                    { user: "김철수", comment: "정말 놀라운 제품입니다. 강력 추천합니다!" },
                    { user: "이영희", comment: "디자인도 예쁘고 성능도 확실하네요." }
                ]
            },
            stats: { items: [{ label: "만족도", value: "99%" }] }
        };
    }
}

async function generateImage(filename) {
    console.log(`🎨 Generating image for ${filename}...`);
    const imageUrl = `https://picsum.photos/1200/800`;

    try {
        const arrayBuffer = await (await fetch(imageUrl)).arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { data, error } = await supabase.storage
            .from('generated-images')
            .upload(`nano-banana/${filename}.png`, buffer, { contentType: 'image/png', upsert: true });

        if (error) {
            console.error('Upload failed:', error);
            return 'https://placehold.co/1200x800?text=Upload+Failed';
        }

        const { data: { publicUrl } } = supabase.storage
            .from('generated-images')
            .getPublicUrl(`nano-banana/${filename}.png`);

        console.log(`✨ Image uploaded: ${publicUrl}`);
        return publicUrl;
    } catch (e) {
        console.error('Image logic error:', e);
        return 'https://placehold.co/1200x800?text=Error';
    }
}

async function main() {
    try {
        console.log('Starting script...');

        // 1. Get Context (API Key & User)
        const { userId, apiKey } = await getContext();
        console.log('User ID:', userId);

        // 2. Generate Content
        // We need to pass apiKey to generateContent now
        const content = await generateContent(apiKey);

        // 3. Generate/Upload Images (Placeholder for now unless we implement Gemini Image Gen via REST)
        const heroImage = await generateImage('hero');

        // 4. Construct Puck Data
        const puckData = {
            content: [
                {
                    type: 'HeroSection',
                    props: {
                        title: content.hero.title,
                        description: content.hero.subtitle,
                        backgroundImage: heroImage,
                        ctaJson: JSON.stringify({ label: content.hero.cta, href: '#' }),
                        id: 'HeroSection-1'
                    }
                },
                {
                    type: 'StatsSection',
                    props: {
                        items: content.stats.items,
                        id: 'StatsSection-1'
                    }
                },
                {
                    type: 'FeaturesSection',
                    props: {
                        title: content.features.title,
                        items: content.features.items,
                        id: 'FeaturesSection-1'
                    }
                },
                {
                    type: 'GallerySection',
                    props: {
                        title: content.reviews.title,
                        images: [
                            { src: 'https://picsum.photos/400/300', alt: 'Review 1' },
                            { src: 'https://picsum.photos/400/301', alt: 'Review 2' },
                            { src: 'https://picsum.photos/400/302', alt: 'Review 3' }
                        ],
                        id: 'GallerySection-1'
                    }
                },
                {
                    type: 'FallbackSection',
                    props: {
                        title: "Gemini 3 Pro Upgrade Available",
                        description: "This content was generated with Gemini 2.0 Flash. Use the Editor's AI feature to regenerate images with Gemini 3 Pro.",
                        id: 'FallbackSection-1'
                    }
                }
            ],
            root: { props: { title: 'Nano Banana Detail Page' } }
        };

        // 5. Insert/Update Project
        const { data: project, error: projError } = await supabase
            .from('projects')
            .upsert({
                user_id: userId,
                name: 'Nano Banana',
                data: puckData,
                image_url: heroImage,
                status: 'published'
            }, { onConflict: 'name' })
            .select()
            .single();

        if (projError) throw projError;

        console.log('🎉 Project created successfully!');
        console.log('Project ID:', project.id);
        fs.writeFileSync('last_project_id.txt', project.id);


    } catch (error) {
        console.error('Error:', error);
        fs.writeFileSync('script_error.txt', JSON.stringify(error, null, 2));
    }
}

main();
