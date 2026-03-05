import { JsonStore } from '../lib/json-store';

type KeystrokeRecord = {
  id: number;
  quiz_assignment_id: number;
  session_id: string;
  timestamp: string;
  events: any[];
  wpm: number;
  burst_score: number;
  avg_latency: number;
  peak_wpm: number;
  paste_chars: number;
  paste_events: number;
  total_keys: number;
  wpm_history: number[];
  nonce: string | null;
  signature: string | null;
  created_at: string;
};

type WindowRecord = {
  id: number;
  quiz_assignment_id: number;
  session_id: string;
  event_type: string;
  timestamp: string;
  away_duration_ms: number | null;
  page_url: string | null;
  created_at: string;
};

type ReplayRecord = {
  id: number;
  quiz_assignment_id: number;
  session_id: string;
  question_id: number | null;
  replay_events: any[];
  text_snapshots: any[];
  duration_ms: number;
  total_events: number;
  created_at: string;
};

const keystrokeLogs = new JsonStore<KeystrokeRecord>('keystroke_logs.json');
const windowLogs = new JsonStore<WindowRecord>('window_change_logs.json');
const replayStore = new JsonStore<ReplayRecord>('session_replays.json');
const assignmentStore = new JsonStore<any>('quiz_assignments.json');

export class TelemetryModel {
  async insertKeystrokeLog(data: {
    quiz_assignment_id: string;
    session_id: string;
    events?: any[];
    wpm?: number;
    burst_score?: number;
    avg_latency?: number;
    peak_wpm?: number;
    paste_chars?: number;
    paste_events?: number;
    total_keys?: number;
    wpm_history?: number[];
    nonce?: string;
    signature?: string;
  }) {
    return keystrokeLogs.insert({
      quiz_assignment_id: Number(data.quiz_assignment_id),
      session_id: data.session_id,
      timestamp: new Date().toISOString(),
      events: data.events || [],
      wpm: data.wpm || 0,
      burst_score: data.burst_score || 0,
      avg_latency: data.avg_latency || 0,
      peak_wpm: data.peak_wpm || 0,
      paste_chars: data.paste_chars || 0,
      paste_events: data.paste_events || 0,
      total_keys: data.total_keys || 0,
      wpm_history: data.wpm_history || [],
      nonce: data.nonce || null,
      signature: data.signature || null,
    } as any);
  }

  async getKeystrokeLogs(assignmentId: string) {
    return keystrokeLogs.query()
      .eq('quiz_assignment_id', Number(assignmentId))
      .order('created_at', false)
      .limit(1)
      .results();
  }

  async insertWindowChange(data: {
    quiz_assignment_id: string;
    session_id: string;
    event_type: string;
    away_duration_ms?: number | null;
  }) {
    const log = windowLogs.insert({
      quiz_assignment_id: Number(data.quiz_assignment_id),
      session_id: data.session_id,
      event_type: data.event_type,
      timestamp: new Date().toISOString(),
      away_duration_ms: data.away_duration_ms || null,
      page_url: null,
    } as any);

    // Auto-increment window_changes on blur
    if (data.event_type === 'blur') {
      const assignment = assignmentStore.findOne({ id: Number(data.quiz_assignment_id) });
      if (assignment) {
        assignmentStore.update(
          { id: assignment.id },
          { window_changes: (assignment.window_changes || 0) + 1 }
        );
      }
    }

    return log;
  }

  async getWindowChanges(assignmentId: string) {
    return windowLogs.query()
      .eq('quiz_assignment_id', Number(assignmentId))
      .order('timestamp', true)
      .results();
  }

  async insertReplay(data: {
    quiz_assignment_id: string;
    session_id: string;
    question_id?: string | null;
    replay_events?: any[];
    text_snapshots?: any[];
    duration_ms?: number;
    total_events?: number;
  }) {
    return replayStore.insert({
      quiz_assignment_id: Number(data.quiz_assignment_id),
      session_id: data.session_id,
      question_id: data.question_id ? Number(data.question_id) : null,
      replay_events: data.replay_events || [],
      text_snapshots: data.text_snapshots || [],
      duration_ms: data.duration_ms || 0,
      total_events: data.total_events || 0,
    } as any);
  }

  async getReplays(assignmentId: string) {
    return replayStore.query()
      .eq('quiz_assignment_id', Number(assignmentId))
      .order('created_at', true)
      .results();
  }

  async getAllKeystrokeLogs(assignmentId: string) {
    return keystrokeLogs.query()
      .eq('quiz_assignment_id', Number(assignmentId))
      .order('created_at', true)
      .results()
      .map(l => ({
        id: l.id,
        wpm: l.wpm,
        burst_score: l.burst_score,
        avg_latency: l.avg_latency,
        peak_wpm: l.peak_wpm,
        paste_chars: l.paste_chars,
        paste_events: l.paste_events,
        total_keys: l.total_keys,
        wpm_history: l.wpm_history,
        created_at: l.created_at,
      }));
  }

  async getTelemetrySummary(assignmentId: string) {
    const logs = keystrokeLogs.query()
      .eq('quiz_assignment_id', Number(assignmentId))
      .order('created_at', false)
      .results();

    const windowResults = windowLogs.find({ quiz_assignment_id: Number(assignmentId) } as any);
    const blurCount = windowResults.filter(l => l.event_type === 'blur').length;

    if (logs.length === 0) {
      return {
        wpm: 0, burst_score: 0, avg_latency: 0, peak_wpm: 0,
        paste_chars: 0, paste_events: 0, total_keys: 0,
        window_change_count: blurCount,
        wpm_history: [],
        heartbeat_count: 0,
      };
    }

    const latest = logs[0];
    const allWpmHistory = logs.flatMap(l => (l.wpm_history as number[]) || []);
    const totalKeys = logs.reduce((sum, l) => sum + (l.total_keys || 0), 0);
    const totalPasteChars = logs.reduce((sum, l) => sum + (l.paste_chars || 0), 0);
    const totalPasteEvents = logs.reduce((sum, l) => sum + (l.paste_events || 0), 0);

    return {
      wpm: latest.wpm || 0,
      burst_score: latest.burst_score || 0,
      avg_latency: latest.avg_latency || 0,
      peak_wpm: Math.max(...logs.map(l => l.peak_wpm || 0)),
      paste_chars: totalPasteChars,
      paste_events: totalPasteEvents,
      total_keys: totalKeys,
      window_change_count: blurCount,
      wpm_history: allWpmHistory,
      heartbeat_count: logs.length,
    };
  }
}
