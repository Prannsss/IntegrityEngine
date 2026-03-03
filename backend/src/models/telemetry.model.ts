// ═══════════════════════════════════════════════════════════════════════════════
// Telemetry Model — Supabase queries for keystroke logs, window changes, replays
// ═══════════════════════════════════════════════════════════════════════════════

import { getServiceClient } from '../config/supabase';

export class TelemetryModel {
  private supabase = getServiceClient();

  // ─── Keystroke Heartbeat ──────────────────────────────────────────────

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
    const { data: log, error } = await this.supabase
      .from('keystroke_logs')
      .insert({
        quiz_assignment_id: data.quiz_assignment_id,
        session_id: data.session_id,
        events: data.events || [],
        wpm: data.wpm || 0,
        burst_score: data.burst_score || 0,
        avg_latency: data.avg_latency || 0,
        peak_wpm: data.peak_wpm || 0,
        paste_chars: data.paste_chars || 0,
        paste_events: data.paste_events || 0,
        total_keys: data.total_keys || 0,
        wpm_history: data.wpm_history || [],
        nonce: data.nonce,
        signature: data.signature,
      })
      .select()
      .single();

    if (error) throw error;
    return log;
  }

  /** Get keystroke logs for an assignment */
  async getKeystrokeLogs(assignmentId: string) {
    const { data, error } = await this.supabase
      .from('keystroke_logs')
      .select('*')
      .eq('quiz_assignment_id', assignmentId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;
    return data;
  }

  // ─── Window Changes ──────────────────────────────────────────────────

  async insertWindowChange(data: {
    quiz_assignment_id: string;
    session_id: string;
    event_type: string;
    away_duration_ms?: number | null;
  }) {
    const { data: log, error } = await this.supabase
      .from('window_change_logs')
      .insert({
        quiz_assignment_id: data.quiz_assignment_id,
        session_id: data.session_id,
        event_type: data.event_type,
        away_duration_ms: data.away_duration_ms || null,
      })
      .select()
      .single();

    if (error) throw error;
    return log;
  }

  async getWindowChanges(assignmentId: string) {
    const { data, error } = await this.supabase
      .from('window_change_logs')
      .select('*')
      .eq('quiz_assignment_id', assignmentId)
      .order('timestamp', { ascending: true });

    if (error) throw error;
    return data;
  }

  // ─── Session Replays ─────────────────────────────────────────────────

  async insertReplay(data: {
    quiz_assignment_id: string;
    session_id: string;
    question_id?: string | null;
    replay_events?: any[];
    text_snapshots?: any[];
    duration_ms?: number;
    total_events?: number;
  }) {
    const { data: replay, error } = await this.supabase
      .from('session_replays')
      .insert({
        quiz_assignment_id: data.quiz_assignment_id,
        session_id: data.session_id,
        question_id: data.question_id || null,
        replay_events: data.replay_events || [],
        text_snapshots: data.text_snapshots || [],
        duration_ms: data.duration_ms || 0,
        total_events: data.total_events || 0,
      })
      .select()
      .single();

    if (error) throw error;
    return replay;
  }

  async getReplays(assignmentId: string) {
    const { data, error } = await this.supabase
      .from('session_replays')
      .select('*')
      .eq('quiz_assignment_id', assignmentId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }
}
