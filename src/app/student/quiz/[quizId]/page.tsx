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
} from 'lucide-react';

export default function StudentQuizPage({ params }: { params: Promise<{ quizId: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, { answer_text?: string; selected_option?: string }>>({}); 
  const [currentQ, setCurrentQ] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resolvedQuizId, setResolvedQuizId] = useState<string>('');

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

  // ─── Submit ──────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!qaId) return;
    setSubmitting(true);

    const responses = questions.map(q => ({
      question_id: q.id,
      answer_text: answers[q.id]?.answer_text || '',
      selected_option: answers[q.id]?.selected_option || null,
    }));

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
