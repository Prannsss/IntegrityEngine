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

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background relative overflow-hidden">
      {/* Left side design */}
      <div className="hidden lg:flex flex-col justify-center p-12 bg-primary/5 relative">
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
          {sent ? (
            <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] bg-green-500/8 blur-[130px] rounded-full" />
          ) : (
            <div className="absolute top-[25%] right-[15%] w-[400px] h-[400px] bg-primary/10 blur-[130px] rounded-full animate-pulse-slow" />
          )}
        </div>
        <div className="max-w-md mx-auto z-10">
          <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity mb-8">
            <IELogo className="w-8 h-8" />
            <span className="font-headline text-xl font-semibold tracking-wide">IntegrityEngine</span>
          </Link>
          <h1 className="text-4xl font-headline font-bold mb-4">{sent ? "Email Sent" : "Account Recovery"}</h1>
          <p className="text-lg text-muted-foreground">{sent ? "Your password reset instructions are on their way." : "Regain access to your academic intelligence tools."}</p>
        </div>
      </div>

      {/* Right side form */}
      <div className="flex flex-col relative w-full h-full">
        {/* Pill nav for mobile */}
        <div className="absolute top-0 w-full z-50 flex justify-center pt-4 px-4 lg:hidden">
          <nav className="w-full max-w-md px-5 py-2.5 flex items-center justify-between rounded-full glass-strong border border-white/[0.08] shadow-lg shadow-black/10">
            <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
              <IELogo className="w-6 h-6" />
              <span className="font-headline text-sm font-semibold tracking-wide hidden sm:block">IntegrityEngine</span>
            </Link>
            <ThemeToggle />
          </nav>
        </div>

        {/* Theme toggle for desktop */}
        <div className="hidden lg:flex absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>

        <div className="flex-1 flex items-center justify-center px-4 py-12">
          {sent ? (
            <Card className="w-full max-w-md glass-strong rounded-2xl animate-scale-in border-none shadow-none bg-transparent sm:bg-card/40 sm:border-solid sm:border-border sm:shadow-sm">
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
          ) : (
            <Card className="w-full max-w-md glass-strong rounded-2xl animate-scale-in border-none shadow-none bg-transparent sm:bg-card/40 sm:border-solid sm:border-border sm:shadow-sm">
              <CardHeader className="text-center space-y-2 pb-2">
                <div className="mx-auto flex items-center justify-center mb-3">
                  <IELogo className="w-12 h-12" />
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
          )}
        </div>
      </div>
    </div>
  );
}
