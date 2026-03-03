'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ShieldCheck, Loader2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, loading } = useAuth();
  const { toast } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }

    if (password.length < 6) {
      toast({ title: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }

    const { error } = await signUp(email, password, fullName, role);

    if (error) {
      toast({ title: 'Sign up failed', description: error, variant: 'destructive' });
    } else {
      toast({
        title: 'Account created!',
        description: 'Check your email to confirm your account, then log in.',
      });
      router.push('/auth/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[10%] right-[20%] w-[400px] h-[400px] bg-primary/10 blur-[130px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-[10%] left-[10%] w-[350px] h-[350px] bg-accent/8 blur-[120px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <Card className="w-full max-w-md glass-strong rounded-2xl animate-scale-in my-8">
        <CardHeader className="text-center space-y-2 pb-2">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center mb-3 glow-primary">
            <ShieldCheck className="w-7 h-7 text-primary" />
          </div>
          <CardTitle className="font-headline text-2xl">Create Account</CardTitle>
          <CardDescription className="text-muted-foreground/70">Join Integrity Engine — Academic Integrity Intelligence</CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-xs font-medium text-muted-foreground">Full Name</Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                className="h-11 bg-white/[0.03] border-white/[0.08] focus:border-primary/50 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@university.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="h-11 bg-white/[0.03] border-white/[0.08] focus:border-primary/50 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-xs font-medium text-muted-foreground">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                className="h-11 bg-white/[0.03] border-white/[0.08] focus:border-primary/50 transition-colors"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-medium text-muted-foreground">I am a...</Label>
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
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
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
  );
}
