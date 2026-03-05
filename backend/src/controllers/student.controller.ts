// ═══════════════════════════════════════════════════════════════════════════════
// Student Controller — List student profiles and their assignments
// ═══════════════════════════════════════════════════════════════════════════════

import { Request, Response } from 'express';
import { StudentModel } from '../models/student.model';

const studentModel = new StudentModel();

// ─── GET /api/students ── List all students (teachers only) ───────────────

export async function listStudents(req: Request, res: Response): Promise<void> {
  try {
    const students = await studentModel.listAll();
    res.json({ students });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

// ─── GET /api/students/:studentId/assignments ── Student assignments ──────

export async function getStudentAssignments(req: Request, res: Response): Promise<void> {
  try {
    const studentId = req.params.studentId as string;
    const assignments = await studentModel.getStudentAssignments(studentId);
    res.json({ assignments });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
