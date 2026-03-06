'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  api,
  type StudentProfile,
  type StudentAnalyticsAssignment,
  type StudentAnalysisResult,
  type WindowChangeLog,
  type StudentKeystrokeSummary,
} from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from 'recharts';
import {
  Loader2,
  ArrowLeft,
  Shield,
  AlertTriangle,
  Eye,
  Keyboard,
  Activity,
  TrendingUp,
  Clock,
  ClipboardList,
} from 'lucide-react';

export default function StudentAnalyticsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const studentId = searchParams.get('studentId');

  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [assignments, setAssignments] = useState<StudentAnalyticsAssignment[]>([]);
  const [analyses, setAnalyses] = useState<StudentAnalysisResult[]>([]);
  const [windowLogs, setWindowLogs] = useState<WindowChangeLog[]>([]);
  const [keystrokeSummary, setKeystrokeSummary] = useState<StudentKeystrokeSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!studentId || !user) return;
    setLoading(true);
    try {
      const res = await api.getStudentAnalytics(parseInt(studentId, 10));
      setStudent(res.student);
      setAssignments(res.assignments);
      setAnalyses(res.analyses);
      setWindowLogs(res.window_logs);
      setKeystrokeSummary(res.keystroke_summary);
    } catch {
      // error
    }
    setLoading(false);
  }, [studentId, user]);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/auth/login');
  }, [authLoading, user, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Student not found.</p>
          <Button variant="outline" onClick={() => router.push('/teacher/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>
      </div>
    );
  }

  // ─── Computed metrics ─────────────────────────────────────────────────────
  const avgRisk =
    analyses.length > 0
      ? Math.round(analyses.reduce((s, a) => s + a.risk_score, 0) / analyses.length)
      : 0;

  const totalWindowChanges = assignments.reduce((s, a) => s + (a.window_changes || 0), 0);

  const avgWpm =
    keystrokeSummary.length > 0
      ? Math.round(
          (keystrokeSummary.reduce((s, k) => s + Number(k.avg_wpm || 0), 0) /
            keystrokeSummary.length) *
            10
        ) / 10
      : 0;

  const totalPaste = keystrokeSummary.reduce((s, k) => s + Number(k.total_paste_chars || 0), 0);

  // ─── Chart data ───────────────────────────────────────────────────────────
  const riskChartData = analyses.map((a) => {
    const assn = assignments.find((x) => x.id === a.quiz_assignment_id);
    return {
      name: assn?.quiz_title?.slice(0, 20) || `#${a.quiz_assignment_id}`,
      risk: a.risk_score,
      confidence: Math.round(a.confidence * 100),
    };
  });

  const windowChartData = assignments
    .filter((a) => a.status !== 'assigned')
    .map((a) => ({
      name: a.quiz_title?.slice(0, 20) || `#${a.quiz_id}`,
      changes: a.window_changes || 0,
    }));

  const wpmChartData = keystrokeSummary.map((k) => {
    const assn = assignments.find((x) => x.id === k.quiz_assignment_id);
    return {
      name: assn?.quiz_title?.slice(0, 20) || `#${k.quiz_assignment_id}`,
      wpm: Number(k.avg_wpm || 0),
      peak: Number(k.peak_wpm || 0),
    };
  });

  const riskConfig = {
    risk: { label: 'Risk Score', color: 'hsl(var(--chart-1))' },
    confidence: { label: 'Confidence %', color: 'hsl(var(--chart-2))' },
  } satisfies ChartConfig;

  const windowConfig = {
    changes: { label: 'Tab Switches', color: 'hsl(var(--chart-3))' },
  } satisfies ChartConfig;

  const wpmConfig = {
    wpm: { label: 'Avg WPM', color: 'hsl(var(--chart-4))' },
    peak: { label: 'Peak WPM', color: 'hsl(var(--chart-5))' },
  } satisfies ChartConfig;

  const getRiskColor = (score: number) => {
    if (score >= 60) return 'text-red-400';
    if (score >= 30) return 'text-yellow-400';
    return 'text-emerald-400';
  };

  const getRiskBadge = (score: number) => {
    if (score >= 60)
      return <Badge className="bg-red-500/15 text-red-400 border-red-500/20">High Risk</Badge>;
    if (score >= 30)
      return (
        <Badge className="bg-yellow-500/15 text-yellow-400 border-yellow-500/20">Medium</Badge>
      );
    return (
      <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20">Low Risk</Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] right-[15%] w-[350px] h-[350px] bg-accent/4 blur-[100px] rounded-full" />
      </div>

      {/* Header */}
      <header className="border-b border-white/[0.04] glass-strong sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/teacher/dashboard')}
              className="mr-1"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-headline text-sm font-semibold">Student Analytics</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Student Info */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center text-xl font-bold text-primary">
            {student.full_name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <h1 className="text-2xl font-headline font-bold">
              {student.full_name || 'Unknown'}
            </h1>
            <p className="text-sm text-muted-foreground">{student.email}</p>
          </div>
          <div className="ml-auto">{getRiskBadge(avgRisk)}</div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="glass-strong border border-white/[0.06]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <Shield className="w-3.5 h-3.5" /> Avg Risk Score
              </div>
              <div className={`text-2xl font-bold ${getRiskColor(avgRisk)}`}>{avgRisk}</div>
            </CardContent>
          </Card>
          <Card className="glass-strong border border-white/[0.06]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <Eye className="w-3.5 h-3.5" /> Tab Switches
              </div>
              <div className="text-2xl font-bold">{totalWindowChanges}</div>
            </CardContent>
          </Card>
          <Card className="glass-strong border border-white/[0.06]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <Keyboard className="w-3.5 h-3.5" /> Avg WPM
              </div>
              <div className="text-2xl font-bold">{avgWpm}</div>
            </CardContent>
          </Card>
          <Card className="glass-strong border border-white/[0.06]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                <ClipboardList className="w-3.5 h-3.5" /> Assignments
              </div>
              <div className="text-2xl font-bold">{assignments.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Risk Score Trend */}
          <Card className="glass-strong border border-white/[0.06]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-headline flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Risk Score Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              {riskChartData.length > 0 ? (
                <ChartContainer config={riskConfig} className="h-[250px] w-full">
                  <LineChart
                    accessibilityLayer
                    data={riskChartData}
                    margin={{ top: 20, right: 12, left: 12, bottom: 0 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => value.length > 10 ? value.slice(0, 10) + '...' : value}
                      tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                    />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <Line
                      dataKey="risk"
                      type="monotone"
                      stroke="var(--color-risk)"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      dataKey="confidence"
                      type="monotone"
                      stroke="var(--color-confidence)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ChartContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-12">
                  No analysis data yet.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Window Changes per Assignment */}
          <Card className="glass-strong border border-white/[0.06]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-headline flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" /> Tab Switches per Assignment
              </CardTitle>
            </CardHeader>
            <CardContent>
              {windowChartData.length > 0 ? (
                <ChartContainer config={windowConfig} className="h-[250px] w-full">
                  <BarChart
                    accessibilityLayer
                    data={windowChartData}
                    margin={{ top: 20, right: 12, left: 12, bottom: 0 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => value.length > 10 ? value.slice(0, 10) + '...' : value}
                      tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                    />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <Bar dataKey="changes" fill="var(--color-changes)" radius={[4, 4, 0, 0]}>
                      {windowChartData.map((_, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={`hsl(var(--chart-${(index % 5) + 1}))`} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-12">No data yet.</p>
              )}
            </CardContent>
          </Card>

          {/* WPM Trend */}
          <Card className="glass-strong border border-white/[0.06]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-headline flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-primary" /> Typing Speed (WPM)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {wpmChartData.length > 0 ? (
                <ChartContainer config={wpmConfig} className="h-[250px] w-full">
                  <LineChart
                    accessibilityLayer
                    data={wpmChartData}
                    margin={{ top: 20, right: 12, left: 12, bottom: 0 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => value.length > 10 ? value.slice(0, 10) + '...' : value}
                      tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                    />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <Line
                      dataKey="wpm"
                      type="monotone"
                      stroke="var(--color-wpm)"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      dataKey="peak"
                      type="monotone"
                      stroke="var(--color-peak)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ChartContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-12">
                  No keystroke data yet.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Paste Activity */}
          <Card className="glass-strong border border-white/[0.06]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-headline flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" /> Paste Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 py-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Pasted Characters</span>
                  <span className="text-lg font-bold">{totalPaste.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Paste Events</span>
                  <span className="text-lg font-bold">
                    {keystrokeSummary.reduce(
                      (s, k) => s + Number(k.total_paste_events || 0),
                      0
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Keystrokes</span>
                  <span className="text-lg font-bold">
                    {keystrokeSummary
                      .reduce((s, k) => s + Number(k.total_keys || 0), 0)
                      .toLocaleString()}
                  </span>
                </div>
                {totalPaste > 0 && (
                  <Badge className="bg-yellow-500/15 text-yellow-400 border-yellow-500/20 text-xs">
                    <AlertTriangle className="w-3 h-3 mr-1" /> Paste activity detected
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignment History */}
        <Card className="glass-strong border border-white/[0.06]">
          <CardHeader>
            <CardTitle className="text-sm font-headline flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-primary" /> Assignment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {assignments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No assignments found.
              </p>
            ) : (
              <div className="space-y-3">
                {assignments.map((a) => {
                  const analysis = analyses.find((x) => x.quiz_assignment_id === a.id);
                  const ks = keystrokeSummary.find((x) => x.quiz_assignment_id === a.id);
                  return (
                    <div
                      key={a.id}
                      className="flex items-center justify-between p-4 rounded-xl border border-white/[0.06] glass"
                    >
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{a.quiz_title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge
                            variant="outline"
                            className="text-[10px] border-white/[0.08]"
                          >
                            {a.content_type || 'quiz'}
                          </Badge>
                          <span>{a.status}</span>
                          {a.submitted_at && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(a.submitted_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        {a.total_score !== null && (
                          <div>
                            <div className="text-sm font-bold">
                              {a.total_score}/{a.max_score}
                            </div>
                            <div className="text-[10px] text-muted-foreground">Score</div>
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-bold">{a.window_changes}</div>
                          <div className="text-[10px] text-muted-foreground">Tab switches</div>
                        </div>
                        {ks && (
                          <div>
                            <div className="text-sm font-bold">{ks.avg_wpm}</div>
                            <div className="text-[10px] text-muted-foreground">Avg WPM</div>
                          </div>
                        )}
                        {analysis && (
                          <div>
                            <div
                              className={`text-sm font-bold ${getRiskColor(analysis.risk_score)}`}
                            >
                              {analysis.risk_score}
                            </div>
                            <div className="text-[10px] text-muted-foreground">Risk</div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Explanations */}
        {analyses.some((a) => a.ai_explanation) && (
          <Card className="glass-strong border border-white/[0.06]">
            <CardHeader>
              <CardTitle className="text-sm font-headline flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" /> Integrity Flags &amp; AI
                Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analyses
                .filter((a) => a.ai_explanation)
                .map((a) => {
                  const assn = assignments.find((x) => x.id === a.quiz_assignment_id);
                  return (
                    <div
                      key={a.id}
                      className="p-4 rounded-xl border border-white/[0.06] glass"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {assn?.quiz_title || `Assignment #${a.quiz_assignment_id}`}
                        </span>
                        {getRiskBadge(a.risk_score)}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {a.ai_explanation}
                      </p>
                    </div>
                  );
                })}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
