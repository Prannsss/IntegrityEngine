'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api, type Quiz, type QuizQuestion } from '@/lib/api';
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
  Wand2,
  CheckCircle2,
  Info,
  LayoutGrid,
} from 'lucide-react';

export default function StudentQuizPage({ params }: { params: Promise<{ quizId: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, { answer_text?: string; selected_option?: string }>>({}); 
  const answersRef = useRef(answers);
  answersRef.current = answers;

  const questionsRef = useRef(questions);
  questionsRef.current = questions;

  const [currentQ, setCurrentQ] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resolvedQuizId, setResolvedQuizId] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number | null>(null); // seconds remaining
  const [paraphrasing, setParaphrasing] = useState(false);
  const [lockedOut, setLockedOut] = useState(false);
  const [lockReason, setLockReason] = useState<'timer' | 'abandoned'>('timer');
  // ─── Window change tracking ─────────────────────────────────────────────
  const sessionIdRef = useRef(`session_${Date.now()}_${Math.random().toString(36).slice(2)}`);
  const blurTimeRef = useRef<number | null>(null);
  const windowChangesRef = useRef(0);

  // ─── Replay tracking ───────────────────────────────────────────────────
  const replayEventsRef = useRef<Array<{ timestamp: number; type: string; data: Record<string, unknown> }>>([]); 
  const textSnapshotsRef = useRef<Array<{ timestamp: number; text: string }>>([]); 
  const sessionStartRef = useRef(Date.now());
  const snapshotIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Resolve params
  useEffect(() => {
    params.then(p => setResolvedQuizId(p.quizId));
  }, [params]);

  const qaId = searchParams.get('qa');

  const buildResponsesPayload = useCallback(() => {
    return questionsRef.current.map(q => ({
      question_id: q.id,
      answer_text: answersRef.current[q.id]?.answer_text || '',
      selected_option: answersRef.current[q.id]?.selected_option || null,
    }));
  }, []);

  const handleForceLockout = useCallback(async (reason: 'timer' | 'abandoned') => {
    if (!qaId || submitting) return;
    setLockedOut(true);
    setLockReason(reason);
    setSubmitting(true);

    try {
      const durationMs = Date.now() - sessionStartRef.current;
      await api.saveReplay({
        quiz_assignment_id: parseInt(qaId, 10),
        session_id: sessionIdRef.current,
        replay_events: replayEventsRef.current,
        text_snapshots: textSnapshotsRef.current,
        duration_ms: durationMs,
        total_events: replayEventsRef.current.length,
      }).catch(console.error);

      await api.submitResponses(parseInt(qaId, 10), buildResponsesPayload());
      
      if (reason === 'timer') {
        toast({ title: 'Time Expired', description: 'Your exam time has run out. Auto-submitting based on your progress.', variant: 'destructive' });
      } else {
        toast({ title: 'Exam Abandoned', description: 'You navigated away from the exam. It has been locked.', variant: 'destructive' });
      }
    } catch (e) {
      console.error('Lockout error', e);
    } finally {
      setSubmitting(false);
    }
  }, [qaId, submitting, toast, buildResponsesPayload]);

  // Fetch quiz data
  const fetchData = useCallback(async () => {
    if (!resolvedQuizId || !user) return;
    setLoading(true);
    try {
      const res = await api.getQuiz(parseInt(resolvedQuizId, 10));
      setQuiz(res.quiz);
      setQuestions(res.questions);
    } catch {
      // quiz not found
    }
    setLoading(false);
  }, [resolvedQuizId, user]);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/auth/login');
  }, [authLoading, user, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Countdown timer ────────────────────────────────────────────────
  useEffect(() => {
    if (!quiz?.time_limit_mins) return;
    // Initialize from time_limit_mins (seconds)
    if (timeLeft === null) {
      setTimeLeft(quiz.time_limit_mins * 60);
    }
  }, [quiz?.time_limit_mins, timeLeft]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || lockedOut) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          // Auto-submit when time runs out
          if (prev === 1) handleForceLockout('timer');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, lockedOut]);

  // ─── Back Button Trap ──────────────────────────────────────────────
  useEffect(() => {
    if (!qaId || lockedOut || submitting) return;

    // Push state so back button doesn't leave immediately
    window.history.pushState({ trap: true }, '', window.location.href);

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      handleForceLockout('abandoned');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [qaId, lockedOut, submitting, handleForceLockout]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return { h, m, s };
  };

  // ─── Window blur/focus tracking ──────────────────────────────────────
  useEffect(() => {
    if (!qaId) return;

    const handleBlur = () => {
      blurTimeRef.current = Date.now();
      windowChangesRef.current++;

      // Record replay event
      replayEventsRef.current.push({
        timestamp: Date.now() - sessionStartRef.current,
        type: 'window_change',
        data: { event_type: 'blur' },
      });

      // Send to API
      api.sendWindowChange({
        quiz_assignment_id: parseInt(qaId, 10),
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

      api.sendWindowChange({
        quiz_assignment_id: parseInt(qaId, 10),
        session_id: sessionIdRef.current,
        event_type: 'focus',
        away_duration_ms: awayMs,
      }).catch(console.error);
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
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

  // ─── Track keystrokes for replay ─────────────────────────────────────
  const handleAnswerChange = (questionId: number, value: string, type: 'essay' | 'mcq') => {
    if (type === 'essay') {
      // Record replay event
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

  // ─── Paraphrase (essay only) ────────────────────────────────────────
  const handleParaphrase = async (questionId: number) => {
    const text = answers[questionId]?.answer_text;
    if (!text?.trim()) return;
    setParaphrasing(true);
    try {
      const res = await fetch('/api/ai/paraphrase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Paraphrase failed');
      setAnswers(prev => ({
        ...prev,
        [questionId]: { ...prev[questionId], answer_text: data.paraphrased },
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setParaphrasing(false);
    }
  };

  // ─── Submit ──────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!qaId || submitting || lockedOut) return;
    setSubmitting(true);

    const responses = buildResponsesPayload();

    // Save replay data
    const durationMs = Date.now() - sessionStartRef.current;
    await api.saveReplay({
      quiz_assignment_id: parseInt(qaId, 10),
      session_id: sessionIdRef.current,
      replay_events: replayEventsRef.current,
      text_snapshots: textSnapshotsRef.current,
      duration_ms: durationMs,
      total_events: replayEventsRef.current.length,
    }).catch(console.error);

    // Submit responses
    try {
      const data = await api.submitResponses(parseInt(qaId, 10), responses);
      setSubmitting(false);
      toast({
        title: 'Quiz submitted!',
        description: data.max_score !== null ? `Score: ${data.total_score}/${data.max_score}` : 'Submitted for review.',
      });
      router.push('/student/dashboard');
    } catch {
      setSubmitting(false);
      toast({ title: 'Submission failed', description: 'Something went wrong.', variant: 'destructive' });
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
          <Button variant="outline" size="sm" className="mt-4 border-white/[0.08]" onClick={() => router.push('/student/dashboard')}>
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (quiz.status === 'closed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="glass-strong rounded-2xl p-8 text-center max-w-sm border border-white/[0.06]">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-7 h-7 text-red-400" />
          </div>
          <h3 className="font-headline font-semibold mb-1">Content Closed</h3>
          <p className="text-muted-foreground text-sm">This {quiz.content_type || 'quiz'} has been closed by the teacher and is no longer accepting submissions.</p>
          <Button variant="outline" size="sm" className="mt-4 border-white/[0.08]" onClick={() => router.push('/student/dashboard')}>
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (lockedOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="glass-strong rounded-2xl p-8 text-center max-w-sm border border-white/[0.06]">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-7 h-7 text-red-400" />
          </div>
          <h3 className="font-headline font-semibold mb-1">
            {lockReason === 'timer' ? 'Time Expired' : 'Exam Locked'}
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            {lockReason === 'timer' 
              ? 'Your time for this exam has run out. Your answers have been automatically submitted.'
              : 'You navigated away from the exam. To ensure academic integrity, the exam has been locked and automatically submitted.'}
          </p>
          <Button variant="outline" size="sm" className="mt-2 border-white/[0.08]" onClick={() => router.push('/student/dashboard')}>
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Return to Dashboard
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
            {windowChangesRef.current > 0 && (
              <Badge className="text-[10px] bg-red-500/15 text-red-400 border border-red-500/20">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {windowChangesRef.current} tab switch{windowChangesRef.current > 1 ? 'es' : ''}
              </Badge>
            )}
            <Badge className="text-[10px] bg-primary/10 text-primary border border-primary/20">
              <Eye className="w-3 h-3 mr-1" /> Monitored
            </Badge>
            {quiz.time_limit_mins && timeLeft !== null && (() => {
              const { h, m, s } = formatTime(timeLeft);
              const isLow = timeLeft < 300;
              return (
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${
                  isLow ? 'border-red-500/30 bg-red-500/10' : 'border-primary/20 bg-primary/10'
                }`}>
                  <Clock className={`w-3.5 h-3.5 ${isLow ? 'text-red-400 animate-pulse' : 'text-primary'}`} />
                  <div className="flex items-baseline gap-0.5 font-mono text-xs font-bold">
                    <span className={isLow ? 'text-red-400' : 'text-foreground'}>{String(h).padStart(2, '0')}</span>
                    <span className="text-muted-foreground">:</span>
                    <span className={isLow ? 'text-red-400' : 'text-foreground'}>{String(m).padStart(2, '0')}</span>
                    <span className="text-muted-foreground">:</span>
                    <span className={isLow ? 'text-red-400' : 'text-foreground'}>{String(s).padStart(2, '0')}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left Column / Main Quiz Area */}
        <div className="flex-1 flex flex-col">
          {/* Progress */}
          <div className="mb-8 animate-slide-up">
            <div className="flex justify-between text-xs text-muted-foreground mb-2.5">
              <span>Current Progress</span>
              <span className="font-semibold text-primary">{currentQ + 1} / {questions.length} Questions</span>
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
            <CardTitle className="text-xl font-headline leading-relaxed mb-4">
              Question {currentQ + 1} of {questions.length}: {question.question_text}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {question.question_type === 'essay' ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {(answers[question.id]?.answer_text || '').trim() === ''
                      ? 'WORD COUNT: 0'
                      : `WORD COUNT: ${(answers[question.id]?.answer_text || '').trim().split(/\s+/).length}`}
                  </span>
                  <Button
                    variant="outline" size="sm"
                    className="h-8 text-primary border-primary/20 hover:bg-primary/10 rounded-full flex items-center gap-1.5"
                    onClick={() => handleParaphrase(question.id)}
                    disabled={paraphrasing || !(answers[question.id]?.answer_text?.trim())}
                  >
                    {paraphrasing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                    {paraphrasing ? 'Paraphrasing…' : 'Paraphrase'}
                  </Button>
                </div>
                <Textarea
                  placeholder="Type your answer here..."
                  className="min-h-[220px] bg-background/30 border-white/[0.06] focus:border-primary/40 rounded-xl text-sm transition-colors resize-none"
                  value={answers[question.id]?.answer_text || ''}
                  onChange={e => handleAnswerChange(question.id, e.target.value, 'essay')}
                  onCopy={e => {
                    e.preventDefault();
                    toast({ title: 'Not Allowed', description: 'Copying is disabled for essay questions.', variant: 'destructive' });
                  }}
                  onPaste={e => {
                    e.preventDefault();
                    toast({ title: 'Not Allowed', description: 'Pasting is disabled for essay questions.', variant: 'destructive' });
                  }}
                />
              </div>
            ) : (
              <div className="space-y-4">
                {(question.options || []).map((opt, idx) => {
                  const isSelected = answers[question.id]?.selected_option === opt;
                  return (
                    <div
                      key={idx}
                      className={`p-5 rounded-2xl border-2 transition-all flex items-center gap-4 cursor-pointer hover:bg-muted/50 ${
                        isSelected ? 'border-primary bg-primary/5' : 'border-white/[0.06] glass'
                      }`}
                      onClick={() => handleAnswerChange(question.id, opt, 'mcq')}
                    >
                      <div className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                        isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className={`text-base font-medium flex-1 ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                        {opt}
                      </span>
                      {isSelected && <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />}
                    </div>
                  );
                })}
              </div>
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
        
        </div>

        {/* Right Column / Sidebar */}
        <div className="w-full lg:w-80 flex flex-col gap-6 animate-slide-up">
          <Card className="glass-strong border border-white/[0.06] p-6">
            <h3 className="font-headline font-semibold mb-6 flex items-center gap-2 text-sm">
              <LayoutGrid className="w-4 h-4 text-primary" /> Question Navigator
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = q.question_type === 'essay' 
                  ? !!answers[q.id]?.answer_text?.trim()
                  : !!answers[q.id]?.selected_option;
                const isCurrent = currentQ === idx;
                
                let statusClass = 'bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/50';
                if (isCurrent) {
                  statusClass = 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20';
                } else if (isAnswered) {
                  statusClass = 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQ(idx)}
                    className={`w-10 h-10 rounded-xl text-xs font-bold border transition-all flex items-center justify-center ${statusClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="w-3 h-3 rounded-full bg-emerald-500/15 border border-emerald-500/30"></div> Answered
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="w-3 h-3 rounded-full bg-primary border border-primary"></div> Current
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="w-3 h-3 rounded-full bg-muted/30 border border-transparent"></div> Pending
              </div>
            </div>
          </Card>
          
          <Card className="glass-strong border border-white/[0.06] p-6 bg-primary/5">
            <h3 className="font-headline font-semibold mb-2 flex items-center gap-2 text-sm text-primary">
              <Info className="w-4 h-4" /> Instructions
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Ensure you answer all questions before final submission. The exam will auto-submit when the timer reaches zero.
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}
