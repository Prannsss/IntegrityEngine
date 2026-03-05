import { JsonStore } from '../lib/json-store';

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

type QuizRecord = {
  id: number;
  teacher_id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  time_limit_mins: number | null;
  due_date: string | null;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

type ProfileRecord = {
  id: string;
  email: string;
  full_name: string | null;
};

const assignments = new JsonStore<AssignmentRecord>('quiz_assignments.json');
const quizzes = new JsonStore<QuizRecord>('quizzes.json');
const profiles = new JsonStore<ProfileRecord>('profiles.json', { useUuid: true });

export class AssignmentModel {
  async assignToStudents(quizId: string, studentIds: string[], teacherId: string) {
    const records = studentIds.map(sid => ({
      quiz_id: Number(quizId),
      student_id: sid,
      teacher_id: teacherId,
      status: 'assigned',
      risk_score: null,
      total_score: null,
      max_score: null,
      started_at: null,
      submitted_at: null,
      session_id: null,
      window_changes: 0,
    }));

    return assignments.insertMany(records as any);
  }

  async getById(assignmentId: string) {
    const a = assignments.findOne({ id: Number(assignmentId) } as any);
    if (!a) return null;

    const quiz = quizzes.findOne({ id: a.quiz_id } as any);
    return { ...a, quizzes: quiz || null };
  }

  async getByIdAndStudent(assignmentId: string, studentId: string) {
    return assignments.findOne({ id: Number(assignmentId), student_id: studentId } as any);
  }

  async updateSubmission(assignmentId: string, totalScore: number, maxScore: number) {
    assignments.update(
      { id: Number(assignmentId) } as any,
      {
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        total_score: totalScore,
        max_score: maxScore,
      } as any
    );
  }

  async updateScoreAndStatus(assignmentId: string, totalScore: number, maxScore: number, status?: string) {
    const updates: Record<string, any> = { total_score: totalScore, max_score: maxScore };
    if (status) updates.status = status;
    assignments.update({ id: Number(assignmentId) } as any, updates as any);
  }

  async updateRiskScore(assignmentId: string, riskScore: number) {
    assignments.update(
      { id: Number(assignmentId) } as any,
      { risk_score: riskScore } as any
    );
  }

  async getQuizForAssignment(assignmentId: string) {
    const a = assignments.findOne({ id: Number(assignmentId) } as any);
    if (!a) return null;
    return quizzes.findOne({ id: a.quiz_id } as any);
  }

  async getQuizWithStudents(quizId: string, studentIds: string[]) {
    const quiz = quizzes.findOne({ id: Number(quizId) } as any);
    const students = profiles.findIn('id', studentIds);
    return {
      quiz: quiz ? { title: quiz.title, due_date: quiz.due_date } : null,
      students: students.map(s => ({ id: s.id, email: s.email, full_name: s.full_name })),
    };
  }
}
