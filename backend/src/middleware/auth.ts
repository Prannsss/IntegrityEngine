import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JsonStore } from '../lib/json-store';

const JWT_SECRET = process.env.JWT_SECRET || 'integrity-engine-local-dev-secret';

export type AuthUser = {
  id: string;
  email: string;
  role: 'teacher' | 'student';
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/**
 * Middleware: requires a valid Bearer token.
 * Attaches `req.user` on success, returns 401 on failure.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' });
    return;
  }

  try {
    const decoded = jwt.verify(authHeader.slice(7), JWT_SECRET) as AuthUser;
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Middleware: optionally attaches user if Bearer token is present.
 * Does NOT block unauthenticated requests.
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(authHeader.slice(7), JWT_SECRET) as AuthUser;
      req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
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
export function requireTeacher(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  if (req.user.role !== 'teacher') {
    res.status(403).json({ error: 'Teachers only' });
    return;
  }

  next();
}
