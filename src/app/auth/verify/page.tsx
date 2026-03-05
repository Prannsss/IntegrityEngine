'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IELogo } from '@/components/ui/ie-logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Loader2, MailCheck, ArrowLeft, RefreshCw } from 'lucide-react';
import { gooeyToast } from 'goey-toast';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const { verifyEmail, resendVerification } = useAuth();

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste of full code
      const pasted = value.replace(/\D/g, '').slice(0, 6);
      const newCode = [...code];
      for (let i = 0; i < 6; i++) {
        newCode[i] = pasted[i] || '';
      }
      setCode(newCode);
      const nextEmpty = pasted.length < 6 ? pasted.length : 5;
      inputRefs.current[nextEmpty]?.focus();
      return;
    }

    const digit = value.replace(/\D/g, '');
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      gooeyToast.error('Please enter the complete 6-digit code');
      return;
    }

    setVerifying(true);
    const { error } = await verifyEmail(emailParam, fullCode);
    setVerifying(false);

    if (error) {
      gooeyToast.error('Verification failed', { description: error });
    } else {
      setVerified(true);
      gooeyToast.success('Email verified!', { description: 'You can now sign in.' });
    }
  };

  const handleResend = async () => {
    setResending(true);
    const { error } = await resendVerification(emailParam);
    setResending(false);

    if (error) {
      gooeyToast.error('Failed to resend', { description: error });
    } else {
      gooeyToast.success('Code sent!', { description: 'Check your inbox for a new code.' });
    }
  };

  // Auto-submit when all 6 digits are entered
  useEffect(() => {
    if (code.every(d => d !== '') && !verifying && !verified) {
      handleVerify();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background relative overflow-hidden">
      {/* Left side design */}
      <div className="hidden lg:flex flex-col justify-center p-12 bg-primary/5 relative">
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
          {verified ? (
            <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] bg-green-500/8 blur-[130px] rounded-full" />
          ) : (
            <>
              <div className="absolute top-[20%] right-[15%] w-[400px] h-[400px] bg-primary/10 blur-[130px] rounded-full animate-pulse-slow" />
              <div className="absolute bottom-[20%] left-[15%] w-[350px] h-[350px] bg-accent/8 blur-[120px] rounded-full animate-pulse-slow [animation-delay:2s]" />
            </>
          )}
        </div>
        <div className="max-w-md mx-auto z-10">
          <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity mb-8">
            <IELogo className="w-8 h-8" />
            <span className="font-headline text-xl font-semibold tracking-wide">IntegrityEngine</span>
          </Link>
          <h1 className="text-4xl font-headline font-bold mb-4">{verified ? "Verification Complete" : "Verify Your Identity"}</h1>
          <p className="text-lg text-muted-foreground">{verified ? "You're ready to use Integrity Engine." : "We've sent a code to your email. Enter it here to continue."}</p>
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
          {verified ? (
            <Card className="w-full max-w-md glass-strong rounded-2xl animate-scale-in border-none shadow-none bg-transparent sm:bg-card/40 sm:border-solid sm:border-border sm:shadow-sm">
              <CardHeader className="text-center space-y-2 pb-2">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-green-500/15 flex items-center justify-center mb-3">
                  <MailCheck className="w-7 h-7 text-green-400" />
                </div>
                <CardTitle className="font-headline text-2xl">Email Verified!</CardTitle>
                <CardDescription className="text-muted-foreground/70">
                  Your account is ready. You can now sign in.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <Link href="/auth/login">
                  <Button className="w-full h-11 bg-primary hover:bg-primary/90 glow-primary">
                    Continue to Sign In
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card className="w-full max-w-md glass-strong rounded-2xl animate-scale-in border-none shadow-none bg-transparent sm:bg-card/40 sm:border-solid sm:border-border sm:shadow-sm">
              <CardHeader className="text-center space-y-2 pb-2">
                <div className="mx-auto flex items-center justify-center mb-3">
                  <MailCheck className="w-12 h-12 text-primary" />
                </div>
                <CardTitle className="font-headline text-2xl">Verify Your Email</CardTitle>
                <CardDescription className="text-muted-foreground/70">
                  We sent a 6-digit code to{' '}
                  <strong className="text-foreground">{emailParam || 'your email'}</strong>
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-4">
                {/* 6-digit code input */}
                <div className="flex gap-3 justify-center mb-6">
                  {code.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
                      onChange={e => handleChange(i, e.target.value)}
                      onKeyDown={e => handleKeyDown(i, e)}
                      aria-label={`Verification digit ${i + 1}`}
                      className="w-12 h-14 text-center text-xl font-headline font-bold rounded-xl border border-white/[0.08] bg-white/[0.03] focus:border-primary/60 focus:outline-none focus:ring-0 transition-colors"
                    />
                  ))}
                </div>

                <Button
                  onClick={handleVerify}
                  className="w-full h-11 bg-primary hover:bg-primary/90 glow-primary"
                  disabled={verifying || code.some(d => !d)}
                >
                  {verifying && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Verify Email
                </Button>

                <div className="flex items-center justify-between mt-6">
                  <Link href="/auth/login" className="text-xs text-primary/80 hover:text-primary transition-colors inline-flex items-center gap-1">
                    <ArrowLeft className="w-3 h-3" />
                    Back to Login
                  </Link>
                  <button
                    onClick={handleResend}
                    disabled={resending}
                    className="text-xs text-primary/80 hover:text-primary transition-colors inline-flex items-center gap-1"
                  >
                    {resending ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                    Resend Code
                  </button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
