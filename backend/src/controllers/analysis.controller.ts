// ═══════════════════════════════════════════════════════════════════════════════
// Analysis Controller — Runs risk analysis on submissions
// ═══════════════════════════════════════════════════════════════════════════════

import { Request, Response } from 'express';
import { AnalysisModel } from '../models/analysis.model';
import { AssignmentModel } from '../models/assignment.model';

const analysisModel = new AnalysisModel();
const assignmentModel = new AssignmentModel();

// ─── POST /api/analysis/run ── Run full risk analysis ─────────────────────

export async function runAnalysis(req: Request, res: Response): Promise<void> {
  try {
    const { quiz_assignment_id } = req.body;

    if (!quiz_assignment_id) {
      res.status(400).json({ error: 'quiz_assignment_id required' });
      return;
    }

    // 1. Get assignment + student
    const assignment = await analysisModel.getAssignmentWithStudent(quiz_assignment_id);

    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }

    const studentId = assignment.student_id;

    // 2. Get baseline fingerprint
    const baseline = await analysisModel.getBaselineFingerprint(studentId);

    // 3. Get latest keystroke log
    const keystrokeLog = await analysisModel.getLatestKeystrokeLog(quiz_assignment_id);

    // 4. Get window change logs
    const windowLogs = await analysisModel.getWindowChangeLogs(quiz_assignment_id);

    // 5. Compute risk score
    const flags: any[] = [];
    let riskScore = 0;

    if (keystrokeLog && baseline) {
      // Compare metrics against baseline
      const metrics = ['wpm', 'burst_score', 'avg_latency', 'peak_wpm'];

      for (const metric of metrics) {
        const current = keystrokeLog[metric] || 0;
        const base = baseline[metric] || 0;

        if (base > 0) {
          const deviation = Math.abs(current - base) / base;
          if (deviation > 0.5) {
            riskScore += 15;
            flags.push({
              type: 'metric_deviation',
              metric,
              current,
              baseline: base,
              deviation: Math.round(deviation * 100),
            });
          }
        }
      }
    }

    // Window change penalty
    const blurCount = windowLogs.filter((l: any) => l.event_type === 'blur').length;
    if (blurCount > 3) {
      riskScore += Math.min(blurCount * 5, 30);
      flags.push({
        type: 'excessive_window_changes',
        blur_count: blurCount,
      });
    }

    // Paste detection penalty
    if (keystrokeLog?.paste_chars > 100) {
      riskScore += 20;
      flags.push({
        type: 'excessive_paste',
        paste_chars: keystrokeLog.paste_chars,
        paste_events: keystrokeLog.paste_events,
      });
    }

    // Burst anomaly
    if (keystrokeLog?.burst_score > 0.8) {
      riskScore += 10;
      flags.push({
        type: 'burst_anomaly',
        burst_score: keystrokeLog.burst_score,
      });
    }

    riskScore = Math.min(riskScore, 100);

    // 6. Save analysis result
    const result = await analysisModel.saveResult({
      quiz_assignment_id,
      student_id: studentId,
      risk_score: riskScore,
      flags,
      metrics: {
        wpm: keystrokeLog?.wpm || 0,
        burst_score: keystrokeLog?.burst_score || 0,
        avg_latency: keystrokeLog?.avg_latency || 0,
        peak_wpm: keystrokeLog?.peak_wpm || 0,
        paste_chars: keystrokeLog?.paste_chars || 0,
        window_changes: blurCount,
      },
    });

    // 7. Update assignment risk score
    await assignmentModel.updateRiskScore(quiz_assignment_id, riskScore);

    res.json({ analysis: result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
