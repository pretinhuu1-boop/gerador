import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';

export type AuthUser = {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
};

export type AuthError = { message: string };

const toAuthUser = (user: User | null | undefined): AuthUser | null => {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email ?? '',
    displayName:
      (user.user_metadata?.display_name as string | undefined) ??
      (user.user_metadata?.name as string | undefined) ??
      null,
    avatarUrl: (user.user_metadata?.avatar_url as string | undefined) ?? null,
  };
};

export const getSession = async (): Promise<Session | null> => {
  const { data } = await supabase.auth.getSession();
  return data.session;
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const { data } = await supabase.auth.getUser();
  return toAuthUser(data.user);
};

export const signInWithPassword = async (
  email: string,
  password: string,
): Promise<{ user: AuthUser | null; error: AuthError | null }> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { user: toAuthUser(data.user), error: error ? { message: error.message } : null };
};

export const signUp = async (
  email: string,
  password: string,
  displayName?: string,
): Promise<{ user: AuthUser | null; error: AuthError | null }> => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: displayName ? { display_name: displayName, name: displayName } : undefined,
    },
  });
  return { user: toAuthUser(data.user), error: error ? { message: error.message } : null };
};

export const signOut = async () => {
  await supabase.auth.signOut();
};

export const onAuthStateChange = (cb: (user: AuthUser | null) => void) => {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    cb(toAuthUser(session?.user));
  });
  return () => data.subscription.unsubscribe();
};
