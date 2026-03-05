'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import type { Quiz, QuizQuestion, QuizAssignment, ReplayEvent, TextSnapshot } from '@/lib/types';
import { KeystrokeTracker, type HeartbeatCallback } from '@/lib/telemetry/keystroke-tracker';
import type { TelemetryPayload } from '@/lib/telemetry/types';
import * as api from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  ShieldCheck,
  Clock,
  Send,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Eye,
} from 'lucide-react';

export default function StudentQuizPage({ params }: { params: Promise<{ quizId: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [assignment, setAssignment] = useState<QuizAssignment | null>(null);
  const [answers, setAnswers] = useState<Record<string, { answer_text?: string; selected_option?: string }>>({});
  const [currentQ, setCurrentQ] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resolvedQuizId, setResolvedQuizId] = useState<string>('');
  const [windowChanges, setWindowChanges] = useState(0);

  // ─── Refs ──────────────────────────────────────────────────────────────────
  const sessionIdRef = useRef(`session_${Date.now()}_${Math.random().toString(36).slice(2)}`);
  const blurTimeRef = useRef<number | null>(null);
  const trackerRef = useRef<KeystrokeTracker | null>(null);

  // ─── Replay tracking ───────────────────────────────────────────────────
  const replayEventsRef = useRef<ReplayEvent[]>([]);
  const textSnapshotsRef = useRef<TextSnapshot[]>([]);
  const sessionStartRef = useRef(Date.now());
  const snapshotIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    params.then(p => setResolvedQuizId(p.quizId));
  }, [params]);

  const qaId = searchParams.get('qa');

  // ─── Heartbeat callback for KeystrokeTracker ──────────────────────────
  const heartbeatCallback: HeartbeatCallback = useCallback((payload: TelemetryPayload) => {
    if (!qaId) return;
    api.postHeartbeat({
      quiz_assignment_id: qaId,
      session_id: payload.sessionId,
      events: payload.events,
      wpm: payload.metrics.wpm,
      burst_score: payload.metrics.burstScore,
      avg_latency: payload.metrics.avgLatency,
      peak_wpm: payload.metrics.peakWpm,
      paste_chars: payload.metrics.pasteCharCount,
      paste_events: payload.metrics.pasteEventCount,
      total_keys: payload.metrics.totalKeystrokes,
      wpm_history: payload.metrics.wpmHistory,
      nonce: payload.nonce,
      signature: payload.signature,
    }).catch(console.error);
  }, [qaId]);

  // ─── Initialize KeystrokeTracker ──────────────────────────────────────
  useEffect(() => {
    if (!qaId) return;
    const tracker = new KeystrokeTracker(qaId, heartbeatCallback);
    trackerRef.current = tracker;
    return () => {
      tracker.destroy();
      trackerRef.current = null;
    };
  }, [qaId, heartbeatCallback]);

  // Fetch quiz data via API
  const fetchData = useCallback(async () => {
    if (!resolvedQuizId || !user) return;
    setLoading(true);

    try {
      const { quiz: quizData } = await api.getQuiz(resolvedQuizId);
      if (quizData) {
        setQuiz(quizData as Quiz);
        if (quizData.quiz_questions) {
          const sorted = [...quizData.quiz_questions].sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
          setQuestions(sorted as QuizQuestion[]);
        }
      }

      if (qaId) {
        const { assignment: assignmentData } = await api.getAssignment(qaId);
        if (assignmentData) {
          setAssignment(assignmentData as QuizAssignment);
          if (assignmentData.status === 'assigned') {
            await api.updateAssignment(qaId, {
              status: 'in_progress',
              started_at: new Date().toISOString(),
              session_id: sessionIdRef.current,
            });
          }
        }
      }
    } catch (err) {
      console.error('Failed to load quiz:', err);
    }

    setLoading(false);
  }, [resolvedQuizId, user, qaId]);

  useEffect(() => {
    if (!authLoading && !profile) router.replace('/auth/login');
  }, [authLoading, profile, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Window blur/focus/visibility tracking ────────────────────────────
  useEffect(() => {
    if (!qaId) return;

    const handleBlur = () => {
      blurTimeRef.current = Date.now();
      setWindowChanges(prev => prev + 1);

      replayEventsRef.current.push({
        timestamp: Date.now() - sessionStartRef.current,
        type: 'window_change',
        data: { event_type: 'blur' },
      });

      api.postWindowChange({
        quiz_assignment_id: qaId,
        session_id: sessionIdRef.current,
        event_type: 'blur',
      }).catch(console.error);
    };

    const handleFocus = () => {
      const awayMs = blurTimeRef.current ? Date.now() - blurTimeRef.current : null;
      blurTimeRef.current = null;

      replayEventsRef.current.push({
        timestamp: Date.now() - sessionStartRef.current,
        type: 'window_change',
        data: { event_type: 'focus', away_duration_ms: awayMs },
      });

      api.postWindowChange({
        quiz_assignment_id: qaId,
        session_id: sessionIdRef.current,
        event_type: 'focus',
        away_duration_ms: awayMs,
      }).catch(console.error);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) handleBlur();
      else handleFocus();
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [qaId]);

  // ─── Replay: periodic text snapshots ─────────────────────────────────
  useEffect(() => {
    snapshotIntervalRef.current = setInterval(() => {
      const currentQuestion = questions[currentQ];
      if (!currentQuestion) return;
      const currentAnswer = answers[currentQuestion.id]?.answer_text || '';
      textSnapshotsRef.current.push({
        timestamp: Date.now() - sessionStartRef.current,
        text: currentAnswer,
      });
    }, 10000);

    return () => {
      if (snapshotIntervalRef.current) clearInterval(snapshotIntervalRef.current);
    };
  }, [currentQ, questions, answers]);

  // ─── Best-effort replay submit on page unload ─────────────────────────
  useEffect(() => {
    if (!qaId) return;

    const handleBeforeUnload = () => {
      const durationMs = Date.now() - sessionStartRef.current;
      const payload = JSON.stringify({
        quiz_assignment_id: qaId,
        session_id: sessionIdRef.current,
        replay_events: replayEventsRef.current,
        text_snapshots: textSnapshotsRef.current,
        duration_ms: durationMs,
        total_events: replayEventsRef.current.length,
      });

      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/telemetry/replay`;
      const token = typeof window !== 'undefined' ? localStorage.getItem('ie_auth_token') : null;
      const headers: Record<string, string> = { type: 'application/json' };

      // Use fetch with keepalive so auth headers are included (sendBeacon can't send custom headers)
      if (token) {
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      } else if (navigator.sendBeacon) {
        navigator.sendBeacon(url, new Blob([payload], { type: 'application/json' }));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [qaId]);

  // ─── Track keystrokes for replay and telemetry ────────────────────────
  const handleAnswerChange = (questionId: string, value: string, type: 'essay' | 'mcq') => {
    if (type === 'essay') {
      replayEventsRef.current.push({
        timestamp: Date.now() - sessionStartRef.current,
        type: 'keystroke',
        data: { question_id: questionId, text_length: value.length },
      });

      setAnswers(prev => ({
        ...prev,
        [questionId]: { ...prev[questionId], answer_text: value },
      }));
    } else {
      setAnswers(prev => ({
        ...prev,
        [questionId]: { ...prev[questionId], selected_option: value },
      }));
    }
  };

  // ─── Submit ──────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!qaId) return;
    setSubmitting(true);

    const responses = questions.map(q => ({
      question_id: q.id,
      answer_text: answers[q.id]?.answer_text || '',
      selected_option: answers[q.id]?.selected_option || null,
    }));

    const durationMs = Date.now() - sessionStartRef.current;
    await api.postReplay({
      quiz_assignment_id: qaId,
      session_id: sessionIdRef.current,
      replay_events: replayEventsRef.current,
      text_snapshots: textSnapshotsRef.current,
      duration_ms: durationMs,
      total_events: replayEventsRef.current.length,
    }).catch(console.error);

    try {
      const data = await api.submitResponses({
        quiz_assignment_id: qaId,
        responses,
      });
      setSubmitting(false);

      toast({
        title: 'Quiz submitted!',
        description: data.max_score !== null ? `Score: ${data.total_score}/${data.max_score}` : 'Submitted for review.',
      });
      router.push('/student');
    } catch (err: any) {
      setSubmitting(false);
      toast({ title: 'Submission failed', description: err.message, variant: 'destructive' });
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading quiz...</span>
        </div>
      </div>
    );
  }

  if (!quiz || !questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="glass-strong rounded-2xl p-8 text-center max-w-sm border border-white/[0.06]">
          <div className="w-14 h-14 rounded-2xl bg-muted/10 flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-7 h-7 text-muted-foreground/50" />
          </div>
          <p className="text-muted-foreground text-sm">Quiz not found or has no questions.</p>
          <Button variant="outline" size="sm" className="mt-4 border-white/[0.08]" onClick={() => router.push('/student')}>
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const question = questions[currentQ];
  const progress = ((currentQ + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background relative">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] right-[15%] w-[350px] h-[350px] bg-accent/4 blur-[100px] rounded-full" />
      </div>

      {/* Header */}
      <header className="border-b border-white/[0.04] glass-strong sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center glow-primary">
              <ShieldCheck className="w-4 h-4 text-primary" />
            </div>
            <span className="font-headline text-sm font-semibold">{quiz.title}</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
            {windowChanges > 0 && (
              <Badge className="text-[10px] bg-red-500/15 text-red-400 border border-red-500/20">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {windowChanges} tab switch{windowChanges > 1 ? 'es' : ''}
              </Badge>
            )}
            <Badge className="text-[10px] bg-primary/10 text-primary border border-primary/20">
              <Eye className="w-3 h-3 mr-1" /> Monitored
            </Badge>
            {quiz.time_limit_mins && (
              <span className="flex items-center gap-1 text-[11px]">
                <Clock className="w-3 h-3" /> {quiz.time_limit_mins} min
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="mb-8 animate-slide-up">
          <div className="flex justify-between text-xs text-muted-foreground mb-2.5">
            <span>Question <span className="font-semibold text-foreground">{currentQ + 1}</span> of {questions.length}</span>
            <span className="font-semibold text-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="glass-strong border border-white/[0.06] mb-8 animate-slide-up-delay-1">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2 mb-3">
              <Badge className="text-[10px] bg-accent/10 text-accent border border-accent/20">
                {question.question_type === 'essay' ? 'Essay' : 'Multiple Choice'}
              </Badge>
              <Badge className="text-[10px] bg-muted/10 text-muted-foreground border border-white/[0.06]">
                {question.points} pt{question.points > 1 ? 's' : ''}
              </Badge>
            </div>
            <CardTitle className="text-lg font-headline leading-relaxed">{question.question_text}</CardTitle>
          </CardHeader>
          <CardContent>
            {question.question_type === 'essay' ? (
              <Textarea
                placeholder="Type your answer here..."
                className="min-h-[220px] bg-background/30 border-white/[0.06] focus:border-primary/40 rounded-xl text-sm transition-colors resize-none"
                value={answers[question.id]?.answer_text || ''}
                onChange={e => handleAnswerChange(question.id, e.target.value, 'essay')}
                onKeyDown={e => trackerRef.current?.recordKeyDown(e.nativeEvent)}
                onKeyUp={e => trackerRef.current?.recordKeyUp(e.nativeEvent)}
                onPaste={e => trackerRef.current?.recordPaste(e.nativeEvent)}
              />
            ) : (
              <RadioGroup
                value={answers[question.id]?.selected_option || ''}
                onValueChange={v => handleAnswerChange(question.id, v, 'mcq')}
                className="space-y-3"
              >
                {(question.options || []).map((opt, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center space-x-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                      answers[question.id]?.selected_option === opt
                        ? 'border-primary/40 bg-primary/10'
                        : 'border-white/[0.06] glass hover:border-white/[0.12]'
                    }`}
                  >
                    <RadioGroupItem value={opt} id={`opt-${idx}`} />
                    <Label htmlFor={`opt-${idx}`} className="cursor-pointer flex-1 text-sm">{opt}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between animate-slide-up-delay-2">
          <Button
            variant="outline"
            className="border-white/[0.08] hover:bg-card/60"
            onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
            disabled={currentQ === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Previous
          </Button>

          {currentQ < questions.length - 1 ? (
            <Button className="glow-primary" onClick={() => setCurrentQ(currentQ + 1)}>
              Next <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20">
              {submitting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Send className="w-4 h-4 mr-1" />}
              Submit Quiz
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
