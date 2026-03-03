/**
 * ─── Stylometry Engine ──────────────────────────────────────────────────────
 *
 * calculateFingerprint(text, keystrokeData?)
 *
 * Computes a 5-dimensional stylometric fingerprint from submitted text
 * and optional keystroke telemetry data.
 *
 * Metrics:
 *   1. Lexical Density     — Ratio of complex words (>6 chars) to total words (%)
 *   2. Avg Sentence Length  — Mean words per sentence
 *   3. Vocabulary Diversity — Type-Token Ratio (unique words / total words) (%)
 *   4. Burst Score          — Std deviation of inter-key latencies (ms)
 *   5. Flesch-Kincaid Grade — Reading difficulty approximation
 *
 * All computations are deterministic and interpretable.
 */

import { Fingerprint, KeystrokeEvent } from '../telemetry/types';

// ─── Text Preprocessing ─────────────────────────────────────────────────────

/** Split text into words, filtering out empty strings and punctuation-only tokens */
function tokenize(text: string): string[] {
  return text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0 && /[a-zA-Z]/.test(w));
}

/** Split text into sentences using sentence-ending punctuation */
function splitSentences(text: string): string[] {
  return text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

// ─── Syllable Estimation ────────────────────────────────────────────────────
/**
 * Approximate syllable count using a vowel-cluster heuristic.
 *
 * Rules:
 *   1. Count groups of consecutive vowels (a, e, i, o, u, y) as one syllable
 *   2. If word ends in silent 'e', subtract 1 (but minimum 1)
 *   3. If word ends in 'le' preceded by a consonant, add 1
 *
 * This is a common lightweight approximation used in readability formulas.
 */
function estimateSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (w.length <= 2) return 1;

  // Count vowel groups
  const vowelGroups = w.match(/[aeiouy]+/g);
  let count = vowelGroups ? vowelGroups.length : 1;

  // Silent 'e' at end
  if (w.endsWith('e') && !w.endsWith('le')) {
    count = Math.max(1, count - 1);
  }

  // 'le' ending preceded by consonant = extra syllable
  if (w.length > 2 && w.endsWith('le') && !/[aeiouy]/.test(w[w.length - 3])) {
    count++;
  }

  return Math.max(1, count);
}

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

// ─── Burst Score from Keystroke Data ────────────────────────────────────────
/**
 * Burst Score Derivation:
 *
 * The burst score quantifies how erratic or irregular the typing rhythm is.
 *
 *   burst_score = σ(IKL)
 *
 * Where IKL = Inter-Key Latency (ms between consecutive keydown events).
 *
 * Interpretation:
 *   - Low burst score (< 50ms σ)   → Consistent, natural typing
 *   - Medium burst score (50–150ms) → Normal variation (thinking pauses)
 *   - High burst score (> 200ms)    → Erratic; possible copy-paste or AI-assisted
 *
 * Alternative: Can also be computed from WPM segments (σ of 5-second WPM windows).
 */
function computeBurstScore(events?: KeystrokeEvent[]): number {
  if (!events || events.length < 2) return 0;

  const latencies = events
    .filter((e) => e.type === 'keypress' && e.latency !== undefined && e.latency > 0)
    .map((e) => e.latency!);

  if (latencies.length < 2) return 0;
  return stdDev(latencies);
}

/**
 * Alternative burst score from WPM segments (5-second windows).
 * Useful when raw keystroke events are not available.
 */
export function computeBurstScoreFromWpmSegments(wpmHistory: number[]): number {
  if (wpmHistory.length < 2) return 0;
  return stdDev(wpmHistory);
}

// ─── Main Fingerprint Calculation ───────────────────────────────────────────

/**
 * Calculate a stylometric fingerprint from text and optional keystroke data.
 *
 * @param text - The student's written content
 * @param keystrokeData - Optional: raw KeystrokeEvent[] from the typing session
 * @param burstScoreOverride - Optional: pre-computed burst score (if keystroke data unavailable)
 * @returns Fingerprint object with all 5 metrics
 */
export function calculateFingerprint(
  text: string,
  keystrokeData?: KeystrokeEvent[],
  burstScoreOverride?: number
): Fingerprint {
  const words = tokenize(text);
  const sentences = splitSentences(text);

  // Edge case: empty or trivial text
  if (words.length === 0) {
    return {
      lexical_density: 0,
      avg_sentence_length: 0,
      vocabulary_diversity: 0,
      burst_score: 0,
      flesch_kincaid_score: 0,
    };
  }

  // ── 1. Lexical Density ─────────────────────────────────────────────────
  // Definition: Percentage of "complex" words (>6 characters) in the text.
  // Rationale: AI-generated text tends to use more sophisticated vocabulary
  //            uniformly, inflating lexical density compared to student norms.
  const complexWords = words.filter((w) => w.replace(/[^a-zA-Z]/g, '').length > 6).length;
  const lexical_density = (complexWords / words.length) * 100;

  // ── 2. Average Sentence Length ─────────────────────────────────────────
  // Definition: Mean number of words per sentence.
  // Rationale: Students have characteristic sentence length patterns.
  //            AI output tends toward medium-length, well-structured sentences.
  const sentenceCount = Math.max(1, sentences.length);
  const avg_sentence_length = words.length / sentenceCount;

  // ── 3. Vocabulary Diversity (Type-Token Ratio) ────────────────────────
  // Definition: TTR = (unique word types / total word tokens) × 100
  // Rationale: A sudden increase in TTR suggests vocabulary beyond the
  //            student's typical range — a strong signal of external sourcing.
  //
  // Note: For texts >500 words, TTR naturally decreases (Zipf's law).
  //       For a production system, use MATTR (Moving Average TTR) with
  //       a sliding window of ~50 words. For this prototype, simple TTR
  //       is sufficient given assignment-length texts (~300-1000 words).
  const uniqueWords = new Set(words.map((w) => w.toLowerCase().replace(/[^a-z]/g, '')));
  const vocabulary_diversity = (uniqueWords.size / words.length) * 100;

  // ── 4. Burst Score ────────────────────────────────────────────────────
  // See computeBurstScore() documentation above.
  const burst_score = burstScoreOverride ?? computeBurstScore(keystrokeData);

  // ── 5. Flesch-Kincaid Grade Level ─────────────────────────────────────
  // Formula:
  //   FK = 0.39 × (words/sentences) + 11.8 × (syllables/words) − 15.59
  //
  // Interpretation (US school grade level):
  //   5  → 5th grade reading level
  //   8  → 8th grade
  //   12 → 12th grade (high school senior)
  //   16 → College graduate
  //
  // Rationale: AI tends to produce consistently high FK scores (12-16),
  //            while students usually vary between 8-12.
  const totalSyllables = words.reduce((acc, w) => acc + estimateSyllables(w), 0);
  const flesch_kincaid_score = Math.max(
    0,
    0.39 * (words.length / sentenceCount) + 11.8 * (totalSyllables / words.length) - 15.59
  );

  return {
    lexical_density: Math.round(lexical_density * 100) / 100,
    avg_sentence_length: Math.round(avg_sentence_length * 100) / 100,
    vocabulary_diversity: Math.round(vocabulary_diversity * 100) / 100,
    burst_score: Math.round(burst_score * 100) / 100,
    flesch_kincaid_score: Math.round(flesch_kincaid_score * 100) / 100,
  };
}