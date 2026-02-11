import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
// Manual .env loading
try {
    const envPath = path.resolve(process.cwd(), '.env');
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        const [key, ...values] = line.split('=');
        if (key && values.length > 0) {
            process.env[key.trim()] = values.join('=').trim();
        }
    });
} catch (e) {
    console.log('.env loading failed or not found', e);
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const FIGMA_TEXT_1 = "멘탈 클럽 멤버십, 압도적인 자료와 만족도를 자랑합니다.";
const FIGMA_TEXT_2 = "실제 회원들의 멤버십 후기 댓글";

// Initialize Supabase Admin
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

// Initialize Gemini
// Note: @google/genai might have different import structure depending on version. 
// Assuming v0.1.x or similar based on usage in route.ts, but standard is usually @google/generative-ai
// Checking package.json... user has "@google/genai": "^1.40.0" -> likely the new SDK?
// If it's the new SDK, import syntax might be different. 
// Let's assume standard usage for now or check route.ts imports if possible.
// route.ts uses: import { GoogleGenerativeAI } from '@google/genai'; -> Wait, standard is @google/generative-ai
// But package.json said "@google/genai". If it is the google-genai package, it might be the Node.js client?
// Actually, the new SDK is 'google-genai' (without @)? No, package.json said `@google/genai`.
// This might be consistent.

// Let's copy styling from route.ts for consistency.
// Actually, I'll use a direct fetch for Gemini 2.0 if SDK fails, but let's try SDK.

const API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const MODEL_NAME = 'gemini-2.0-flash-exp';

async function generateContent() {
    console.log('🚀 Generating Nano Banana content with Gemini 2.0 (REST)...');

    const prompt = `
    You are a professional UX copywriter.
    Create a JSON structure for a landing page for a product called "Nano Banana".
    The product is a futuristic, premium device (details up to you, but make it sound amazing).
    
    CRITICAL: You MUST use the following text phrases (translated/adapted for Nano Banana) as headers to match the Figma design:
    1. "${FIGMA_TEXT_1}" -> Adapt to "Nano Banana, 압도적인 성능과 만족도를 자랑합니다."
    2. "${FIGMA_TEXT_2}" -> "실제 사용자들의 리얼 후기"

    Structure the response as a JSON object with:
    - hero: { title: string, subtitle: string, cta: string, imagePrompt: string }
    - features: { title: string, items: { title: string, description: string }[] }
    - reviews: { title: string, items: { user: string, comment: string }[] }
    - stats: { items: { label: string, value: string }[] }
  `;

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
        throw new Error(`Gemini API Error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    console.log('✅ Content generated:', text.substring(0, 100) + '...');
    return JSON.parse(text);
}

async function generateImage(prompt: string, filename: string) {
    console.log(`🎨 Generating image for ${filename}...`);
    // Using reliable placeholder for now as Gemini API for image is complex via REST in this script
    const imageUrl = `https://picsum.photos/1200/800`;

    const arrayBuffer = await (await fetch(imageUrl)).arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase
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
}

async function main() {
    try {
        const content = await generateContent();

        // Generate/Upload Images
        const heroImage = await generateImage(content.hero.imagePrompt, 'hero');
        // const featureImage = await generateImage('Nano Banana Feature', 'feature1');

        // Construct Puck Data
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
                    type: 'GallerySection', // Using Gallery as Reviews
                    props: {
                        title: content.reviews.title,
                        images: [
                            { src: 'https://picsum.photos/400/300', alt: 'Review 1' },
                            { src: 'https://picsum.photos/400/301', alt: 'Review 2' },
                            { src: 'https://picsum.photos/400/302', alt: 'Review 3' }
                        ],
                        id: 'GallerySection-1'
                    }
                }
            ],
            root: { props: { title: 'Nano Banana Detail Page' } }
        };

        // Insert into DB
        // 1. Get User
        const { data: users, error: userError } = await supabase.from('user_settings').select('user_id').limit(1);
        if (userError || !users?.length) throw new Error('No user found');
        const userId = users[0].user_id;

        // 2. Insert Project
        const { data: project, error: projError } = await supabase
            .from('projects')
            .insert({
                user_id: userId,
                name: 'Nano Banana',
                data: puckData,
                image_url: heroImage, // Thumbnail
                status: 'published'
            })
            .select()
            .single();

        if (projError) throw projError;

        console.log('🎉 Project created successfully!');
        console.log('Project ID:', project.id);

    } catch (error) {
        console.error('Error:', error);
    }
}

main();
