import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// Browser-safe client (uses anon key — respects Row Level Security)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server/build-time client (uses service role key — bypasses RLS)
// Only import this in .astro files or server-side code, never in client components
export function createServiceClient() {
  const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
