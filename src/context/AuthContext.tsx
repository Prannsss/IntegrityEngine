'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, type SupabaseProfile } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export type AuthState = {
  user: User | null;
  profile: SupabaseProfile | null;
  session: Session | null;
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    error: null,
  });

  const fetchProfile = useCallback(async (userId: string): Promise<SupabaseProfile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error.message);
      return null;
    }
    return data as SupabaseProfile;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!state.user) return;
    const profile = await fetchProfile(state.user.id);
    setState(prev => ({ ...prev, profile }));
  }, [state.user, fetchProfile]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setState({
          user: session.user,
          profile,
          session,
          loading: false,
          error: null,
        });
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await fetchProfile(session.user.id);
          // Update last_login_at
          await supabase
            .from('profiles')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', session.user.id);

          setState({
            user: session.user,
            profile,
            session,
            loading: false,
            error: null,
          });
        } else if (event === 'SIGNED_OUT') {
          setState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            error: null,
          });
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          setState(prev => ({ ...prev, session, user: session.user }));
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: 'teacher' | 'student'
  ): Promise<{ error: string | null }> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
      },
    });

    if (error) {
      setState(prev => ({ ...prev, loading: false, error: error.message }));
      return { error: error.message };
    }

    setState(prev => ({ ...prev, loading: false }));
    return { error: null };
  };

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setState(prev => ({ ...prev, loading: false, error: error.message }));
      return { error: error.message };
    }

    setState(prev => ({ ...prev, loading: false }));
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setState({
      user: null,
      profile: null,
      session: null,
      loading: false,
      error: null,
    });
  };

  const resetPassword = async (email: string): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/login`,
    });

    if (error) return { error: error.message };
    return { error: null };
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
