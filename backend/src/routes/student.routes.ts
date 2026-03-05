// ═══════════════════════════════════════════════════════════════════════════════
// Student Routes — Express router for student profiles
// ═══════════════════════════════════════════════════════════════════════════════

import { Router } from 'express';
import { requireAuth, requireTeacher } from '../Middleware/auth';
import { listStudents, myAssignments } from '../Controllers/student.controller';

export const studentRoutes = Router();

// GET /api/students/assignments → get current student's assignments (must be before /:id)
studentRoutes.get('/assignments', requireAuth, myAssignments);

// GET /api/students → list all students (teachers only)
studentRoutes.get('/', requireAuth, requireTeacher, listStudents);
