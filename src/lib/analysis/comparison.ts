/**
 * ─── Fingerprint Comparison Engine ───────────────────────────────────────────
 *
 * compareFingerprints(current, historical, flags?, historicalSamples?)
 *
 * Deterministic, interpretable comparison of a student's current submission
 * fingerprint against their historical baseline.
 *
 * Computes:
 *   - Percentage deviation per metric
 *   - Z-score per metric (if historical samples provided)
 *   - Weighted aggregate risk score (0–100)
 *   - Confidence level based on data quality
 *   - Human-readable explanation summary
 *
 * Scoring is fully transparent: no black-box ML, every point is traceable.
 */

import { Fingerprint, AnalysisResult, AnomalyFlag } from '../telemetry/types';

// ─── Metric Weights ─────────────────────────────────────────────────────────
// burst_score is weighted highest because it's the hardest behavioral signal
// to fake — it requires physically mimicking someone's typing rhythm.

const METRIC_WEIGHTS: Record<keyof Fingerprint, number> = {
  lexical_density: 0.18,
  avg_sentence_length: 0.12,
  vocabulary_diversity: 0.20,
  burst_score: 0.35,
  flesch_kincaid_score: 0.15,
};

// ─── Threshold Configuration ────────────────────────────────────────────────

/** Deviation thresholds for each metric (as a fraction, e.g. 0.4 = 40%) */
const DEVIATION_THRESHOLDS: Record<keyof Fingerprint, { yellow: number; red: number }> = {
  lexical_density:       { yellow: 0.30, red: 0.60 },
  avg_sentence_length:   { yellow: 0.35, red: 0.70 },
  vocabulary_diversity:  { yellow: 0.25, red: 0.50 },
  burst_score:           { yellow: 0.50, red: 1.00 },
  flesch_kincaid_score:  { yellow: 0.30, red: 0.60 },
};

/** Z-score thresholds */
const Z_SCORE_THRESHOLDS = {
  warning: 1.5,   // 1.5 σ → unusual
  critical: 2.5,  // 2.5 σ → highly anomalous
};

// ─── Behavioral Flag Scoring ────────────────────────────────────────────────

const BEHAVIORAL_FLAG_SCORES: Record<string, number> = {
  paste_block_large: 25,
  wpm_spike_detected: 20,
  high_stylometric_deviation: 15,
  vocabulary_anomaly: 10,
  sentence_complexity_jump: 10,
};

// ─── Statistical Helpers ────────────────────────────────────────────────────

function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stdDev(arr: number[]): number {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  return Math.sqrt(arr.reduce((acc, v) => acc + (v - m) ** 2, 0) / arr.length);
}

/**
 * Calculate Z-score: how many standard deviations `value` is from the mean
 * of `samples`. Returns 0 if insufficient data.
 */
function zScore(value: number, samples: number[]): number {
  if (samples.length < 3) return 0; // Need at least 3 samples for meaningful σ
  const m = mean(samples);
  const sd = stdDev(samples);
  if (sd === 0) return 0;
  return (value - m) / sd;
}

// ─── Historical sample type ────────────────────────────────────────────────

export type HistoricalSamples = {
  [K in keyof Fingerprint]?: number[];
};

// ─── Main Comparison Function ───────────────────────────────────────────────

/**
 * Compare the current submission fingerprint against a historical baseline.
 *
 * @param current - Fingerprint of the current submission
 * @param historical - Average/baseline fingerprint for this student
 * @param behavioralFlags - Pre-detected behavioral anomaly flags (paste, WPM spike, etc.)
 * @param historicalSamples - Optional: raw per-metric arrays from past submissions (enables Z-score)
 * @returns AnalysisResult with risk score, flags, confidence, deviations, Z-scores, and explanation
 */
export function compareFingerprints(
  current: Fingerprint,
  historical: Fingerprint,
  behavioralFlags: AnomalyFlag[] = [],
  historicalSamples?: HistoricalSamples
): AnalysisResult {
  const metrics: (keyof Fingerprint)[] = [
    'lexical_density',
    'avg_sentence_length',
    'vocabulary_diversity',
    'burst_score',
    'flesch_kincaid_score',
  ];

  // ── Step 1: Compute per-metric deviation and Z-score ────────────────────

  const deviation: Record<string, number> = {};
  const zScores: Record<string, number> = {};
  let totalWeightedDeviation = 0;
  let totalWeightedZAbsolute = 0;
  const deviationDetails: string[] = [];

  for (const metric of metrics) {
    const curr = current[metric];
    const hist = historical[metric];

    // Percentage deviation (absolute)
    const diff = Math.abs(curr - hist);
    const pctDev = hist === 0 ? (curr === 0 ? 0 : 1.0) : diff / hist;
    deviation[metric] = pctDev;
    totalWeightedDeviation += pctDev * METRIC_WEIGHTS[metric];

    // Z-score (if historical samples available)
    const samples = historicalSamples?.[metric];
    const z = samples ? zScore(curr, samples) : 0;
    zScores[metric] = Math.round(z * 100) / 100;

    if (samples && Math.abs(z) > Z_SCORE_THRESHOLDS.warning) {
      totalWeightedZAbsolute += Math.abs(z) * METRIC_WEIGHTS[metric];
    }

    // Collect human-readable deviation notes
    const thresholds = DEVIATION_THRESHOLDS[metric];
    if (pctDev > thresholds.red) {
      deviationDetails.push(
        `${formatMetricName(metric)}: ${(pctDev * 100).toFixed(0)}% deviation (critical)`
      );
    } else if (pctDev > thresholds.yellow) {
      deviationDetails.push(
        `${formatMetricName(metric)}: ${(pctDev * 100).toFixed(0)}% deviation (elevated)`
      );
    }
  }

  // ── Step 2: Detect stylometric flags from deviations ────────────────────

  const detectedFlags: AnomalyFlag[] = [...behavioralFlags];

  // High overall stylometric deviation
  if (totalWeightedDeviation > 0.45) {
    detectedFlags.push({
      id: 'high_stylometric_deviation',
      severity: totalWeightedDeviation > 0.7 ? 'critical' : 'high',
      label: 'High Stylometric Deviation',
      detail: `Weighted stylometric drift of ${(totalWeightedDeviation * 100).toFixed(0)}% detected across all metrics.`,
      value: totalWeightedDeviation,
      threshold: 0.45,
    });
  }

  // Vocabulary anomaly
  if (deviation.vocabulary_diversity > DEVIATION_THRESHOLDS.vocabulary_diversity.red) {
    detectedFlags.push({
      id: 'vocabulary_anomaly',
      severity: 'high',
      label: 'Vocabulary Richness Anomaly',
      detail: `Vocabulary diversity shifted by ${(deviation.vocabulary_diversity * 100).toFixed(0)}%, suggesting a different writing source.`,
      value: current.vocabulary_diversity,
      threshold: historical.vocabulary_diversity * (1 + DEVIATION_THRESHOLDS.vocabulary_diversity.red),
    });
  }

  // Sentence complexity jump
  if (deviation.avg_sentence_length > DEVIATION_THRESHOLDS.avg_sentence_length.red) {
    detectedFlags.push({
      id: 'sentence_complexity_jump',
      severity: 'medium',
      label: 'Sentence Complexity Jump',
      detail: `Average sentence length shifted by ${(deviation.avg_sentence_length * 100).toFixed(0)}%.`,
      value: current.avg_sentence_length,
      threshold: historical.avg_sentence_length * (1 + DEVIATION_THRESHOLDS.avg_sentence_length.red),
    });
  }

  // ── Step 3: Calculate risk score ────────────────────────────────────────

  // Base score from weighted deviation (0 → ~60 range)
  let riskScore = Math.min(60, totalWeightedDeviation * 100);

  // Add Z-score contribution if available (0 → ~20 range)
  if (historicalSamples) {
    riskScore += Math.min(20, totalWeightedZAbsolute * 5);
  }

  // Add behavioral flag contributions (0 → ~50 range, but total capped at 100)
  for (const flag of detectedFlags) {
    const flagScore = BEHAVIORAL_FLAG_SCORES[flag.id] ?? 5;
    riskScore += flagScore;
  }

  // Deduplicate: don't double-count flags that were both behavioral and stylometric
  const uniqueFlagIds = new Set(detectedFlags.map((f) => f.id));
  if (uniqueFlagIds.size < detectedFlags.length) {
    riskScore -= 5; // Small deduction for overlap
  }

  riskScore = Math.max(0, Math.min(100, Math.round(riskScore)));

  // ── Step 4: Calculate confidence level ──────────────────────────────────
  //
  // Confidence depends on:
  //   - How many historical samples we have (more samples → higher confidence)
  //   - Whether Z-scores were computable
  //   - How many data signals contributed to the score

  let confidence = 0.5; // Base confidence

  const sampleCounts = historicalSamples
    ? Object.values(historicalSamples).map((s) => s?.length ?? 0)
    : [];
  const avgSamples = sampleCounts.length > 0 ? mean(sampleCounts) : 0;

  if (avgSamples >= 10) confidence += 0.25;
  else if (avgSamples >= 5) confidence += 0.15;
  else if (avgSamples >= 3) confidence += 0.10;

  if (detectedFlags.length >= 3) confidence += 0.10;
  if (detectedFlags.some((f) => f.severity === 'critical')) confidence += 0.05;
  if (historicalSamples) confidence += 0.05;

  confidence = Math.min(0.99, Math.round(confidence * 100) / 100);

  // ── Step 5: Build explanation summary ───────────────────────────────────

  const severityLabel =
    riskScore > 70 ? 'HIGH' : riskScore > 30 ? 'MODERATE' : 'LOW';

  const explanationParts: string[] = [
    `Risk assessment: ${severityLabel} (${riskScore}/100) with ${Math.round(confidence * 100)}% confidence.`,
  ];

  if (deviationDetails.length > 0) {
    explanationParts.push(`Key deviations: ${deviationDetails.join('; ')}.`);
  }

  if (detectedFlags.length > 0) {
    const flagSummary = detectedFlags
      .map((f) => f.label)
      .filter((v, i, a) => a.indexOf(v) === i) // Unique labels
      .join(', ');
    explanationParts.push(`Active flags: ${flagSummary}.`);
  } else {
    explanationParts.push('No behavioral or stylometric anomalies detected.');
  }

  // Burst-specific insight
  if (deviation.burst_score > 0.5) {
    explanationParts.push(
      `Typing rhythm variability increased by ${(deviation.burst_score * 100).toFixed(0)}%, which may indicate externally sourced content.`
    );
  }

  const explanation = explanationParts.join(' ');

  // ── Return ──────────────────────────────────────────────────────────────

  return {
    riskScore,
    flags: detectedFlags,
    confidence,
    explanation,
    deviation: deviation as Record<keyof Fingerprint, number>,
    zScores: zScores as Record<keyof Fingerprint, number>,
  };
}

// ─── Helper: Format metric name for display ─────────────────────────────────

function formatMetricName(key: string): string {
  const names: Record<string, string> = {
    lexical_density: 'Lexical Density',
    avg_sentence_length: 'Avg Sentence Length',
    vocabulary_diversity: 'Vocabulary Diversity',
    burst_score: 'Burst Score',
    flesch_kincaid_score: 'Flesch-Kincaid Grade',
  };
  return names[key] ?? key;
}