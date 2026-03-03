// ═══════════════════════════════════════════════════════════════════════════════
// Response Routes — Express router for quiz response submission
// ═══════════════════════════════════════════════════════════════════════════════

import { Router } from 'express';
import { optionalAuth } from '../middleware/auth';
import { submitResponses } from '../controllers/response.controller';

export const responseRoutes = Router();

// POST /api/quiz-responses/submit → submit quiz answers with auto-grading
responseRoutes.post('/submit', optionalAuth, submitResponses);
