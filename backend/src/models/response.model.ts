import { JsonStore } from '../lib/json-store';

type QuestionRecord = {
  id: number;
  quiz_id: number;
  question_text: string;
  question_type: string;
  options: string[] | null;
  correct_answer: string | null;
  points: number;
  sort_order: number;
};

type ResponseRecord = {
  id: number;
  quiz_assignment_id: number;
  question_id: number;
  answer_text: string;
  selected_option: string | null;
  is_correct: boolean | null;
  score: number | null;
  created_at: string;
  updated_at: string;
};

const questions = new JsonStore<QuestionRecord>('quiz_questions.json');
const responses = new JsonStore<ResponseRecord>('quiz_responses.json');

export class ResponseModel {
  async getQuestionsByIds(questionIds: string[]) {
    return questions.findIn('id', questionIds.map(Number)).map(q => ({
      id: q.id,
      question_type: q.question_type,
      correct_answer: q.correct_answer,
      points: q.points,
    }));
  }

  async getResponsesByAssignment(qaId: string) {
    const resps = responses.find({ quiz_assignment_id: Number(qaId) } as any);
    const questionIds = resps.map(r => r.question_id);
    const qs = questions.findIn('id', questionIds);
    const qMap = new Map(qs.map(q => [q.id, q]));

    return resps
      .map(r => {
        const q = qMap.get(r.question_id);
        return {
          id: r.id,
          question_id: r.question_id,
          question_text: q?.question_text || '',
          question_type: q?.question_type || 'essay',
          options: q?.options || null,
          correct_answer: q?.correct_answer || null,
          points: q?.points || 1,
          sort_order: q?.sort_order ?? 0,
          answer_text: r.answer_text,
          selected_option: r.selected_option,
          is_correct: r.is_correct,
          score: r.score,
        };
      })
      .sort((a, b) => a.sort_order - b.sort_order);
  }

  async getResponseById(responseId: string) {
    return responses.findOne({ id: Number(responseId) } as any);
  }

  async updateScore(responseId: string, score: number) {
    const updated = responses.update(
      { id: Number(responseId) } as any,
      { score, is_correct: score > 0 } as any
    );
    return updated[0] || null;
  }

  async recalcAssignmentScore(qaId: number) {
    const resps = responses.find({ quiz_assignment_id: qaId } as any);
    const questionIds = resps.map(r => r.question_id);
    const qs = questions.findIn('id', questionIds);
    const qMap = new Map(qs.map(q => [q.id, q]));

    let totalScore = 0;
    let maxScore = 0;
    let allScored = true;

    for (const r of resps) {
      const q = qMap.get(r.question_id);
      maxScore += q?.points || 1;
      if (r.score !== null) {
        totalScore += r.score;
      } else {
        allScored = false;
      }
    }

    return { totalScore, maxScore, allScored };
  }

  async upsertResponses(records: {
    quiz_assignment_id: string;
    question_id: string;
    answer_text: string;
    selected_option: string | null;
    is_correct: boolean | null;
    score: number | null;
  }[]) {
    for (const r of records) {
      responses.upsert(
        {
          quiz_assignment_id: Number(r.quiz_assignment_id),
          question_id: Number(r.question_id),
          answer_text: r.answer_text,
          selected_option: r.selected_option,
          is_correct: r.is_correct,
          score: r.score,
        } as any,
        ['quiz_assignment_id', 'question_id']
      );
    }
  }
}
