'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { SupabaseProfile } from '@/lib/types';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
const TOKEN_KEY = 'ie_auth_token';

export type AuthState = {
  user: { id: string; email: string; role: string } | null;
  profile: SupabaseProfile | null;
  session: { access_token: string } | null;
  loading: boolean;
  error: string | null;
};

type AuthContextType = AuthState & {
  signUp: (email: string, password: string, fullName: string, role: 'teacher' | 'student') => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    error: null,
  });

  const fetchMe = useCallback(async (token: string): Promise<SupabaseProfile | null> => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return null;
      const { user } = await res.json();
      return user as SupabaseProfile;
    } catch {
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    const token = getStoredToken();
    if (!token) return;
    const profile = await fetchMe(token);
    if (profile) {
      setState(prev => ({ ...prev, profile }));
    }
  }, [fetchMe]);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    fetchMe(token).then(profile => {
      if (profile) {
        setState({
          user: { id: profile.id, email: profile.email, role: profile.role },
          profile,
          session: { access_token: token },
          loading: false,
          error: null,
        });
      } else {
        clearStoredToken();
        setState(prev => ({ ...prev, loading: false }));
      }
    });
  }, [fetchMe]);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: 'teacher' | 'student'
  ): Promise<{ error: string | null }> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setState(prev => ({ ...prev, loading: false, error: data.error }));
        return { error: data.error };
      }

      setStoredToken(data.token);
      setState({
        user: { id: data.user.id, email: data.user.email, role: data.user.role },
        profile: data.user as SupabaseProfile,
        session: { access_token: data.token },
        loading: false,
        error: null,
      });
      return { error: null };
    } catch (err: any) {
      setState(prev => ({ ...prev, loading: false, error: err.message }));
      return { error: err.message };
    }
  };

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setState(prev => ({ ...prev, loading: false, error: data.error }));
        return { error: data.error };
      }

      setStoredToken(data.token);
      setState({
        user: { id: data.user.id, email: data.user.email, role: data.user.role },
        profile: data.user as SupabaseProfile,
        session: { access_token: data.token },
        loading: false,
        error: null,
      });
      return { error: null };
    } catch (err: any) {
      setState(prev => ({ ...prev, loading: false, error: err.message }));
      return { error: err.message };
    }
  };

  const signOut = async () => {
    clearStoredToken();
    setState({
      user: null,
      profile: null,
      session: null,
      loading: false,
      error: null,
    });
  };

  const resetPassword = async (_email: string): Promise<{ error: string | null }> => {
    return { error: 'Password reset is not available in local mode. Use the default credentials.' };
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signUp,
        signIn,
        signOut,
        resetPassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
