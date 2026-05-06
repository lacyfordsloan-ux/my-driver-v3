import { createClient } from '@supabase/supabase-js';

// Fallback placeholders prevent build-time crash.
// Real values MUST be set in Vercel Environment Variables for the app to work.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
