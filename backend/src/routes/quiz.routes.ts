// ═══════════════════════════════════════════════════════════════════════════════
// Quiz Routes — Express router for quiz CRUD + assignment
// ═══════════════════════════════════════════════════════════════════════════════

import { Router } from 'express';
import { requireAuth, requireTeacher } from '../Middleware/auth';
import {
  listQuizzes,
  createQuiz,
  getQuiz,
  updateQuiz,
  deleteQuiz,
  assignQuiz,
} from '../Controllers/quiz.controller';

export const quizRoutes = Router();

// All quiz routes require authentication
quizRoutes.use(requireAuth);

// GET    /api/quizzes          → list teacher's quizzes
// POST   /api/quizzes          → create quiz with questions
quizRoutes.get('/', listQuizzes);
quizRoutes.post('/', createQuiz);

// GET    /api/quizzes/:id      → get quiz details
// PATCH  /api/quizzes/:id      → update quiz
// DELETE /api/quizzes/:id      → delete quiz
quizRoutes.get('/:id', getQuiz);
quizRoutes.patch('/:id', updateQuiz);
quizRoutes.delete('/:id', deleteQuiz);

// POST   /api/quizzes/:id/assign → assign quiz to students
quizRoutes.post('/:id/assign', requireTeacher, assignQuiz);
