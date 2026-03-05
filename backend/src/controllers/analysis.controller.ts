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

    // 2. Get baseline fingerprint from profiles.baseline_fingerprint (JSONB)
    const baseline = await analysisModel.getBaselineFingerprint(studentId);

    // 3. Get latest keystroke log
    const keystrokeLog = await analysisModel.getLatestKeystrokeLog(quiz_assignment_id);

    // 4. Get window change logs
    const windowLogs = await analysisModel.getWindowChangeLogs(quiz_assignment_id);

    // 5. Compute risk score
    const flags: any[] = [];
    const deviation: Record<string, number> = {};
    const zScores: Record<string, number> = {};
    let riskScore = 0;

    const metricKeys = ['wpm', 'burst_score', 'avg_latency', 'peak_wpm'];

    if (keystrokeLog && baseline) {
      for (const metric of metricKeys) {
        const current = (keystrokeLog as Record<string, any>)[metric] || 0;
        const base = baseline[metric] || 0;

        if (base > 0) {
          const dev = Math.abs(current - base) / base;
          deviation[metric] = Math.round(dev * 100);
          zScores[metric] = parseFloat(((current - base) / Math.max(base * 0.2, 1)).toFixed(2));
          if (dev > 0.5) {
            riskScore += 15;
            flags.push({
              type: 'metric_deviation',
              metric,
              current,
              baseline: base,
              deviation: Math.round(dev * 100),
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

    const confidence = baseline ? 0.85 : 0.4;
    const explanation = flags.length
      ? `Detected ${flags.length} anomal${flags.length > 1 ? 'ies' : 'y'}: ${flags.map(f => f.type).join(', ')}`
      : 'No significant anomalies detected.';

    // 6. Save analysis result (matches analysis_results schema)
    const result = await analysisModel.saveResult({
      quiz_assignment_id,
      student_id: studentId,
      risk_score: riskScore,
      confidence,
      flags,
      deviation,
      z_scores: zScores,
      explanation,
      window_change_count: blurCount,
    });

    // 7. Update assignment risk score
    await assignmentModel.updateRiskScore(quiz_assignment_id, riskScore);

    res.json({ analysis: result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
