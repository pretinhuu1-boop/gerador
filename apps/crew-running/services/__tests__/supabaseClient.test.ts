import { describe, it, expect, vi } from 'vitest';

describe('supabaseClient', () => {
  it('returns same instance on repeated calls', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'test-key');
    const { getSupabase } = await import('../supabaseClient');
    const a = getSupabase();
    const b = getSupabase();
    expect(a).toBe(b);
    vi.unstubAllEnvs();
  });

  it('returns null when env vars missing', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', '');
    vi.resetModules();
    const { getSupabase } = await import('../supabaseClient');
    expect(getSupabase()).toBeNull();
    vi.unstubAllEnvs();
  });
});
