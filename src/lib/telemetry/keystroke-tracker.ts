import { KeystrokeEvent } from './types';

export class KeystrokeTracker {
  private events: KeystrokeEvent[] = [];
  private lastKeyTime: number | null = null;
  private startTime: number = Date.now();
  private characterCount: number = 0;

  constructor(private onHeartbeat: (events: KeystrokeEvent[], wpm: number, burst: number) => void) {
    this.startHeartbeat();
  }

  public recordKey(e: KeyboardEvent) {
    const now = Date.now();
    const latency = this.lastKeyTime ? now - this.lastKeyTime : 0;
    
    const event: KeystrokeEvent = {
      timestamp: now,
      type: 'keypress',
      keyCode: e.code,
      latency: latency,
    };

    this.events.push(event);
    this.lastKeyTime = now;
    this.characterCount++;
  }

  public recordPaste(text: string) {
    const event: KeystrokeEvent = {
      timestamp: Date.now(),
      type: 'paste',
      length: text.length,
    };
    this.events.push(event);
  }

  public calculateWPM(): number {
    const elapsedMinutes = (Date.now() - this.startTime) / 60000;
    if (elapsedMinutes === 0) return 0;
    const words = this.characterCount / 5;
    return Math.round(words / elapsedMinutes);
  }

  public calculateBurstScore(): number {
    const latencies = this.events
      .filter(e => e.type === 'keypress' && e.latency !== undefined)
      .map(e => e.latency!);
    
    if (latencies.length < 2) return 0;
    
    const mean = latencies.reduce((a, b) => a + b, 0) / latencies.length;
    const variance = latencies.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / latencies.length;
    return Math.sqrt(variance); // Standard Deviation as burst score
  }

  private startHeartbeat() {
    setInterval(() => {
      if (this.events.length > 0) {
        const payloadEvents = [...this.events];
        this.onHeartbeat(payloadEvents, this.calculateWPM(), this.calculateBurstScore());
        this.events = []; // Clear buffer after sending
      }
    }, 30000); // 30-second telemetry heartbeat
  }
}