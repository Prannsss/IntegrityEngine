// ═══════════════════════════════════════════════════════════════════════════════
// Analysis Model — Supabase queries for fingerprints and analysis results
// ═══════════════════════════════════════════════════════════════════════════════

import { getServiceClient } from '../Config/supabase';

export class AnalysisModel {
  private supabase = getServiceClient();

  /** Get student's baseline fingerprint from profile */
  async getBaselineFingerprint(studentId: string) {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('baseline_fingerprint, baseline_sample_count')
      .eq('id', studentId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data?.baseline_fingerprint ? { ...data.baseline_fingerprint, sample_count: data.baseline_sample_count } : null;
  }

  /** Save analysis result */
  async saveResult(result: {
    quiz_assignment_id: string;
    student_id: string;
    risk_score: number;
    confidence: number;
    flags: any[];
    deviation: Record<string, number>;
    z_scores: Record<string, number>;
    explanation: string;
    ai_explanation?: string | null;
    window_change_count?: number;
  }) {
    const { data, error } = await this.supabase
      .from('analysis_results')
      .insert({
        quiz_assignment_id: result.quiz_assignment_id,
        student_id: result.student_id,
        risk_score: result.risk_score,
        confidence: result.confidence,
        flags: result.flags,
        deviation: result.deviation,
        z_scores: result.z_scores,
        explanation: result.explanation,
        ai_explanation: result.ai_explanation || null,
        window_change_count: result.window_change_count || 0,
      })
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
