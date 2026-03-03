'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Loader2, ArrowLeft, MailCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await resetPassword(email);
    setSubmitting(false);

    if (error) {
      toast({ title: 'Error', description: error, variant: 'destructive' });
    } else {
      setSent(true);
      toast({ title: 'Reset link sent!', description: 'Check your inbox.' });
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none -z-10">
          <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] bg-green-500/8 blur-[130px] rounded-full" />
        </div>
        <Card className="w-full max-w-md glass-strong rounded-2xl animate-scale-in">
          <CardHeader className="text-center space-y-2 pb-2">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-green-500/15 flex items-center justify-center mb-3">
              <MailCheck className="w-7 h-7 text-green-400" />
            </div>
            <CardTitle className="font-headline text-2xl">Check Your Email</CardTitle>
            <CardDescription className="text-muted-foreground/70">
              We sent a password reset link to <strong className="text-foreground">{email}</strong>. Click the link in the email to reset your password.
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
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[25%] right-[15%] w-[400px] h-[400px] bg-primary/10 blur-[130px] rounded-full animate-pulse-slow" />
      </div>

      <Card className="w-full max-w-md glass-strong rounded-2xl animate-scale-in">
        <CardHeader className="text-center space-y-2 pb-2">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center mb-3 glow-primary">
            <ShieldCheck className="w-7 h-7 text-primary" />
          </div>
          <CardTitle className="font-headline text-2xl">Reset Password</CardTitle>
          <CardDescription className="text-muted-foreground/70">
            Enter your email and we&apos;ll send you a reset link.
          </CardDescription>
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
                className="h-11 bg-white/[0.03] border-white/[0.08] focus:border-primary/50 transition-colors"
              />
            </div>

            <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/90 glow-primary mt-2" disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
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
  );
}
