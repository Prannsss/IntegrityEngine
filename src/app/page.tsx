import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Shield, Zap, Fingerprint, Search } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none -z-10" />
      
      <nav className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
        <div className="flex items-center gap-2 font-headline text-2xl font-bold tracking-tight">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          VeriType
        </div>
        <div className="flex gap-4">
          <Link href="/dashboard">
            <Button variant="ghost">Teacher Portal</Button>
          </Link>
          <Link href="/editor">
            <Button className="bg-primary hover:bg-primary/90">Get Started</Button>
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-24 pb-32 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-muted text-xs font-medium text-accent mb-8 animate-in fade-in slide-in-from-bottom-4">
          <Zap className="w-3 h-3" />
          Real-time Behavioral Intelligence Prototype
        </div>
        
        <h1 className="text-6xl md:text-8xl font-headline font-bold leading-[1.1] mb-8 tracking-tighter">
          Trust, but <span className="text-primary italic">Verify.</span>
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-muted-foreground mb-12 font-body">
          Distinguish human drafting behavior from AI-generated content using keystroke dynamics and stylometric fingerprinting.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/editor">
            <Button size="lg" className="h-14 px-10 text-lg bg-primary hover:bg-primary/90 gap-2">
              <Zap className="w-5 h-5" />
              Start Drafting
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline" className="h-14 px-10 text-lg gap-2">
              <Search className="w-5 h-5" />
              Teacher Dashboard
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32">
          {[
            {
              icon: <Fingerprint className="w-8 h-8 text-primary" />,
              title: "Behavioral Biometrics",
              desc: "Analyzes Inter-Key Latency (IKL) and typing bursts to create a unique behavioral ID."
            },
            {
              icon: <Zap className="w-8 h-8 text-accent" />,
              title: "Stylometric Drift",
              desc: "Detects sudden changes in lexical density and sentence complexity against baselines."
            },
            {
              icon: <Shield className="w-8 h-8 text-green-500" />,
              title: "Deterministic Risk",
              desc: "Transparent scoring logic based on verifiable telemetry events, not black-box ML."
            }
          ].map((feature, i) => (
            <div key={i} className="p-8 rounded-2xl bg-card border border-muted text-left hover:border-primary/50 transition-colors group">
              <div className="mb-4 p-3 bg-secondary rounded-xl w-fit group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-headline mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-muted flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          VeriType © 2024
        </div>
        <div className="flex gap-8">
          <Link href="#" className="hover:text-primary transition-colors">Documentation</Link>
          <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
          <Link href="#" className="hover:text-primary transition-colors">Security</Link>
        </div>
      </footer>
    </div>
  );
}