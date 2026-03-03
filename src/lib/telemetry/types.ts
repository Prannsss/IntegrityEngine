// ─── Keystroke Event Types ───────────────────────────────────────────────────

export type KeystrokeEvent = {
  timestamp: number;
  type: 'keypress' | 'keyup' | 'paste';
  keyCode?: string;
  latency?: number;       // Inter-Key Latency (ms) — time since last keydown
  holdTime?: number;       // Key hold duration (ms) — keydown→keyup
  length?: number;         // For paste events: character count
  pastedText?: string;     // For paste events: first 200 chars (truncated for privacy)
};

// ─── Telemetry Payload (sent every 30s heartbeat) ───────────────────────────

export type TelemetryPayload = {
  assignmentId: string;
  sessionId: string;
  timestamp: number;           // When this heartbeat was generated
  events: KeystrokeEvent[];
  metrics: HeartbeatMetrics;
  signature?: string;          // HMAC-SHA256 of payload for tamper detection
  nonce?: string;              // Replay attack prevention
};

export type HeartbeatMetrics = {
  wpm: number;                 // Rolling-window WPM
  burstScore: number;          // Std dev of IKL
  avgLatency: number;          // Mean inter-key latency (ms)
  peakWpm: number;             // Highest rolling WPM observed this session
  pasteCharCount: number;      // Total pasted characters this heartbeat
  pasteEventCount: number;     // Number of paste events this heartbeat
  totalKeystrokes: number;     // Keypresses in this heartbeat window
  wpmHistory: number[];        // Rolling WPM samples (5s windows)
};

// ─── Stylometric Fingerprint ────────────────────────────────────────────────

export type Fingerprint = {
  lexical_density: number;       // % of complex words (>6 chars)
  avg_sentence_length: number;   // words per sentence
  vocabulary_diversity: number;  // Type-Token Ratio (%)
  burst_score: number;           // Std deviation of IKL
  flesch_kincaid_score: number;  // FK Grade Level
};

// ─── Comparison / Analysis Result ───────────────────────────────────────────

export type AnalysisResult = {
  riskScore: number;             // 0–100
  flags: AnomalyFlag[];
  confidence: number;            // 0–1
  explanation: string;
  deviation: Record<keyof Fingerprint, number>;   // % deviation per metric
  zScores: Record<keyof Fingerprint, number>;      // Z-score per metric
};

// ─── Anomaly Flags ──────────────────────────────────────────────────────────

export type AnomalyFlag = {
  id: string;                    // e.g. 'paste_block_large'
  severity: 'low' | 'medium' | 'high' | 'critical';
  label: string;                 // Human-readable label
  detail: string;                // Explanation of why this was flagged
  value?: number;                // The observed value that triggered the flag
  threshold?: number;            // The threshold that was exceeded
};

// ─── Tracker Configuration ──────────────────────────────────────────────────

export type TrackerConfig = {
  heartbeatIntervalMs: number;   // Default: 30000
  rollingWindowMs: number;       // WPM rolling window. Default: 10000
  pasteAlertThreshold: number;   // Chars to trigger paste alert. Default: 100
  wpmSpikeMultiplier: number;    // % of baseline to flag. Default: 2.0 (200%)
  maxBufferSize: number;         // Max events before forced flush. Default: 5000
};

export const DEFAULT_TRACKER_CONFIG: TrackerConfig = {
  heartbeatIntervalMs: 30000,
  rollingWindowMs: 10000,
  pasteAlertThreshold: 100,
  wpmSpikeMultiplier: 2.0,
  maxBufferSize: 5000,
};