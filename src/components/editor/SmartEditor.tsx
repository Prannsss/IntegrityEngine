"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Activity, Clipboard, Zap, Clock } from 'lucide-react';
import { KeystrokeTracker } from '@/lib/telemetry/keystroke-tracker';
import { Progress } from '@/components/ui/progress';

export function SmartEditor() {
  const [content, setContent] = useState('');
  const [wpm, setWpm] = useState(0);
  const [burst, setBurst] = useState(0);
  const [isPasting, setIsPasting] = useState(false);
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const trackerRef = useRef<KeystrokeTracker | null>(null);

  const handleHeartbeat = useCallback((events: any[], currentWpm: number, currentBurst: number) => {
    setWpm(currentWpm);
    setBurst(currentBurst);
    setLastSync(new Date());
    console.log('Telemetry Heartbeat:', { events, currentWpm, currentBurst });
  }, []);

  useEffect(() => {
    trackerRef.current = new KeystrokeTracker(handleHeartbeat);
  }, [handleHeartbeat]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    trackerRef.current?.recordKey(e.nativeEvent as KeyboardEvent);
  };

  const onPaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text');
    trackerRef.current?.recordPaste(text);
    if (text.length > 100) {
      setIsPasting(true);
      setTimeout(() => setIsPasting(false), 3000);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6 max-w-7xl mx-auto h-[calc(100vh-80px)]">
      <div className="lg:col-span-3 flex flex-col gap-4">
        <Card className="flex-1 p-6 relative bg-card border-muted overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-headline flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              VeriType Editor
            </h2>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Last Sync: {lastSync.toLocaleTimeString()}
              </span>
              <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
                Connected
              </Badge>
            </div>
          </div>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={onKeyDown}
            onPaste={onPaste}
            placeholder="Start drafting your assignment here. Your behavioral fingerprint is being established..."
            className="flex-1 resize-none bg-transparent border-none focus-visible:ring-0 text-lg leading-relaxed font-body placeholder:text-muted-foreground/30"
          />
          {isPasting && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-destructive text-destructive-foreground px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-in fade-in zoom-in">
              Large Paste Event Detected
            </div>
          )}
        </Card>
      </div>

      <div className="flex flex-col gap-4 h-full overflow-y-auto pr-1">
        <Card className="p-5 bg-card border-muted">
          <h3 className="text-sm font-headline uppercase tracking-wider text-muted-foreground mb-4">Typing Dynamics</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Activity className="w-4 h-4 text-accent" />
                  Speed (WPM)
                </span>
                <span className="text-2xl font-headline text-accent">{wpm}</span>
              </div>
              <Progress value={Math.min(wpm, 120)} className="h-1.5" />
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  Burst Level
                </span>
                <span className="text-2xl font-headline text-primary">{(burst / 10).toFixed(1)}</span>
              </div>
              <Progress value={Math.min(burst / 2, 100)} className="h-1.5" />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-card border-muted flex-1">
          <h3 className="text-sm font-headline uppercase tracking-wider text-muted-foreground mb-4 flex items-center justify-between">
            Recent Telemetry
            <Badge variant="secondary" className="text-[10px] px-1 h-4">Live</Badge>
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Paste Monitoring', status: 'Active', icon: <Clipboard className="w-3 h-3" /> },
              { label: 'IKL Tracking', status: 'Healthy', icon: <Clock className="w-3 h-3" /> },
              { label: 'Linguistic Buffer', status: 'Ready', icon: <Zap className="w-3 h-3" /> }
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-muted/50">
                <div className="flex items-center gap-2 text-sm">
                  {item.icon}
                  {item.label}
                </div>
                <span className="text-[10px] text-accent font-bold uppercase">{item.status}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 text-[11px] text-muted-foreground bg-secondary/30 p-3 rounded border border-dashed border-muted">
            Telemetry is encrypted and signed before submission to the Integrity Engine.
          </div>
        </Card>
      </div>
    </div>
  );
}