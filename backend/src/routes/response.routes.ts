// ═══════════════════════════════════════════════════════════════════════════════
// Response Routes — Express router for quiz response submission + teacher scoring
// ═══════════════════════════════════════════════════════════════════════════════

import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { submitResponses, listResponses, scoreResponse } from '../controllers/response.controller';

export const responseRoutes = Router();

responseRoutes.post('/submit', requireAuth, submitResponses);
responseRoutes.get('/', requireAuth, listResponses);
responseRoutes.patch('/:id/score', requireAuth, scoreResponse);
