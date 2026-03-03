// ═══════════════════════════════════════════════════════════════════════════════
// Response Model — Supabase queries for quiz responses
// ═══════════════════════════════════════════════════════════════════════════════

import { getServiceClient } from '../config/supabase';

export class ResponseModel {
  private supabase = getServiceClient();

  /** Get questions by IDs (for auto-grading) */
  async getQuestionsByIds(questionIds: string[]) {
    const { data, error } = await this.supabase
      .from('quiz_questions')
      .select('id, question_type, correct_answer, points')
      .in('id', questionIds);

    if (error) throw error;
    return data || [];
  }

  /** Upsert quiz responses */
  async upsertResponses(responses: {
    quiz_assignment_id: string;
    question_id: string;
    answer_text: string;
    selected_option: string | null;
    is_correct: boolean | null;
    score: number | null;
  }[]) {
    const { error } = await this.supabase
      .from('quiz_responses')
      .upsert(responses, { onConflict: 'quiz_assignment_id,question_id' });

    if (error) throw error;
  }
}
