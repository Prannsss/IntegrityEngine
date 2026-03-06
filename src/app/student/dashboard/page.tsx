'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api, type StudentAssignment, type Announcement } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { IELogo } from '@/components/ui/ie-logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';
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
  Loader2,
  LogOut,
  Calendar,
  MessageSquare,
  FileText,
  Clock,
  ArrowRight,
  Plus,
  BookOpen,
  HelpCircle,
} from 'lucide-react';
import { gooeyToast } from 'goey-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format, isFuture, isPast, differenceInDays, differenceInHours, formatDistanceToNow } from 'date-fns';

// Helper to get relative deadline
function getDeadlineStatus(dueDate: string | null) {
  if (!dueDate) return null;
  const date = new Date(dueDate);
  if (isPast(date)) return { text: 'OVERDUE', color: 'text-red-600 bg-red-100 dark:bg-red-900/30' };
  
  const hrs = differenceInHours(date, new Date());
  if (hrs < 24) return { text: `STARTS IN ${hrs}H`, color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' };
  
  const days = differenceInDays(date, new Date());
  return { text: `${days} DAYS LEFT`, color: 'text-slate-600 bg-slate-100 dark:bg-slate-800' };
}

export default function StudentDashboard() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [assignments, setAssignments] = useState<StudentAssignment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/auth/login');
    if (!authLoading && user && user.role !== 'student') router.replace('/teacher/dashboard');
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      Promise.all([
        api.myAssignments(),
        api.announcements(),
      ])
        .then(([{ assignments: a }, { announcements: ann }]) => {
          const sorted = [...a].sort((x, y) => {
            if (!x.due_date) return 1;
            if (!y.due_date) return -1;
            return new Date(x.due_date).getTime() - new Date(y.due_date).getTime();
          });
          setAssignments(sorted);
          setAnnouncements(ann);
        })
        .catch(() => gooeyToast.error('Failed to load dashboard data'))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleLogout = () => {
    signOut();
    router.push('/');
  };

  const handleToggleTask = async (id: number, e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      // Only navigate if it's not completed
      const assignment = assignments.find(a => a.id === id);
      if (assignment && ['assigned', 'in_progress'].includes(assignment.status)) {
         router.push(`/student/quiz/${assignment.quiz_id}?qa=${assignment.id}`);
      }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const upcomingAssignments = assignments.filter(a => a.due_date && isFuture(new Date(a.due_date))).slice(0, 3);
  
  // Tasks (all assignments)
  const completedCount = assignments.filter(a => ['submitted', 'reviewed'].includes(a.status)).length;
  const progressPct = assignments.length > 0 ? Math.round((completedCount / assignments.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans text-slate-900 dark:text-slate-100">
      {/* Top Nav (simplified/clean like design might imply, though not pictured) */}
      <div className="sticky top-0 z-50 flex justify-center pt-4 px-4 mb-4">
        <nav className="w-full max-w-6xl px-5 py-2.5 flex items-center justify-between rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/[0.08] shadow-sm">
          <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
            <IELogo className="w-6 h-6" />
            <span className="font-headline text-sm font-semibold tracking-wide">IntegrityEngine</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-muted-foreground mr-2">
              {user?.full_name}
            </span>
            <ThemeToggle />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 px-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/5">
                  <LogOut className="w-4 h-4" />
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

      <main className="max-w-7xl mx-auto px-6 py-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* COLUMN 1: UPCOMING (Timeline) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold font-headline">Upcoming</h2>
              {upcomingAssignments.length > 0 && (
                <span className="text-xs font-semibold text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded-full">
                  {upcomingAssignments.length} NEW
                </span>
              )}
            </div>
            
            <div className="relative border-l-2 border-slate-200 dark:border-zinc-800 ml-4 space-y-8 pb-4">
              {upcomingAssignments.map((assignment, i) => {
                const isFirst = i === 0;
                const status = getDeadlineStatus(assignment.due_date);
                return (
                  <div key={assignment.id} className="relative pl-8">
                    {/* Node Icon */}
                    <div className={`absolute -left-[17px] top-0.5 w-8 h-8 rounded-full border-4 border-slate-50 dark:border-zinc-950 flex items-center justify-center
                      ${isFirst ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400 border-blue-200 dark:border-blue-800' : 'bg-white dark:bg-zinc-800 text-slate-400 dark:text-slate-400 border-slate-200 dark:border-zinc-700'}`}>
                      {assignment.type === 'multiple_choice' ? <BookOpen className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                    </div>
                    
                    <div className="space-y-1 mt-0.5">
                      <h3 className="font-semibold text-sm">{assignment.title}</h3>
                      {assignment.due_date && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Due {format(new Date(assignment.due_date), 'MMM d, hh:mm a')}
                        </p>
                      )}
                      {status && (
                        <div className="mt-2 inline-block">
                           <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 w-fit ${status?.color}`}>
                             {status.text.includes('STARTS') ? <Clock className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                             {status.text}
                           </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {upcomingAssignments.length === 0 && (
                <div className="pl-6 text-sm text-slate-500">No upcoming events.</div>
              )}
            </div>
          </div>

          {/* COLUMN 2: TODAY'S TASKS */}
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <h2 className="text-xl font-bold font-headline mb-1">Today's Tasks</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Focus on these items to stay on track</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-blue-600 dark:text-blue-500">{progressPct}%</span>
                    <Progress value={progressPct} className="w-24 h-2 mt-1" />
                  </div>
                </div>
              </div>
              
              <div className="divide-y divide-slate-100 dark:divide-zinc-800/50">
                {assignments.map((assignment) => {
                  const isCompleted = ['submitted', 'reviewed'].includes(assignment.status);
                  const isClosed = assignment.quiz_status === 'closed';
                  const isAccessible = !isCompleted && !isClosed;
                  
                  return (
                    <div 
                      key={assignment.id} 
                      onClick={() => {
                        if (isAccessible) router.push(`/student/quiz/${assignment.quiz_id}?qa=${assignment.id}`);
                      }}
                      className={`p-5 flex items-start gap-4 transition-colors group ${isAccessible ? 'hover:bg-slate-50 dark:hover:bg-zinc-800/50 cursor-pointer' : 'opacity-60'}`}
                    >
                      <div className="pt-0.5" onClick={(e) => handleToggleTask(assignment.id, e)}>
                         <Checkbox checked={isCompleted} className={isCompleted ? 'data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600' : ''} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold text-sm mb-1 line-clamp-1 ${isCompleted ? 'line-through text-slate-500 dark:text-slate-400' : isClosed ? 'text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'}`}>
                          {assignment.title}
                          {isClosed && <span className="ml-2 text-[10px] font-bold text-red-400 bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded-full">CLOSED</span>}
                        </h3>
                        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                          {assignment.time_limit_mins && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {assignment.time_limit_mins} mins
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5" />
                            {assignment.type === 'multiple_choice' ? 'Quiz' : 'Assignment'}
                          </span>
                          
                          {/* Priority simulated by risk score / arbitrary */}
                          {!isCompleted && assignment.id % 2 === 0 && (
                            <span className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400">
                              ! High Priority
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {assignments.length === 0 && (
                  <div className="p-10 text-center text-slate-400 text-sm">
                    No active tasks right now.
                  </div>
                )}
                
                <div className="p-4 bg-slate-50/50 dark:bg-zinc-900 flex justify-center border-t border-slate-100 dark:border-zinc-800">
                  <Button variant="ghost" className="text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full text-sm h-10 w-full max-w-xs">
                    <Plus className="w-4 h-4 mr-2" />
                    Add a custom task
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 3: ANNOUNCEMENTS */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold font-headline">Announcements</h2>
              <button className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline tracking-wide">
                VIEW ALL
              </button>
            </div>
            
            <div className="space-y-4">
              {announcements.map((ann) => {
                const isUser = ann.type === 'user';
                const initials = ann.author_name
                  .split(' ')
                  .map((w) => w[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase();
                return (
                  <div key={ann.id} className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-slate-200 dark:border-zinc-800 shadow-sm transition-shadow hover:shadow-md">
                    <div className="flex items-center gap-3 mb-3">
                      {isUser && ann.author_avatar ? (
                        <Avatar className="w-8 h-8 rounded-full">
                          <AvatarImage src={ann.author_avatar} alt={ann.author_name} />
                          <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">{initials}</AvatarFallback>
                        </Avatar>
                      ) : isUser ? (
                        <Avatar className="w-8 h-8 rounded-full">
                          <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">{initials}</AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${ann.type === 'alert' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-zinc-800'}`}>
                          {ann.type === 'alert'
                            ? <MessageSquare className="w-4 h-4" />
                            : <BookOpen className="w-4 h-4 text-blue-600" />}
                        </div>
                      )}
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{ann.author_name}</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          {formatDistanceToNow(new Date(ann.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <h3 className="font-semibold text-sm mb-1 text-slate-900 dark:text-slate-100">{ann.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3 line-clamp-2">
                      {ann.content}
                    </p>
                    <button className="text-[10px] font-bold text-blue-600 dark:text-blue-400 tracking-wider hover:underline uppercase">
                      READ MORE
                    </button>
                  </div>
                );
              })}

              {announcements.length === 0 && (
                <div className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No announcements.</div>
              )}

              <div className="bg-[#111625] text-white rounded-3xl p-5 flex items-center justify-between shadow-md cursor-pointer hover:bg-slate-800 transition-colors mt-6 group">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-[10px] text-white/50 font-bold uppercase tracking-wider mb-0.5">Questions?</h4>
                    <p className="text-sm font-semibold">Ask your TA on Discord</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
              </div>
              
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
