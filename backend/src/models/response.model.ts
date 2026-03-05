import { JsonStore } from '../lib/json-store';

type QuestionRecord = {
  id: number;
  quiz_id: number;
  question_type: string;
  correct_answer: string | null;
  points: number;
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
