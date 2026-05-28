import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured } from '../services/supabaseClient';

type SignInResult = { ok: true } | { ok: false; message: string };

export type SupabaseSessionState = {
  configured: boolean;
  session: Session | null;
  userId: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signOut: () => Promise<void>;
};

export const useSupabaseSession = (): SupabaseSessionState => {
  const configured = isSupabaseConfigured();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(configured);

  useEffect(() => {
    if (!configured) return;
    const sb = getSupabase();
    if (!sb) return;

    let cancelled = false;
    sb.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setSession(data.session ?? null);
      setIsLoading(false);
    });

    const { data: subscription } = sb.auth.onAuthStateChange((_event, next) => {
      setSession(next ?? null);
    });

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, [configured]);

  const signIn = useCallback(async (email: string, password: string): Promise<SignInResult> => {
    const sb = getSupabase();
    if (!sb) return { ok: false, message: 'Supabase nao configurado' };
    const { error } = await sb.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) return { ok: false, message: error.message };
    return { ok: true };
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    const sb = getSupabase();
    if (!sb) return;
    await sb.auth.signOut();
  }, []);

  return {
    configured,
    session,
    userId: session?.user?.id ?? null,
    isLoading,
    signIn,
    signOut,
  };
};
