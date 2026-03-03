"use client";

import React, { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  AlertTriangle,
  CheckCircle,
  User,
  Search,
  BarChart3,
  FileText,
  ShieldAlert,
  Fingerprint as FingerprintIcon,
  Clock,
  Zap,
  TrendingUp,
  Activity,
  Shield,
} from "lucide-react";
import { compareFingerprints } from "@/lib/analysis/comparison";
import { classifyRisk, RiskLevel } from "@/lib/analysis/heuristics";
import { Fingerprint, AnomalyFlag } from "@/lib/telemetry/types";

// ─── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_STUDENTS = [
  {
    id: "s1",
    name: "Alex Rivera",
    course: "English 101",
    submittedAgo: "2 hours ago",
    content:
      "The implications of generative models in late capitalism represent a paradoxical shift in the valuation of intellectual labor. As we observe the flattening of creative output through automated synthesis, the role of the individual author becomes decentralized, if not entirely vestigial. In this context, we must ask if the stylistic nuances we previously attributed to human genius are merely patterns of token distribution that can be replicated through sufficient stochastic refinement.",
    current: {
      lexical_density: 45,
      avg_sentence_length: 22,
      vocabulary_diversity: 38,
      burst_score: 420,
      flesch_kincaid_score: 14.2,
    } as Fingerprint,
    historical: {
      lexical_density: 32,
      avg_sentence_length: 14,
      vocabulary_diversity: 25,
      burst_score: 180,
      flesch_kincaid_score: 9.8,
    } as Fingerprint,
    flags: [
      {
        id: "paste_block_large",
        severity: "critical" as const,
        label: "Large Paste Event",
        detail: "342 characters pasted at once.",
        value: 342,
        threshold: 100,
      },
      {
        id: "wpm_spike_detected",
        severity: "high" as const,
        label: "WPM Spike Detected",
        detail: "Current WPM (245) exceeds 200% of baseline (82).",
        value: 245,
        threshold: 164,
      },
    ] as AnomalyFlag[],
    wpmHistory: [52, 58, 61, 68, 72, 68, 55, 210, 245, 230, 195, 88, 62, 58],
    burstTimeline: [
      { time: "0:00", score: 45 },
      { time: "0:30", score: 52 },
      { time: "1:00", score: 48 },
      { time: "1:30", score: 180 },
      { time: "2:00", score: 420 },
      { time: "2:30", score: 380 },
      { time: "3:00", score: 95 },
      { time: "3:30", score: 58 },
    ],
  },
  {
    id: "s2",
    name: "Jordan Smith",
    course: "English 101",
    submittedAgo: "4 hours ago",
    content:
      "I think social media is really changing how we talk to each other. Like my friends and me mostly text instead of calling. It makes things easier but also harder sometimes because you can't tell what someone means without hearing their voice.",
    current: {
      lexical_density: 28,
      avg_sentence_length: 13,
      vocabulary_diversity: 24,
      burst_score: 175,
      flesch_kincaid_score: 8.5,
    } as Fingerprint,
    historical: {
      lexical_density: 29,
      avg_sentence_length: 12,
      vocabulary_diversity: 22,
      burst_score: 160,
      flesch_kincaid_score: 8.2,
    } as Fingerprint,
    flags: [] as AnomalyFlag[],
    wpmHistory: [42, 45, 48, 52, 50, 48, 53, 55, 51, 49, 47, 50],
    burstTimeline: [
      { time: "0:00", score: 38 },
      { time: "0:30", score: 42 },
      { time: "1:00", score: 45 },
      { time: "1:30", score: 40 },
      { time: "2:00", score: 43 },
    ],
  },
  {
    id: "s3",
    name: "Casey Lee",
    course: "English 101",
    submittedAgo: "6 hours ago",
    content:
      "Communication technology has evolved rapidly over the past decade. The shift from verbal communication to text-based messaging platforms has altered interpersonal dynamics significantly. While convenience has increased, the nuance of face-to-face interaction remains irreplacable.",
    current: {
      lexical_density: 31,
      avg_sentence_length: 15,
      vocabulary_diversity: 26,
      burst_score: 190,
      flesch_kincaid_score: 9.1,
    } as Fingerprint,
    historical: {
      lexical_density: 30,
      avg_sentence_length: 14,
      vocabulary_diversity: 25,
      burst_score: 185,
      flesch_kincaid_score: 9.0,
    } as Fingerprint,
    flags: [] as AnomalyFlag[],
    wpmHistory: [55, 58, 60, 57, 62, 58, 61, 55, 59],
    burstTimeline: [
      { time: "0:00", score: 42 },
      { time: "0:30", score: 48 },
      { time: "1:00", score: 45 },
      { time: "1:30", score: 50 },
      { time: "2:00", score: 47 },
    ],
  },
];

// ─── Component ──────────────────────────────────────────────────────────────

export function TeacherDashboard() {
  const [selectedStudent, setSelectedStudent] = useState(MOCK_STUDENTS[0]);

  const analysis = useMemo(() => {
    return compareFingerprints(
      selectedStudent.current,
      selectedStudent.historical,
      selectedStudent.flags
    );
  }, [selectedStudent]);

  const riskInfo = useMemo(
    () => classifyRisk(analysis.riskScore),
    [analysis.riskScore]
  );

  // ── Risk color helpers ──────────────────────────────────────────────────
  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case "red":
        return "text-red-500";
      case "orange":
        return "text-orange-400";
      case "yellow":
        return "text-yellow-500";
      default:
        return "text-green-500";
    }
  };

  const getRiskBg = (level: RiskLevel) => {
    switch (level) {
      case "red":
        return "bg-red-500/10 border-red-500/30 text-red-400";
      case "orange":
        return "bg-orange-500/10 border-orange-500/30 text-orange-400";
      case "yellow":
        return "bg-yellow-500/10 border-yellow-500/30 text-yellow-400";
      default:
        return "bg-green-500/10 border-green-500/30 text-green-400";
    }
  };

  const getBadgeVariant = (score: number): "destructive" | "secondary" | "default" => {
    if (score > 70) return "destructive";
    if (score > 30) return "secondary";
    return "default";
  };

  // ── Max value in burst timeline for scaling ─────────────────────────────
  const maxBurst = Math.max(
    ...selectedStudent.burstTimeline.map((b) => b.score),
    1
  );
  const maxWpm = Math.max(...selectedStudent.wpmHistory, 1);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-headline text-primary flex items-center gap-3">
            <Shield className="w-8 h-8" />
            Academic Integrity Intelligence
          </h1>
          <p className="text-muted-foreground mt-1 font-body">
            Behavioral + stylometric anomaly detection across student cohorts.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Search className="w-4 h-4" />
            Search
          </Button>
          <Button size="sm" className="bg-primary text-primary-foreground">
            Export Report
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── Sidebar: Student List ──────────────────────────────────────── */}
        <aside className="lg:col-span-3 space-y-4">
          <h2 className="text-sm font-headline uppercase tracking-wider text-muted-foreground px-2">
            Recent Submissions
          </h2>
          <div className="space-y-2">
            {MOCK_STUDENTS.map((student) => {
              const studentAnalysis = compareFingerprints(
                student.current,
                student.historical,
                student.flags
              );
              const studentRisk = classifyRisk(studentAnalysis.riskScore);
              return (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className={`w-full text-left p-4 rounded-xl transition-all border flex flex-col gap-2 ${
                    selectedStudent.id === student.id
                      ? "bg-secondary/80 border-primary ring-1 ring-primary/50"
                      : "bg-card border-muted hover:border-muted-foreground/30"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      {student.name}
                    </span>
                    <Badge
                      variant={getBadgeVariant(studentAnalysis.riskScore)}
                      className="text-[10px] uppercase tracking-tighter"
                    >
                      {studentAnalysis.riskScore}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-muted-foreground uppercase">
                      {student.course}
                    </span>
                    {/* Risk level pill */}
                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${getRiskBg(studentRisk.level)}`}
                    >
                      {studentRisk.label}
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {student.submittedAgo}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Cohort Summary */}
          <Card className="p-4 bg-card border-muted mt-4">
            <h3 className="text-[10px] font-headline uppercase text-muted-foreground mb-3">
              Cohort Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Submissions</span>
                <span className="font-medium">{MOCK_STUDENTS.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Flagged</span>
                <span className="font-medium text-destructive">
                  {MOCK_STUDENTS.filter((s) => s.flags.length > 0).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Healthy</span>
                <span className="font-medium text-green-500">
                  {MOCK_STUDENTS.filter((s) => s.flags.length === 0).length}
                </span>
              </div>
            </div>
          </Card>
        </aside>

        {/* ── Main: Analysis View ────────────────────────────────────────── */}
        <main className="lg:col-span-9 space-y-6">
          {/* ── Risk Score Header Card ──────────────────────────────────── */}
          <Card className="bg-card border-muted overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between bg-secondary/20 border-b border-muted">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-headline">
                    {selectedStudent.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Comparative Fingerprint Analysis —{" "}
                    {selectedStudent.course}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`text-5xl font-headline ${getRiskColor(riskInfo.level)}`}
                >
                  {analysis.riskScore}
                </div>
                <div
                  className={`text-xs font-headline uppercase mt-1 px-3 py-1 rounded-full border ${getRiskBg(riskInfo.level)}`}
                >
                  {riskInfo.label}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">
                  Confidence: {Math.round(analysis.confidence * 100)}%
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* ── Left: Stylometric Deviation ────────────────────────── */}
                <div className="space-y-6">
                  <h3 className="text-sm font-headline uppercase text-muted-foreground flex items-center gap-2">
                    <FingerprintIcon className="w-4 h-4" />
                    Stylometric Comparison
                  </h3>
                  <div className="space-y-5">
                    {[
                      { label: "Lexical Density", key: "lexical_density" as keyof Fingerprint, unit: "%" },
                      { label: "Avg Sentence Length", key: "avg_sentence_length" as keyof Fingerprint, unit: "w" },
                      { label: "Vocabulary Richness", key: "vocabulary_diversity" as keyof Fingerprint, unit: "%" },
                      { label: "Burst Score", key: "burst_score" as keyof Fingerprint, unit: "ms σ" },
                      { label: "Flesch-Kincaid Grade", key: "flesch_kincaid_score" as keyof Fingerprint, unit: "" },
                    ].map((metric) => {
                      const dev = analysis.deviation[metric.key];
                      const currVal = selectedStudent.current[metric.key];
                      const histVal = selectedStudent.historical[metric.key];
                      const isAnomaly = dev > 0.4;
                      const zVal = analysis.zScores[metric.key];

                      return (
                        <div key={metric.key}>
                          <div className="flex justify-between text-sm mb-1.5">
                            <span>{metric.label}</span>
                            <div className="flex items-center gap-3 text-xs">
                              <span className="text-muted-foreground">
                                {histVal.toFixed(1)} → {currVal.toFixed(1)}{metric.unit}
                              </span>
                              <span
                                className={
                                  isAnomaly
                                    ? "text-destructive font-bold"
                                    : "text-muted-foreground"
                                }
                              >
                                {dev > 0 ? "+" : ""}
                                {(dev * 100).toFixed(0)}%
                              </span>
                              {zVal !== 0 && (
                                <span
                                  className={`text-[10px] px-1.5 py-0.5 rounded ${
                                    Math.abs(zVal) > 2.5
                                      ? "bg-red-500/20 text-red-400"
                                      : Math.abs(zVal) > 1.5
                                      ? "bg-yellow-500/20 text-yellow-400"
                                      : "bg-secondary text-muted-foreground"
                                  }`}
                                >
                                  z={zVal.toFixed(1)}
                                </span>
                              )}
                            </div>
                          </div>
                          {/* Comparison bar */}
                          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden flex">
                            <div
                              className="h-full bg-primary/30 transition-all"
                              style={{
                                width: `${Math.min(100, (histVal / Math.max(currVal, histVal, 1)) * 100)}%`,
                              }}
                            />
                            <div
                              className={`h-full transition-all ${
                                isAnomaly ? "bg-destructive" : "bg-accent"
                              }`}
                              style={{
                                width: `${Math.min(100, dev * 100)}%`,
                              }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                            <span>Baseline</span>
                            <span>Current</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ── Right: Flags + Interpretation ──────────────────────── */}
                <div className="space-y-6">
                  <h3 className="text-sm font-headline uppercase text-muted-foreground flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" />
                    Detected Red Flags
                  </h3>
                  <div className="space-y-3">
                    {analysis.flags.length > 0 ? (
                      analysis.flags.map((flag, i) => (
                        <Alert
                          key={i}
                          variant="destructive"
                          className={`border ${
                            flag.severity === "critical"
                              ? "bg-red-500/10 border-red-500/30"
                              : flag.severity === "high"
                              ? "bg-orange-500/10 border-orange-500/30"
                              : "bg-yellow-500/10 border-yellow-500/30"
                          }`}
                        >
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle className="text-xs uppercase font-headline flex items-center justify-between">
                            {flag.label}
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded-full uppercase font-bold ${
                                flag.severity === "critical"
                                  ? "bg-red-500/20 text-red-400"
                                  : flag.severity === "high"
                                  ? "bg-orange-500/20 text-orange-400"
                                  : "bg-yellow-500/20 text-yellow-400"
                              }`}
                            >
                              {flag.severity}
                            </span>
                          </AlertTitle>
                          <AlertDescription className="text-xs opacity-80 mt-1">
                            {flag.detail}
                          </AlertDescription>
                        </Alert>
                      ))
                    ) : (
                      <Alert className="bg-green-500/10 border-green-500/20 text-green-500">
                        <CheckCircle className="h-4 w-4" />
                        <AlertTitle>No Behavioral Flags</AlertTitle>
                        <AlertDescription className="text-xs">
                          Typing dynamics are consistent with historical baseline.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {/* Interpretation Summary */}
                  <div className="p-4 rounded-xl bg-secondary/30 border border-muted mt-6">
                    <h4 className="text-xs font-headline uppercase mb-3 text-primary flex items-center gap-2">
                      <BarChart3 className="w-3 h-3" />
                      Interpretation Summary
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {analysis.explanation}
                    </p>
                    <div className="mt-3 text-xs text-muted-foreground/70">
                      Action: {riskInfo.action}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Typing Burst Timeline ──────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Burst Score Timeline */}
            <Card className="bg-card border-muted p-6">
              <h3 className="font-headline text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-primary" />
                Burst Score Timeline
              </h3>
              <div className="flex items-end gap-1 h-24">
                {selectedStudent.burstTimeline.map((point, i) => {
                  const height = (point.score / maxBurst) * 100;
                  const isSpike = point.score > maxBurst * 0.6;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className={`w-full rounded-t transition-all ${
                          isSpike ? "bg-destructive" : "bg-primary/40"
                        }`}
                        style={{ height: `${Math.max(2, height)}%` }}
                        title={`${point.time}: ${point.score}`}
                      />
                      <span className="text-[8px] text-muted-foreground">
                        {point.time}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="text-[10px] text-muted-foreground mt-2 flex justify-between">
                <span>30s intervals</span>
                <span>Red = anomalous burst</span>
              </div>
            </Card>

            {/* WPM History */}
            <Card className="bg-card border-muted p-6">
              <h3 className="font-headline text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-accent" />
                WPM History
              </h3>
              <div className="flex items-end gap-1 h-24">
                {selectedStudent.wpmHistory.map((w, i) => {
                  const height = (w / maxWpm) * 100;
                  const isSpike = w > maxWpm * 0.7;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div
                        className={`w-full rounded-t transition-all ${
                          isSpike ? "bg-orange-500" : "bg-accent/40"
                        }`}
                        style={{ height: `${Math.max(2, height)}%` }}
                        title={`${w} WPM`}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="text-[10px] text-muted-foreground mt-2 flex justify-between">
                <span>5s samples</span>
                <span>Orange = spike (&gt;70% peak)</span>
              </div>
            </Card>
          </div>

          {/* ── Submission Content ──────────────────────────────────────── */}
          <Card className="bg-card border-muted p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Submission Content
              </h3>
              <div className="flex gap-2 items-center">
                <Badge variant="outline">
                  {selectedStudent.content.split(/\s+/).length} words
                </Badge>
                <Badge variant="outline">Revision v2</Badge>
              </div>
            </div>
            <div className="prose prose-invert max-w-none text-muted-foreground leading-loose max-h-48 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-muted">
              <p>{selectedStudent.content}</p>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}