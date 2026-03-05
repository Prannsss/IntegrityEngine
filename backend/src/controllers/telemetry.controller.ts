// ═══════════════════════════════════════════════════════════════════════════════
// Telemetry Controller — Handles keystroke heartbeat, window changes, replays
// ═══════════════════════════════════════════════════════════════════════════════

import { Request, Response } from 'express';
import { TelemetryModel } from '../models/telemetry.model';
import { AssignmentModel } from '../models/assignment.model';

const telemetryModel = new TelemetryModel();
const assignmentModel = new AssignmentModel();

async function verifyAssignmentOwnership(qaId: string, userId: string): Promise<boolean> {
  try {
    const qa = await assignmentModel.getByIdAndStudent(qaId, userId);
    return !!qa;
  } catch {
    return false;
  }
}

// ─── POST /api/telemetry/heartbeat ── Receive keystroke heartbeat ─────────

export async function postHeartbeat(req: Request, res: Response): Promise<void> {
  try {
    const {
      quiz_assignment_id, session_id, events,
      wpm, burst_score, avg_latency, peak_wpm,
      paste_chars, paste_events, total_keys,
      wpm_history, nonce, signature,
    } = req.body;

    if (!quiz_assignment_id || !session_id) {
      res.status(400).json({ error: 'quiz_assignment_id and session_id required' });
      return;
    }

    const owns = await verifyAssignmentOwnership(quiz_assignment_id, req.user!.id);
    if (!owns) {
      res.status(403).json({ error: 'Assignment does not belong to authenticated user' });
      return;
    }

    const log = await telemetryModel.insertKeystrokeLog({
      quiz_assignment_id, session_id, events,
      wpm, burst_score, avg_latency, peak_wpm,
      paste_chars, paste_events, total_keys,
      wpm_history, nonce, signature,
    });

    res.status(201).json({ log });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// ─── POST /api/telemetry/window-change ── Record blur/focus event ─────────

export async function postWindowChange(req: Request, res: Response): Promise<void> {
  try {
    const { quiz_assignment_id, session_id, event_type, away_duration_ms } = req.body;

    if (!quiz_assignment_id || !session_id || !event_type) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const owns = await verifyAssignmentOwnership(quiz_assignment_id, req.user!.id);
    if (!owns) {
      res.status(403).json({ error: 'Assignment does not belong to authenticated user' });
      return;
    }

    const log = await telemetryModel.insertWindowChange({
      quiz_assignment_id, session_id, event_type, away_duration_ms,
    });

    res.status(201).json({ log });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// ─── GET /api/telemetry/window-change?quiz_assignment_id=X ────────────────

export async function getWindowChanges(req: Request, res: Response): Promise<void> {
  try {
    const qaId = req.query.quiz_assignment_id as string;

    if (!qaId) {
      res.status(400).json({ error: 'quiz_assignment_id required' });
      return;
    }

    const logs = await telemetryModel.getWindowChanges(qaId);
    res.json({ logs });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// ─── POST /api/telemetry/replay ── Save replay data ──────────────────────

export async function postReplay(req: Request, res: Response): Promise<void> {
  try {
    const {
      quiz_assignment_id, session_id, question_id,
      replay_events, text_snapshots, duration_ms, total_events,
    } = req.body;

    if (!quiz_assignment_id || !session_id) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const owns = await verifyAssignmentOwnership(quiz_assignment_id, req.user!.id);
    if (!owns) {
      res.status(403).json({ error: 'Assignment does not belong to authenticated user' });
      return;
    }

    const replay = await telemetryModel.insertReplay({
      quiz_assignment_id, session_id, question_id,
      replay_events, text_snapshots, duration_ms, total_events,
    });

    res.status(201).json({ replay });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// ─── GET /api/telemetry/replay?quiz_assignment_id=X ───────────────────────

export async function getReplays(req: Request, res: Response): Promise<void> {
  try {
    const qaId = req.query.quiz_assignment_id as string;

    if (!qaId) {
      res.status(400).json({ error: 'quiz_assignment_id required' });
      return;
    }

    const replays = await telemetryModel.getReplays(qaId);
    res.json({ replays });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// ─── GET /api/telemetry/keystroke-logs?quiz_assignment_id=X ───────────────

export async function getKeystrokeLogs(req: Request, res: Response): Promise<void> {
  try {
    const qaId = req.query.quiz_assignment_id as string;

    if (!qaId) {
      res.status(400).json({ error: 'quiz_assignment_id required' });
      return;
    }

    const logs = await telemetryModel.getAllKeystrokeLogs(qaId);
    res.json({ logs });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// ─── GET /api/telemetry/summary?quiz_assignment_id=X ──────────────────────

export async function getTelemetrySummary(req: Request, res: Response): Promise<void> {
  try {
    const qaId = req.query.quiz_assignment_id as string;

    if (!qaId) {
      res.status(400).json({ error: 'quiz_assignment_id required' });
      return;
    }

    const summary = await telemetryModel.getTelemetrySummary(qaId);
    res.json({ summary });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
