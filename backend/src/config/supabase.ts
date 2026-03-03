// ═══════════════════════════════════════════════════════════════════════════════
// Supabase Configuration — Service client & user auth client
// ═══════════════════════════════════════════════════════════════════════════════

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/**
 * Service client — bypasses RLS for server-side operations.
 */
export function getServiceClient(): SupabaseClient {
  return createClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY,
    { auth: { persistSession: false } }
  );
}

/**
 * Auth client — used to verify user tokens.
 */
export function getAuthClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
