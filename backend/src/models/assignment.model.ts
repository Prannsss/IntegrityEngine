// ═══════════════════════════════════════════════════════════════════════════════
// Assignment Model — Supabase queries for quiz assignments
// ═══════════════════════════════════════════════════════════════════════════════

import { getServiceClient } from '../Config/supabase';

export class AssignmentModel {
  private supabase = getServiceClient();

  /** Assign a quiz to multiple students */
  async assignToStudents(quizId: string, studentIds: string[]) {
    const records = studentIds.map(sid => ({
      quiz_id: quizId,
      student_id: sid,
      status: 'assigned',
    }));

    const { data, error } = await this.supabase
      .from('quiz_assignments')
      .insert(records)
      .select();

    if (error) throw error;
    return data;
  }

  /** Get assignment by ID with quiz info */
  async getById(assignmentId: string) {
    const { data, error } = await this.supabase
      .from('quiz_assignments')
      .select('*, quizzes(*)')
      .eq('id', assignmentId)
      .single();

    if (error) throw error;
    return data;
  }

  /** Get assignment for a specific student */
  async getByIdAndStudent(assignmentId: string, studentId: string) {
    const { data, error } = await this.supabase
      .from('quiz_assignments')
      .select('id, quiz_id, student_id')
      .eq('id', assignmentId)
      .eq('student_id', studentId)
      .single();

    if (error) throw error;
    return data;
  }

  /** Update assignment status and scores */
  async updateSubmission(assignmentId: string, totalScore: number, maxScore: number) {
    const { error } = await this.supabase
      .from('quiz_assignments')
      .update({
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        total_score: totalScore,
        max_score: maxScore,
      })
      .eq('id', assignmentId);

    if (error) throw error;
  }

  /** Update risk score on an assignment */
  async updateRiskScore(assignmentId: string, riskScore: number) {
    const { error } = await this.supabase
      .from('quiz_assignments')
      .update({ risk_score: riskScore })
      .eq('id', assignmentId);

    if (error) throw error;
  }

  /** Get quiz info for assigned students (for email notifications) */
  async getQuizWithStudents(quizId: string, studentIds: string[]) {
    const { data: quiz } = await this.supabase
      .from('quizzes')
      .select('title, due_date')
      .eq('id', quizId)
      .single();

    const { data: students } = await this.supabase
      .from('profiles')
      .select('id, email, full_name')
      .in('id', studentIds);

    return { quiz, students };
  }
}
