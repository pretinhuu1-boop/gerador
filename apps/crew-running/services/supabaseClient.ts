import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './supabaseTypes';

type ImportMetaEnv = {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_PUBLISHABLE_KEY?: string;
};

const env = (import.meta as ImportMeta & { env?: ImportMetaEnv }).env ?? {};
const url = (env.VITE_SUPABASE_URL ?? '').trim();
const key = (env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '').trim();

let client: SupabaseClient<Database> | null = null;

export const isSupabaseConfigured = (): boolean => Boolean(url && key);

export const getSupabase = (): SupabaseClient<Database> | null => {
  if (!isSupabaseConfigured()) return null;
  if (!client) {
    client = createClient<Database>(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storageKey: 'crew.supabase.auth',
      },
    });
  }
  return client;
};

export const ensureAnonSession = async (): Promise<string | null> => {
  const sb = getSupabase();
  if (!sb) return null;
  const { data: existing } = await sb.auth.getSession();
  if (existing.session?.user?.id) return existing.session.user.id;

  const { data, error } = await sb.auth.signInAnonymously();
  if (error || !data.session?.user?.id) {
    if (error && import.meta.env?.DEV) {
      console.warn('[supabase] anonymous sign-in failed:', error.message);
    }
    return null;
  }
  return data.session.user.id;
};
