export type KeystrokeEvent = {
  timestamp: number;
  type: 'keypress' | 'paste';
  keyCode?: string;
  latency?: number;
  length?: number;
};

export type TelemetryPayload = {
  assignmentId: string;
  sessionId: string;
  events: KeystrokeEvent[];
  wpm: number;
  burstScore: number;
};

export type Fingerprint = {
  lexical_density: number;
  avg_sentence_length: number;
  vocabulary_diversity: number;
  burst_score: number;
  flesch_kincaid_score: number;
};

export type AnalysisResult = {
  riskScore: number;
  flags: string[];
  confidence: number;
  explanation: string;
  deviation: Record<keyof Fingerprint, number>;
};