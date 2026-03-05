'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import type { Quiz, QuizAssignment } from '@/lib/types';
import * as api from '@/lib/api/client';
import type { TelemetrySummary, WindowChangeEntry } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  ShieldCheck,
  LogOut,
  Plus,
  Trash2,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  Play,
  BarChart3,
  Loader2,
  Send,
  GripVertical,
  Keyboard,
  Activity,
  Gauge,
  Clipboard,
  MonitorOff,
} from 'lucide-react';

type StudentSubmission = QuizAssignment & {
  profiles: { full_name: string; email: string };
  quizzes: { title: string };
};

type QuizQuestion = {
  question_text: string;
  question_type: 'essay' | 'multiple_choice';
  options: string[] | null;
  correct_answer: string | null;
  points: number;
};

export default function TeacherDashboardPage() {
  const router = useRouter();
  const { profile, user, loading: authLoading, signOut } = useAuth();
  const { toast } = useToast();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [students, setStudents] = useState<{ id: string; full_name: string; email: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentSubmission | null>(null);

  // ─── Telemetry detail state ────────────────────────────────────────────
  const [telemetrySummary, setTelemetrySummary] = useState<TelemetrySummary | null>(null);
  const [windowEvents, setWindowEvents] = useState<WindowChangeEntry[]>([]);
  const [wpmChartData, setWpmChartData] = useState<{ idx: number; wpm: number }[]>([]);
  const [telemetryLoading, setTelemetryLoading] = useState(false);

  // ─── Quiz Creation State ────────────────────────────────────────────────
  const [showCreate, setShowCreate] = useState(false);
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    description: '',
    type: 'mixed' as 'essay' | 'multiple_choice' | 'mixed',
    time_limit_mins: '',
    due_date: '',
  });
  const [newQuestions, setNewQuestions] = useState<QuizQuestion[]>([
    { question_text: '', question_type: 'essay', options: null, correct_answer: null, points: 1 },
  ]);
  const [creating, setCreating] = useState(false);

  // ─── Assign State ──────────────────────────────────────────────────────
  const [showAssign, setShowAssign] = useState(false);
  const [assignQuizId, setAssignQuizId] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [assigning, setAssigning] = useState(false);

  // ─── Replay State ──────────────────────────────────────────────────────
  const [showReplay, setShowReplay] = useState(false);
  const [replayData, setReplayData] = useState<{ replay_events: unknown[]; text_snapshots: { timestamp: number; text: string }[]; duration_ms: number } | null>(null);
  const [replayIdx, setReplayIdx] = useState(0);
  const [replayPlaying, setReplayPlaying] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      const [quizRes, subRes, studRes] = await Promise.all([
        api.listQuizzes(),
        api.listAssignments(),
        api.listStudents(),
      ]);

      if (quizRes.quizzes) setQuizzes(quizRes.quizzes as Quiz[]);
      if (subRes.assignments) setSubmissions(subRes.assignments as unknown as StudentSubmission[]);
      if (studRes.students) setStudents(studRes.students as { id: string; full_name: string; email: string }[]);
    } catch (err) {
      console.error('Failed to load data:', err);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading && !profile) router.replace('/auth/login');
    else if (!authLoading && profile?.role === 'student') router.replace('/student');
  }, [authLoading, profile, router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ─── Fetch telemetry when selecting a student ──────────────────────────
  const fetchTelemetryDetails = useCallback(async (qaId: string | number) => {
    setTelemetryLoading(true);
    try {
      const [summaryRes, windowRes, logsRes] = await Promise.all([
        api.getTelemetrySummary(qaId),
        api.getWindowChanges(qaId),
        api.getKeystrokeLogs(qaId),
      ]);

      setTelemetrySummary(summaryRes.summary);
      setWindowEvents(windowRes.logs || []);

      const allWpm = logsRes.logs?.flatMap(l => (l.wpm_history || [])) || [];
      setWpmChartData(allWpm.map((wpm, idx) => ({ idx: idx + 1, wpm })));
    } catch (err) {
      console.error('Failed to load telemetry:', err);
      setTelemetrySummary(null);
      setWindowEvents([]);
      setWpmChartData([]);
    }
    setTelemetryLoading(false);
  }, []);

  const handleSelectStudent = useCallback((sub: StudentSubmission) => {
    setSelectedStudent(sub);
    fetchTelemetryDetails(sub.id);
  }, [fetchTelemetryDetails]);

  // ─── Quiz Creation ──────────────────────────────────────────────────────
  const addQuestion = () => {
    setNewQuestions(prev => [
      ...prev,
      { question_text: '', question_type: 'essay', options: null, correct_answer: null, points: 1 },
    ]);
  };

  const removeQuestion = (idx: number) => {
    setNewQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const updateQuestion = (idx: number, updates: Partial<QuizQuestion>) => {
    setNewQuestions(prev => prev.map((q, i) => i === idx ? { ...q, ...updates } : q));
  };

  const handleCreateQuiz = async () => {
    if (!newQuiz.title.trim()) {
      toast({ title: 'Title required', variant: 'destructive' });
      return;
    }
    const validQuestions = newQuestions.filter(q => q.question_text.trim());
    if (validQuestions.length === 0) {
      toast({ title: 'Add at least one question', variant: 'destructive' });
      return;
    }

    setCreating(true);
    try {
      const data = await api.createQuiz({
        ...newQuiz,
        time_limit_mins: newQuiz.time_limit_mins ? parseInt(newQuiz.time_limit_mins) : null,
        due_date: newQuiz.due_date || null,
        questions: validQuestions,
      });

      if (data.quiz) {
        toast({ title: 'Quiz created!' });
        setShowCreate(false);
        setNewQuiz({ title: '', description: '', type: 'mixed', time_limit_mins: '', due_date: '' });
        setNewQuestions([{ question_text: '', question_type: 'essay', options: null, correct_answer: null, points: 1 }]);
        fetchData();
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setCreating(false);
  };

  // ─── Assign Quiz ───────────────────────────────────────────────────────
  const handleAssign = async () => {
    if (!assignQuizId || selectedStudentIds.length === 0) {
      toast({ title: 'Select quiz and students', variant: 'destructive' });
      return;
    }

    setAssigning(true);
    try {
      const data = await api.assignQuiz(assignQuizId, selectedStudentIds);
      toast({ title: `Assigned to ${data.assignments.length} student(s)` });
      setShowAssign(false);
      setSelectedStudentIds([]);
      fetchData();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setAssigning(false);
  };

  // ─── Load Replay ──────────────────────────────────────────────────────
  const loadReplay = async (qaId: string | number) => {
    try {
      const { replays } = await api.getAssignmentReplays(qaId);
      const latest = replays?.[replays.length - 1];

      if (latest) {
        setReplayData(latest as { replay_events: unknown[]; text_snapshots: { timestamp: number; text: string }[]; duration_ms: number });
        setReplayIdx(0);
        setShowReplay(true);
      } else {
        toast({ title: 'No replay data available', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'No replay data available', variant: 'destructive' });
    }
  };

  // ─── Replay Player ────────────────────────────────────────────────────
  useEffect(() => {
    if (!replayPlaying || !replayData) return;
    const snapshots = replayData.text_snapshots || [];
    if (replayIdx >= snapshots.length - 1) {
      setReplayPlaying(false);
      return;
    }
    const timeout = setTimeout(() => {
      setReplayIdx(prev => prev + 1);
    }, 800);
    return () => clearTimeout(timeout);
  }, [replayPlaying, replayIdx, replayData]);

  // ─── Risk badge color ─────────────────────────────────────────────────
  const riskBadge = (score: number | null) => {
    if (score === null) return <Badge variant="outline" className="text-muted-foreground">Pending</Badge>;
    if (score <= 25) return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">{score}%</Badge>;
    if (score <= 55) return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">{score}%</Badge>;
    if (score <= 75) return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">{score}%</Badge>;
    return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">{score}%</Badge>;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  const flaggedCount = submissions.filter(s => (s.risk_score ?? 0) >= 56).length;
  const submittedCount = submissions.filter(s => s.status === 'submitted' || s.status === 'reviewed').length;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[30%] w-[500px] h-[500px] bg-primary/6 blur-[140px] rounded-full" />
        <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-accent/5 blur-[120px] rounded-full" />
      </div>

      {/* ═══ STICKY SIDEBAR ═══════════════════════════════════════════════ */}
      <aside className="w-72 border-r border-white/[0.04] glass-strong sticky top-0 h-screen flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/[0.04]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center glow-primary">
              <ShieldCheck className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-headline text-sm font-semibold">Integrity <em className="font-display not-italic" style={{ fontStyle: 'italic' }}>Engine</em></p>
              <p className="text-[10px] text-muted-foreground">{profile?.full_name}</p>
            </div>
          </div>
          <Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px] px-2">Teacher Dashboard</Badge>
        </div>

        {/* Stats */}
        <div className="p-4 border-b border-white/[0.04] space-y-2.5">
          <div className="flex justify-between text-xs items-center">
            <span className="text-muted-foreground flex items-center gap-1.5"><FileText className="w-3 h-3" />Quizzes</span>
            <span className="font-headline font-bold">{quizzes.length}</span>
          </div>
          <div className="flex justify-between text-xs items-center">
            <span className="text-muted-foreground flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3" />Submissions</span>
            <span className="font-headline font-bold">{submittedCount}</span>
          </div>
          <div className="flex justify-between text-xs items-center">
            <span className="text-muted-foreground flex items-center gap-1.5"><AlertTriangle className="w-3 h-3" />Flagged</span>
            <span className="font-headline font-bold text-red-400">{flaggedCount}</span>
          </div>
          <div className="flex justify-between text-xs items-center">
            <span className="text-muted-foreground flex items-center gap-1.5"><Users className="w-3 h-3" />Students</span>
            <span className="font-headline font-bold">{students.length}</span>
          </div>
        </div>

        {/* Scrollable Student Submissions List */}
        <ScrollArea className="flex-1 p-2">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground px-2 py-1">
            Recent Submissions
          </p>
          {submissions.map(sub => (
            <button
              key={sub.id}
              onClick={() => handleSelectStudent(sub)}
              className={`w-full text-left p-2 rounded-lg mb-1 transition-colors text-xs hover:bg-primary/10 ${
                selectedStudent?.id === sub.id ? 'bg-primary/15 border border-primary/30' : 'border border-transparent'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium truncate">{sub.profiles?.full_name || 'Student'}</span>
                {riskBadge(sub.risk_score)}
              </div>
              <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                {sub.quizzes?.title || 'Quiz'}
              </p>
            </button>
          ))}
          {submissions.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">No submissions yet</p>
          )}
        </ScrollArea>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/[0.04]">
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* ═══ MAIN CONTENT ═════════════════════════════════════════════════ */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Top Actions */}
          <div className="flex items-center justify-between mb-8 animate-slide-up">
            <div>
              <h1 className="font-headline text-2xl text-gradient">Teacher Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">Manage quizzes, view submissions, and inspect student telemetry.</p>
            </div>
            <div className="flex gap-2">
              <Dialog open={showCreate} onOpenChange={setShowCreate}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Create Quiz</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto glass-strong border border-white/[0.08]">
                  <DialogHeader>
                    <DialogTitle className="font-headline">Create New Quiz</DialogTitle>
                    <DialogDescription>Add questions — supports essay and multiple choice.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input value={newQuiz.title} onChange={e => setNewQuiz(p => ({ ...p, title: e.target.value }))} placeholder="Quiz title" />
                      </div>
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select value={newQuiz.type} onValueChange={v => setNewQuiz(p => ({ ...p, type: v as Quiz['type'] }))}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="essay">Essay Only</SelectItem>
                            <SelectItem value="multiple_choice">MCQ Only</SelectItem>
                            <SelectItem value="mixed">Mixed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea value={newQuiz.description} onChange={e => setNewQuiz(p => ({ ...p, description: e.target.value }))} placeholder="Optional description" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Time Limit (minutes)</Label>
                        <Input type="number" value={newQuiz.time_limit_mins} onChange={e => setNewQuiz(p => ({ ...p, time_limit_mins: e.target.value }))} placeholder="No limit" />
                      </div>
                      <div className="space-y-2">
                        <Label>Due Date</Label>
                        <Input type="datetime-local" value={newQuiz.due_date} onChange={e => setNewQuiz(p => ({ ...p, due_date: e.target.value }))} />
                      </div>
                    </div>

                    <Separator />
                    <div className="flex items-center justify-between">
                      <h3 className="font-headline text-sm">Questions ({newQuestions.length})</h3>
                      <Button size="sm" variant="outline" onClick={addQuestion}>
                        <Plus className="w-3 h-3 mr-1" /> Add Question
                      </Button>
                    </div>

                    {newQuestions.map((q, idx) => (
                      <Card key={idx} className="glass border border-white/[0.06]">
                        <CardContent className="pt-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <GripVertical className="w-4 h-4 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">Q{idx + 1}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Select value={q.question_type} onValueChange={v => updateQuestion(idx, { question_type: v as 'essay' | 'multiple_choice', options: v === 'multiple_choice' ? ['', '', '', ''] : null, correct_answer: null })}>
                                <SelectTrigger className="w-[140px] h-7 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="essay">Essay</SelectItem>
                                  <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                </SelectContent>
                              </Select>
                              <Input type="number" className="w-16 h-7 text-xs" value={q.points} onChange={e => updateQuestion(idx, { points: parseInt(e.target.value) || 1 })} min={1} />
                              <span className="text-[10px] text-muted-foreground">pts</span>
                              {newQuestions.length > 1 && (
                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => removeQuestion(idx)}>
                                  <Trash2 className="w-3 h-3 text-red-400" />
                                </Button>
                              )}
                            </div>
                          </div>
                          <Textarea
                            placeholder="Question text..."
                            className="min-h-[60px] text-sm"
                            value={q.question_text}
                            onChange={e => updateQuestion(idx, { question_text: e.target.value })}
                          />
                          {q.question_type === 'multiple_choice' && (
                            <div className="space-y-2">
                              {(q.options || ['', '', '', '']).map((opt, optIdx) => (
                                <div key={optIdx} className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name={`correct-${idx}`}
                                    checked={q.correct_answer === opt && opt !== ''}
                                    onChange={() => updateQuestion(idx, { correct_answer: opt })}
                                    className="accent-primary"
                                    title={`Mark option ${String.fromCharCode(65 + optIdx)} as correct`}
                                    aria-label={`Mark option ${String.fromCharCode(65 + optIdx)} as correct answer`}
                                  />
                                  <Input
                                    className="h-8 text-xs"
                                    placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                                    value={opt}
                                    onChange={e => {
                                      const newOpts = [...(q.options || [])];
                                      newOpts[optIdx] = e.target.value;
                                      updateQuestion(idx, { options: newOpts });
                                    }}
                                  />
                                </div>
                              ))}
                              <p className="text-[10px] text-muted-foreground">Select the radio button next to the correct answer.</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}

                    <Button className="w-full glow-primary" onClick={handleCreateQuiz} disabled={creating}>
                      {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Create Quiz
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showAssign} onOpenChange={setShowAssign}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline"><Send className="w-4 h-4 mr-1" /> Assign</Button>
                </DialogTrigger>
                <DialogContent className="glass-strong border border-white/[0.08]">
                  <DialogHeader>
                    <DialogTitle className="font-headline">Assign Quiz to Students</DialogTitle>
                    <DialogDescription>Select a quiz and students to assign it to.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Quiz</Label>
                      <Select value={assignQuizId} onValueChange={setAssignQuizId}>
                        <SelectTrigger><SelectValue placeholder="Select quiz" /></SelectTrigger>
                        <SelectContent>
                          {quizzes.map(q => (
                            <SelectItem key={q.id} value={String(q.id)}>{q.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Students ({selectedStudentIds.length} selected)</Label>
                      <ScrollArea className="h-48 border border-white/[0.06] rounded-xl p-2 glass">
                        {students.map(s => (
                          <label key={s.id} className="flex items-center gap-2 p-2 hover:bg-card/60 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedStudentIds.includes(s.id)}
                              onChange={e => {
                                if (e.target.checked) setSelectedStudentIds(p => [...p, s.id]);
                                else setSelectedStudentIds(p => p.filter(x => x !== s.id));
                              }}
                              className="accent-primary"
                            />
                            <span className="text-sm">{s.full_name || s.email}</span>
                          </label>
                        ))}
                      </ScrollArea>
                    </div>
                    <Button className="w-full glow-primary" onClick={handleAssign} disabled={assigning}>
                      {assigning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                      Assign to {selectedStudentIds.length} Student(s)
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="submissions" className="space-y-4 animate-slide-up-delay-1">
            <TabsList className="glass border border-white/[0.06] p-1">
              <TabsTrigger value="submissions" className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:shadow-none gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" />Submissions ({submissions.length})</TabsTrigger>
              <TabsTrigger value="quizzes" className="data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:shadow-none gap-1.5"><FileText className="w-3.5 h-3.5" />My Quizzes ({quizzes.length})</TabsTrigger>
            </TabsList>

            {/* ─── Submissions Tab ──────────────────────────────────────── */}
            <TabsContent value="submissions" className="space-y-3">
              {selectedStudent ? (
                <div className="space-y-4">
                  {/* Header Card */}
                  <Card className="glass-strong border border-white/[0.06]">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base font-headline">
                            {selectedStudent.profiles?.full_name || 'Student'}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {selectedStudent.quizzes?.title} — {selectedStudent.profiles?.email}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {riskBadge(selectedStudent.risk_score)}
                          <Button size="sm" variant="outline" onClick={() => loadReplay(selectedStudent.id)}>
                            <Play className="w-3 h-3 mr-1" /> Replay
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => { setSelectedStudent(null); setTelemetrySummary(null); }}>
                            Close
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div className="text-center p-3 rounded-xl glass border border-white/[0.06]">
                          <p className="text-lg font-headline font-bold text-gradient">{selectedStudent.risk_score ?? '—'}%</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Risk Score</p>
                        </div>
                        <div className="text-center p-3 rounded-xl glass border border-white/[0.06]">
                          <p className="text-lg font-headline font-bold">{selectedStudent.window_changes}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Tab Switches</p>
                        </div>
                        <div className="text-center p-3 rounded-xl glass border border-white/[0.06]">
                          <p className="text-lg font-headline font-bold">{selectedStudent.total_score ?? '—'}/{selectedStudent.max_score ?? '—'}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Score</p>
                        </div>
                        <div className="text-center p-3 rounded-xl glass border border-white/[0.06]">
                          <p className="text-lg font-headline font-bold capitalize">{selectedStudent.status}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Status</p>
                        </div>
                      </div>
                      {selectedStudent.window_changes > 3 && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                          <AlertTriangle className="w-4 h-4" />
                          Excessive window changes detected ({selectedStudent.window_changes} times)
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* ─── Typing Metrics (from telemetry summary) ──────────── */}
                  {telemetryLoading ? (
                    <Card className="glass border border-white/[0.06]">
                      <CardContent className="flex items-center justify-center py-10">
                        <Loader2 className="w-5 h-5 animate-spin text-primary mr-2" />
                        <span className="text-sm text-muted-foreground">Loading telemetry data...</span>
                      </CardContent>
                    </Card>
                  ) : telemetrySummary ? (
                    <>
                      <Card className="glass border border-white/[0.06]">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-headline flex items-center gap-2">
                            <Keyboard className="w-4 h-4 text-primary" /> Typing Metrics
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                            <MetricCard icon={<Gauge className="w-3.5 h-3.5" />} label="WPM" value={telemetrySummary.wpm} />
                            <MetricCard icon={<Activity className="w-3.5 h-3.5" />} label="Burst Score" value={telemetrySummary.burst_score.toFixed(1)} />
                            <MetricCard icon={<Clock className="w-3.5 h-3.5" />} label="Avg Latency" value={`${Math.round(telemetrySummary.avg_latency)}ms`} />
                            <MetricCard icon={<Gauge className="w-3.5 h-3.5" />} label="Peak WPM" value={telemetrySummary.peak_wpm} />
                            <MetricCard icon={<Clipboard className="w-3.5 h-3.5" />} label="Paste Chars" value={telemetrySummary.paste_chars} />
                            <MetricCard icon={<Keyboard className="w-3.5 h-3.5" />} label="Total Keys" value={telemetrySummary.total_keys} />
                          </div>
                        </CardContent>
                      </Card>

                      {/* ─── WPM Timeline Chart ──────────────────────────── */}
                      {wpmChartData.length > 0 && (
                        <Card className="glass border border-white/[0.06]">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-headline flex items-center gap-2">
                              <BarChart3 className="w-4 h-4 text-primary" /> WPM Timeline
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ResponsiveContainer width="100%" height={200}>
                              <LineChart data={wpmChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                <XAxis dataKey="idx" tick={{ fontSize: 10 }} stroke="rgba(255,255,255,0.3)" />
                                <YAxis tick={{ fontSize: 10 }} stroke="rgba(255,255,255,0.3)" />
                                <Tooltip
                                  contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                                  labelFormatter={(v) => `Sample ${v}`}
                                />
                                <Line type="monotone" dataKey="wpm" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                              </LineChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      )}

                      {/* ─── Tab-Switch Events ──────────────────────────── */}
                      {windowEvents.length > 0 && (
                        <Card className="glass border border-white/[0.06]">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-headline flex items-center gap-2">
                              <MonitorOff className="w-4 h-4 text-red-400" /> Tab-Switch Events ({windowEvents.filter(e => e.event_type === 'blur').length} switches)
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ScrollArea className="max-h-[200px]">
                              <div className="space-y-1.5">
                                {windowEvents.map((evt, i) => (
                                  <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg glass border border-white/[0.04]">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-2 h-2 rounded-full ${evt.event_type === 'blur' ? 'bg-red-400' : 'bg-green-400'}`} />
                                      <span className={evt.event_type === 'blur' ? 'text-red-400' : 'text-green-400'}>
                                        {evt.event_type === 'blur' ? 'Left page' : 'Returned'}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-muted-foreground">
                                      {evt.event_type === 'focus' && evt.away_duration_ms != null && (
                                        <span>away {(evt.away_duration_ms / 1000).toFixed(1)}s</span>
                                      )}
                                      <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  ) : (
                    <Card className="glass border border-white/[0.06]">
                      <CardContent className="pt-6 pb-6 text-center text-muted-foreground">
                        <p className="text-sm">No telemetry data available for this submission.</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="grid gap-3">
                  {submissions.map((sub, idx) => (
                    <Card
                      key={sub.id}
                      className="glass border border-white/[0.06] hover-lift cursor-pointer transition-all"
                      style={{ animationDelay: `${idx * 60}ms` }}
                      onClick={() => handleSelectStudent(sub)}
                    >
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center text-xs font-semibold">
                              {(sub.profiles?.full_name || 'S')[0]}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{sub.profiles?.full_name || 'Student'}</p>
                              <p className="text-[10px] text-muted-foreground">{sub.quizzes?.title}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {sub.window_changes > 0 && (
                              <span className="text-[10px] text-yellow-400 flex items-center gap-1">
                                <Eye className="w-3 h-3" /> {sub.window_changes}
                              </span>
                            )}
                            {riskBadge(sub.risk_score)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {submissions.length === 0 && (
                    <Card className="glass border border-white/[0.06]">
                      <CardContent className="pt-8 pb-8 text-center text-muted-foreground">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                          <Users className="w-7 h-7 text-primary/60" />
                        </div>
                        <p className="text-sm">No submissions yet. Create and assign a quiz to get started.</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>

            {/* ─── Quizzes Tab ──────────────────────────────────────────── */}
            <TabsContent value="quizzes" className="space-y-3">
              {quizzes.map((q, idx) => (
                <Card key={q.id} className="glass border border-white/[0.06] hover-lift transition-all" style={{ animationDelay: `${idx * 60}ms` }}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-accent" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{q.title}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {q.type} • Created {new Date(q.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={q.status === 'published' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : q.status === 'draft' ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20' : 'bg-muted/20 text-muted-foreground border border-white/[0.06]'}>
                          {q.status}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-white/[0.08] hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                          onClick={() => { setAssignQuizId(String(q.id)); setShowAssign(true); }}
                        >
                          <Send className="w-3 h-3 mr-1" /> Assign
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {quizzes.length === 0 && (
                <Card className="glass border border-white/[0.06]">
                  <CardContent className="pt-8 pb-8 text-center text-muted-foreground">
                    <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
                      <FileText className="w-7 h-7 text-accent/60" />
                    </div>
                    <p className="text-sm">No quizzes created yet.</p>
                    <Button size="sm" className="mt-4 glow-primary" onClick={() => setShowCreate(true)}>
                      <Plus className="w-4 h-4 mr-1" /> Create Your First Quiz
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* ═══ TYPING REPLAY DIALOG ══════════════════════════════════════════ */}
      <Dialog open={showReplay} onOpenChange={setShowReplay}>
        <DialogContent className="max-w-3xl glass-strong border border-white/[0.08]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-headline">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                <Play className="w-4 h-4 text-primary" />
              </div>
              Typing Replay
            </DialogTitle>
            <DialogDescription>
              Watch how the student typed their answers, snapshot by snapshot.
            </DialogDescription>
          </DialogHeader>
          {replayData && replayData.text_snapshots?.length > 0 ? (
            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Snapshot <span className="font-semibold text-foreground">{replayIdx + 1}</span> / {replayData.text_snapshots.length}
                  {' '}• {Math.round((replayData.text_snapshots[replayIdx]?.timestamp || 0) / 1000)}s
                </span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="border-white/[0.08]" onClick={() => setReplayIdx(Math.max(0, replayIdx - 1))} disabled={replayIdx === 0}>
                    Prev
                  </Button>
                  <Button size="sm" className={replayPlaying ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/20' : 'glow-primary'} onClick={() => setReplayPlaying(!replayPlaying)}>
                    {replayPlaying ? 'Pause' : 'Play'}
                  </Button>
                  <Button size="sm" variant="outline" className="border-white/[0.08]" onClick={() => setReplayIdx(Math.min(replayData.text_snapshots.length - 1, replayIdx + 1))} disabled={replayIdx >= replayData.text_snapshots.length - 1}>
                    Next
                  </Button>
                </div>
              </div>
              <div className="p-4 rounded-xl glass border border-white/[0.06] min-h-[200px] whitespace-pre-wrap text-sm font-mono">
                {replayData.text_snapshots[replayIdx]?.text || '(empty)'}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <BarChart3 className="w-3 h-3" />
                Total duration: {Math.round((replayData.duration_ms || 0) / 1000)}s •
                Events: {replayData.replay_events?.length || 0}
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-10">
              <div className="w-12 h-12 rounded-2xl bg-muted/10 flex items-center justify-center mx-auto mb-3">
                <Play className="w-5 h-5 text-muted-foreground/50" />
              </div>
              <p className="text-sm">No replay data available for this session.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="text-center p-2.5 rounded-xl glass border border-white/[0.06]">
      <div className="flex items-center justify-center text-primary mb-1">{icon}</div>
      <p className="text-sm font-headline font-bold">{value}</p>
      <p className="text-[9px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}
