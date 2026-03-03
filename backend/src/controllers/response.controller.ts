// ═══════════════════════════════════════════════════════════════════════════════
// Response Controller — Quiz response submission with auto-grading
// ═══════════════════════════════════════════════════════════════════════════════

import { Request, Response } from 'express';
import { ResponseModel } from '../models/response.model';
import { AssignmentModel } from '../models/assignment.model';

const responseModel = new ResponseModel();
const assignmentModel = new AssignmentModel();

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

    // Verify student owns this assignment
    const userId = req.user?.id;
    if (userId) {
      const qa = await assignmentModel.getByIdAndStudent(quiz_assignment_id, userId);
      if (!qa) {
        res.status(404).json({ error: 'Assignment not found' });
        return;
      }
    }

    // Get correct answers for MCQ auto-grading
    const questionIds = responses.map(r => r.question_id);
    const questions = await responseModel.getQuestionsByIds(questionIds);
    const questionMap = new Map(questions.map(q => [q.id, q]));

    // Prepare response records
    let totalScore = 0;
    let maxScore = 0;

    const responseRecords = responses.map(r => {
      const q = questionMap.get(r.question_id);
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

    // Update assignment status
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
