<?php
/**
 * Student Controller — List students, get student assignments
 */

namespace App\Controllers;

use App\Config\Database;
use App\Middleware\Auth;

class StudentController
{
    /**
     * GET /api/students — List all students (teachers only)
     */
    public static function listAll(): void
    {
        $user = Auth::requireAuth();
        Auth::requireTeacher($user);

        $db   = Database::getConnection();
        $stmt = $db->query("SELECT id, email, full_name, avatar_url, baseline_sample_count, created_at FROM profiles WHERE role = 'student' ORDER BY full_name ASC");
        $students = $stmt->fetchAll();

        echo json_encode(['success' => true, 'students' => $students]);
    }

    /**
     * GET /api/students/assignments — Get current student's assignments
     */
    public static function myAssignments(): void
    {
        $user = Auth::requireAuth();
        $db   = Database::getConnection();

        $stmt = $db->prepare('
            SELECT qa.*, q.title, q.description, q.type, q.time_limit_mins, q.due_date, q.status AS quiz_status,
                   (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = q.id) AS question_count
            FROM quiz_assignments qa
            JOIN quizzes q ON q.id = qa.quiz_id
            WHERE qa.student_id = ?
            ORDER BY qa.created_at DESC
        ');
        $stmt->execute([$user['id']]);
        $assignments = $stmt->fetchAll();

        echo json_encode(['success' => true, 'assignments' => $assignments]);
    }

    /**
     * GET /api/students/{id}/analytics — Get analytics data for a student (teachers only)
     */
    public static function analytics(int $studentId): void
    {
        $user = Auth::requireAuth();
        Auth::requireTeacher($user);
        $db = Database::getConnection();

        // Student profile
        $stmt = $db->prepare("SELECT id, email, full_name, avatar_url, baseline_sample_count, created_at FROM profiles WHERE id = ? AND role = 'student'");
        $stmt->execute([$studentId]);
        $student = $stmt->fetch();
        if (!$student) {
            http_response_code(404);
            echo json_encode(['error' => 'Student not found']);
            return;
        }

        // Assignments with quiz info
        $stmt = $db->prepare('
            SELECT qa.id, qa.quiz_id, qa.status, qa.risk_score, qa.total_score, qa.max_score,
                   qa.started_at, qa.submitted_at, qa.window_changes, qa.created_at,
                   q.title AS quiz_title, q.type AS quiz_type, q.content_type
            FROM quiz_assignments qa
            JOIN quizzes q ON q.id = qa.quiz_id
            WHERE qa.student_id = ?
            ORDER BY qa.created_at DESC
        ');
        $stmt->execute([$studentId]);
        $assignments = $stmt->fetchAll();

        // Analysis results
        $stmt = $db->prepare('
            SELECT ar.id, ar.quiz_assignment_id, ar.risk_score, ar.confidence, ar.flags,
                   ar.deviation, ar.z_scores, ar.explanation, ar.ai_explanation,
                   ar.window_change_count, ar.created_at
            FROM analysis_results ar
            WHERE ar.student_id = ?
            ORDER BY ar.created_at DESC
        ');
        $stmt->execute([$studentId]);
        $analyses = $stmt->fetchAll();

        // Decode JSON fields
        foreach ($analyses as &$a) {
            $a['flags']     = json_decode($a['flags'] ?? '[]', true);
            $a['deviation'] = json_decode($a['deviation'] ?? '{}', true);
            $a['z_scores']  = json_decode($a['z_scores'] ?? '{}', true);
        }

        // Window change logs
        $qaIds = array_column($assignments, 'id');
        $windowLogs = [];
        if (!empty($qaIds)) {
            $placeholders = implode(',', array_fill(0, count($qaIds), '?'));
            $stmt = $db->prepare("
                SELECT wcl.quiz_assignment_id, wcl.event_type, wcl.timestamp, wcl.away_duration_ms
                FROM window_change_logs wcl
                WHERE wcl.quiz_assignment_id IN ($placeholders)
                ORDER BY wcl.timestamp ASC
            ");
            $stmt->execute($qaIds);
            $windowLogs = $stmt->fetchAll();
        }

        // Keystroke summary (avg wpm, total paste)
        $keystrokeSummary = [];
        if (!empty($qaIds)) {
            $placeholders = implode(',', array_fill(0, count($qaIds), '?'));
            $stmt = $db->prepare("
                SELECT quiz_assignment_id,
                       ROUND(AVG(wpm), 1) AS avg_wpm,
                       MAX(peak_wpm) AS peak_wpm,
                       SUM(paste_chars) AS total_paste_chars,
                       SUM(paste_events) AS total_paste_events,
                       SUM(total_keys) AS total_keys
                FROM keystroke_logs
                WHERE quiz_assignment_id IN ($placeholders)
                GROUP BY quiz_assignment_id
            ");
            $stmt->execute($qaIds);
            $keystrokeSummary = $stmt->fetchAll();
        }

        echo json_encode([
            'success'           => true,
            'student'           => $student,
            'assignments'       => $assignments,
            'analyses'          => $analyses,
            'window_logs'       => $windowLogs,
            'keystroke_summary' => $keystrokeSummary,
        ]);
    }
}
