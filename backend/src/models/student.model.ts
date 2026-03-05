import { JsonStore } from '../lib/json-store';

type ProfileRecord = {
  id: string;
  email: string;
  password_hash: string;
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

type AssignmentRecord = {
  id: number;
  quiz_id: number;
  student_id: string;
  teacher_id: string;
  status: string;
  risk_score: number | null;
  total_score: number | null;
  max_score: number | null;
  started_at: string | null;
  submitted_at: string | null;
  window_changes: number;
  created_at: string;
  updated_at: string;
};

type QuizRecord = {
  id: number;
  title: string;
  type: string;
  status: string;
};

const profiles = new JsonStore<ProfileRecord>('profiles.json', { useUuid: true });
const assignments = new JsonStore<AssignmentRecord>('quiz_assignments.json');
const quizzes = new JsonStore<QuizRecord>('quizzes.json');

export class StudentModel {
  async listAll() {
    return profiles.query()
      .eq('role', 'student')
      .order('full_name', true)
      .results()
      .map(({ password_hash, ...rest }) => ({
        id: rest.id,
        email: rest.email,
        full_name: rest.full_name,
        avatar_url: rest.avatar_url,
        baseline_sample_count: rest.baseline_sample_count,
        created_at: rest.created_at,
      }));
  }

  async getRole(userId: string): Promise<string | null> {
    const profile = profiles.findOne({ id: userId } as any);
    return profile?.role || null;
  }

  async getStudentAssignments(studentId: string) {
    const studentAssignments = assignments.query()
      .eq('student_id', studentId)
      .order('created_at', false)
      .results();

    return studentAssignments.map(a => {
      const quiz = quizzes.findOne({ id: a.quiz_id } as any);
      return {
        id: a.id,
        quiz_id: a.quiz_id,
        status: a.status,
        risk_score: a.risk_score,
        total_score: a.total_score,
        max_score: a.max_score,
        window_changes: a.window_changes,
        started_at: a.started_at,
        submitted_at: a.submitted_at,
        created_at: a.created_at,
        quizzes: quiz ? { id: quiz.id, title: quiz.title, type: quiz.type, status: quiz.status } : null,
      };
    });
  }
}
