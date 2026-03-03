// ═══════════════════════════════════════════════════════════════════════════════
// Student Routes — Express router for student profiles
// ═══════════════════════════════════════════════════════════════════════════════

import { Router } from 'express';
import { requireAuth, requireTeacher } from '../middleware/auth';
import { listStudents } from '../controllers/student.controller';

export const studentRoutes = Router();

// GET /api/students → list all students (teachers only)
studentRoutes.get('/', requireAuth, requireTeacher, listStudents);
