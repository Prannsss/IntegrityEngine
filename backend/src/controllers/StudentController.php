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
}
