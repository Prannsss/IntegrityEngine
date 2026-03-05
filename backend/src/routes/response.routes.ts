// ═══════════════════════════════════════════════════════════════════════════════
// Response Routes — Express router for quiz response submission
// ═══════════════════════════════════════════════════════════════════════════════

import { Router } from 'express';
import { optionalAuth } from '../Middleware/auth';
import { submitResponses } from '../Controllers/response.controller';

export const responseRoutes = Router();

// POST /api/quiz-responses/submit → submit quiz answers with auto-grading
responseRoutes.post('/submit', optionalAuth, submitResponses);
