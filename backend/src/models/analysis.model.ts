import { JsonStore } from '../lib/json-store';

export interface AnalysisResultInput {
  quiz_assignment_id: string;
  student_id: string;
  risk_score: number;
  confidence: number;
  flags: unknown[];
  deviation: Record<string, number>;
  z_scores: Record<string, number>;
  explanation: string;
  window_change_count: number;
  ai_explanation?: string | null;
}

type ProfileRecord = {
  id: string;
  email: string;
  full_name: string | null;
  baseline_fingerprint: Record<string, number> | null;
};

type AnalysisRecord = {
  id: number;
  quiz_assignment_id: number;
  student_id: string;
  risk_score: number;
  confidence: number;
  flags: unknown[];
  deviation: Record<string, number>;
  z_scores: Record<string, number>;
  explanation: string;
  ai_explanation: string | null;
  window_change_count: number;
  created_at: string;
};

type KeystrokeRecord = {
  id: number;
  quiz_assignment_id: number;
  session_id: string;
  events: any[];
  wpm: number;
  burst_score: number;
  avg_latency: number;
  peak_wpm: number;
  paste_chars: number;
  paste_events: number;
  total_keys: number;
  wpm_history: number[];
  nonce: string;
  signature: string;
  created_at: string;
};

type WindowRecord = {
  id: number;
  quiz_assignment_id: number;
  session_id: string;
  event_type: string;
  timestamp: string;
  away_duration_ms: number | null;
  created_at: string;
};

type AssignmentRecord = {
  id: number;
  quiz_id: number;
  student_id: string;
  teacher_id: string;
  status: string;
  risk_score: number | null;
  created_at: string;
  updated_at: string;
};

const profiles = new JsonStore<ProfileRecord>('profiles.json', { useUuid: true });
const analysisResults = new JsonStore<AnalysisRecord>('analysis_results.json');
const keystrokeLogs = new JsonStore<KeystrokeRecord>('keystroke_logs.json');
const windowLogs = new JsonStore<WindowRecord>('window_change_logs.json');
const assignments = new JsonStore<AssignmentRecord>('quiz_assignments.json');

export class AnalysisModel {
  async getBaselineFingerprint(studentId: string) {
    const profile = profiles.findOne({ id: studentId } as any);
    return profile?.baseline_fingerprint ?? null;
  }

  async saveResult(result: AnalysisResultInput) {
    return analysisResults.insert({
      quiz_assignment_id: Number(result.quiz_assignment_id),
      student_id: result.student_id,
      risk_score: result.risk_score,
      confidence: result.confidence,
      flags: result.flags,
      deviation: result.deviation,
      z_scores: result.z_scores,
      explanation: result.explanation,
      window_change_count: result.window_change_count,
      ai_explanation: result.ai_explanation ?? null,
    } as any);
  }

  async getLatestKeystrokeLog(assignmentId: string) {
    const logs = keystrokeLogs.query()
      .eq('quiz_assignment_id', Number(assignmentId))
      .order('created_at', false)
      .limit(1)
      .results();
    return logs[0] || null;
  }

  async getWindowChangeLogs(assignmentId: string) {
    return windowLogs.find({ quiz_assignment_id: Number(assignmentId) } as any);
  }

  async getAssignmentWithStudent(assignmentId: string) {
    const a = assignments.findOne({ id: Number(assignmentId) } as any);
    if (!a) return null;

    const profile = profiles.findOne({ id: a.student_id } as any);
    return {
      ...a,
      profiles: profile
        ? { id: profile.id, email: profile.email, full_name: profile.full_name }
        : null,
    };
  }
}
