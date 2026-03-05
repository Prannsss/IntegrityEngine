// ═══════════════════════════════════════════════════════════════════════════════
// Quiz Controller — Handles quiz CRUD operations
// ═══════════════════════════════════════════════════════════════════════════════

import { Request, Response } from 'express';
import { QuizModel } from '../models/quiz.model';
import { AssignmentModel } from '../models/assignment.model';
import { EmailService } from '../services/email.service';

const quizModel = new QuizModel();
const assignmentModel = new AssignmentModel();
const emailService = new EmailService();

// ─── GET /api/quizzes ── List quizzes for authenticated teacher ───────────

export async function listQuizzes(req: Request, res: Response): Promise<void> {
  try {
    const data = await quizModel.listByTeacher(req.user!.id);
    res.json({ quizzes: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// ─── POST /api/quizzes ── Create a new quiz with questions ────────────────

export async function createQuiz(req: Request, res: Response): Promise<void> {
  try {
    const { title, description, type, time_limit_mins, status, due_date, questions } = req.body;

    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    const quiz = await quizModel.create({
      title,
      description: description || '',
      teacher_id: req.user!.id,
      type: type || 'mixed',
      time_limit_mins: time_limit_mins ?? null,
      status: status || 'draft',
      due_date: due_date || null,
    });

    if (questions?.length) {
      const questionRecords = questions.map((q: any, idx: number) => ({
        quiz_id: quiz.id,
        question_text: q.question_text,
        question_type: q.question_type || 'essay',
        options: q.options || null,
        correct_answer: q.correct_answer || null,
        points: q.points || 1,
        sort_order: q.sort_order ?? idx,
      }));

      await quizModel.insertQuestions(questionRecords);
    }

    res.status(201).json({ quiz });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// ─── GET /api/quizzes/:id ── Get quiz with questions and assignments ──────

export async function getQuiz(req: Request, res: Response): Promise<void> {
  try {
    const quiz = await quizModel.getById(req.params.id as string);

    if (!quiz) {
      res.status(404).json({ error: 'Quiz not found' });
      return;
    }

    res.json({ quiz });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// ─── PATCH /api/quizzes/:id ── Update quiz ────────────────────────────────

export async function updateQuiz(req: Request, res: Response): Promise<void> {
  try {
    const quiz = await quizModel.update(req.params.id as string, req.user!.id, req.body);
    res.json({ quiz });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// ─── DELETE /api/quizzes/:id ── Delete quiz ───────────────────────────────

export async function deleteQuiz(req: Request, res: Response): Promise<void> {
  try {
    await quizModel.delete(req.params.id as string, req.user!.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// ─── POST /api/quizzes/:id/assign ── Assign quiz to students ─────────────

export async function assignQuiz(req: Request, res: Response): Promise<void> {
  try {
    const { student_ids } = req.body;
    const quizId = req.params.id as string;

    if (!student_ids?.length) {
      res.status(400).json({ error: 'student_ids array required' });
      return;
    }

    const assignments = await assignmentModel.assignToStudents(quizId, student_ids, req.user!.id);

    // Auto-publish draft quizzes
    await quizModel.updateStatus(quizId, 'published');

    // Send email notifications (fire-and-forget)
    const { quiz, students } = await assignmentModel.getQuizWithStudents(quizId, student_ids);
    if (quiz && students) {
      for (const student of students) {
        emailService.sendQuizAssignedEmail(
          student.email,
          student.full_name || 'Student',
          quiz.title,
          quiz.due_date
        ).catch(console.error);
      }
    }

    res.status(201).json({ assignments });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
