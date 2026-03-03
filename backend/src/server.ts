// ═══════════════════════════════════════════════════════════════════════════════
// IntegrityEngine API — Express.js Server Entry Point
// ═══════════════════════════════════════════════════════════════════════════════

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { quizRoutes } from './routes/quiz.routes';
import { telemetryRoutes } from './routes/telemetry.routes';
import { analysisRoutes } from './routes/analysis.routes';
import { studentRoutes } from './routes/student.routes';
import { responseRoutes } from './routes/response.routes';

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Global Middleware ────────────────────────────────────────────────────────

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:9002',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

// ─── Root Handler (Render uptime ping / HEAD /) ──────────────────────────────

app.get('/', (_req, res) => {
  res.json({ name: 'IntegrityEngine API', status: 'ok' });
});

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── API Routes ───────────────────────────────────────────────────────────────

app.use('/api/quizzes', quizRoutes);
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/quiz-responses', responseRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// ─── Start Server ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  const publicUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
  console.log(`✅ IntegrityEngine API running on port ${PORT}`);
  console.log(`   Health: ${publicUrl}/api/health`);
});

export default app;
