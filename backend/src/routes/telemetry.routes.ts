// ═══════════════════════════════════════════════════════════════════════════════
// Telemetry Routes — Express router for heartbeat, window changes, replays
// ═══════════════════════════════════════════════════════════════════════════════

import { Router } from 'express';
import { optionalAuth } from '../middleware/auth';
import {
  postHeartbeat,
  postWindowChange,
  getWindowChanges,
  postReplay,
  getReplays,
} from '../controllers/telemetry.controller';

export const telemetryRoutes = Router();

// Telemetry routes use optional auth (student pages may not always pass token)
telemetryRoutes.use(optionalAuth);

// POST /api/telemetry/heartbeat       → record keystroke heartbeat
telemetryRoutes.post('/heartbeat', postHeartbeat);

// POST /api/telemetry/window-change   → record blur/focus event
// GET  /api/telemetry/window-change   → list window changes
telemetryRoutes.post('/window-change', postWindowChange);
telemetryRoutes.get('/window-change', getWindowChanges);

// POST /api/telemetry/replay          → save replay data
// GET  /api/telemetry/replay          → fetch replays
telemetryRoutes.post('/replay', postReplay);
telemetryRoutes.get('/replay', getReplays);
