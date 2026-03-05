'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, type UserProfile, ApiError } from '@/lib/api';

export type AuthState = {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
};

type AuthContextType = AuthState & {
  signUp: (email: string, password: string, fullName: string, role: 'teacher' | 'student') => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null; code?: string; email?: string }>;
  signOut: () => void;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<{ error: string | null }>;
  resendVerification: (email: string) => Promise<{ error: string | null }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  const refreshProfile = useCallback(async () => {
    if (!api.getToken()) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      const { user } = await api.me();
      setState({ user, loading: false, error: null });
    } catch {
      api.logout();
      setState({ user: null, loading: false, error: null });
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: 'teacher' | 'student'
  ): Promise<{ error: string | null }> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await api.signup(email, password, fullName, role);
      setState(prev => ({ ...prev, loading: false }));
      return { error: null };
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Sign up failed';
      setState(prev => ({ ...prev, loading: false, error: message }));
      return { error: message };
    }
  };

  const signIn = async (email: string, password: string): Promise<{ error: string | null; code?: string; email?: string }> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { user } = await api.login(email, password);
      setState({ user, loading: false, error: null });
      return { error: null };
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Login failed';
      const data = err instanceof ApiError ? (err.data as Record<string, unknown>) : {};
      setState(prev => ({ ...prev, loading: false, error: message }));
      return {
        error: message,
        code: data?.code as string | undefined,
        email: data?.email as string | undefined,
      };
    }
  };

  const signOut = () => {
    api.logout();
    setState({ user: null, loading: false, error: null });
  };

  const resetPassword = async (email: string): Promise<{ error: string | null }> => {
    try {
      await api.forgotPassword(email);
      return { error: null };
    } catch (err) {
      return { error: err instanceof ApiError ? err.message : 'Failed to send reset link' };
    }
  };

  const verifyEmail = async (email: string, code: string): Promise<{ error: string | null }> => {
    try {
      await api.verifyEmail(email, code);
      return { error: null };
    } catch (err) {
      return { error: err instanceof ApiError ? err.message : 'Verification failed' };
    }
  };

  const resendVerification = async (email: string): Promise<{ error: string | null }> => {
    try {
      await api.resendVerification(email);
      return { error: null };
    } catch (err) {
      return { error: err instanceof ApiError ? err.message : 'Failed to resend' };
    }
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
        verifyEmail,
        resendVerification,
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
