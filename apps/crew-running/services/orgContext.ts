import { getSupabase } from './supabaseClient';

/** UUID of the single Axial-SP organization for MVP.
 *  Multi-city expansion will add more org rows; this constant is the default
 *  used when a user has no user_profiles row (e.g. tests, anon fallback). */
export const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

export const AXIAL_SP_ORG_SLUG = 'axial-sp';

let cachedOrgId: string | null = null;

/** Read the current user's organization_id. Returns DEFAULT_ORG_ID when:
 *  - Supabase is not configured (offline / tests)
 *  - The session has no user (not signed in yet)
 *  - The user_profiles row is missing (race during signup — DB trigger should
 *    have filled it; we fall back to the default rather than crash).
 *  Result is memoized in-process; clear via clearOrgIdCache() on sign-out. */
export const getCurrentOrgId = async (): Promise<string> => {
  if (cachedOrgId) return cachedOrgId;
  const sb = getSupabase();
  if (!sb) return DEFAULT_ORG_ID;
  const { data: sessionData } = await sb.auth.getSession();
  const uid = sessionData?.session?.user?.id;
  if (!uid) return DEFAULT_ORG_ID;
  const { data, error } = await sb
    .from('user_profiles')
    .select('organization_id')
    .eq('id', uid)
    .maybeSingle();
  if (error || !data) return DEFAULT_ORG_ID;
  const orgId = (data as { organization_id: string }).organization_id;
  cachedOrgId = orgId;
  return orgId;
};

export const clearOrgIdCache = (): void => {
  cachedOrgId = null;
};

/** Best-effort: ensure the current auth.user has a user_profiles row.
 *  The 000_user_profiles.sql DB trigger normally handles this on auth.users
 *  insert. This helper is a client-side belt-and-suspenders for cases where
 *  the trigger fires after the session is already established (race). */
export const ensureUserProfile = async (): Promise<void> => {
  const sb = getSupabase();
  if (!sb) return;
  const { data: sessionData } = await sb.auth.getSession();
  const uid = sessionData?.session?.user?.id;
  if (!uid) return;
  await sb
    .from('user_profiles')
    .upsert({ id: uid, organization_id: DEFAULT_ORG_ID }, { onConflict: 'id' });
};
