// ═══════════════════════════════════════════════════════════════════════════════
// Response Controller — Quiz response submission with auto-grading + teacher scoring
// ═══════════════════════════════════════════════════════════════════════════════

import { Request, Response } from 'express';
import { ResponseModel } from '../models/response.model';
import { AssignmentModel } from '../models/assignment.model';
import { JsonStore } from '../lib/json-store';

const responseModel = new ResponseModel();
const assignmentModel = new AssignmentModel();

type QuizRecord = { id: number; due_date: string | null; [k: string]: any };
const quizzesStore = new JsonStore<QuizRecord>('quizzes.json');

// ─── POST /api/quiz-responses/submit ── Submit quiz answers ───────────────

export async function submitResponses(req: Request, res: Response): Promise<void> {
  try {
    const { quiz_assignment_id, responses } = req.body as {
      quiz_assignment_id: string;
      responses: { question_id: string; answer_text?: string; selected_option?: string }[];
    };

    if (!quiz_assignment_id || !responses?.length) {
      res.status(400).json({ error: 'quiz_assignment_id and responses required' });
      return;
    }

    const qa = await assignmentModel.getByIdAndStudent(quiz_assignment_id, req.user!.id);
    if (!qa) {
      res.status(404).json({ error: 'Assignment not found or does not belong to you' });
      return;
    }

    // Deadline enforcement
    const quiz = quizzesStore.findOne({ id: qa.quiz_id } as any);
    if (quiz?.due_date && new Date() > new Date(quiz.due_date)) {
      res.status(403).json({ error: 'This quiz is past its deadline and can no longer be submitted.' });
      return;
    }

    const questionIds = responses.map(r => r.question_id);
    const questions = await responseModel.getQuestionsByIds(questionIds);
    const questionMap = new Map(questions.map(q => [q.id, q]));

    let totalScore = 0;
    let maxScore = 0;

    const responseRecords = responses.map(r => {
      const q = questionMap.get(Number(r.question_id));
      const isCorrect = q?.question_type === 'multiple_choice' && q.correct_answer
        ? r.selected_option === q.correct_answer
        : null;
      const score = isCorrect ? (q?.points || 1) : (isCorrect === false ? 0 : null);

      if (score !== null) totalScore += score;
      maxScore += q?.points || 1;

      return {
        quiz_assignment_id,
        question_id: r.question_id,
        answer_text: r.answer_text || '',
        selected_option: r.selected_option || null,
        is_correct: isCorrect,
        score,
      };
    });

    await responseModel.upsertResponses(responseRecords);
    await assignmentModel.updateSubmission(quiz_assignment_id, totalScore, maxScore);

    res.json({
      success: true,
      total_score: totalScore,
      max_score: maxScore,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// ─── GET /api/quiz-responses ── List responses for an assignment ──────────

export async function listResponses(req: Request, res: Response): Promise<void> {
  try {
    const qaId = req.query.quiz_assignment_id as string;
    if (!qaId) {
      res.status(400).json({ error: 'quiz_assignment_id query parameter required' });
      return;
    }

    const assignment = await assignmentModel.getById(qaId);
    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }

    if (req.user!.role === 'teacher' && assignment.teacher_id !== req.user!.id) {
      res.status(403).json({ error: 'Not your assignment' });
      return;
    }
    if (req.user!.role === 'student' && assignment.student_id !== req.user!.id) {
      res.status(403).json({ error: 'Not your assignment' });
      return;
    }

    const responsesData = await responseModel.getResponsesByAssignment(qaId);
    res.json({ responses: responsesData });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// ─── PATCH /api/quiz-responses/:id/score ── Teacher scores a response ─────

export async function scoreResponse(req: Request, res: Response): Promise<void> {
  try {
    if (req.user!.role !== 'teacher') {
      res.status(403).json({ error: 'Only teachers can score responses' });
      return;
    }

    const { score } = req.body as { score: number };
    if (score === undefined || score === null || score < 0) {
      res.status(400).json({ error: 'Valid score (>= 0) required' });
      return;
    }

    const responseId = req.params.id as string;
    const resp = await responseModel.getResponseById(responseId);
    if (!resp) {
      res.status(404).json({ error: 'Response not found' });
      return;
    }

    const assignment = await assignmentModel.getById(String(resp.quiz_assignment_id));
    if (!assignment || assignment.teacher_id !== req.user!.id) {
      res.status(403).json({ error: 'Not your assignment' });
      return;
    }

    await responseModel.updateScore(responseId, score);

    const { totalScore, maxScore, allScored } = await responseModel.recalcAssignmentScore(resp.quiz_assignment_id);
    await assignmentModel.updateScoreAndStatus(
      String(resp.quiz_assignment_id),
      totalScore,
      maxScore,
      allScored ? 'reviewed' : undefined
    );

    res.json({
      success: true,
      total_score: totalScore,
      max_score: maxScore,
      all_scored: allScored,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
