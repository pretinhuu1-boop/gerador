import { describe, expect, it, vi, beforeEach } from 'vitest';
import { DEFAULT_ORG_ID, AXIAL_SP_ORG_SLUG, getCurrentOrgId, clearOrgIdCache } from '../orgContext';
import * as supabaseClient from '../supabaseClient';

describe('orgContext', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    clearOrgIdCache();
  });

  it('exports DEFAULT_ORG_ID as the Axial-SP UUID', () => {
    expect(DEFAULT_ORG_ID).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('exports AXIAL_SP_ORG_SLUG as "axial-sp"', () => {
    expect(AXIAL_SP_ORG_SLUG).toBe('axial-sp');
  });

  it('getCurrentOrgId returns DEFAULT_ORG_ID when no supabase client', async () => {
    vi.spyOn(supabaseClient, 'getSupabase').mockReturnValue(null);
    const orgId = await getCurrentOrgId();
    expect(orgId).toBe(DEFAULT_ORG_ID);
  });

  it('getCurrentOrgId returns DEFAULT_ORG_ID when no user_profiles row', async () => {
    vi.spyOn(supabaseClient, 'getSupabase').mockReturnValue({
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: null, error: null }),
          }),
        }),
      }),
      auth: {
        getSession: async () => ({ data: { session: { user: { id: 'u1' } } } }),
      },
    } as unknown as ReturnType<typeof supabaseClient.getSupabase>);
    const orgId = await getCurrentOrgId();
    expect(orgId).toBe(DEFAULT_ORG_ID);
  });

  it('getCurrentOrgId returns profile.organization_id when present', async () => {
    vi.spyOn(supabaseClient, 'getSupabase').mockReturnValue({
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: { organization_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' },
              error: null,
            }),
          }),
        }),
      }),
      auth: {
        getSession: async () => ({ data: { session: { user: { id: 'u1' } } } }),
      },
    } as unknown as ReturnType<typeof supabaseClient.getSupabase>);
    const orgId = await getCurrentOrgId();
    expect(orgId).toBe('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
  });
});
