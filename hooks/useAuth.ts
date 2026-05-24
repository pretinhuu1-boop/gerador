import { useCallback, useEffect, useState } from 'react';
import {
  type AuthUser,
  getCurrentUser,
  onAuthStateChange,
  signInWithPassword,
  signOut,
  signUp,
} from '../services/authService';

export interface UseAuthReturn {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getCurrentUser().then((u) => {
      if (!cancelled) {
        setUser(u);
        setLoading(false);
      }
    });
    const unsub = onAuthStateChange((u) => {
      if (!cancelled) {
        setUser(u);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await signInWithPassword(email, password);
    return { error: error?.message ?? null };
  }, []);

  const signUpFn = useCallback(async (email: string, password: string, displayName?: string) => {
    const { error } = await signUp(email, password, displayName);
    return { error: error?.message ?? null };
  }, []);

  const signOutFn = useCallback(async () => {
    await signOut();
  }, []);

  return {
    user,
    loading,
    signIn,
    signUp: signUpFn,
    signOut: signOutFn,
  };
}
