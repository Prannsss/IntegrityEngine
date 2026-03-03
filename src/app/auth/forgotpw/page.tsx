'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FloatingInput } from '@/components/ui/floating-input';
import { IELogo } from '@/components/ui/ie-logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Loader2, ArrowLeft, MailCheck } from 'lucide-react';
import { gooeyToast } from 'goey-toast';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await resetPassword(email);
    setSubmitting(false);

    if (error) {
      gooeyToast.error('Failed to send reset link', { description: error });
    } else {
      setSent(true);
      gooeyToast.success('Reset link sent!', { description: 'Check your inbox.' });
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none -z-10">
          <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] bg-green-500/8 blur-[130px] rounded-full" />
        </div>
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
              <div className="mx-auto w-14 h-14 rounded-2xl bg-green-500/15 flex items-center justify-center mb-3">
                <MailCheck className="w-7 h-7 text-green-400" />
              </div>
              <CardTitle className="font-headline text-2xl">Check Your Email</CardTitle>
              <CardDescription className="text-muted-foreground/70">
                We sent a password reset link to <strong className="text-foreground">{email}</strong>. Click the link to reset your password.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <Link href="/auth/login">
                <Button variant="outline" className="w-full h-11 border-white/[0.1] hover:bg-white/5 gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back to Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[25%] right-[15%] w-[400px] h-[400px] bg-primary/10 blur-[130px] rounded-full animate-pulse-slow" />
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
            <CardTitle className="font-headline text-2xl">Reset Password</CardTitle>
            <CardDescription className="text-muted-foreground/70">
              Enter your email and we&apos;ll send you a reset link.
            </CardDescription>
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

              <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 glow-primary mt-2" disabled={submitting}>
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Send Reset Link
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground/70 mt-6">
              <Link href="/auth/login" className="text-primary hover:text-primary/80 font-medium transition-colors inline-flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" />
                Back to Login
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
