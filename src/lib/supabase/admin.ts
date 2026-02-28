import { createClient as createSupabaseClient } from '@supabase/supabase-js';

let adminClient: ReturnType<typeof createSupabaseClient> | null = null;

export function createAdminClient() {
    if (adminClient) return adminClient;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        return null;
    }

    adminClient = createSupabaseClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });

    return adminClient;
}

const verifiedBuckets = new Set<string>();

export async function ensureStorageBucket(bucketName: string) {
    if (verifiedBuckets.has(bucketName)) return;

    const admin = createAdminClient();
    if (!admin) {
        throw new Error('Admin client 없음 - SUPABASE_SERVICE_ROLE_KEY 확인 필요');
    }

    const { data: buckets, error: listError } = await admin.storage.listBuckets();
    if (listError) {
        console.error(`[storage] 버킷 목록 조회 실패: ${listError.message}`);
        throw listError;
    }

    const exists = buckets?.some((b) => b.name === bucketName);

    if (!exists) {
        const { error } = await admin.storage.createBucket(bucketName, {
            public: true,
            fileSizeLimit: 10485760,
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
        });
        if (error && !error.message.includes('already exists')) {
            console.error(`[storage] 버킷 생성 실패: ${error.message}`);
            throw error;
        }
    }

    // 성공했을 때만 캐싱
    verifiedBuckets.add(bucketName);
}
