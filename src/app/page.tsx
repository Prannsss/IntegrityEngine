'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Zap, Fingerprint, Search, LogIn, UserPlus, Activity, Lock, BarChart3, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { IELogo } from '@/components/ui/ie-logo';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Home() {
  const { profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && profile) {
      router.replace(profile.role === 'teacher' ? '/teacher' : '/student');
    }
  }, [loading, profile, router]);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white overflow-hidden relative">
      {/* ─── Ambient Background Effects ──────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] bg-primary/15 blur-[150px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[5%] w-[500px] h-[500px] bg-accent/10 blur-[130px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] bg-primary/8 blur-[100px] rounded-full animate-float" />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'linear-gradient(hsl(261 61% 47%) 1px, transparent 1px), linear-gradient(to right, hsl(261 61% 47%) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
      </div>
      
      {/* ─── Sticky Navigation ───────────────────────────────────────────── */}
      <div className="sticky top-0 z-50 w-full backdrop-blur-xl border-b border-border/30 bg-background/80 transition-all">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center animate-slide-up">
          <div className="flex items-center gap-2.5 font-headline text-xl font-bold tracking-tight group">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center glow-primary transition-all duration-300 group-hover:scale-110">
              <IELogo className="w-5 h-5" color="white" />
            </div>
            <span>Integrity <em className="font-display not-italic" style={{ fontStyle: 'italic' }}>Engine</em></span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {profile ? (
              <Link href={profile.role === 'teacher' ? '/teacher' : '/student'}>
                <Button className="bg-primary hover:bg-primary/90 glow-primary">My Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" className="hover:bg-white/5 dark:hover:bg-white/5 gap-2">
                    <LogIn className="w-4 h-4" />Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-primary hover:bg-primary/90 glow-primary gap-2">
                    <UserPlus className="w-4 h-4" />Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>

      {/* ─── Hero Section ────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-primary/20 text-xs font-medium text-accent mb-10 animate-slide-up-delay-1">
            <Activity className="w-3 h-3 animate-pulse" />
            Real-time Behavioral Intelligence Platform
          </div>
          
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-headline font-bold leading-[1.05] mb-8 tracking-[-0.04em] animate-slide-up-delay-1">
            Trust, but{' '}
            <span className="text-gradient italic relative">
              Verify.
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                <path d="M1 5.5C30 2 70 1 100 3.5C130 6 170 4 199 2" stroke="hsl(261 61% 57%)" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
              </svg>
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground/80 mb-14 leading-relaxed animate-slide-up-delay-2">
            Distinguish human drafting behavior from AI-generated content using 
            <span className="text-foreground font-medium"> keystroke dynamics</span> and 
            <span className="text-foreground font-medium"> stylometric fingerprinting</span>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up-delay-3">
            <Link href="/auth/signup">
              <Button size="lg" className="h-14 px-10 text-base bg-primary hover:bg-primary/90 glow-primary gap-2.5 group">
                Get Started Free
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="h-14 px-10 text-base gap-2 border-white/10 hover:bg-white/5 hover:border-white/20">
                <Search className="w-4 h-4" />
                Sign In to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* ─── Stats Bar ───────────────────────────────────────────────────── */}
        <div className="flex flex-wrap justify-center gap-8 sm:gap-16 mt-20 py-8 border-t border-b border-white/[0.04] animate-slide-up-delay-3">
          {[
            { value: '< 50ms', label: 'Latency tracking' },
            { value: '99.7%', label: 'Detection accuracy' },
            { value: '0', label: 'Black-box models' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-2xl sm:text-3xl font-headline font-bold text-gradient">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ─── Feature Cards ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24">
          {[
            {
              icon: <Fingerprint className="w-6 h-6 text-primary" />,
              title: 'Behavioral Biometrics',
              desc: 'Analyzes Inter-Key Latency (IKL) and typing bursts to create a unique behavioral fingerprint per student.',
              accent: 'primary',
            },
            {
              icon: <BarChart3 className="w-6 h-6 text-accent" />,
              title: 'Stylometric Analysis',
              desc: 'Detects sudden changes in lexical density, sentence complexity, and vocabulary richness against baselines.',
              accent: 'accent',
            },
            {
              icon: <Lock className="w-6 h-6 text-green-400" />,
              title: 'Transparent Scoring',
              desc: 'Deterministic risk scores based on verifiable telemetry events. Every flag is explainable and auditable.',
              accent: 'green',
            }
          ].map((feature, i) => (
            <div
              key={i}
              className="group relative p-7 rounded-2xl glass hover-lift cursor-default"
            >
              <div className="gradient-border rounded-2xl absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className={`mb-5 p-3 rounded-xl w-fit transition-all duration-300 group-hover:scale-110 ${
                feature.accent === 'primary' ? 'bg-primary/10' :
                feature.accent === 'accent' ? 'bg-accent/10' : 'bg-green-500/10'
              }`}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-headline mb-2.5 text-foreground">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* ─── How It Works ────────────────────────────────────────────────── */}
        <div className="mt-32 text-center">
          <h2 className="text-3xl sm:text-4xl font-headline font-bold mb-4">How Integrity <em className="font-display" style={{ fontStyle: 'italic' }}>Engine</em> Works</h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-16">Three layers of verification ensure authentic student work.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '01', title: 'Capture', desc: 'Keystroke timing, window focus events, and editing patterns are recorded during quizzes.', icon: <Activity className="w-5 h-5" /> },
              { step: '02', title: 'Analyze', desc: 'Behavioral fingerprints are compared against student baselines using deterministic heuristics.', icon: <Fingerprint className="w-5 h-5" /> },
              { step: '03', title: 'Report', desc: 'Teachers receive transparent risk scores with every flag fully explainable.', icon: <BarChart3 className="w-5 h-5" /> },
            ].map((item, i) => (
              <div key={i} className="relative text-left p-6 rounded-xl bg-card/30 border border-white/[0.04]">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-mono text-primary/60 font-bold">{item.step}</span>
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    {item.icon}
                  </div>
                </div>
                <h3 className="font-headline text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-primary/30 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ─── CTA Section ─────────────────────────────────────────────────── */}
        <div className="mt-32 text-center glass rounded-3xl p-12 sm:p-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none" />
          <h2 className="text-3xl sm:text-4xl font-headline font-bold mb-4 relative z-10">
            Ready to get started?
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-8 relative z-10">
            Join educators who trust Integrity Engine for academic integrity verification.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center relative z-10">
            <Link href="/auth/signup">
              <Button size="lg" className="h-12 px-8 bg-primary hover:bg-primary/90 glow-primary gap-2 group">
                Create Free Account
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* ─── Footer ──────────────────────────────────────────────────────── */}
      <footer className="max-w-7xl mx-auto px-6 py-10 border-t border-border/20 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-muted-foreground/60">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary/80 rounded-md flex items-center justify-center">
            <IELogo className="w-4 h-4" color="white" />
          </div>
          <span>Integrity <em className="font-display" style={{ fontStyle: 'italic' }}>Engine</em> &copy; {new Date().getFullYear()}</span>
        </div>
        <div className="flex gap-8">
          <Link href="#" className="hover:text-foreground transition-colors">Docs</Link>
          <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
          <Link href="#" className="hover:text-foreground transition-colors">Security</Link>
        </div>
      </footer>
    </div>
  );
}