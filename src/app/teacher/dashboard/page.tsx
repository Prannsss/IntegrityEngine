'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api, type Quiz, type StudentProfile, type QuizAssignment, type Material } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IELogo } from '@/components/ui/ie-logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Loader2,
  LogOut,
  Plus,
  Upload,
  FileText,
  Users,
  BarChart3,
  BookOpen,
  Clock,
  Trash2,
  UserPlus,
  CheckCircle,
  AlertTriangle,
  Shield,
  ChevronRight,
  ClipboardList,
  GraduationCap,
  FileUp,
  File,
  X,
  CheckSquare,
  PenLine,
  ListChecks,
  Type,
  Calendar,
  Ban,
  Pencil,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { gooeyToast } from 'goey-toast';

type TabKey = 'quizzes' | 'students' | 'review' | 'materials';

export default function TeacherDashboard() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('quizzes');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/auth/login');
    if (!authLoading && user && user.role !== 'teacher') router.replace('/student/dashboard');
  }, [authLoading, user, router]);

  const fetchData = useCallback(async () => {
    try {
      const [qRes, sRes, mRes] = await Promise.all([
        api.listQuizzes(),
        api.listStudents(),
        api.listMaterials(),
      ]);
      setQuizzes(qRes.quizzes);
      setStudents(sRes.students);
      setMaterials(mRes.materials);
    } catch {
      gooeyToast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchData();
  }, [user, fetchData]);

  const handleLogout = () => {
    signOut();
    router.push('/');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[10%] left-[10%] w-[400px] h-[400px] bg-primary/8 blur-[130px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-[15%] right-[10%] w-[350px] h-[350px] bg-accent/6 blur-[110px] rounded-full animate-pulse-slow [animation-delay:2s]" />
      </div>

      {/* Pill nav */}
      <div className="sticky top-0 z-50 flex justify-center pt-4 px-4">
        <nav className="w-full max-w-5xl px-5 py-2.5 flex items-center justify-between rounded-full glass-strong border border-white/[0.08] shadow-lg shadow-black/10">
          <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
            <IELogo className="w-6 h-6" />
            <span className="font-headline text-sm font-semibold tracking-wide">IntegrityEngine</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:block">{user?.full_name}</span>
            <ThemeToggle />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2.5 hover:bg-white/5 rounded-full">
                  <LogOut className="w-3.5 h-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will end your current session. You will need to log in again to access your dashboard.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout}>Log out</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </nav>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-slide-up">
          <h1 className="text-2xl font-headline font-bold mb-1 flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Teacher Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">Manage quizzes, students, and integrity analysis</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-slide-up-delay-1">
          <StatCard icon={<BookOpen className="w-4 h-4 text-primary" />} value={quizzes.length} label="Total Content" bgClass="bg-primary/10" />
          <StatCard icon={<FileText className="w-4 h-4 text-blue-400" />} value={quizzes.filter(q => q.status === 'published').length} label="Published" bgClass="bg-blue-500/10" />
          <StatCard icon={<Users className="w-4 h-4 text-green-400" />} value={students.length} label="Students" bgClass="bg-green-500/10" />
          <StatCard icon={<BarChart3 className="w-4 h-4 text-orange-400" />} value={quizzes.reduce((s, q) => s + (q.submitted_count || 0), 0)} label="Submissions" bgClass="bg-orange-500/10" />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={v => setActiveTab(v as TabKey)} className="animate-slide-up-delay-2">
          <TabsList className="mb-6 bg-card/40 border border-white/[0.06]">
            <TabsTrigger value="quizzes">Content</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="review">Submissions</TabsTrigger>
          </TabsList>

          <TabsContent value="quizzes">
            <QuizzesTab quizzes={quizzes} students={students} onRefresh={fetchData} />
          </TabsContent>
          <TabsContent value="materials">
            <MaterialsTab materials={materials} onRefresh={fetchData} />
          </TabsContent>
          <TabsContent value="students">
            <StudentsTab students={students} />
          </TabsContent>
          <TabsContent value="review">
            <ReviewTab quizzes={quizzes} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

/* ── Stat Card ─────────────────────────────────────────────────────────────── */

function StatCard({ icon, value, label, bgClass }: { icon: React.ReactNode; value: number; label: string; bgClass: string }) {
  return (
    <Card className="glass border border-white/[0.06]">
      <CardContent className="pt-5 pb-4 px-5">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl ${bgClass} flex items-center justify-center`}>{icon}</div>
          <div>
            <p className="text-2xl font-headline font-bold">{value}</p>
            <p className="text-[11px] text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Quizzes Tab ───────────────────────────────────────────────────────────── */

/* ── Quizzes Tab ───────────────────────────────────────────────────────────── */

const CONTENT_TYPES = [
  {
    value: 'quiz' as const,
    label: 'Quiz',
    description: 'Short assessment with auto-grading',
    icon: <BookOpen className="w-5 h-5" />,
    color: 'text-primary bg-primary/10 border-primary/20',
  },
  {
    value: 'exam' as const,
    label: 'Exam',
    description: 'Formal examination with time limit',
    icon: <GraduationCap className="w-5 h-5" />,
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  },
  {
    value: 'assignment' as const,
    label: 'Assignment',
    description: 'Take-home task with due date',
    icon: <ClipboardList className="w-5 h-5" />,
    color: 'text-green-400 bg-green-500/10 border-green-500/20',
  },
];

type QuestionDraft = {
  question_text: string;
  question_type: 'essay' | 'multiple_choice' | 'identification';
  options: string[];
  correct_answer: string;
  points: number;
};

const EMPTY_MCQ: QuestionDraft = { question_text: '', question_type: 'multiple_choice', options: ['', '', '', ''], correct_answer: '', points: 1 };
const EMPTY_ESSAY: QuestionDraft = { question_text: '', question_type: 'essay', options: [], correct_answer: '', points: 1 };
const EMPTY_IDENT: QuestionDraft = { question_text: '', question_type: 'identification', options: [], correct_answer: '', points: 1 };

function QuizzesTab({ quizzes, students, onRefresh }: { quizzes: Quiz[]; students: StudentProfile[]; onRefresh: () => void }) {
  const [step, setStep] = useState<'pick' | 'form' | 'questions'>('pick');
  const [contentType, setContentType] = useState<'quiz' | 'exam' | 'assignment'>('quiz');
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'essay' | 'multiple_choice' | 'mixed'>('essay');
  const [timeLimit, setTimeLimit] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);

  const selectedMeta = CONTENT_TYPES.find(c => c.value === contentType)!;

  const resetForm = () => {
    setStep('pick');
    setContentType('quiz');
    setTitle('');
    setDescription('');
    setType('essay');
    setTimeLimit('');
    setDueDate('');
    setQuestions([]);
  };

  const goToQuestions = () => {
    if (!title.trim()) return;
    // Initialize one empty question based on type
    if (questions.length === 0) {
      if (type === 'multiple_choice') setQuestions([{ ...EMPTY_MCQ }]);
      else if (type === 'essay') setQuestions([{ ...EMPTY_ESSAY }]);
      else setQuestions([{ ...EMPTY_ESSAY }]);
    }
    setStep('questions');
  };

  const addQuestion = (qType?: 'essay' | 'multiple_choice' | 'identification') => {
    const t = qType || (type === 'multiple_choice' ? 'multiple_choice' : type === 'essay' ? 'essay' : 'essay');
    if (t === 'multiple_choice') setQuestions(prev => [...prev, { ...EMPTY_MCQ }]);
    else if (t === 'identification') setQuestions(prev => [...prev, { ...EMPTY_IDENT }]);
    else setQuestions(prev => [...prev, { ...EMPTY_ESSAY }]);
  };

  const updateQuestion = (idx: number, patch: Partial<QuestionDraft>) => {
    setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, ...patch } : q));
  };

  const removeQuestion = (idx: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const updateOption = (qIdx: number, optIdx: number, value: string) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIdx) return q;
      const opts = [...q.options];
      opts[optIdx] = value;
      return { ...q, options: opts };
    }));
  };

  const handleCreate = async () => {
    if (!title.trim()) return;
    setCreating(true);
    try {
      const mappedQuestions = questions
        .filter(q => q.question_text.trim())
        .map((q, i) => ({
          question_text: q.question_text.trim(),
          question_type: q.question_type === 'identification' ? 'essay' as const : q.question_type,
          options: q.question_type === 'multiple_choice' ? q.options.filter(o => o.trim()) : undefined,
          correct_answer: (q.question_type === 'multiple_choice' || q.question_type === 'identification') ? q.correct_answer || undefined : undefined,
          points: q.points || 1,
          sort_order: i,
        }));
      await api.createQuiz({
        title: title.trim(),
        description: description.trim(),
        content_type: contentType,
        type,
        time_limit_mins: timeLimit ? parseInt(timeLimit, 10) : undefined,
        due_date: dueDate || undefined,
        questions: mappedQuestions,
      });
      gooeyToast.success(`${selectedMeta.label} created`);
      resetForm();
      setDialogOpen(false);
      onRefresh();
    } catch {
      gooeyToast.error('Failed to create content');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteQuiz(id);
      gooeyToast.success('Deleted');
      onRefresh();
    } catch {
      gooeyToast.error('Failed to delete');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-headline font-semibold text-muted-foreground uppercase tracking-wide">Your Content</h2>
        <Dialog open={dialogOpen} onOpenChange={open => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary hover:bg-primary/90 glow-primary rounded-full h-8 px-4">
              <Plus className="w-3.5 h-3.5 mr-1" /> New Content
            </Button>
          </DialogTrigger>
          <DialogContent className={`glass-strong border border-white/[0.08] ${step === 'questions' ? 'max-w-2xl' : 'max-w-md'}`}>
            {step === 'pick' ? (
              <>
                <DialogHeader>
                  <DialogTitle className="font-headline text-lg">New Content</DialogTitle>
                  <DialogDescription>Choose the type of content to create.</DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-2">
                  {CONTENT_TYPES.map(ct => (
                    <button
                      key={ct.value}
                      onClick={() => { setContentType(ct.value); setStep('form'); }}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all hover:scale-[1.01] hover:shadow-md text-left ${ct.color}`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${ct.color}`}>
                        {ct.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{ct.label}</p>
                        <p className="text-xs opacity-70">{ct.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : step === 'form' ? (
              <>
                <DialogHeader>
                  <DialogTitle className="font-headline flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center ${selectedMeta.color}`}>
                      {selectedMeta.icon}
                    </span>
                    Create {selectedMeta.label}
                  </DialogTitle>
                  <DialogDescription>Fill in the details, then add questions.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div>
                    <Label>Title <span className="text-red-400">*</span></Label>
                    <Input value={title} onChange={e => setTitle(e.target.value)} placeholder={`${selectedMeta.label} title`} className="mt-1" />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional description" className="mt-1" rows={2} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Question Type</Label>
                      <Select value={type} onValueChange={v => setType(v as typeof type)}>
                        <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="essay">Essay</SelectItem>
                          <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                          <SelectItem value="mixed">Mixed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Time Limit (min)</Label>
                      <Input type="number" value={timeLimit} onChange={e => setTimeLimit(e.target.value)} placeholder="Optional" className="mt-1" />
                    </div>
                  </div>
                  <div>
                    <Label>Deadline</Label>
                    <Input type="datetime-local" value={dueDate} onChange={e => setDueDate(e.target.value)} className="mt-1" />
                  </div>
                </div>
                <DialogFooter className="gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setStep('pick')} className="rounded-full">
                    Back
                  </Button>
                  <Button onClick={goToQuestions} disabled={!title.trim()} className="bg-primary hover:bg-primary/90 rounded-full">
                    Next: Add Questions
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle className="font-headline flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center ${selectedMeta.color}`}>
                      {selectedMeta.icon}
                    </span>
                    Add Questions
                  </DialogTitle>
                  <DialogDescription>{title} — {type.replace('_', ' ')}</DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[420px] pr-3">
                  <div className="space-y-4 py-2">
                    {questions.map((q, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-white/[0.08] bg-card/30 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className="text-[10px] bg-primary/10 text-primary border-primary/20">
                              Q{idx + 1}
                            </Badge>
                            {type === 'mixed' && (
                              <Select value={q.question_type} onValueChange={v => updateQuestion(idx, { question_type: v as QuestionDraft['question_type'], options: v === 'multiple_choice' ? ['', '', '', ''] : [], correct_answer: '' })}>
                                <SelectTrigger className="h-7 w-[150px] text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="multiple_choice">
                                    <span className="flex items-center gap-1.5"><ListChecks className="w-3 h-3" /> Multiple Choice</span>
                                  </SelectItem>
                                  <SelectItem value="essay">
                                    <span className="flex items-center gap-1.5"><PenLine className="w-3 h-3" /> Essay</span>
                                  </SelectItem>
                                  <SelectItem value="identification">
                                    <span className="flex items-center gap-1.5"><Type className="w-3 h-3" /> Identification</span>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-full hover:bg-red-500/10 text-muted-foreground hover:text-red-400" onClick={() => removeQuestion(idx)}>
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                        <div>
                          <Label className="text-xs">Question</Label>
                          <Textarea
                            value={q.question_text}
                            onChange={e => updateQuestion(idx, { question_text: e.target.value })}
                            placeholder="Enter your question..."
                            className="mt-1 text-sm"
                            rows={2}
                          />
                        </div>
                        {q.question_type === 'multiple_choice' && (
                          <div className="space-y-2">
                            <Label className="text-xs">Choices</Label>
                            {['A', 'B', 'C', 'D'].map((letter, optIdx) => (
                              <div key={letter} className="flex items-center gap-2">
                                <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-semibold shrink-0 ${q.correct_answer === q.options[optIdx] && q.options[optIdx] ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-muted/20 text-muted-foreground border border-white/[0.06]'}`}>{letter}</span>
                                <Input
                                  value={q.options[optIdx] || ''}
                                  onChange={e => updateOption(idx, optIdx, e.target.value)}
                                  placeholder={`Option ${letter}`}
                                  className="text-sm h-8"
                                />
                              </div>
                            ))}
                            <div>
                              <Label className="text-xs">Correct Answer</Label>
                              <Select value={q.correct_answer} onValueChange={v => updateQuestion(idx, { correct_answer: v })}>
                                <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue placeholder="Select correct answer" /></SelectTrigger>
                                <SelectContent>
                                  {q.options.map((opt, oi) => opt.trim() ? (
                                    <SelectItem key={oi} value={opt}>{['A', 'B', 'C', 'D'][oi]}: {opt}</SelectItem>
                                  ) : null)}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}
                        {q.question_type === 'identification' && (
                          <div>
                            <Label className="text-xs">Correct Answer</Label>
                            <Input
                              value={q.correct_answer}
                              onChange={e => updateQuestion(idx, { correct_answer: e.target.value })}
                              placeholder="Enter the correct answer"
                              className="mt-1 text-sm h-8"
                            />
                          </div>
                        )}
                        <div className="w-20">
                          <Label className="text-xs">Points</Label>
                          <Input type="number" value={q.points} onChange={e => updateQuestion(idx, { points: parseInt(e.target.value, 10) || 1 })} className="mt-1 h-8 text-sm" min={1} />
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                {type === 'mixed' ? (
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="rounded-full text-xs h-7 border-white/[0.1]" onClick={() => addQuestion('multiple_choice')}>
                      <ListChecks className="w-3 h-3 mr-1" /> + Multiple Choice
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-full text-xs h-7 border-white/[0.1]" onClick={() => addQuestion('essay')}>
                      <PenLine className="w-3 h-3 mr-1" /> + Essay
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-full text-xs h-7 border-white/[0.1]" onClick={() => addQuestion('identification')}>
                      <Type className="w-3 h-3 mr-1" /> + Identification
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" className="rounded-full text-xs h-7 border-white/[0.1]" onClick={() => addQuestion()}>
                    <Plus className="w-3 h-3 mr-1" /> Add Question
                  </Button>
                )}
                <DialogFooter className="gap-2 pt-2">
                  <Button variant="ghost" size="sm" onClick={() => setStep('form')} className="rounded-full">
                    Back
                  </Button>
                  <Button onClick={handleCreate} disabled={creating || questions.filter(q => q.question_text.trim()).length === 0} className="bg-primary hover:bg-primary/90 rounded-full">
                    {creating && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                    Create {selectedMeta.label}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {quizzes.length === 0 ? (
        <EmptyState icon={<BookOpen />} text="No content yet. Create your first one!" />
      ) : (
        <div className="space-y-3">
          {quizzes.map(q => (
            <QuizCard key={q.id} quiz={q} students={students} onDelete={handleDelete} onRefresh={onRefresh} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Quiz Card ─────────────────────────────────────────────────────────────── */

function QuizCard({ quiz, students, onDelete, onRefresh }: { quiz: Quiz; students: StudentProfile[]; onDelete: (id: number) => void; onRefresh: () => void }) {
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [assigning, setAssigning] = useState(false);
  const [closing, setClosing] = useState(false);

  const handleAssign = async () => {
    if (selectedStudents.length === 0) return;
    setAssigning(true);
    try {
      await api.assignQuiz(quiz.id, selectedStudents);
      gooeyToast.success(`Assigned to ${selectedStudents.length} student(s)`);
      setSelectedStudents([]);
      setAssignOpen(false);
      onRefresh();
    } catch {
      gooeyToast.error('Failed to assign quiz');
    } finally {
      setAssigning(false);
    }
  };

  const statusColor = quiz.status === 'published'
    ? 'bg-green-500/10 text-green-400 border-green-500/20'
    : quiz.status === 'closed'
    ? 'bg-muted/10 text-muted-foreground border-white/[0.06]'
    : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';

  const contentTypeMeta = CONTENT_TYPES.find(c => c.value === (quiz.content_type ?? 'quiz'))!;

  return (
    <Card className="glass border border-white/[0.06] hover-lift">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="font-headline font-semibold text-sm truncate">{quiz.title}</h3>
              <Badge className={`text-[10px] border ${statusColor} shrink-0`}>{quiz.status}</Badge>
              <Badge className={`text-[10px] border shrink-0 ${contentTypeMeta.color}`}>{contentTypeMeta.label}</Badge>
              <Badge variant="outline" className="text-[10px] shrink-0">{quiz.type.replace('_', ' ')}</Badge>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{quiz.description || 'No description'}</p>
            <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{quiz.question_count ?? 0} Qs</span>
              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{quiz.assignment_count ?? 0} assigned</span>
              <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" />{quiz.submitted_count ?? 0} submitted</span>
              {quiz.time_limit_mins && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{quiz.time_limit_mins}m</span>}
              {quiz.due_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Due {new Date(quiz.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>}
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors"
              title="Edit Content"
              onClick={() => gooeyToast.info('Edit mode coming soon!')}
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors"
                  title="Assign to Students"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-strong border border-white/[0.08]">
                <DialogHeader>
                  <DialogTitle className="font-headline">Assign: {quiz.title}</DialogTitle>
                  <DialogDescription>Select students to assign this quiz to.</DialogDescription>
                </DialogHeader>
                {students.length > 0 && (
                  <div className="flex items-center justify-between pb-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-3 text-[11px] rounded-full border-white/[0.1]"
                      onClick={() => {
                        if (selectedStudents.length === students.length) {
                          setSelectedStudents([]);
                        } else {
                          setSelectedStudents(students.map(s => s.id));
                        }
                      }}
                    >
                      <CheckSquare className="w-3 h-3 mr-1" />
                      {selectedStudents.length === students.length ? 'Deselect All' : 'Select All'}
                    </Button>
                    <span className="text-[11px] text-muted-foreground">{selectedStudents.length}/{students.length} selected</span>
                  </div>
                )}
                <div className="max-h-60 overflow-y-auto space-y-2 py-2">
                  {students.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No students registered yet.</p>
                  ) : (
                    students.map(s => (
                      <label key={s.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                        <Checkbox
                          checked={selectedStudents.includes(s.id)}
                          onCheckedChange={checked => {
                            setSelectedStudents(prev =>
                              checked ? [...prev, s.id] : prev.filter(id => id !== s.id)
                            );
                          }}
                        />
                        <div>
                          <p className="text-sm font-medium">{s.full_name || s.email}</p>
                          <p className="text-[11px] text-muted-foreground">{s.email}</p>
                        </div>
                      </label>
                    ))
                  )}
                </div>
                <DialogFooter>
                  <Button onClick={handleAssign} disabled={assigning || selectedStudents.length === 0} className="bg-primary hover:bg-primary/90 rounded-full">
                    {assigning && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                    Assign ({selectedStudents.length})
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            {quiz.status !== 'closed' ? (
              <Button
                variant="ghost" size="sm"
                className="h-8 w-8 p-0 rounded-full hover:bg-orange-500/10 text-muted-foreground hover:text-orange-400"
                disabled={closing}
                onClick={async () => {
                  setClosing(true);
                  try {
                    await api.updateQuiz(quiz.id, { status: 'closed' });
                    gooeyToast.success('Content closed');
                    onRefresh();
                  } catch { gooeyToast.error('Failed to close'); }
                  finally { setClosing(false); }
                }}
                title="Close — makes this inaccessible to students"
              >
                {closing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
              </Button>
            ) : (
              <Button
                variant="ghost" size="sm"
                className="h-8 w-8 p-0 rounded-full hover:bg-green-500/10 text-muted-foreground hover:text-green-400"
                disabled={closing}
                onClick={async () => {
                  setClosing(true);
                  try {
                    await api.updateQuiz(quiz.id, { status: 'published' });
                    gooeyToast.success('Content re-opened');
                    onRefresh();
                  } catch { gooeyToast.error('Failed to reopen'); }
                  finally { setClosing(false); }
                }}
                title="Reopen — makes this accessible to students again"
              >
                {closing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
              </Button>
            )}
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-red-500/10 text-muted-foreground hover:text-red-400" onClick={() => onDelete(quiz.id)}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Materials Tab ─────────────────────────────────────────────────────────── */

const MIME_LABELS: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/vnd.ms-powerpoint': 'PPT',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
  'application/msword': 'DOC',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'text/plain': 'TXT',
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
  'image/gif': 'GIF',
  'image/webp': 'WEBP',
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function MaterialsTab({ materials, onRefresh }: { materials: Material[]; onRefresh: () => void }) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const resetUpload = () => {
    setUploadTitle('');
    setUploadDesc('');
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadTitle.trim()) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', selectedFile);
      fd.append('title', uploadTitle.trim());
      fd.append('description', uploadDesc.trim());
      await api.uploadMaterial(fd);
      gooeyToast.success('File uploaded');
      resetUpload();
      setUploadOpen(false);
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      gooeyToast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteMaterial(id);
      gooeyToast.success('Deleted');
      onRefresh();
    } catch {
      gooeyToast.error('Failed to delete');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-headline font-semibold text-muted-foreground uppercase tracking-wide">Study Materials</h2>
        <Dialog open={uploadOpen} onOpenChange={open => { setUploadOpen(open); if (!open) resetUpload(); }}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="rounded-full h-8 px-4 border-white/[0.1] hover:bg-white/5">
              <Upload className="w-3.5 h-3.5 mr-1" /> Upload
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-strong border border-white/[0.08]">
            <DialogHeader>
              <DialogTitle className="font-headline flex items-center gap-2">
                <FileUp className="w-4 h-4 text-primary" /> Upload Material
              </DialogTitle>
              <DialogDescription>
                Share notes, PDFs, or presentations with your students.
                Accepted: PDF, PPT/PPTX, DOC/DOCX, TXT, images — max 20 MB.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label>Title <span className="text-red-400">*</span></Label>
                <Input value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} placeholder="e.g. Week 3 Lecture Notes" className="mt-1" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={uploadDesc} onChange={e => setUploadDesc(e.target.value)} placeholder="Optional notes for students" className="mt-1" rows={2} />
              </div>
              <div>
                <Label>File <span className="text-red-400">*</span></Label>
                <div
                  className="mt-1 border-2 border-dashed border-white/[0.12] rounded-xl p-6 text-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <File className="w-8 h-8 text-primary" />
                      <div className="text-left">
                        <p className="text-sm font-medium truncate max-w-[200px]">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">{formatBytes(selectedFile.size)}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Click to choose a file</p>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  aria-label="Upload material file"
                  className="hidden"
                  accept=".pdf,.ppt,.pptx,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.webp"
                  onChange={e => setSelectedFile(e.target.files?.[0] ?? null)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleUpload}
                disabled={uploading || !selectedFile || !uploadTitle.trim()}
                className="bg-primary hover:bg-primary/90 rounded-full"
              >
                {uploading && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                Upload
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {materials.length === 0 ? (
        <EmptyState icon={<FileUp />} text="No materials uploaded yet. Share notes or presentations with your students!" />
      ) : (
        <div className="space-y-3">
          {materials.map(m => (
            <Card key={m.id} className="glass border border-white/[0.06]">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <File className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold truncate">{m.title}</p>
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {MIME_LABELS[m.file_type] ?? m.file_type.split('/')[1]?.toUpperCase() ?? 'FILE'}
                      </Badge>
                    </div>
                    {m.description && <p className="text-xs text-muted-foreground line-clamp-1 mb-0.5">{m.description}</p>}
                    <p className="text-[11px] text-muted-foreground">{formatBytes(m.file_size)} · {m.file_name}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full hover:bg-red-500/10 text-muted-foreground hover:text-red-400 shrink-0"
                    onClick={() => handleDelete(m.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Students Tab ──────────────────────────────────────────────────────────── */

function StudentsTab({ students }: { students: StudentProfile[] }) {
  const router = useRouter();

  if (students.length === 0) {
    return <EmptyState icon={<Users />} text="No students registered yet." />;
  }

  return (
    <div>
      <h2 className="text-sm font-headline font-semibold text-muted-foreground uppercase tracking-wide mb-4">Registered Students</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {students.map(s => (
          <Card
            key={s.id}
            className="glass border border-white/[0.06] cursor-pointer hover-lift"
            onClick={() => router.push(`/teacher/analytics?studentId=${s.id}`)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{s.full_name || 'Unnamed'}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{s.email}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ── Review Tab ────────────────────────────────────────────────────────────── */

function ReviewTab({ quizzes }: { quizzes: Quiz[] }) {
  const publishedWithSubmissions = quizzes.filter(q => (q.submitted_count ?? 0) > 0);

  if (publishedWithSubmissions.length === 0) {
    return <EmptyState icon={<BarChart3 />} text="No submissions to review yet." />;
  }

  return (
    <div>
      <h2 className="text-sm font-headline font-semibold text-muted-foreground uppercase tracking-wide mb-4">Submissions to Review</h2>
      <div className="space-y-3">
        {publishedWithSubmissions.map(q => (
          <QuizReviewCard key={q.id} quiz={q} />
        ))}
      </div>
    </div>
  );
}

function QuizReviewCard({ quiz }: { quiz: Quiz }) {
  const [assignments, setAssignments] = useState<QuizAssignment[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  const handleExpand = async () => {
    if (expanded) {
      setExpanded(false);
      return;
    }
    setLoadingAssignments(true);
    try {
      const res = await api.getQuiz(quiz.id);
      setAssignments(res.assignments.filter(a => a.status === 'submitted' || a.status === 'reviewed' || a.status === 'flagged'));
      setExpanded(true);
    } catch {
      gooeyToast.error('Failed to load submissions');
    } finally {
      setLoadingAssignments(false);
    }
  };

  return (
    <Card className="glass border border-white/[0.06]">
      <CardContent className="p-0">
        <button onClick={handleExpand} className="w-full p-5 text-left flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-headline font-semibold text-sm truncate">{quiz.title}</h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">{quiz.submitted_count} submission(s)</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {loadingAssignments && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
            <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </div>
        </button>
        {expanded && assignments.length > 0 && (
          <div className="border-t border-white/[0.06] px-5 py-3 space-y-2">
            {assignments.map(a => {
              const riskColor = a.risk_score === null ? 'text-muted-foreground'
                : a.risk_score >= 76 ? 'text-red-400'
                : a.risk_score >= 56 ? 'text-orange-400'
                : a.risk_score >= 26 ? 'text-yellow-400'
                : 'text-green-400';

              const statusBadge = a.status === 'flagged'
                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                : a.status === 'reviewed'
                ? 'bg-primary/10 text-primary border-primary/20'
                : 'bg-green-500/10 text-green-400 border-green-500/20';

              return (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-card/30 border border-white/[0.04]">
                  <div>
                    <p className="text-sm font-medium">{a.student_name || a.student_email || `Student #${a.student_id}`}</p>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                      <Badge className={`text-[10px] border ${statusBadge}`}>{a.status}</Badge>
                      {a.total_score !== null && a.max_score !== null && (
                        <span>Score: {a.total_score}/{a.max_score}</span>
                      )}
                      {a.submitted_at && (
                        <span>{new Date(a.submitted_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {a.risk_score !== null && (
                      <div className="text-right">
                        <span className={`text-lg font-headline font-bold ${riskColor}`}>{a.risk_score}</span>
                        <p className="text-[10px] text-muted-foreground">Risk</p>
                      </div>
                    )}
                    {a.risk_score === null && (
                      <RunAnalysisButton assignmentId={a.id} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RunAnalysisButton({ assignmentId }: { assignmentId: number }) {
  const [running, setRunning] = useState(false);

  const handleRun = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setRunning(true);
    try {
      const res = await api.runAnalysis(assignmentId);
      gooeyToast.success(`Analysis complete — Risk: ${res.risk_score}`);
    } catch {
      gooeyToast.error('Analysis failed');
    } finally {
      setRunning(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleRun} disabled={running} className="h-7 px-3 text-[11px] rounded-full">
      {running ? <Loader2 className="w-3 h-3 animate-spin" /> : <BarChart3 className="w-3 h-3 mr-1" />}
      Analyze
    </Button>
  );
}

/* ── Empty State ───────────────────────────────────────────────────────────── */

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="text-center py-16 text-muted-foreground/60">
      <div className="w-10 h-10 mx-auto mb-3 opacity-30">{icon}</div>
      <p className="text-sm">{text}</p>
    </div>
  );
}