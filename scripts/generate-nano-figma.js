const { createClient } = require('@supabase/supabase-js');

// Correct credentials from MCP config (quzeez...)
const SUPABASE_URL = 'https://quzeezzomvdmhggvskws.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1emVlenpvbXZkbWhnZ3Zza3dzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDY0MDk2MywiZXhwIjoyMDg2MjE2OTYzfQ.LL7TZPNlkVM9vic9BZSC7Wm8GVAgGdskUjBst_7QTwc';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const USER_EMAIL = 'dydqjadlsp@naver.com';
const USER_PASSWORD = 'dydqjadlek'; // Same as create-admin.js

async function generateNanoFigma() {
    console.log('Starting Figma-to-Project generation for Nano Banana (v3)...');

    // 1. Get or Create User
    let userId;
    const { data: listData, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('Error listing users:', listError);
        return;
    }

    const existingUser = listData.users.find(u => u.email === USER_EMAIL);

    if (existingUser) {
        console.log('User found:', existingUser.id);
        userId = existingUser.id;
    } else {
        console.log('User not found, creating...');
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email: USER_EMAIL,
            password: USER_PASSWORD,
            email_confirm: true,
            user_metadata: { name: 'Admin' }
        });

        if (createError) {
            console.error('Error creating user:', createError);
            return;
        }
        console.log('User created:', newUser.user.id);
        userId = newUser.user.id;
    }

    // 2. Construct Figma-based Data
    const puckData = {
        content: [
            {
                type: 'HeroSection',
                props: {
                    title: '멘탈 클럽 멤버십, 압도적인 자료와 만족도를 자랑합니다.',
                    subtitle: '업계 최고의 퀄리티로 보답합니다. 지금 바로 시작하세요.',
                    ctaText: '멤버십 가입하기',
                    backgroundColor: '#0a0a0a',
                    textColor: '#ffffff',
                    imageUrl: 'https://placehold.co/1200x600/111111/ffffff?text=Mental+Club+Premium',
                    id: 'hero-section'
                }
            },
            {
                type: 'StatsSection',
                props: {
                    title: '압도적인 만족도',
                    subtitle: '수치로 증명하는 멘탈 클럽의 클래스',
                    items: [
                        { value: '98%', label: '재가입률' },
                        { value: '5,000+', label: '누적 회원수' },
                        { value: '4.9/5', label: '평균 평점' }
                    ],
                    backgroundColor: '#111111',
                    textColor: '#ffffff',
                    id: 'stats-section'
                }
            },
            {
                type: 'GallerySection',
                props: {
                    title: '실제 회원들의 멤버십 후기 댓글',
                    subtitle: '조작 없는 100% 리얼 후기를 확인하세요.',
                    items: [
                        { imageUrl: 'https://placehold.co/300x500/222222/ffffff?text=Review+1' },
                        { imageUrl: 'https://placehold.co/300x500/222222/ffffff?text=Review+2' },
                        { imageUrl: 'https://placehold.co/300x500/222222/ffffff?text=Review+3' },
                        { imageUrl: 'https://placehold.co/300x500/222222/ffffff?text=Review+4' }
                    ],
                    backgroundColor: '#0a0a0a',
                    textColor: '#ffffff',
                    id: 'reviews-section'
                }
            },
            {
                type: 'FeaturesSection',
                props: {
                    title: '멤버십 제공 자료',
                    subtitle: '비교불가한 방대한 자료 아카이브',
                    items: [
                        { title: '시크릿 자료실', description: '멤버십 회원 전용 시크릿 자료 제공', icon: 'Lock' },
                        { title: '실시간 업데이트', description: '매일 업데이트되는 최신 트렌드 분석', icon: 'Zap' },
                        { title: '1:1 코칭', description: '전문가의 1:1 맞춤형 멘탈 케어', icon: 'UserCheck' }
                    ],
                    backgroundColor: '#111111',
                    textColor: '#ffffff',
                    id: 'features-section'
                }
            },
            {
                type: 'CTASection',
                props: {
                    title: '지금 바로 시작하세요',
                    subtitle: '망설이는 순간에도 경쟁자는 앞서갑니다.',
                    ctaText: '멤버십 가입하기',
                    backgroundColor: '#000000',
                    textColor: '#ffffff',
                    id: 'cta-section'
                }
            }
        ],
        root: { props: { title: 'Nano Banana Figma Edition' } }
    };

    // 3. Upsert Project
    const { data: project, error: projectError } = await supabase
        .from('projects')
        .upsert({
            name: 'Nano Banana (Figma Output)',
            user_id: userId,
            data: puckData, // Correct column name is 'data' as verified in scheme inspection
            status: 'published',
            image_url: 'https://placehold.co/600x400/000000/ffffff?text=Nano+Banana+Thumb' // Correct column name is 'image_url'
        })
        .select()
        .single();

    if (projectError) {
        console.error('Error creating project:', projectError);
    } else {
        console.log('Project created successfully!');
        console.log('ID:', project.id);
        console.log('URL:', `http://localhost:3000/projects/${project.id}`);
        console.log('Preview:', `http://localhost:3000/dashboard/preview/${project.id}`);
    }
}

generateNanoFigma();
