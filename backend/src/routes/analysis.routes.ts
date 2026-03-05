// ═══════════════════════════════════════════════════════════════════════════════
// Analysis Routes — Express router for risk analysis
// ═══════════════════════════════════════════════════════════════════════════════

import { Router } from 'express';
import { requireAuth } from '../Middleware/auth';
import { runAnalysis } from '../Controllers/analysis.controller';

export const analysisRoutes = Router();

// POST /api/analysis/run → run full risk analysis pipeline
analysisRoutes.post('/run', requireAuth, runAnalysis);
