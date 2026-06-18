import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vjyvikuyuzkmyrtcuznc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqeXZpa3V5dXprbXlydGN1em5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMjY5MDksImV4cCI6MjA5NTkwMjkwOX0.CVg4HbusPRVlrSoMtF5VKc268jLHf8WGUYp6lyJ4deA';


export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        flowType: 'implicit',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
    }
});