// ═══════════════════════════════════════════════════════════════════════════════
// Analysis Routes — Express router for risk analysis
// ═══════════════════════════════════════════════════════════════════════════════

import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { runAnalysis } from '../controllers/analysis.controller';

export const analysisRoutes = Router();

// POST /api/analysis/run → run full risk analysis pipeline
analysisRoutes.post('/run', requireAuth, runAnalysis);
