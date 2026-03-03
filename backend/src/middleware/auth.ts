// ═══════════════════════════════════════════════════════════════════════════════
// Auth Middleware — Extracts and verifies Supabase JWT from Bearer token
// ═══════════════════════════════════════════════════════════════════════════════

import { Request, Response, NextFunction } from 'express';
import { getAuthClient } from '../config/supabase';
import { User } from '@supabase/supabase-js';

// Extend Express Request to carry authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

/**
 * Middleware: requires a valid Bearer token.
 * Attaches `req.user` on success, returns 401 on failure.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' });
    return;
  }

  const token = authHeader.slice(7);
  const supabase = getAuthClient();

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Authentication failed' });
  }
}

/**
 * Middleware: optionally attaches user if Bearer token is present.
 * Does NOT block unauthenticated requests.
 */
export async function optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const supabase = getAuthClient();

    try {
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) req.user = user;
    } catch {
      // Ignore auth errors for optional auth
    }
  }

  next();
}

/**
 * Middleware: requires the authenticated user to have 'teacher' role.
 * Must be used after requireAuth.
 */
export async function requireTeacher(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { getServiceClient } = await import('../config/supabase');
  const supabase = getServiceClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', req.user.id)
    .single();

  if (profile?.role !== 'teacher') {
    res.status(403).json({ error: 'Teachers only' });
    return;
  }

  next();
}
