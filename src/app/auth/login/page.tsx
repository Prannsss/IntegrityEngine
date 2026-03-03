'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Loader2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, loading, profile } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (profile) {
      router.replace(profile.role === 'teacher' ? '/teacher' : '/student');
    }
  }, [profile, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await signIn(email, password);

    if (error) {
      toast({ title: 'Login failed', description: error, variant: 'destructive' });
    } else {
      toast({ title: 'Welcome back!' });
      // Role-based redirect will happen via useEffect
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[20%] left-[15%] w-[400px] h-[400px] bg-primary/10 blur-[130px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-[20%] right-[15%] w-[350px] h-[350px] bg-accent/8 blur-[120px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <Card className="w-full max-w-md glass-strong rounded-2xl animate-scale-in">
        <CardHeader className="text-center space-y-2 pb-2">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center mb-3 glow-primary">
            <ShieldCheck className="w-7 h-7 text-primary" />
          </div>
          <CardTitle className="font-headline text-2xl">Welcome Back</CardTitle>
          <CardDescription className="text-muted-foreground/70">Sign in to your Integrity Engine account</CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@university.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-11 bg-white/[0.03] border-white/[0.08] focus:border-primary/50 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">Password</Label>
                <Link
                  href="/auth/forgotpw"
                  className="text-xs text-primary/80 hover:text-primary transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="h-11 bg-white/[0.03] border-white/[0.08] focus:border-primary/50 transition-colors pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPw(!showPw)}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 glow-primary mt-2" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
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
  );
}
