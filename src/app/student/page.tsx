'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import type { Quiz, QuizAssignment } from '@/lib/types';
import * as api from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  ShieldCheck,
  LogOut,
  Clock,
  FileText,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Loader2,
  ArrowRight,
  Trophy,
  TrendingUp,
} from 'lucide-react';

type AssignmentWithQuiz = QuizAssignment & {
  quizzes: Quiz;
};

export default function StudentDashboardPage() {
  const router = useRouter();
  const { profile, user, loading: authLoading, signOut } = useAuth();
  const [assignments, setAssignments] = useState<AssignmentWithQuiz[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAssignments = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { assignments: data } = await api.listAssignments();
      if (data) {
        setAssignments(data as unknown as AssignmentWithQuiz[]);
      }
    } catch (err) {
      console.error('Failed to load assignments:', err);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading && !profile) {
      router.replace('/auth/login');
    } else if (!authLoading && profile?.role === 'teacher') {
      router.replace('/teacher');
    }
  }, [authLoading, profile, router]);

  useEffect(() => {
    if (user) fetchAssignments();
  }, [user, fetchAssignments]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  const pending = assignments.filter(a => a.status === 'assigned' || a.status === 'in_progress');
  const submitted = assignments.filter(a => a.status === 'submitted' || a.status === 'reviewed' || a.status === 'flagged');
  const completionRate = assignments.length > 0 ? Math.round((submitted.length / assignments.length) * 100) : 0;

  const statusBadge = (status: string) => {
    switch (status) {
      case 'assigned': return <Badge className="bg-blue-500/10 text-blue-400 border border-blue-400/20 hover:bg-blue-500/20">Not Started</Badge>;
      case 'in_progress': return <Badge className="bg-yellow-500/10 text-yellow-400 border border-yellow-400/20 hover:bg-yellow-500/20">In Progress</Badge>;
      case 'submitted': return <Badge className="bg-green-500/10 text-green-400 border border-green-400/20 hover:bg-green-500/20">Submitted</Badge>;
      case 'reviewed': return <Badge className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20">Reviewed</Badge>;
      case 'flagged': return <Badge className="bg-red-500/10 text-red-400 border border-red-400/20">Flagged</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ─── Ambient Background ─────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-15%] right-[10%] w-[400px] h-[400px] bg-primary/8 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[15%] w-[350px] h-[350px] bg-accent/6 blur-[110px] rounded-full" />
      </div>

      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <header className="border-b border-white/[0.04] glass-strong sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center glow-primary">
              <ShieldCheck className="w-4 h-4 text-primary" />
            </div>
            <span className="font-headline text-lg font-semibold">Integrity <em className="font-display not-italic" style={{ fontStyle: 'italic' }}>Engine</em></span>
            <Badge className="bg-accent/10 text-accent border border-accent/20 text-[10px] px-2">Student</Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">{profile?.full_name || profile?.email}</span>
            <Button variant="ghost" size="sm" onClick={signOut} className="hover:bg-white/5 gap-2 text-muted-foreground hover:text-foreground">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ─── Main Content ───────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-slide-up">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="font-headline text-2xl sm:text-3xl font-bold mb-1">
            Welcome back, <span className="text-gradient">{profile?.full_name?.split(' ')[0] || 'Student'}</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            View and complete your assignments. Your typing behavior is monitored for integrity.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="glass hover-lift">
            <CardContent className="pt-5 pb-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-headline font-bold">{assignments.length}</p>
                <p className="text-[11px] text-muted-foreground">Total Assigned</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass hover-lift">
            <CardContent className="pt-5 pb-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-headline font-bold">{pending.length}</p>
                <p className="text-[11px] text-muted-foreground">Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass hover-lift">
            <CardContent className="pt-5 pb-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-headline font-bold">{submitted.length}</p>
                <p className="text-[11px] text-muted-foreground">Completed</p>
              </div>
            </CardContent>
          </Card>
          <Card className="glass hover-lift">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="text-[11px] text-muted-foreground">Completion</span>
                </div>
                <span className="text-sm font-headline font-bold text-primary">{completionRate}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList className="glass border-white/[0.06] p-1">
            <TabsTrigger value="pending" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Pending ({pending.length})
            </TabsTrigger>
            <TabsTrigger value="submitted" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Completed ({submitted.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="data-[state=active]:bg-white/10 gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> All ({assignments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-3">
            {pending.length === 0 ? (
              <Card className="glass">
                <CardContent className="pt-10 pb-10 text-center">
                  <div className="w-14 h-14 rounded-xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-7 h-7 text-green-400" />
                  </div>
                  <p className="font-headline text-lg mb-1">All caught up!</p>
                  <p className="text-sm text-muted-foreground">No pending quizzes. Great job!</p>
                </CardContent>
              </Card>
            ) : (
              pending.map((a, i) => <AssignmentCard key={a.id} assignment={a} statusBadge={statusBadge} index={i} />)
            )}
          </TabsContent>

          <TabsContent value="submitted" className="space-y-3">
            {submitted.length === 0 ? (
              <Card className="glass">
                <CardContent className="pt-10 pb-10 text-center">
                  <div className="w-14 h-14 rounded-xl bg-muted/20 flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-7 h-7 text-muted-foreground/40" />
                  </div>
                  <p className="font-headline text-lg mb-1">No submissions yet</p>
                  <p className="text-sm text-muted-foreground">Complete a quiz to see it here.</p>
                </CardContent>
              </Card>
            ) : (
              submitted.map((a, i) => <AssignmentCard key={a.id} assignment={a} statusBadge={statusBadge} index={i} />)
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-3">
            {assignments.length === 0 ? (
              <Card className="glass">
                <CardContent className="pt-10 pb-10 text-center">
                  <div className="w-14 h-14 rounded-xl bg-muted/20 flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-7 h-7 text-muted-foreground/40" />
                  </div>
                  <p className="font-headline text-lg mb-1">No assignments yet</p>
                  <p className="text-sm text-muted-foreground">Your teacher will assign quizzes soon.</p>
                </CardContent>
              </Card>
            ) : (
              assignments.map((a, i) => <AssignmentCard key={a.id} assignment={a} statusBadge={statusBadge} index={i} />)
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function AssignmentCard({
  assignment,
  statusBadge,
  index,
}: {
  assignment: AssignmentWithQuiz;
  statusBadge: (status: string) => React.ReactNode;
  index: number;
}) {
  const quiz = assignment.quizzes;
  const router = useRouter();
  const isPastDue = quiz?.due_date ? new Date() > new Date(quiz.due_date) : false;
  const canTake = (assignment.status === 'assigned' || assignment.status === 'in_progress') && !isPastDue;

  return (
    <Card className={`glass hover-lift group animate-slide-up ${isPastDue && (assignment.status === 'assigned' || assignment.status === 'in_progress') ? 'opacity-60' : ''}`} style={{ animationDelay: `${index * 0.05}s` }}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 flex-1 min-w-0">
            <CardTitle className="text-base font-headline truncate">{quiz?.title || 'Quiz'}</CardTitle>
            <CardDescription className="text-xs line-clamp-2">
              {quiz?.description || 'No description provided'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1.5">
            {isPastDue && (assignment.status === 'assigned' || assignment.status === 'in_progress') && (
              <Badge className="bg-red-500/10 text-red-400 border border-red-400/20">Past Due</Badge>
            )}
            {statusBadge(assignment.status)}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1.5 bg-white/[0.03] rounded-md px-2 py-1">
              <FileText className="w-3 h-3" />
              {quiz?.type === 'essay' ? 'Essay' : quiz?.type === 'multiple_choice' ? 'MCQ' : 'Mixed'}
            </span>
            {quiz?.time_limit_mins && (
              <span className="flex items-center gap-1.5 bg-white/[0.03] rounded-md px-2 py-1">
                <Clock className="w-3 h-3" />
                {quiz.time_limit_mins} min
              </span>
            )}
            {quiz?.due_date && (
              <span className={`flex items-center gap-1.5 rounded-md px-2 py-1 ${isPastDue ? 'bg-red-500/10 text-red-400' : 'bg-white/[0.03]'}`}>
                <Clock className="w-3 h-3" />
                {isPastDue ? 'Was due' : 'Due'} {new Date(quiz.due_date).toLocaleDateString()}
              </span>
            )}
            {assignment.status === 'flagged' && (
              <span className="flex items-center gap-1 text-red-400 bg-red-500/10 rounded-md px-2 py-1">
                <AlertTriangle className="w-3 h-3" />
                Under review
              </span>
            )}
            {assignment.total_score !== null && assignment.max_score !== null && (
              <span className="font-medium text-foreground bg-primary/10 rounded-md px-2 py-1">
                Score: {assignment.total_score}/{assignment.max_score}
              </span>
            )}
          </div>
          {canTake && (
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 gap-1.5 glow-primary group/btn ml-2"
              onClick={() => router.push(`/student/quiz/${assignment.quiz_id}?qa=${assignment.id}`)}
            >
              {assignment.status === 'in_progress' ? 'Continue' : 'Start'}
              <ArrowRight className="w-3 h-3 transition-transform group-hover/btn:translate-x-0.5" />
            </Button>
          )}
          {isPastDue && (assignment.status === 'assigned' || assignment.status === 'in_progress') && (
            <span className="text-xs text-red-400 ml-2">Deadline passed</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
