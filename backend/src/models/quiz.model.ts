// ═══════════════════════════════════════════════════════════════════════════════
// Quiz Model — Supabase queries for quizzes and questions
// ═══════════════════════════════════════════════════════════════════════════════

import { getServiceClient } from '../Config/supabase';

export interface QuizInput {
  title: string;
  description?: string;
  teacher_id: string;
  type?: 'essay' | 'multiple_choice' | 'mixed';
  time_limit_mins?: number;
  status?: string;
  due_date?: string;
}

export interface QuestionInput {
  quiz_id: string;
  question_text: string;
  question_type: 'essay' | 'multiple_choice';
  options?: string[];
  correct_answer?: string;
  points: number;
  sort_order: number;
}

export class QuizModel {
  private supabase = getServiceClient();

  /** List quizzes for a teacher, with question and assignment counts */
  async listByTeacher(teacherId: string) {
    const { data, error } = await this.supabase
      .from('quizzes')
      .select(`
        *,
        quiz_questions(count),
        quiz_assignments(count)
      `)
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /** Get a single quiz with nested questions, assignments, and student profiles */
  async getById(quizId: string) {
    const { data, error } = await this.supabase
      .from('quizzes')
      .select(`
        *,
        quiz_questions(*),
        quiz_assignments(
          *,
          profiles:student_id(id, email, full_name, avatar_url)
        )
      `)
      .eq('id', quizId)
      .single();

    if (error) throw error;
    return data;
  }

  /** Create a quiz */
  async create(input: QuizInput) {
    const { data, error } = await this.supabase
      .from('quizzes')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /** Update a quiz */
  async update(quizId: string, teacherId: string, updates: Partial<QuizInput>) {
    const { data, error } = await this.supabase
      .from('quizzes')
      .update(updates)
      .eq('id', quizId)
      .eq('teacher_id', teacherId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /** Delete a quiz (verifies teacher ownership) */
  async delete(quizId: string, teacherId: string) {
    const { error } = await this.supabase
      .from('quizzes')
      .delete()
      .eq('id', quizId)
      .eq('teacher_id', teacherId);

    if (error) throw error;
  }

  /** Insert multiple questions for a quiz */
  async insertQuestions(questions: QuestionInput[]) {
    const { data, error } = await this.supabase
      .from('quiz_questions')
      .insert(questions)
      .select();

    if (error) throw error;
    return data;
  }

  /** Update quiz status (e.g. draft → published) */
  async updateStatus(quizId: string, status: string) {
    const { error } = await this.supabase
      .from('quizzes')
      .update({ status })
      .eq('id', quizId);

    if (error) throw error;
  }
}
