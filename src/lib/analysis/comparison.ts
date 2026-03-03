import { Fingerprint, AnalysisResult } from '../telemetry/types';

export function compareFingerprints(current: Fingerprint, historical: Fingerprint, flags: string[] = []): AnalysisResult {
  const metrics: (keyof Fingerprint)[] = [
    'lexical_density',
    'avg_sentence_length',
    'vocabulary_diversity',
    'burst_score',
    'flesch_kincaid_score'
  ];

  const deviation: Record<string, number> = {};
  let totalWeightedDeviation = 0;
  
  const weights: Record<keyof Fingerprint, number> = {
    lexical_density: 0.2,
    avg_sentence_length: 0.15,
    vocabulary_diversity: 0.2,
    burst_score: 0.3,
    flesch_kincaid_score: 0.15
  };

  metrics.forEach(m => {
    const diff = Math.abs(current[m] - historical[m]);
    const percent = historical[m] === 0 ? 0 : (diff / historical[m]);
    deviation[m] = percent;
    totalWeightedDeviation += percent * weights[m];
  });

  // Detection logic for flags
  const activeFlags = [...flags];
  if (deviation.burst_score > 1.0) activeFlags.push('wpm_spike_detected');
  if (deviation.lexical_density > 0.5) activeFlags.push('high_stylometric_deviation');

  // Base risk score calculation
  let riskScore = Math.min(100, totalWeightedDeviation * 100);
  
  // Add heavy weight for explicit behavior flags
  if (activeFlags.includes('paste_event_detected')) riskScore += 30;
  if (activeFlags.includes('wpm_spike_detected')) riskScore += 20;

  riskScore = Math.min(100, Math.round(riskScore));

  return {
    riskScore,
    flags: activeFlags,
    confidence: 0.85, // Mock confidence
    explanation: `Risk score of ${riskScore} determined by ${activeFlags.length} active flags and stylometric drift.`,
    deviation: deviation as any
  };
}