const https = require('https');

const SUPABASE_URL = 'wyuhztsasnmzqypzilkt.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5dWh6dHNhc25tenF5cHppbGt0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDY0MDUxNSwiZXhwIjoyMDg2MjE2NTE1fQ.XwjErGoK8BQT6Ijs9BDSG6gXN8rJZFGAiX911nmxkJc';

const sql = `
CREATE TABLE IF NOT EXISTS public.user_settings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    gemini_api_key text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own settings'
    ) THEN
        CREATE POLICY "Users can manage own settings"
        ON public.user_settings
        FOR ALL
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;
`;

const data = JSON.stringify({ query: sql });

const options = {
    hostname: SUPABASE_URL,
    path: '/rest/v1/rpc/exec_sql',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': 'Bearer ' + SERVICE_ROLE_KEY,
        'Prefer': 'return=minimal'
    }
};

// Try SQL Editor endpoint first
const sqlOptions = {
    hostname: SUPABASE_URL,
    path: '/pg',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': 'Bearer ' + SERVICE_ROLE_KEY,
    }
};

// Use the Management API /query endpoint
const mgmtOptions = {
    hostname: 'api.supabase.com',
    path: '/v1/projects/wyuhztsasnmzqypzilkt/database/query',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + SERVICE_ROLE_KEY,
    }
};

console.log('Creating user_settings table via Supabase REST API...');
console.log('SQL:', sql);
console.log('');
console.log('NOTE: If this script fails, please run the following SQL in Supabase Dashboard > SQL Editor:');
console.log('');
console.log(sql);
