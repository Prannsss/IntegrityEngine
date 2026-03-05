'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { FloatingInput } from '@/components/ui/floating-input';
import { IELogo } from '@/components/ui/ie-logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { gooeyToast } from 'goey-toast';

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, loading } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      gooeyToast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      gooeyToast.error('Password too short', { description: 'Must be at least 6 characters.' });
      return;
    }

    const { error } = await signUp(email, password, fullName, role);

    if (error) {
      gooeyToast.error('Sign up failed', { description: error });
    } else {
      gooeyToast.success('Account created!', { description: 'Please verify your email to continue.' });
      router.push(`/auth/verify?email=${encodeURIComponent(email)}`);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background relative overflow-hidden">
      {/* Left side design */}
      <div className="hidden lg:flex flex-col justify-center p-12 bg-primary/5 relative">
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-[10%] right-[20%] w-[400px] h-[400px] bg-primary/10 blur-[130px] rounded-full animate-pulse-slow" />
          <div className="absolute bottom-[10%] left-[10%] w-[350px] h-[350px] bg-accent/8 blur-[120px] rounded-full animate-pulse-slow [animation-delay:2s]" />
        </div>
        <div className="max-w-md mx-auto z-10">
          <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity mb-8">
            <IELogo className="w-8 h-8" />
            <span className="font-headline text-xl font-semibold tracking-wide">IntegrityEngine</span>
          </Link>
          <h1 className="text-4xl font-headline font-bold mb-4">Start Your Journey</h1>
          <p className="text-lg text-muted-foreground">Create an account to access powerful academic intelligence and unlock a new era of integrity-focused learning.</p>
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
          <Card className="w-full max-w-md glass-strong rounded-2xl animate-scale-in border-none shadow-none bg-transparent sm:bg-card/40 sm:border-solid sm:border-border sm:shadow-sm">
            <CardHeader className="text-center space-y-2 pb-2">
              <div className="mx-auto flex items-center justify-center mb-3">
                <IELogo className="w-12 h-12" />
              </div>
              <CardTitle className="font-headline text-2xl">Create Account</CardTitle>
              <CardDescription className="text-muted-foreground/70">Join Integrity Engine — Academic Integrity Intelligence</CardDescription>
            </CardHeader>

          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <FloatingInput
                label="Full Name"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                autoComplete="name"
              />

              <FloatingInput
                label="Email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />

              <FloatingInput
                label="Password"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="new-password"
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

              <FloatingInput
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />

              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground px-1">I am a...</p>
                <RadioGroup
                  value={role}
                  onValueChange={(v) => setRole(v as 'student' | 'teacher')}
                  className="flex gap-3"
                >
                  <label htmlFor="role-student" className={`flex-1 flex items-center gap-2.5 rounded-xl border p-3 cursor-pointer transition-all ${role === 'student' ? 'border-primary/50 bg-primary/5' : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15]'}`}>
                    <RadioGroupItem value="student" id="role-student" />
                    <span className="text-sm">Student</span>
                  </label>
                  <label htmlFor="role-teacher" className={`flex-1 flex items-center gap-2.5 rounded-xl border p-3 cursor-pointer transition-all ${role === 'teacher' ? 'border-primary/50 bg-primary/5' : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15]'}`}>
                    <RadioGroupItem value="teacher" id="role-teacher" />
                    <span className="text-sm">Teacher</span>
                  </label>
                </RadioGroup>
              </div>

              <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 glow-primary mt-2" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Account
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground/70 mt-6">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
     </div>
    </div>
  );
}
