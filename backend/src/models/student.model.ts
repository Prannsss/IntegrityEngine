// ═══════════════════════════════════════════════════════════════════════════════
// Student Model — Supabase queries for student profiles
// ═══════════════════════════════════════════════════════════════════════════════

import { getServiceClient } from '../config/supabase';

export class StudentModel {
  private supabase = getServiceClient();

  /** List all students (for teacher assignment) */
  async listAll() {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('id, email, full_name, avatar_url, baseline_sample_count, created_at')
      .eq('role', 'student')
      .order('full_name', { ascending: true });

    if (error) throw error;
    return data;
  }

  /** Get user role by ID */
  async getRole(userId: string): Promise<string | null> {
    const { data } = await this.supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    return data?.role || null;
  }
}
