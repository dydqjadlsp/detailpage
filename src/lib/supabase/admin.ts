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

let bucketInitialized = false;

export async function ensureStorageBucket(bucketName: string) {
    if (bucketInitialized) return;

    const admin = createAdminClient();
    if (!admin) return;

    const { data: buckets } = await admin.storage.listBuckets();
    const exists = buckets?.some((b) => b.name === bucketName);

    if (!exists) {
        const { error } = await admin.storage.createBucket(bucketName, {
            public: true,
            fileSizeLimit: 10485760,
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
        });
        if (error && !error.message.includes('already exists')) {
            console.error('Bucket creation failed:', error);
        }
    }

    bucketInitialized = true;
}
