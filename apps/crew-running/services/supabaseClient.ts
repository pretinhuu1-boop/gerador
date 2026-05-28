import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './supabaseTypes';

/** Read an env var — prefers process.env (works in tests/node), falls back to
 *  import.meta.env (works in Vite browser builds).  Vite inlines import.meta.env
 *  references at transform time, making them immune to vi.stubEnv; process.env is
 *  patched at runtime so test stubs work correctly. */
const readEnv = (key: string): string => {
  if (typeof process !== 'undefined' && process.env) {
    const v = process.env[key];
    if (v !== undefined) return v;
  }
  // Vite browser build: access via bracket notation to avoid static inlining
  const metaEnv = (import.meta as ImportMeta & { env?: Record<string, string> }).env ?? {};
  return metaEnv[key] ?? '';
};

let instance: SupabaseClient<Database> | null = null;
let checked = false;

export const getSupabase = (): SupabaseClient<Database> | null => {
  if (checked) return instance;
  checked = true;
  const url = readEnv('VITE_SUPABASE_URL').trim();
  const key = readEnv('VITE_SUPABASE_PUBLISHABLE_KEY').trim();
  if (!url || !key) return null;
  instance = createClient<Database>(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storageKey: 'crew.supabase.auth',
    },
  });
  return instance;
};

export const isSupabaseConfigured = (): boolean => getSupabase() !== null;

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
