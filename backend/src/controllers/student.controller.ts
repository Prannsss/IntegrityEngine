// ═══════════════════════════════════════════════════════════════════════════════
// Student Controller — List student profiles
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
