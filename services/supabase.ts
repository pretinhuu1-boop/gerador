import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.warn(
    '[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY missing. ' +
      'Run `supabase start` then copy values to .env.local.',
  );
}

export const supabase: SupabaseClient = createClient(
  url ?? 'http://localhost:54321',
  anonKey ?? 'public-anon-key-missing',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);

export const isSupabaseConfigured = Boolean(url && anonKey);
