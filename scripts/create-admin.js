const https = require('https');

const SUPABASE_URL = 'wyuhztsasnmzqypzilkt.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5dWh6dHNhc25tenF5cHppbGt0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDY0MDUxNSwiZXhwIjoyMDg2MjE2NTE1fQ.XwjErGoK8BQT6Ijs9BDSG6gXN8rJZFGAiX911nmxkJc';

const data = JSON.stringify({
    email: 'dydqjadlsp@naver.com',
    password: 'dydqjadlek',
    email_confirm: true,
    user_metadata: { name: 'Admin' }
});

const options = {
    hostname: SUPABASE_URL,
    path: '/auth/v1/admin/users',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': 'Bearer ' + SERVICE_ROLE_KEY
    }
};

const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        try {
            const parsed = JSON.parse(body);
            if (res.statusCode === 200 || res.statusCode === 201) {
                console.log('Account created successfully!');
                console.log('User ID:', parsed.id);
                console.log('Email:', parsed.email);
            } else {
                console.log('Error:', parsed.msg || parsed.message || body);
            }
        } catch (e) {
            console.log('Response:', body);
        }
    });
});

req.on('error', (e) => console.error('Request error:', e.message));
req.write(data);
req.end();
