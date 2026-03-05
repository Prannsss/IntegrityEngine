const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
const TOKEN_KEY = 'ie_auth_token';

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function apiGet<T = any>(path: string): Promise<T> {
  const headers = getAuthHeaders();
  const res = await fetch(`${BACKEND_URL}${path}`, { headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API error ${res.status}`);
  }
  return res.json();
}

async function apiPost<T = any>(path: string, body: unknown): Promise<T> {
  const headers = getAuthHeaders();
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `API error ${res.status}`);
  }
  return res.json();
}

async function apiPatch<T = any>(path: string, body: unknown): Promise<T> {
  const headers = getAuthHeaders();
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `API error ${res.status}`);
  }
  return res.json();
}

// ─── Quiz endpoints ──────────────────────────────────────────────────────────

export type CreateQuizPayload = {
  title: string;
  description?: string;
  type: 'essay' | 'multiple_choice' | 'mixed';
  time_limit_mins?: number | null;
  status?: string;
  due_date?: string | null;
  questions?: {
    question_text: string;
    question_type: 'essay' | 'multiple_choice';
    options?: string[] | null;
    correct_answer?: string | null;
    points: number;
    sort_order?: number;
  }[];
};

export function createQuiz(payload: CreateQuizPayload) {
  return apiPost<{ quiz: any }>('/api/quizzes', payload);
}

export function listQuizzes() {
  return apiGet<{ quizzes: any[] }>('/api/quizzes');
}

export function getQuiz(quizId: string | number) {
  return apiGet<{ quiz: any }>(`/api/quizzes/${quizId}`);
}

export function assignQuiz(quizId: string | number, studentIds: string[]) {
  return apiPost<{ assignments: any[] }>(`/api/quizzes/${quizId}/assign`, { student_ids: studentIds });
}

// ─── Assignment endpoints ────────────────────────────────────────────────────

export function listAssignments() {
  return apiGet<{ assignments: any[] }>('/api/quiz-assignments');
}

export function getAssignment(qaId: string | number) {
  return apiGet<{ assignment: any }>(`/api/quiz-assignments/${qaId}`);
}

export function updateAssignment(qaId: string | number, updates: Record<string, any>) {
  return apiPatch<{ assignment: any }>(`/api/quiz-assignments/${qaId}`, updates);
}

export function getAssignmentReplays(qaId: string | number) {
  return apiGet<{ replays: any[] }>(`/api/quiz-assignments/${qaId}/replays`);
}

// ─── Student endpoints ───────────────────────────────────────────────────────

export function listStudents() {
  return apiGet<{ students: any[] }>('/api/students');
}

export function getStudentAssignments(studentId: string) {
  return apiGet<{ assignments: any[] }>(`/api/students/${studentId}/assignments`);
}

// ─── Response endpoints ──────────────────────────────────────────────────────

export type SubmitResponsesPayload = {
  quiz_assignment_id: string | number;
  responses: {
    question_id: string | number;
    answer_text?: string;
    selected_option?: string | null;
  }[];
};

export function submitResponses(payload: SubmitResponsesPayload) {
  return apiPost<{ success: boolean; total_score: number; max_score: number }>('/api/quiz-responses/submit', payload);
}

export type StudentResponse = {
  id: number;
  question_id: number;
  question_text: string;
  question_type: string;
  options: string[] | null;
  correct_answer: string | null;
  points: number;
  sort_order: number;
  answer_text: string;
  selected_option: string | null;
  is_correct: boolean | null;
  score: number | null;
};

export function getResponses(qaId: string | number) {
  return apiGet<{ responses: StudentResponse[] }>(`/api/quiz-responses?quiz_assignment_id=${qaId}`);
}

export function scoreResponse(responseId: string | number, score: number) {
  return apiPatch<{ success: boolean; total_score: number; max_score: number; all_scored: boolean }>(
    `/api/quiz-responses/${responseId}/score`,
    { score }
  );
}

// ─── Telemetry endpoints ─────────────────────────────────────────────────────

export type HeartbeatPayload = {
  quiz_assignment_id: string | number;
  session_id: string;
  events?: unknown[];
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
};

export function postHeartbeat(payload: HeartbeatPayload) {
  return apiPost<{ log: any }>('/api/telemetry/heartbeat', payload);
}

export type WindowChangePayload = {
  quiz_assignment_id: string | number;
  session_id: string;
  event_type: 'blur' | 'focus';
  away_duration_ms?: number | null;
};

export function postWindowChange(payload: WindowChangePayload) {
  return apiPost<{ log: any }>('/api/telemetry/window-change', payload);
}

export type ReplayPayload = {
  quiz_assignment_id: string | number;
  session_id: string;
  question_id?: string | number | null;
  replay_events?: unknown[];
  text_snapshots?: { timestamp: number; text: string }[];
  duration_ms?: number;
  total_events?: number;
};

export function postReplay(payload: ReplayPayload) {
  return apiPost<{ replay: any }>('/api/telemetry/replay', payload);
}

// ─── Teacher analytics endpoints ─────────────────────────────────────────────

export type TelemetrySummary = {
  wpm: number;
  burst_score: number;
  avg_latency: number;
  peak_wpm: number;
  paste_chars: number;
  paste_events: number;
  total_keys: number;
  window_change_count: number;
  wpm_history: number[];
  heartbeat_count: number;
};

export type KeystrokeLogEntry = {
  id: number;
  wpm: number;
  burst_score: number;
  avg_latency: number;
  peak_wpm: number;
  paste_chars: number;
  paste_events: number;
  total_keys: number;
  wpm_history: number[];
  created_at: string;
};

export type WindowChangeEntry = {
  id: number;
  quiz_assignment_id: number;
  session_id: string;
  event_type: 'blur' | 'focus';
  timestamp: string;
  away_duration_ms: number | null;
  created_at: string;
};

export function getTelemetrySummary(qaId: string | number) {
  return apiGet<{ summary: TelemetrySummary }>(`/api/telemetry/summary?quiz_assignment_id=${qaId}`);
}

export function getKeystrokeLogs(qaId: string | number) {
  return apiGet<{ logs: KeystrokeLogEntry[] }>(`/api/telemetry/keystroke-logs?quiz_assignment_id=${qaId}`);
}

export function getWindowChanges(qaId: string | number) {
  return apiGet<{ logs: WindowChangeEntry[] }>(`/api/telemetry/window-change?quiz_assignment_id=${qaId}`);
}

export function getReplays(qaId: string | number) {
  return apiGet<{ replays: any[] }>(`/api/telemetry/replay?quiz_assignment_id=${qaId}`);
}
