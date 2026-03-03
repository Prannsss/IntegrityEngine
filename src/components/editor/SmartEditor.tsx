"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Clipboard,
  Zap,
  Clock,
  Wifi,
  WifiOff,
  AlertTriangle,
  CheckCircle,
  Fingerprint,
} from "lucide-react";
import { KeystrokeTracker, HeartbeatCallback, AlertCallback } from "@/lib/telemetry/keystroke-tracker";
import { TelemetryPayload, AnomalyFlag } from "@/lib/telemetry/types";
import { calculateFingerprint } from "@/lib/analysis/stylometry";
import { Progress } from "@/components/ui/progress";

// ─── Mock assignment ID (would come from route params in production) ────────
const MOCK_ASSIGNMENT_ID = "assign_demo_001";

export function SmartEditor() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [content, setContent] = useState("");
  const [wpm, setWpm] = useState(0);
  const [burstScore, setBurstScore] = useState(0);
  const [avgLatency, setAvgLatency] = useState(0);
  const [peakWpm, setPeakWpm] = useState(0);
  const [isPasting, setIsPasting] = useState(false);
  const [pasteLength, setPasteLength] = useState(0);
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [heartbeatCount, setHeartbeatCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [offlineQueueSize, setOfflineQueueSize] = useState(0);
  const [alerts, setAlerts] = useState<AnomalyFlag[]>([]);
  const [sessionId, setSessionId] = useState<string>("");
  const [wpmHistory, setWpmHistory] = useState<number[]>([]);
  const [wordCount, setWordCount] = useState(0);

  // ── Refs ───────────────────────────────────────────────────────────────────
  const trackerRef = useRef<KeystrokeTracker | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Live fingerprint (computed on content change, debounced) ────────────
  const [fingerprint, setFingerprint] = useState({
    lexical_density: 0,
    avg_sentence_length: 0,
    vocabulary_diversity: 0,
    flesch_kincaid_score: 0,
  });

  // ── Heartbeat callback: receives structured TelemetryPayload ───────────
  const handleHeartbeat: HeartbeatCallback = useCallback(
    (payload: TelemetryPayload) => {
      setWpm(payload.metrics.wpm);
      setBurstScore(payload.metrics.burstScore);
      setAvgLatency(payload.metrics.avgLatency);
      setPeakWpm(payload.metrics.peakWpm);
      setWpmHistory(payload.metrics.wpmHistory);
      setLastSync(new Date());
      setHeartbeatCount((prev) => prev + 1);

      // In production, this is where you'd POST to Supabase:
      // await supabase.from('keystroke_logs').insert({ ... payload })
      console.log(
        `[Heartbeat #${heartbeatCount + 1}] Session: ${payload.sessionId}`,
        payload.metrics
      );
    },
    [heartbeatCount]
  );

  // ── Alert callback: receives real-time anomaly flags ───────────────────
  const handleAlert: AlertCallback = useCallback((flag: AnomalyFlag) => {
    setAlerts((prev) => {
      // Deduplicate by id within a 5-second window
      const recent = prev.filter(
        (f) => f.id !== flag.id || Date.now() - (f as any)._time > 5000
      );
      return [...recent, { ...flag, _time: Date.now() } as any].slice(-10);
    });
  }, []);

  // ── Initialize tracker ─────────────────────────────────────────────────
  useEffect(() => {
    const tracker = new KeystrokeTracker(
      MOCK_ASSIGNMENT_ID,
      handleHeartbeat,
      handleAlert
    );
    trackerRef.current = tracker;
    setSessionId(tracker.sessionId);

    // Online/offline listeners for UI indicator
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      tracker.destroy();
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [handleHeartbeat, handleAlert]);

  // ── Debounced fingerprint computation on content change ────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      if (content.trim().length > 20) {
        const fp = calculateFingerprint(content);
        setFingerprint(fp);
        const words = content.trim().split(/\s+/).filter((w) => w.length > 0);
        setWordCount(words.length);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [content]);

  // ── Event handlers ─────────────────────────────────────────────────────
  const onKeyDown = (e: React.KeyboardEvent) => {
    trackerRef.current?.recordKeyDown(e.nativeEvent as KeyboardEvent);
  };

  const onKeyUp = (e: React.KeyboardEvent) => {
    trackerRef.current?.recordKeyUp(e.nativeEvent as KeyboardEvent);
  };

  const onPaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text");
    trackerRef.current?.recordPaste(text);
    if (text.length > 100) {
      setIsPasting(true);
      setPasteLength(text.length);
      setTimeout(() => setIsPasting(false), 4000);
    }
  };

  // ── Severity color helpers ─────────────────────────────────────────────
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-500 bg-red-500/10 border-red-500/30";
      case "high":
        return "text-orange-400 bg-orange-500/10 border-orange-500/30";
      case "medium":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
      default:
        return "text-blue-400 bg-blue-500/10 border-blue-500/30";
    }
  };

  // ── WPM bar color ──────────────────────────────────────────────────────
  const getWpmColor = () => {
    if (wpm > 150) return "text-destructive";
    if (wpm > 100) return "text-yellow-500";
    return "text-accent";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6 max-w-7xl mx-auto h-[calc(100vh-80px)]">
      {/* ── Main Editor Panel ────────────────────────────────────────────── */}
      <div className="lg:col-span-3 flex flex-col gap-4">
        <Card className="flex-1 p-6 relative bg-card border-muted overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-headline flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Integrity Engine Editor
            </h2>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {/* Session ID */}
              <span className="font-mono text-[10px] opacity-50" title="Session ID">
                {sessionId.substring(0, 20)}…
              </span>
              {/* Sync time */}
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Sync: {lastSync.toLocaleTimeString()}
              </span>
              {/* Heartbeat counter */}
              <span className="text-[10px] text-muted-foreground">
                #{heartbeatCount}
              </span>
              {/* Online status */}
              {isOnline ? (
                <Badge
                  variant="outline"
                  className="bg-green-500/10 text-green-400 border-green-500/20"
                >
                  <Wifi className="w-3 h-3 mr-1" />
                  Online
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                >
                  <WifiOff className="w-3 h-3 mr-1" />
                  Offline ({offlineQueueSize} queued)
                </Badge>
              )}
            </div>
          </div>

          {/* Text Area */}
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={onKeyDown}
            onKeyUp={onKeyUp}
            onPaste={onPaste}
            placeholder="Start drafting your assignment here. Your behavioral fingerprint is being established…"
            className="flex-1 resize-none bg-transparent border-none focus-visible:ring-0 text-lg leading-relaxed font-body placeholder:text-muted-foreground/30"
          />

          {/* Word count footer */}
          <div className="flex justify-between text-xs text-muted-foreground pt-3 border-t border-muted/50 mt-2">
            <span>{wordCount} words</span>
            <span>{content.length} characters</span>
          </div>

          {/* Paste Alert Banner */}
          {isPasting && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-destructive text-destructive-foreground px-6 py-3 rounded-full text-sm font-medium shadow-lg animate-in fade-in zoom-in flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Large Paste Detected: {pasteLength} characters
            </div>
          )}
        </Card>
      </div>

      {/* ── Sidebar: Telemetry Panel ─────────────────────────────────────── */}
      <div className="flex flex-col gap-4 h-full overflow-y-auto pr-1">
        {/* Typing Dynamics */}
        <Card className="p-5 bg-card border-muted">
          <h3 className="text-sm font-headline uppercase tracking-wider text-muted-foreground mb-4">
            Typing Dynamics
          </h3>
          <div className="space-y-6">
            {/* WPM */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Activity className="w-4 h-4 text-accent" />
                  Speed (WPM)
                </span>
                <span className={`text-2xl font-headline ${getWpmColor()}`}>
                  {wpm}
                </span>
              </div>
              <Progress value={Math.min(wpm, 150) / 1.5} className="h-1.5" />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>Peak: {peakWpm}</span>
                <span>Avg Latency: {Math.round(avgLatency)}ms</span>
              </div>
            </div>

            {/* Burst Score */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  Burst Level
                </span>
                <span className="text-2xl font-headline text-primary">
                  {burstScore.toFixed(0)}
                </span>
              </div>
              <Progress value={Math.min(burstScore / 3, 100)} className="h-1.5" />
              <div className="text-[10px] text-muted-foreground mt-1">
                σ of Inter-Key Latency (ms)
              </div>
            </div>

            {/* Mini WPM Sparkline (text-based) */}
            {wpmHistory.length > 1 && (
              <div>
                <div className="text-[10px] text-muted-foreground uppercase mb-2">
                  WPM History (5s windows)
                </div>
                <div className="flex items-end gap-[2px] h-8">
                  {wpmHistory.slice(-20).map((w, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-primary/40 rounded-t-sm min-w-[3px]"
                      style={{
                        height: `${Math.max(2, Math.min(100, (w / Math.max(...wpmHistory, 1)) * 100))}%`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Live Fingerprint Preview */}
        {wordCount > 10 && (
          <Card className="p-5 bg-card border-muted">
            <h3 className="text-sm font-headline uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
              <Fingerprint className="w-4 h-4" />
              Live Fingerprint
            </h3>
            <div className="space-y-3 text-xs">
              {[
                { label: "Lexical Density", value: fingerprint.lexical_density, unit: "%" },
                { label: "Avg Sentence Len", value: fingerprint.avg_sentence_length, unit: "w" },
                { label: "Vocabulary TTR", value: fingerprint.vocabulary_diversity, unit: "%" },
                { label: "Flesch-Kincaid", value: fingerprint.flesch_kincaid_score, unit: "gr" },
              ].map((m) => (
                <div key={m.label} className="flex justify-between items-center">
                  <span className="text-muted-foreground">{m.label}</span>
                  <span className="font-mono font-medium">
                    {m.value.toFixed(1)}<span className="text-muted-foreground ml-0.5">{m.unit}</span>
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Telemetry Status */}
        <Card className="p-5 bg-card border-muted flex-1">
          <h3 className="text-sm font-headline uppercase tracking-wider text-muted-foreground mb-4 flex items-center justify-between">
            Telemetry Status
            <Badge variant="secondary" className="text-[10px] px-1 h-4">
              Live
            </Badge>
          </h3>
          <div className="space-y-3">
            {[
              {
                label: "Paste Monitor",
                status: "Active",
                icon: <Clipboard className="w-3 h-3" />,
              },
              {
                label: "IKL Tracking",
                status: "Healthy",
                icon: <Clock className="w-3 h-3" />,
              },
              {
                label: "Burst Analysis",
                status: "Ready",
                icon: <Zap className="w-3 h-3" />,
              },
              {
                label: "Fingerprinting",
                status: wordCount > 10 ? "Active" : "Waiting",
                icon: <Fingerprint className="w-3 h-3" />,
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-muted/50"
              >
                <div className="flex items-center gap-2 text-sm">
                  {item.icon}
                  {item.label}
                </div>
                <span
                  className={`text-[10px] font-bold uppercase ${
                    item.status === "Active" || item.status === "Healthy" || item.status === "Ready"
                      ? "text-accent"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>

          {/* Real-time Alerts */}
          {alerts.length > 0 && (
            <div className="mt-5 space-y-2">
              <h4 className="text-[10px] font-headline uppercase text-destructive flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Active Alerts
              </h4>
              {alerts.slice(-3).map((alert, i) => (
                <div
                  key={i}
                  className={`text-[11px] p-2 rounded border ${getSeverityColor(alert.severity)}`}
                >
                  <div className="font-medium">{alert.label}</div>
                  <div className="opacity-70 mt-0.5">{alert.detail}</div>
                </div>
              ))}
            </div>
          )}

          {/* Security Note */}
          <div className="mt-8 text-[11px] text-muted-foreground bg-secondary/30 p-3 rounded border border-dashed border-muted">
            <CheckCircle className="w-3 h-3 inline mr-1 text-green-500" />
            Telemetry is signed with HMAC-SHA256 and includes replay-prevention nonces.
          </div>
        </Card>
      </div>
    </div>
  );
}