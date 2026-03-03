/**
 * ─── Security & Integrity Utilities ─────────────────────────────────────────
 *
 * Client-side payload signing and tamper detection for telemetry data.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * 1. PREVENTING TELEMETRY TAMPERING
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Strategy: HMAC-SHA256 payload signing.
 *
 * - Each telemetry heartbeat payload is signed with a shared secret before
 *   transmission. The server verifies the signature on receipt.
 * - The signing key is derived from a per-session secret issued by the server
 *   at session start (NOT hardcoded in client JS).
 * - The payload includes a monotonic sequence number to detect reordering.
 *
 * Limitation: Since the client is a browser, a determined attacker can
 * extract the session key. This is a deterrent, not absolute prevention.
 * For a production system, consider a browser extension or proctoring agent.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * 2. PAYLOAD SIGNING
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Sign: HMAC-SHA256(JSON.stringify(payload), sessionKey)
 * Verify: Recompute HMAC on server and compare.
 *
 * The signature covers the entire payload including nonce and timestamp,
 * so any modification invalidates it.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * 3. PREVENTING REPLAY ATTACKS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * - Each payload includes a unique `nonce` (timestamp + random string).
 * - Server maintains a short-lived nonce cache (TTL = 5 minutes).
 * - Duplicate nonces are rejected.
 * - Payloads older than 5 minutes are rejected (clock drift tolerance: 30s).
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 * 4. DATA MINIMIZATION
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * - Pasted text is truncated to 200 characters (enough for analysis, not storage).
 * - Key codes are recorded, not actual characters (e.g., "KeyA" not "a").
 * - Raw events are purged from `keystroke_logs` after 30 days.
 * - Only computed fingerprints and analysis results are retained long-term.
 * - No PII beyond Supabase Auth user ID is stored in telemetry tables.
 */

import { TelemetryPayload } from '../telemetry/types';

// ─── HMAC-SHA256 Signing (Web Crypto API) ───────────────────────────────────

/**
 * Sign a telemetry payload using HMAC-SHA256.
 * Uses the Web Crypto API (available in modern browsers and Edge Functions).
 *
 * @param payload - The telemetry payload to sign
 * @param secretKey - The per-session signing key (issued by server)
 * @returns The hex-encoded HMAC signature
 */
export async function signPayload(
  payload: Omit<TelemetryPayload, 'signature'>,
  secretKey: string
): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(payload));
  const keyData = encoder.encode(secretKey);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, data);
  return bufferToHex(signatureBuffer);
}

/**
 * Verify a signed telemetry payload.
 *
 * @param payload - The full payload including signature
 * @param secretKey - The per-session signing key
 * @returns true if signature is valid
 */
export async function verifyPayload(
  payload: TelemetryPayload,
  secretKey: string
): Promise<boolean> {
  const { signature, ...payloadWithoutSig } = payload;
  if (!signature) return false;

  const expectedSignature = await signPayload(payloadWithoutSig, secretKey);
  return timingSafeEqual(signature, expectedSignature);
}

// ─── Nonce Validation (Server-Side) ─────────────────────────────────────────

/**
 * In-memory nonce cache for replay prevention.
 * In production, use Redis or Supabase edge cache.
 */
const nonceCache = new Map<string, number>();
const NONCE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const CLOCK_DRIFT_TOLERANCE_MS = 30 * 1000; // 30 seconds

/**
 * Validate a payload's nonce and timestamp.
 * Rejects duplicate nonces and stale payloads.
 */
export function validateNonce(nonce: string, payloadTimestamp: number): boolean {
  const now = Date.now();

  // Reject stale payloads
  if (Math.abs(now - payloadTimestamp) > NONCE_TTL_MS + CLOCK_DRIFT_TOLERANCE_MS) {
    return false;
  }

  // Reject duplicate nonces
  if (nonceCache.has(nonce)) {
    return false;
  }

  // Store nonce with TTL
  nonceCache.set(nonce, now);

  // Cleanup expired nonces
  cleanupNonceCache();

  return true;
}

function cleanupNonceCache(): void {
  const now = Date.now();
  for (const [key, timestamp] of nonceCache.entries()) {
    if (now - timestamp > NONCE_TTL_MS) {
      nonceCache.delete(key);
    }
  }
}

// ─── Utility Functions ──────────────────────────────────────────────────────

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Constant-time string comparison to prevent timing attacks on signature verification.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// ─── Session Key Generation (Server-Side) ───────────────────────────────────

/**
 * Generate a per-session signing key.
 * Call this from an API route when a student starts a typing session.
 */
export function generateSessionKey(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return bufferToHex(array.buffer);
}
