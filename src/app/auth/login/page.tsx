'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FloatingInput } from '@/components/ui/floating-input';
import { IELogo } from '@/components/ui/ie-logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { gooeyToast } from 'goey-toast';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, loading, profile } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    if (profile) router.replace(profile.role === 'teacher' ? '/teacher' : '/student');
  }, [profile, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await signIn(email, password);
    if (error) {
      gooeyToast.error('Login failed', { description: error });
    } else {
      gooeyToast.success('Welcome back!');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[20%] left-[15%] w-[400px] h-[400px] bg-primary/10 blur-[130px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-[20%] right-[15%] w-[350px] h-[350px] bg-accent/8 blur-[120px] rounded-full animate-pulse-slow [animation-delay:2s]" />
      </div>

      {/* Sticky nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 h-14 border-b border-white/[0.06] bg-background/80 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
          <IELogo className="w-7 h-7" />
          <span className="font-headline text-sm font-semibold tracking-wide hidden sm:block">IntegrityEngine</span>
        </Link>
        <ThemeToggle />
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md glass-strong rounded-2xl animate-scale-in">
          <CardHeader className="text-center space-y-2 pb-2">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center mb-3 glow-primary">
              <IELogo className="w-8 h-8" />
            </div>
            <CardTitle className="font-headline text-2xl">Welcome Back</CardTitle>
            <CardDescription className="text-muted-foreground/70">Sign in to your Integrity Engine account</CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <FloatingInput
                label="Email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />

              <div className="space-y-1">
                <FloatingInput
                  label="Password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  rightElement={
                    <button
                      type="button"
                      tabIndex={-1}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setShowPw(v => !v)}
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
                <div className="flex justify-end">
                  <Link href="/auth/forgotpw" className="text-xs text-primary/80 hover:text-primary transition-colors">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 glow-primary mt-2" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Sign In
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground/70 mt-6">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="text-primary hover:text-primary/80 font-medium transition-colors">
                Create one
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
