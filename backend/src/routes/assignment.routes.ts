import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  listAssignments,
  getAssignment,
  updateAssignment,
  getAssignmentReplays,
} from '../controllers/assignment.controller';

export const assignmentRoutes = Router();

assignmentRoutes.use(requireAuth);

// GET  /api/quiz-assignments         — list own assignments (teacher or student)
assignmentRoutes.get('/', listAssignments);

// GET  /api/quiz-assignments/:id     — get single assignment
assignmentRoutes.get('/:id', getAssignment);

// PATCH /api/quiz-assignments/:id    — update assignment status/session
assignmentRoutes.patch('/:id', updateAssignment);

// GET  /api/quiz-assignments/:id/replays — get replays for an assignment
assignmentRoutes.get('/:id/replays', getAssignmentReplays);
