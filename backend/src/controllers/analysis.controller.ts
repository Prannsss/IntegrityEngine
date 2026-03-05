// ═══════════════════════════════════════════════════════════════════════════════
// Analysis Controller — Runs risk analysis on submissions
// ═══════════════════════════════════════════════════════════════════════════════

import { Request, Response } from 'express';
import { AnalysisModel } from '../Models/analysis.model';
import { AssignmentModel } from '../Models/assignment.model';

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
    const deviation: Record<string, number> = {};
    const zScores: Record<string, number> = {};
    let riskScore = 0;

    if (keystrokeLog && baseline) {
      // Compare metrics against baseline
      const metrics = ['wpm', 'burst_score', 'avg_latency', 'peak_wpm'];

      for (const metric of metrics) {
        const current = keystrokeLog[metric] || 0;
        const base = baseline[metric] || 0;

        if (base > 0) {
          const dev = Math.abs(current - base) / base;
          deviation[metric] = Math.round(dev * 100);
          // Approximate z-score (deviation / expected std ~0.25)
          zScores[metric] = Math.round((dev / 0.25) * 100) / 100;

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

    // Compute confidence based on amount of data
    const sampleCount = baseline?.sample_count || 0;
    const confidence = Math.min(0.5 + (sampleCount * 0.1), 0.95);

    // Build explanation
    const explanationParts: string[] = [];
    if (flags.length === 0) {
      explanationParts.push('No anomalies detected.');
    } else {
      for (const f of flags) {
        if (f.type === 'metric_deviation') explanationParts.push(`${f.metric} deviated ${f.deviation}% from baseline.`);
        if (f.type === 'excessive_window_changes') explanationParts.push(`${f.blur_count} window switches detected.`);
        if (f.type === 'excessive_paste') explanationParts.push(`Large paste detected: ${f.paste_chars} chars.`);
        if (f.type === 'burst_anomaly') explanationParts.push(`Burst score anomaly: ${f.burst_score}.`);
      }
    }
    const explanation = explanationParts.join(' ');

    // 6. Save analysis result
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
