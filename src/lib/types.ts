export type SupabaseProfile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'teacher' | 'student';
  baseline_fingerprint: Record<string, number> | null;
  baseline_sample_count: number;
  email_verified: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Quiz = {
  id: string;
  teacher_id: string;
  title: string;
  description: string;
  type: 'essay' | 'multiple_choice' | 'mixed';
  status: 'draft' | 'published' | 'closed';
  time_limit_mins: number | null;
  due_date: string | null;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type QuizQuestion = {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: 'essay' | 'multiple_choice';
  options: string[] | null;
  correct_answer: string | null;
  points: number;
  sort_order: number;
  created_at: string;
};

export type QuizAssignment = {
  id: string;
  quiz_id: string;
  student_id: string;
  teacher_id: string;
  status: 'assigned' | 'in_progress' | 'submitted' | 'reviewed' | 'flagged';
  risk_score: number | null;
  total_score: number | null;
  max_score: number | null;
  started_at: string | null;
  submitted_at: string | null;
  session_id: string | null;
  window_changes: number;
  created_at: string;
  updated_at: string;
};

export type QuizResponse = {
  id: string;
  quiz_assignment_id: string;
  question_id: string;
  answer_text: string;
  selected_option: string | null;
  is_correct: boolean | null;
  score: number | null;
  created_at: string;
  updated_at: string;
};

export type WindowChangeLog = {
  id: string;
  quiz_assignment_id: string;
  session_id: string;
  event_type: 'blur' | 'focus';
  timestamp: string;
  away_duration_ms: number | null;
  created_at: string;
};

export type SessionReplay = {
  id: string;
  quiz_assignment_id: string;
  session_id: string;
  question_id: string | null;
  replay_events: ReplayEvent[];
  text_snapshots: TextSnapshot[];
  duration_ms: number;
  total_events: number;
  created_at: string;
};

export type ReplayEvent = {
  timestamp: number;
  type: 'keystroke' | 'paste' | 'delete' | 'snapshot' | 'cursor_move' | 'window_change';
  data: Record<string, unknown>;
};

export type TextSnapshot = {
  timestamp: number;
  text: string;
};
