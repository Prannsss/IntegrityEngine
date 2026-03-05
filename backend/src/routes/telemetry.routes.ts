// ═══════════════════════════════════════════════════════════════════════════════
// Telemetry Routes — Express router for heartbeat, window changes, replays
// ═══════════════════════════════════════════════════════════════════════════════

import { Router } from 'express';
import { requireAuth, requireTeacher } from '../middleware/auth';
import {
  postHeartbeat,
  postWindowChange,
  getWindowChanges,
  postReplay,
  getReplays,
  getKeystrokeLogs,
  getTelemetrySummary,
} from '../controllers/telemetry.controller';

export const telemetryRoutes = Router();

// Student write endpoints — require valid auth + ownership checked in controller
telemetryRoutes.post('/heartbeat', requireAuth, postHeartbeat);
telemetryRoutes.post('/window-change', requireAuth, postWindowChange);
telemetryRoutes.post('/replay', requireAuth, postReplay);

// Teacher read endpoints
telemetryRoutes.get('/window-change', requireAuth, requireTeacher, getWindowChanges);
telemetryRoutes.get('/replay', requireAuth, requireTeacher, getReplays);
telemetryRoutes.get('/keystroke-logs', requireAuth, requireTeacher, getKeystrokeLogs);
telemetryRoutes.get('/summary', requireAuth, requireTeacher, getTelemetrySummary);
