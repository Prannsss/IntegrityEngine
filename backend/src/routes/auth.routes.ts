import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { JsonStore } from '../lib/json-store';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'integrity-engine-local-dev-secret';
const JWT_EXPIRES_IN = '7d';

type Profile = {
  id: string;
  email: string;
  password_hash: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'teacher' | 'student';
  baseline_fingerprint: Record<string, number> | null;
  baseline_sample_count: number;
  email_verified: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
};

const profiles = new JsonStore<Profile>('profiles.json', { useUuid: true });

function signToken(profile: Profile): string {
  return jwt.sign(
    { id: profile.id, email: profile.email, role: profile.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function sanitizeProfile(p: Profile) {
  const { password_hash, ...rest } = p;
  return rest;
}

/** POST /api/auth/signup */
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, full_name, role } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const existing = profiles.findOne({ email } as any);
    if (existing) {
      res.status(409).json({ error: 'User already exists with that email' });
      return;
    }

    const password_hash = await bcrypt.hash(password, 10);
    const id = crypto.randomUUID();

    const profile = profiles.insert({
      id,
      email,
      password_hash,
      full_name: full_name || null,
      avatar_url: null,
      role: role || 'student',
      baseline_fingerprint: null,
      baseline_sample_count: 0,
      email_verified: false,
      last_login_at: new Date().toISOString(),
    } as any);

    const token = signToken(profile);
    res.status(201).json({ token, user: sanitizeProfile(profile) });
  } catch (err: any) {
    console.error('Signup error:', err.message);
    res.status(500).json({ error: 'Signup failed' });
  }
});

/** POST /api/auth/login */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const profile = profiles.findOne({ email } as any);
    if (!profile) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const valid = await bcrypt.compare(password, profile.password_hash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    profiles.update({ id: profile.id } as any, { last_login_at: new Date().toISOString() } as any);

    const token = signToken(profile);
    res.json({ token, user: sanitizeProfile(profile) });
  } catch (err: any) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

/** GET /api/auth/me — returns the profile for the current JWT */
router.get('/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing token' });
    return;
  }

  try {
    const decoded = jwt.verify(authHeader.slice(7), JWT_SECRET) as { id: string };
    const profile = profiles.findOne({ id: decoded.id } as any);
    if (!profile) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({ user: sanitizeProfile(profile) });
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

export { router as authRoutes, profiles as profilesStore, JWT_SECRET };
