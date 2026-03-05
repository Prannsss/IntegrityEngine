// ═══════════════════════════════════════════════════════════════════════════════
// Student Routes — Express router for student profiles
// ═══════════════════════════════════════════════════════════════════════════════

import { Router } from 'express';
import { requireAuth, requireTeacher } from '../middleware/auth';
import { listStudents, getStudentAssignments } from '../controllers/student.controller';

export const studentRoutes = Router();

// GET /api/students — list all students (teachers only)
studentRoutes.get('/', requireAuth, requireTeacher, listStudents);

// GET /api/students/:studentId/assignments — list assignments for a student (teachers only)
studentRoutes.get('/:studentId/assignments', requireAuth, requireTeacher, getStudentAssignments);
