/**
 * ─── Detection Heuristics Model ─────────────────────────────────────────────
 *
 * Behavioral anomaly scoring formula with weighted components,
 * threshold tuning guidance, and false positive mitigation.
 *
 * This module provides the high-level orchestration layer that combines
 * keystroke dynamics, stylometric analysis, and behavioral signals into
 * a single interpretable risk assessment.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * SCORING FORMULA
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 *   RiskScore = min(100,
 *     W_stylometric × StyleDrift         // Stylometric deviation (0–60)
 *   + W_behavioral  × BehaviorScore      // Paste + WPM anomalies (0–50)
 *   + W_zscore      × ZScoreContribution // Statistical outlier signal (0–20)
 *   - FalsePositiveMitigation            // Reduce score for edge cases
 *   )
 *
 * Where:
 *   StyleDrift      = Weighted sum of % deviations across 5 fingerprint metrics
 *   BehaviorScore   = Σ (flag severity scores) for detected behavioral anomalies
 *   ZScoreContribution = Weighted sum of |Z| for metrics exceeding 1.5σ
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * WEIGHTED SCORING MODEL
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Component               | Weight | Max Contribution | Rationale
 * -------------------------+--------+------------------+--------------------------
 * Burst Score Deviation   | 0.35   | ~21 pts          | Hardest to fake
 * Vocabulary Diversity Δ  | 0.20   | ~12 pts          | Strong AI signal
 * Lexical Density Δ       | 0.18   | ~11 pts          | Writing complexity shift
 * Flesch-Kincaid Δ        | 0.15   | ~9 pts           | Readability shift
 * Avg Sentence Length Δ   | 0.12   | ~7 pts           | Structural change
 * -------------------------+--------+------------------+--------------------------
 * Paste > 100 chars       | +25    | +25 pts          | Direct insertion signal
 * WPM Spike > 200%        | +20    | +20 pts          | Abnormal speed
 * Stylometric Drift > 45% | +15    | +15 pts          | Overall writing change
 * Z-Score > 2.5σ any      | +10    | +20 pts          | Statistical outlier
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * THRESHOLD TUNING GUIDANCE
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Risk Level | Score Range | Action
 * -----------+-------------+--------------------------------------------
 * GREEN      | 0–25        | No action. Normal student behavior.
 * YELLOW     | 26–55       | Review recommended. Possible false positive.
 * ORANGE     | 56–75       | Flag for manual review. Notable deviation.
 * RED        | 76–100      | High confidence anomaly. Requires review.
 *
 * Tuning Tips:
 *   - Start conservative (higher thresholds) and tighten as baseline grows
 *   - Require ≥5 historical submissions before Z-score contributes
 *   - Weight behavioral signals (paste, WPM) more heavily in early assessments
 *   - Consider assignment type: creative writing has higher natural variance
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * FALSE POSITIVE MITIGATION
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Strategy                          | Implementation
 * -----------------------------------+-------------------------------------------
 * Minimum baseline requirement       | No Z-scores until ≥3 historical samples
 * Confidence scaling                 | Score is softened when confidence < 0.6
 * Single-signal dampening            | If only 1 flag, reduce by 10 pts
 * Self-paste detection               | Paste of text matching prior typed content
 *                                    | within same session is not flagged
 * Code/citation exemption            | Paste of < 100 chars OR containing URLs
 *                                    | or code patterns gets reduced severity
 * Time-of-day normalization          | Late-night typing has naturally higher
 *                                    | burst variance (not implemented in MVP)
 */

import { Fingerprint, AnomalyFlag, AnalysisResult, KeystrokeEvent } from '../telemetry/types';
import { compareFingerprints, HistoricalSamples } from './comparison';
import { calculateFingerprint } from './stylometry';

// ─── Risk Level Classification ──────────────────────────────────────────────

export type RiskLevel = 'green' | 'yellow' | 'orange' | 'red';

export interface RiskAssessment extends AnalysisResult {
  level: RiskLevel;
  levelLabel: string;
  actionRequired: string;
  mitigationsApplied: string[];
}

export function classifyRisk(score: number): { level: RiskLevel; label: string; action: string } {
  if (score <= 25) return { level: 'green', label: 'Low Risk', action: 'No action required.' };
  if (score <= 55) return { level: 'yellow', label: 'Moderate Risk', action: 'Review recommended.' };
  if (score <= 75) return { level: 'orange', label: 'Elevated Risk', action: 'Flag for manual review.' };
  return { level: 'red', label: 'High Risk', action: 'Requires immediate review.' };
}

// ─── Full Assessment Pipeline ───────────────────────────────────────────────

/**
 * Run the complete detection heuristics pipeline.
 *
 * @param text - Current submission text
 * @param keystrokeEvents - Raw keystroke events from the session
 * @param historicalBaseline - Averaged historical fingerprint
 * @param historicalSamples - Optional: per-metric sample arrays for Z-score
 * @param behavioralFlags - Pre-detected alerts from the keystroke tracker
 * @returns Full risk assessment with level, mitigations, and explanation
 */
export function runFullAssessment(
  text: string,
  keystrokeEvents: KeystrokeEvent[],
  historicalBaseline: Fingerprint,
  historicalSamples?: HistoricalSamples,
  behavioralFlags: AnomalyFlag[] = []
): RiskAssessment {
  // ── Step 1: Compute current fingerprint ─────────────────────────────────
  const currentFingerprint = calculateFingerprint(text, keystrokeEvents);

  // ── Step 2: Detect self-paste (false-positive mitigation) ───────────────
  const mitigationsApplied: string[] = [];
  const filteredFlags = applyFalsePositiveMitigations(
    behavioralFlags,
    keystrokeEvents,
    mitigationsApplied
  );

  // ── Step 3: Run comparison engine ───────────────────────────────────────
  const analysis = compareFingerprints(
    currentFingerprint,
    historicalBaseline,
    filteredFlags,
    historicalSamples
  );

  // ── Step 4: Apply confidence scaling ────────────────────────────────────
  let adjustedScore = analysis.riskScore;

  // If confidence is low, soften the score
  if (analysis.confidence < 0.6) {
    const scaleFactor = 0.6 + analysis.confidence * 0.4; // Range: 0.6–0.84
    adjustedScore = Math.round(adjustedScore * scaleFactor);
    mitigationsApplied.push(`Low-confidence scaling applied (×${scaleFactor.toFixed(2)})`);
  }

  // Single-signal dampening: if only one flag triggered, reduce by 10
  if (analysis.flags.length === 1) {
    adjustedScore = Math.max(0, adjustedScore - 10);
    mitigationsApplied.push('Single-signal dampening: -10 pts');
  }

  adjustedScore = Math.max(0, Math.min(100, adjustedScore));

  // ── Step 5: Classify risk level ─────────────────────────────────────────
  const { level, label, action } = classifyRisk(adjustedScore);

  return {
    ...analysis,
    riskScore: adjustedScore,
    level,
    levelLabel: label,
    actionRequired: action,
    mitigationsApplied,
  };
}

// ─── False Positive Mitigation Logic ────────────────────────────────────────

function applyFalsePositiveMitigations(
  flags: AnomalyFlag[],
  events: KeystrokeEvent[],
  mitigationsLog: string[]
): AnomalyFlag[] {
  return flags.filter((flag) => {
    // ── Self-paste detection ──
    // If a paste event's content was recently typed in the same session,
    // it's likely the student copying their own work (e.g., restructuring).
    if (flag.id === 'paste_block_large') {
      const pasteEvents = events.filter((e) => e.type === 'paste');
      for (const pe of pasteEvents) {
        if (pe.pastedText && pe.length && pe.length < 200) {
          // Small-ish paste that could be self-reorganization
          // Check if similar chars were typed recently
          const recentKeys = events
            .filter((e) => e.type === 'keypress' && e.timestamp < pe.timestamp)
            .slice(-pe.length);
          if (recentKeys.length >= pe.length * 0.5) {
            mitigationsLog.push('Self-paste detected: paste matches recently typed content');
            return false; // Filter out this flag
          }
        }
      }
    }

    // ── Code/citation exemption ──
    // Paste containing URLs or code-like patterns gets reduced severity
    if (flag.id === 'paste_block_large') {
      const pasteEvents = events.filter((e) => e.type === 'paste' && e.pastedText);
      const hasCodeOrUrl = pasteEvents.some(
        (e) =>
          e.pastedText &&
          (/https?:\/\//.test(e.pastedText) ||
            /[{}\[\]();]/.test(e.pastedText) ||
            /^(import|const|let|var|function|class)\s/.test(e.pastedText))
      );
      if (hasCodeOrUrl) {
        // Don't remove the flag, but downgrade severity
        flag.severity = flag.severity === 'critical' ? 'high' : 'medium';
        flag.detail += ' (Code/URL content detected — severity reduced.)';
        mitigationsLog.push('Code/URL paste detected: severity downgraded');
      }
    }

    return true;
  });
}

// ─── Batch Assessment (for Teacher Dashboard) ───────────────────────────────

export interface StudentSubmissionInput {
  studentId: string;
  studentName: string;
  text: string;
  keystrokeEvents: KeystrokeEvent[];
  baseline: Fingerprint;
  historicalSamples?: HistoricalSamples;
  behavioralFlags?: AnomalyFlag[];
}

export interface BatchAssessmentResult {
  studentId: string;
  studentName: string;
  assessment: RiskAssessment;
  currentFingerprint: Fingerprint;
}

/**
 * Run assessments for multiple students at once (teacher dashboard view).
 */
export function runBatchAssessment(
  submissions: StudentSubmissionInput[]
): BatchAssessmentResult[] {
  return submissions.map((sub) => {
    const assessment = runFullAssessment(
      sub.text,
      sub.keystrokeEvents,
      sub.baseline,
      sub.historicalSamples,
      sub.behavioralFlags ?? []
    );

    return {
      studentId: sub.studentId,
      studentName: sub.studentName,
      assessment,
      currentFingerprint: calculateFingerprint(sub.text, sub.keystrokeEvents),
    };
  });
}
