// ═══════════════════════════════════════════════════════════════════════════════
// Response Routes — Express router for quiz response submission
// ═══════════════════════════════════════════════════════════════════════════════

import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { submitResponses } from '../controllers/response.controller';

export const responseRoutes = Router();

// POST /api/quiz-responses/submit — requires authenticated student
responseRoutes.post('/submit', requireAuth, submitResponses);
