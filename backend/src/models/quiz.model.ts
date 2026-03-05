import { JsonStore } from '../lib/json-store';

type QuizRecord = {
  id: number;
  teacher_id: string;
  title: string;
  description: string;
  type: 'essay' | 'multiple_choice' | 'mixed';
  status: string;
  time_limit_mins: number | null;
  due_date: string | null;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

type QuestionRecord = {
  id: number;
  quiz_id: number;
  question_text: string;
  question_type: 'essay' | 'multiple_choice';
  options: string[] | null;
  correct_answer: string | null;
  points: number;
  sort_order: number;
  created_at: string;
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
  session_id: string | null;
  window_changes: number;
  created_at: string;
  updated_at: string;
};

export interface QuizInput {
  title: string;
  description?: string;
  teacher_id: string;
  type: 'essay' | 'multiple_choice' | 'mixed';
  time_limit_mins?: number | null;
  status?: string;
  due_date?: string | null;
}

export interface QuestionInput {
  quiz_id: number;
  question_text: string;
  question_type: 'essay' | 'multiple_choice';
  options?: string[] | null;
  correct_answer?: string | null;
  points: number;
  sort_order: number;
}

const quizzes = new JsonStore<QuizRecord>('quizzes.json');
const questions = new JsonStore<QuestionRecord>('quiz_questions.json');
const assignments = new JsonStore<AssignmentRecord>('quiz_assignments.json');

export class QuizModel {
  async listByTeacher(teacherId: string) {
    const teacherQuizzes = quizzes.query()
      .eq('teacher_id', teacherId)
      .order('created_at', false)
      .results();

    return teacherQuizzes.map(q => ({
      ...q,
      quiz_questions: [{ count: questions.count({ quiz_id: q.id } as any) }],
      quiz_assignments: [{ count: assignments.count({ quiz_id: q.id } as any) }],
    }));
  }

  async getById(quizId: string) {
    const quiz = quizzes.findOne({ id: Number(quizId) } as any);
    if (!quiz) return null;

    const profileStore = new JsonStore<any>('profiles.json', { useUuid: true });
    const quizQuestions = questions.find({ quiz_id: quiz.id } as any);
    const quizAssignments = assignments.find({ quiz_id: quiz.id } as any);

    const enrichedAssignments = quizAssignments.map(a => {
      const profile = profileStore.findOne({ id: a.student_id } as any);
      return {
        ...a,
        profiles: profile
          ? { id: profile.id, email: profile.email, full_name: profile.full_name, avatar_url: profile.avatar_url }
          : null,
      };
    });

    return {
      ...quiz,
      quiz_questions: quizQuestions,
      quiz_assignments: enrichedAssignments,
    };
  }

  async create(input: QuizInput) {
    return quizzes.insert({
      teacher_id: input.teacher_id,
      title: input.title,
      description: input.description || '',
      type: input.type,
      status: input.status || 'draft',
      time_limit_mins: input.time_limit_mins ?? null,
      due_date: input.due_date ?? null,
      settings: {},
    } as any);
  }

  async update(quizId: string, teacherId: string, updates: Partial<QuizInput>) {
    const results = quizzes.update(
      { id: Number(quizId), teacher_id: teacherId } as any,
      updates as any
    );
    return results[0] || null;
  }

  async delete(quizId: string, teacherId: string) {
    questions.delete({ quiz_id: Number(quizId) } as any);
    assignments.delete({ quiz_id: Number(quizId) } as any);
    quizzes.delete({ id: Number(quizId), teacher_id: teacherId } as any);
  }

  async insertQuestions(qs: QuestionInput[]) {
    return questions.insertMany(qs as any);
  }

  async updateStatus(quizId: string, status: string) {
    quizzes.update({ id: Number(quizId) } as any, { status } as any);
  }
}

export { quizzes as quizzesStore, questions as questionsStore, assignments as assignmentsStore };
