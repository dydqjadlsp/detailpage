const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    'https://wyuhztsasnmzqypzilkt.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5dWh6dHNhc25tenF5cHppbGt0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDY0MDUxNSwiZXhwIjoyMDg2MjE2NTE1fQ.XwjErGoK8BQT6Ijs9BDSG6gXN8rJZFGAiX911nmxkJc'
);

async function main() {
    const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
    console.log('Existing buckets:', buckets?.map(b => b.name) || [], listErr);

    const { data, error } = await supabase.storage.createBucket('generated-images', {
        public: true,
        fileSizeLimit: 10485760,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
    });

    if (error) {
        console.log('Create bucket result:', error.message);
        if (error.message.includes('already exists')) {
            console.log('Bucket already exists, OK.');
        }
    } else {
        console.log('Bucket created:', data);
    }

    const { data: buckets2 } = await supabase.storage.listBuckets();
    console.log('Final buckets:', buckets2?.map(b => b.name));
}

main().catch(console.error);
