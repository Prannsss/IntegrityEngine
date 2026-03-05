// ═══════════════════════════════════════════════════════════════════════════════
// Student Model — Supabase queries for student profiles
// ═══════════════════════════════════════════════════════════════════════════════

import { getServiceClient } from '../Config/supabase';

export class StudentModel {
  private supabase = getServiceClient();

  /** List all students (for teacher assignment) */
  async listAll() {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('id, email, full_name, avatar_url, baseline_sample_count, created_at')
      .eq('role', 'student')
      .order('full_name', { ascending: true });

    if (error) throw error;
    return data;
  }

  /** Get assignments for a specific student with quiz info */
  async getAssignments(studentId: string) {
    const { data, error } = await this.supabase
      .from('quiz_assignments')
      .select(`
        id, quiz_id, student_id, status, risk_score, total_score, max_score,
        started_at, submitted_at, session_id, window_changes, created_at, updated_at,
        quizzes(id, title, description, type, status, time_limit_mins, due_date)
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Flatten quiz info into assignment
    return (data || []).map((a: any) => ({
      ...a,
      title: a.quizzes?.title,
      description: a.quizzes?.description,
      type: a.quizzes?.type,
      time_limit_mins: a.quizzes?.time_limit_mins,
      due_date: a.quizzes?.due_date,
      quiz_status: a.quizzes?.status,
      assignment_status: a.status,
      assignment_id: a.id,
      quizzes: undefined,
    }));
  }

  /** Get user role by ID */
  async getRole(userId: string): Promise<string | null> {
    const { data } = await this.supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    return data?.role || null;
  }
}
