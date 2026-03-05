import { Request, Response } from 'express';
import { AssignmentModel } from '../models/assignment.model';
import { TelemetryModel } from '../models/telemetry.model';
import { JsonStore } from '../lib/json-store';

const assignmentModel = new AssignmentModel();
const telemetryModel = new TelemetryModel();

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

type ProfileRecord = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
};

type QuizRecord = {
  id: number;
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

const assignments = new JsonStore<AssignmentRecord>('quiz_assignments.json');
const profiles = new JsonStore<ProfileRecord>('profiles.json', { useUuid: true });
const quizzes = new JsonStore<QuizRecord>('quizzes.json');

/** GET /api/quiz-assignments — list assignments for teacher or student */
export async function listAssignments(req: Request, res: Response): Promise<void> {
  try {
    const user = req.user!;
    let results: AssignmentRecord[];

    if (user.role === 'teacher') {
      results = assignments.query()
        .eq('teacher_id', user.id)
        .order('updated_at', false)
        .results();
    } else {
      results = assignments.query()
        .eq('student_id', user.id)
        .order('created_at', false)
        .results();
    }

    const enriched = results.map(a => {
      const profile = profiles.findOne({ id: a.student_id } as any);
      const quiz = quizzes.findOne({ id: a.quiz_id } as any);
      return {
        ...a,
        profiles: profile
          ? { full_name: profile.full_name, email: profile.email }
          : null,
        quizzes: quiz || null,
      };
    });

    res.json({ assignments: enriched });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

/** GET /api/quiz-assignments/:id */
export async function getAssignment(req: Request, res: Response): Promise<void> {
  try {
    const a = assignments.findOne({ id: Number(req.params.id) } as any);
    if (!a) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }
    res.json({ assignment: a });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

/** PATCH /api/quiz-assignments/:id */
export async function updateAssignment(req: Request, res: Response): Promise<void> {
  try {
    const updates = req.body;

    // Deadline enforcement: block students from starting a quiz past due_date
    if (updates.status === 'in_progress' && req.user?.role === 'student') {
      const assignment = assignments.findOne({ id: Number(req.params.id) } as any);
      if (assignment) {
        const quiz = quizzes.findOne({ id: assignment.quiz_id } as any);
        if (quiz?.due_date && new Date() > new Date(quiz.due_date)) {
          res.status(403).json({ error: 'This quiz is past its deadline.' });
          return;
        }
      }
    }

    const updated = assignments.update({ id: Number(req.params.id) } as any, updates);
    if (updated.length === 0) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }
    res.json({ assignment: updated[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

/** GET /api/quiz-assignments/:id/replays */
export async function getAssignmentReplays(req: Request, res: Response): Promise<void> {
  try {
    const replays = await telemetryModel.getReplays(req.params.id as string);
    res.json({ replays });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
