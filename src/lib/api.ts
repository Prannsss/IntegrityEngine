/**
 * IntegrityEngine API Client
 * Communicates with the PHP backend via REST.
 */

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost/IntegrityEngine/backend/public';

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('ie_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('ie_token', token);
      } else {
        localStorage.removeItem('ie_token');
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T = unknown>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });

    const data = await res.json();

    if (!res.ok) {
      const error = data.error || `Request failed with status ${res.status}`;
      throw new ApiError(error, res.status, data);
    }

    return data as T;
  }

  // ─── Auth ─────────────────────────────────────────────────────────────────

  async signup(email: string, password: string, fullName: string, role: 'teacher' | 'student') {
    return this.request<{ success: boolean; message: string; user_id: number }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name: fullName, role }),
    });
  }

  async login(email: string, password: string) {
    const data = await this.request<{ success: boolean; token: string; user: UserProfile }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async me() {
    return this.request<{ success: boolean; user: UserProfile }>('/api/auth/me');
  }

  async forgotPassword(email: string) {
    return this.request<{ success: boolean; message: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyEmail(email: string, code: string) {
    return this.request<{ success: boolean; message: string }>('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  }

  async resendVerification(email: string) {
    return this.request<{ success: boolean; message: string }>('/api/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  logout() {
    this.setToken(null);
  }

  // ─── Quizzes ──────────────────────────────────────────────────────────────

  async listQuizzes() {
    return this.request<{ success: boolean; quizzes: Quiz[] }>('/api/quizzes');
  }

  async getQuiz(id: number) {
    return this.request<{ success: boolean; quiz: Quiz; questions: QuizQuestion[]; assignments: QuizAssignment[] }>(`/api/quizzes/${id}`);
  }

  async createQuiz(data: CreateQuizInput) {
    return this.request<{ success: boolean; quiz_id: number }>('/api/quizzes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateQuiz(id: number, data: Partial<Quiz>) {
    return this.request<{ success: boolean }>(`/api/quizzes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteQuiz(id: number) {
    return this.request<{ success: boolean }>(`/api/quizzes/${id}`, {
      method: 'DELETE',
    });
  }

  async assignQuiz(quizId: number, studentIds: number[]) {
    return this.request<{ success: boolean; assigned_count: number }>(`/api/quizzes/${quizId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ student_ids: studentIds }),
    });
  }

  // ─── Students ─────────────────────────────────────────────────────────────

  async listStudents() {
    return this.request<{ success: boolean; students: StudentProfile[] }>('/api/students');
  }

  async myAssignments() {
    return this.request<{ success: boolean; assignments: StudentAssignment[] }>('/api/students/assignments');
  }

  // ─── Announcements ────────────────────────────────────────────────────────

  async announcements() {
    return this.request<{ success: boolean; announcements: Announcement[] }>('/api/announcements');
  }

  // ─── Responses ────────────────────────────────────────────────────────────

  async submitResponses(qaId: number, responses: QuizResponseInput[]) {
    return this.request<{ success: boolean; total_score: number; max_score: number }>('/api/quiz-responses/submit', {
      method: 'POST',
      body: JSON.stringify({ quiz_assignment_id: qaId, responses }),
    });
  }

  // ─── Telemetry ────────────────────────────────────────────────────────────

  async sendHeartbeat(data: HeartbeatPayload) {
    return this.request('/api/telemetry/heartbeat', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async sendWindowChange(data: WindowChangePayload) {
    return this.request('/api/telemetry/window-change', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getWindowChanges(qaId: number) {
    return this.request<{ success: boolean; logs: WindowChangeLog[] }>(`/api/telemetry/window-change?quiz_assignment_id=${qaId}`);
  }

  async saveReplay(data: ReplayPayload) {
    return this.request('/api/telemetry/replay', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getReplays(qaId: number) {
    return this.request<{ success: boolean; replays: SessionReplay[] }>(`/api/telemetry/replay?quiz_assignment_id=${qaId}`);
  }

  // ─── Analysis ─────────────────────────────────────────────────────────────

  async runAnalysis(qaId: number) {
    return this.request<AnalysisResponse>('/api/analysis/run', {
      method: 'POST',
      body: JSON.stringify({ quiz_assignment_id: qaId }),
    });
  }

  // ─── Materials ────────────────────────────────────────────────────────────

  async listMaterials() {
    return this.request<{ success: boolean; materials: Material[] }>('/api/materials');
  }

  async uploadMaterial(formData: FormData) {
    // File upload uses multipart/form-data — do NOT set Content-Type manually
    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    const res = await fetch(`${API_BASE}/api/materials/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) {
      throw new ApiError(data.error || `Upload failed (${res.status})`, res.status, data);
    }
    return data as { success: boolean; material: Material };
  }

  async deleteMaterial(id: number) {
    return this.request<{ success: boolean }>(`/api/materials/${id}`, { method: 'DELETE' });
  }
}

// ─── Error class ──────────────────────────────────────────────────────────────

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserProfile = {
  id: number;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'teacher' | 'student';
  baseline_fingerprint: Record<string, number> | null;
  baseline_sample_count: number;
  email_verified: number;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Quiz = {
  id: number;
  teacher_id: number;
  content_type: 'quiz' | 'exam' | 'assignment';
  title: string;
  description: string;
  type: 'essay' | 'multiple_choice' | 'mixed';
  status: 'draft' | 'published' | 'closed';
  time_limit_mins: number | null;
  due_date: string | null;
  settings: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  // Computed fields from list query
  question_count?: number;
  assignment_count?: number;
  submitted_count?: number;
};

export type QuizQuestion = {
  id: number;
  quiz_id: number;
  question_text: string;
  question_type: 'essay' | 'multiple_choice';
  options: string[] | null;
  correct_answer: string | null;
  points: number;
  sort_order: number;
  created_at: string;
};

export type QuizAssignment = {
  id: number;
  quiz_id: number;
  student_id: number;
  teacher_id: number | null;
  status: 'assigned' | 'in_progress' | 'submitted' | 'reviewed' | 'flagged';
  risk_score: number | null;
  total_score: number | null;
  max_score: number | null;
  started_at: string | null;
  submitted_at: string | null;
  session_id: string | null;
  window_changes: number;
  created_at: string;
  updated_at: string;
  // Joined fields
  student_name?: string;
  student_email?: string;
  // Student view joined fields
  title?: string;
  description?: string;
  type?: string;
  time_limit_mins?: number;
  due_date?: string;
  quiz_status?: string;
  assignment_status?: string;
  assignment_id?: number;
};

export type StudentAssignment = {
  id: number;
  quiz_id: number;
  student_id: number;
  status: 'assigned' | 'in_progress' | 'submitted' | 'reviewed' | 'flagged';
  risk_score: number | null;
  total_score: number | null;
  max_score: number | null;
  started_at: string | null;
  submitted_at: string | null;
  title: string;
  description: string;
  type: string;
  time_limit_mins: number | null;
  due_date: string | null;
  quiz_status: string;
  question_count: number;
  created_at: string;
  updated_at: string;
};

export type Announcement = {
  id: number;
  author_id: number | null;
  author_name: string;
  author_avatar: string | null;
  type: 'user' | 'system' | 'alert';
  title: string;
  content: string;
  created_at: string;
};

export type StudentProfile = {
  id: number;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  baseline_sample_count: number;
  created_at: string;
};

export type CreateQuizInput = {
  title: string;
  description?: string;
  content_type?: 'quiz' | 'exam' | 'assignment';
  type: 'essay' | 'multiple_choice' | 'mixed';
  time_limit_mins?: number;
  due_date?: string;
  settings?: Record<string, unknown>;
  questions: {
    question_text: string;
    question_type: 'essay' | 'multiple_choice';
    options?: string[];
    correct_answer?: string;
    points?: number;
    sort_order?: number;
  }[];
};

export type QuizResponseInput = {
  question_id: number;
  answer_text?: string;
  selected_option?: string | null;
};

export type HeartbeatPayload = {
  quiz_assignment_id: number;
  session_id: string;
  events: unknown[];
  wpm: number;
  burst_score: number;
  avg_latency: number;
  peak_wpm: number;
  paste_chars: number;
  paste_events: number;
  total_keys: number;
  wpm_history: number[];
  nonce?: string;
  signature?: string;
};

export type WindowChangePayload = {
  quiz_assignment_id: number;
  session_id: string;
  event_type: 'blur' | 'focus';
  away_duration_ms?: number | null;
};

export type WindowChangeLog = {
  id: number;
  quiz_assignment_id: number;
  session_id: string;
  event_type: 'blur' | 'focus';
  timestamp: string;
  away_duration_ms: number | null;
  created_at: string;
};

export type ReplayPayload = {
  quiz_assignment_id: number;
  session_id: string;
  question_id?: number | null;
  replay_events: unknown[];
  text_snapshots: unknown[];
  duration_ms: number;
  total_events: number;
};

export type SessionReplay = {
  id: number;
  quiz_assignment_id: number;
  session_id: string;
  question_id: number | null;
  replay_events: unknown[];
  text_snapshots: unknown[];
  duration_ms: number;
  total_events: number;
  created_at: string;
};

export type AnalysisResponse = {
  success: boolean;
  risk_score: number;
  confidence: number;
  flags: AnomalyFlag[];
  deviation: Record<string, number>;
  z_scores: Record<string, number>;
  explanation: string;
};

export type AnomalyFlag = {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  label: string;
  detail: string;
  value: number;
  threshold: number;
};

export type Material = {
  id: number;
  teacher_id: number;
  title: string;
  description: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
  updated_at: string;
};

// ─── Singleton Export ─────────────────────────────────────────────────────────

export const api = new ApiClient();
