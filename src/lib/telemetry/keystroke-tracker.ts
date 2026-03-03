/**
 * ─── KeystrokeTracker ────────────────────────────────────────────────────────
 *
 * Production-grade client-side telemetry engine for capturing typing behavior.
 *
 * Captures: keydown, keyup, paste
 * Calculates: Inter-Key Latency (IKL), rolling WPM, burst typing speed
 * Detects: Large paste blocks (>100 chars), WPM spikes (>200% baseline)
 * Maintains: 30-second heartbeat, in-memory session buffer, offline queue
 *
 * Architecture:
 *   - Events are buffered in memory and flushed every heartbeat interval
 *   - Rolling WPM is calculated over a configurable sliding window (default 10s)
 *   - Burst score = standard deviation of inter-key latencies
 *   - Offline events are queued and replayed when connection resumes
 *   - Buffer overflow protection prevents memory exhaustion
 */

import {
  KeystrokeEvent,
  TelemetryPayload,
  HeartbeatMetrics,
  AnomalyFlag,
  TrackerConfig,
  DEFAULT_TRACKER_CONFIG,
} from './types';

// ─── Utility: generate a random session ID ─────────────────────────────────
function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}

// ─── Utility: generate a nonce for replay prevention ────────────────────────
function generateNonce(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 12)}`;
}

// ─── Statistical helpers ────────────────────────────────────────────────────

/** Arithmetic mean of a numeric array */
function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/** Standard deviation of a numeric array */
function stdDev(arr: number[]): number {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  const variance = arr.reduce((acc, v) => acc + (v - m) ** 2, 0) / arr.length;
  return Math.sqrt(variance);
}

// ─── Heartbeat callback signature ───────────────────────────────────────────

export type HeartbeatCallback = (payload: TelemetryPayload) => void;
export type AlertCallback = (flag: AnomalyFlag) => void;

// ─── KeystrokeTracker Class ─────────────────────────────────────────────────

export class KeystrokeTracker {
  // ── Internal state ──────────────────────────────────────────────────────
  private events: KeystrokeEvent[] = [];
  private offlineQueue: TelemetryPayload[] = [];
  private lastKeyDownTime: number | null = null;
  private keyDownTimestamps: Map<string, number> = new Map(); // For hold-time calc
  private sessionCharCount: number = 0;
  private sessionStartTime: number = Date.now();
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private wpmSamples: number[] = []; // Rolling WPM snapshots (every 5s)
  private wpmSampleTimer: ReturnType<typeof setInterval> | null = null;
  private peakWpm: number = 0;
  private baselineWpm: number = 0; // Established after first 60s
  private baselineEstablished: boolean = false;
  private isOnline: boolean = true;

  // ── Public read-only ────────────────────────────────────────────────────
  public readonly sessionId: string;
  public readonly config: TrackerConfig;

  constructor(
    private assignmentId: string,
    private onHeartbeat: HeartbeatCallback,
    private onAlert?: AlertCallback,
    config?: Partial<TrackerConfig>
  ) {
    this.config = { ...DEFAULT_TRACKER_CONFIG, ...config };
    this.sessionId = generateSessionId();
    this.startHeartbeat();
    this.startWpmSampling();
    this.setupOnlineListener();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  PUBLIC API — attach these to DOM event listeners
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Record a keydown event. Calculates IKL from last keydown.
   * Call from: element.addEventListener('keydown', tracker.recordKeyDown)
   */
  public recordKeyDown = (e: KeyboardEvent): void => {
    // Ignore modifier-only keys
    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(e.key)) return;

    const now = Date.now();
    const latency = this.lastKeyDownTime ? now - this.lastKeyDownTime : 0;

    const event: KeystrokeEvent = {
      timestamp: now,
      type: 'keypress',
      keyCode: e.code,
      latency,
    };

    this.events.push(event);
    this.lastKeyDownTime = now;
    this.keyDownTimestamps.set(e.code, now);
    this.sessionCharCount++;

    // ── Buffer overflow protection ──
    if (this.events.length >= this.config.maxBufferSize) {
      this.flushHeartbeat();
    }

    // ── Real-time WPM spike detection ──
    this.detectWpmSpike();
  };

  /**
   * Record a keyup event. Calculates key hold duration.
   * Call from: element.addEventListener('keyup', tracker.recordKeyUp)
   */
  public recordKeyUp = (e: KeyboardEvent): void => {
    if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(e.key)) return;

    const now = Date.now();
    const downTime = this.keyDownTimestamps.get(e.code);
    const holdTime = downTime ? now - downTime : undefined;
    this.keyDownTimestamps.delete(e.code);

    const event: KeystrokeEvent = {
      timestamp: now,
      type: 'keyup',
      keyCode: e.code,
      holdTime,
    };

    this.events.push(event);
  };

  /**
   * Record a paste event. Flags large pastes (>100 chars).
   * Call from: element.addEventListener('paste', tracker.recordPaste)
   */
  public recordPaste = (e: ClipboardEvent | string): void => {
    const text = typeof e === 'string' ? e : e instanceof ClipboardEvent ? (e.clipboardData?.getData('text') ?? '') : '';
    const now = Date.now();

    const event: KeystrokeEvent = {
      timestamp: now,
      type: 'paste',
      length: text.length,
      pastedText: text.substring(0, 200), // Truncate for privacy
    };

    this.events.push(event);

    // ── Flag large paste blocks ──
    if (text.length > this.config.pasteAlertThreshold) {
      const flag: AnomalyFlag = {
        id: 'paste_block_large',
        severity: text.length > 500 ? 'critical' : text.length > 200 ? 'high' : 'medium',
        label: 'Large Paste Event Detected',
        detail: `${text.length} characters pasted at once, exceeding the ${this.config.pasteAlertThreshold}-character threshold.`,
        value: text.length,
        threshold: this.config.pasteAlertThreshold,
      };
      this.onAlert?.(flag);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  //  METRICS CALCULATION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Rolling-window WPM. Uses events within the last `rollingWindowMs`.
   * Formula: (chars_in_window / 5) / (window_duration_in_minutes)
   */
  public calculateRollingWPM(): number {
    const now = Date.now();
    const windowStart = now - this.config.rollingWindowMs;
    const recentKeys = this.events.filter(
      (e) => e.type === 'keypress' && e.timestamp >= windowStart
    );

    if (recentKeys.length < 2) return 0;

    const windowDuration = (now - recentKeys[0].timestamp) / 60000;
    if (windowDuration <= 0) return 0;

    const words = recentKeys.length / 5; // Standard: 5 chars = 1 word
    return Math.round(words / windowDuration);
  }

  /**
   * Session-wide WPM (cumulative average).
   */
  public calculateSessionWPM(): number {
    const elapsedMinutes = (Date.now() - this.sessionStartTime) / 60000;
    if (elapsedMinutes <= 0) return 0;
    return Math.round(this.sessionCharCount / 5 / elapsedMinutes);
  }

  /**
   * Burst score = standard deviation of inter-key latencies.
   * High burst score → erratic typing (possible copy/paste or AI assist).
   * Low burst score → consistent human typing rhythm.
   */
  public calculateBurstScore(): number {
    const latencies = this.getLatencies();
    return stdDev(latencies);
  }

  /**
   * Average inter-key latency in ms.
   */
  public calculateAvgLatency(): number {
    return mean(this.getLatencies());
  }

  /**
   * Get all current events (read-only snapshot).
   */
  public getEvents(): ReadonlyArray<KeystrokeEvent> {
    return [...this.events];
  }

  /**
   * Get current metrics snapshot.
   */
  public getMetrics(): HeartbeatMetrics {
    const pasteEvents = this.events.filter((e) => e.type === 'paste');
    return {
      wpm: this.calculateRollingWPM(),
      burstScore: this.calculateBurstScore(),
      avgLatency: this.calculateAvgLatency(),
      peakWpm: this.peakWpm,
      pasteCharCount: pasteEvents.reduce((sum, e) => sum + (e.length ?? 0), 0),
      pasteEventCount: pasteEvents.length,
      totalKeystrokes: this.events.filter((e) => e.type === 'keypress').length,
      wpmHistory: [...this.wpmSamples],
    };
  }

  /**
   * Flush any queued offline payloads. Call when network resumes.
   */
  public flushOfflineQueue(): TelemetryPayload[] {
    const queue = [...this.offlineQueue];
    this.offlineQueue = [];
    return queue;
  }

  /**
   * Destroy the tracker. Clears intervals and flushes remaining events.
   */
  public destroy(): void {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    if (this.wpmSampleTimer) clearInterval(this.wpmSampleTimer);
    this.flushHeartbeat(); // Send any remaining events
    this.events = [];
    this.wpmSamples = [];
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  INTERNAL METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  /** Extract IKL values from current event buffer */
  private getLatencies(): number[] {
    return this.events
      .filter((e) => e.type === 'keypress' && e.latency !== undefined && e.latency > 0)
      .map((e) => e.latency!);
  }

  /** Detect WPM spikes above 200% of baseline */
  private detectWpmSpike(): void {
    if (!this.baselineEstablished) return;

    const currentWpm = this.calculateRollingWPM();
    if (currentWpm > this.peakWpm) this.peakWpm = currentWpm;

    const spikeThreshold = this.baselineWpm * this.config.wpmSpikeMultiplier;
    if (currentWpm > spikeThreshold && this.baselineWpm > 0) {
      const flag: AnomalyFlag = {
        id: 'wpm_spike_detected',
        severity: currentWpm > spikeThreshold * 1.5 ? 'critical' : 'high',
        label: 'WPM Spike Detected',
        detail: `Current WPM (${currentWpm}) exceeds ${Math.round(this.config.wpmSpikeMultiplier * 100)}% of baseline (${this.baselineWpm}).`,
        value: currentWpm,
        threshold: spikeThreshold,
      };
      this.onAlert?.(flag);
    }
  }

  /** Establish WPM baseline from first 60 seconds of samples */
  private establishBaseline(): void {
    if (this.baselineEstablished) return;
    if (this.wpmSamples.length >= 12) {
      // 12 samples × 5s = 60 seconds of data
      this.baselineWpm = mean(this.wpmSamples);
      this.baselineEstablished = true;
    }
  }

  /** Sample WPM every 5 seconds for rolling history */
  private startWpmSampling(): void {
    this.wpmSampleTimer = setInterval(() => {
      const wpm = this.calculateRollingWPM();
      this.wpmSamples.push(wpm);
      if (wpm > this.peakWpm) this.peakWpm = wpm;

      // Keep only last 60 samples (5 minutes of history)
      if (this.wpmSamples.length > 60) {
        this.wpmSamples = this.wpmSamples.slice(-60);
      }

      this.establishBaseline();
    }, 5000);
  }

  /** 30-second heartbeat: package events + metrics → send to callback */
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      this.flushHeartbeat();
    }, this.config.heartbeatIntervalMs);
  }

  /** Build and send a telemetry payload */
  private flushHeartbeat(): void {
    if (this.events.length === 0) return;

    const payload: TelemetryPayload = {
      assignmentId: this.assignmentId,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      events: [...this.events],
      metrics: this.getMetrics(),
      nonce: generateNonce(),
    };

    // ── Offline buffering ──
    if (!this.isOnline) {
      this.offlineQueue.push(payload);
    } else {
      // Send any queued payloads first
      if (this.offlineQueue.length > 0) {
        const queued = this.flushOfflineQueue();
        queued.forEach((p) => this.onHeartbeat(p));
      }
      this.onHeartbeat(payload);
    }

    // Clear buffer after sending
    this.events = [];
  }

  /** Listen for online/offline browser events */
  private setupOnlineListener(): void {
    if (typeof window === 'undefined') return;
    window.addEventListener('online', () => {
      this.isOnline = true;
      // Flush any offline queue
      if (this.offlineQueue.length > 0) {
        const queued = this.flushOfflineQueue();
        queued.forEach((p) => this.onHeartbeat(p));
      }
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  EXAMPLE TELEMETRY JSON PAYLOAD
// ═══════════════════════════════════════════════════════════════════════════════
//
// {
//   "assignmentId": "assign_abc123",
//   "sessionId": "sess_1717200000000_x7k2m9p1",
//   "timestamp": 1717200030000,
//   "nonce": "1717200030000-a3b8c2d1e4",
//   "events": [
//     { "timestamp": 1717200001200, "type": "keypress", "keyCode": "KeyH", "latency": 0 },
//     { "timestamp": 1717200001350, "type": "keypress", "keyCode": "KeyE", "latency": 150 },
//     { "timestamp": 1717200001480, "type": "keyup",   "keyCode": "KeyH", "holdTime": 85 },
//     { "timestamp": 1717200001520, "type": "keypress", "keyCode": "KeyL", "latency": 170 },
//     { "timestamp": 1717200012000, "type": "paste",   "length": 342, "pastedText": "The quick brown fox..." }
//   ],
//   "metrics": {
//     "wpm": 68,
//     "burstScore": 45.3,
//     "avgLatency": 142,
//     "peakWpm": 92,
//     "pasteCharCount": 342,
//     "pasteEventCount": 1,
//     "totalKeystrokes": 47,
//     "wpmHistory": [52, 58, 61, 68, 72, 68]
//   }
// }
//