import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { authRoutes } from './routes/auth.routes';
import { quizRoutes } from './routes/quiz.routes';
import { assignmentRoutes } from './routes/assignment.routes';
import { telemetryRoutes } from './routes/telemetry.routes';
import { analysisRoutes } from './routes/analysis.routes';
import { studentRoutes } from './routes/student.routes';
import { responseRoutes } from './routes/response.routes';
import { seedDatabase } from './lib/seed';

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

// ─── Root Handler ─────────────────────────────────────────────────────────────

app.get('/', (_req, res) => {
  res.json({ name: 'IntegrityEngine API', status: 'ok', storage: 'local-json' });
});

// ─── Health Check ─────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── API Routes ───────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/quiz-assignments', assignmentRoutes);
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

async function start() {
  console.log('🗄️  Initializing local JSON database...');
  await seedDatabase();

  app.listen(PORT, () => {
    console.log(`✅ IntegrityEngine API running on port ${PORT}`);
    console.log(`   Storage: Local JSON files (backend/data/)`);
    console.log(`   Health: http://localhost:${PORT}/api/health`);
  });
}

start().catch(console.error);

export default app;
