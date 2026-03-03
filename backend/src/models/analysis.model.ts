// ═══════════════════════════════════════════════════════════════════════════════
// Analysis Model — Supabase queries for fingerprints and analysis results
// ═══════════════════════════════════════════════════════════════════════════════

import { getServiceClient } from '../config/supabase';

export class AnalysisModel {
  private supabase = getServiceClient();

  /** Get student's baseline fingerprint */
  async getBaselineFingerprint(studentId: string) {
    const { data, error } = await this.supabase
      .from('fingerprints')
      .select('*')
      .eq('student_id', studentId)
      .eq('is_baseline', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /** Save analysis result */
  async saveResult(result: {
    quiz_assignment_id: string;
    student_id: string;
    risk_score: number;
    flags: any[];
    metrics: Record<string, any>;
    ai_explanation?: string | null;
  }) {
    const { data, error } = await this.supabase
      .from('analysis_results')
      .insert(result)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /** Get keystroke logs for an assignment (latest) */
  async getLatestKeystrokeLog(assignmentId: string) {
    const { data, error } = await this.supabase
      .from('keystroke_logs')
      .select('*')
      .eq('quiz_assignment_id', assignmentId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /** Get window change logs for an assignment */
  async getWindowChangeLogs(assignmentId: string) {
    const { data, error } = await this.supabase
      .from('window_change_logs')
      .select('*')
      .eq('quiz_assignment_id', assignmentId);

    if (error) throw error;
    return data || [];
  }

  /** Get assignment with student info */
  async getAssignmentWithStudent(assignmentId: string) {
    const { data, error } = await this.supabase
      .from('quiz_assignments')
      .select('*, profiles:student_id(id, email, full_name)')
      .eq('id', assignmentId)
      .single();

    if (error) throw error;
    return data;
  }
}
