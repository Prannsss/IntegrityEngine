<?php
/**
 * Quiz Controller — CRUD for quizzes, questions, assignments
 */

namespace App\Controllers;

use App\Config\Database;
use App\Middleware\Auth;

class QuizController
{
    /**
     * GET /api/quizzes
     */
    public static function list(): void
    {
        $user = Auth::requireAuth();
        $db   = Database::getConnection();

        if ($user['role'] === 'teacher') {
            $stmt = $db->prepare('
                SELECT q.*,
                    (SELECT COUNT(*) FROM quiz_questions WHERE quiz_id = q.id) AS question_count,
                    (SELECT COUNT(*) FROM quiz_assignments WHERE quiz_id = q.id) AS assignment_count,
                    (SELECT COUNT(*) FROM quiz_assignments WHERE quiz_id = q.id AND status = "submitted") AS submitted_count
                FROM quizzes q
                WHERE q.teacher_id = ?
                ORDER BY q.created_at DESC
            ');
            $stmt->execute([$user['id']]);
        } else {
            // Students see their assigned quizzes
            $stmt = $db->prepare('
                SELECT q.*, qa.id AS assignment_id, qa.status AS assignment_status,
                       qa.risk_score, qa.total_score, qa.max_score, qa.started_at, qa.submitted_at
                FROM quizzes q
                JOIN quiz_assignments qa ON qa.quiz_id = q.id
                WHERE qa.student_id = ?
                ORDER BY q.created_at DESC
            ');
            $stmt->execute([$user['id']]);
        }

        $quizzes = $stmt->fetchAll();

        // Decode JSON settings
        foreach ($quizzes as &$q) {
            if (isset($q['settings']) && $q['settings']) {
                $q['settings'] = json_decode($q['settings'], true);
            }
        }

        echo json_encode(['success' => true, 'quizzes' => $quizzes]);
    }

    /**
     * POST /api/quizzes
     */
    public static function create(array $body): void
    {
        $user = Auth::requireAuth();
        Auth::requireTeacher($user);

        $db = Database::getConnection();

        $title       = trim($body['title'] ?? '');
        $description = trim($body['description'] ?? '');
        $type        = $body['type'] ?? 'essay';
        $contentType = $body['content_type'] ?? 'quiz';
        $timeLimit   = $body['time_limit_mins'] ?? null;
        $dueDate     = $body['due_date'] ?? null;
        $settings    = isset($body['settings']) ? json_encode($body['settings']) : null;
        $questions   = $body['questions'] ?? [];

        if (!$title) {
            http_response_code(400);
            echo json_encode(['error' => 'Title is required']);
            return;
        }

        if (!in_array($contentType, ['quiz', 'exam', 'assignment'], true)) {
            $contentType = 'quiz';
        }

        $db->beginTransaction();

        try {
            $stmt = $db->prepare('
                INSERT INTO quizzes (teacher_id, content_type, title, description, type, time_limit_mins, due_date, settings, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, "draft")
            ');
            $stmt->execute([$user['id'], $contentType, $title, $description, $type, $timeLimit, $dueDate, $settings]);
            $quizId = (int)$db->lastInsertId();

            // Insert questions
            if (!empty($questions)) {
                $qStmt = $db->prepare('
                    INSERT INTO quiz_questions (quiz_id, question_text, question_type, options, correct_answer, points, sort_order)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ');
                foreach ($questions as $i => $q) {
                    $options = isset($q['options']) ? json_encode($q['options']) : null;
                    $qStmt->execute([
                        $quizId,
                        $q['question_text'],
                        $q['question_type'] ?? 'essay',
                        $options,
                        $q['correct_answer'] ?? null,
                        $q['points'] ?? 1,
                        $q['sort_order'] ?? $i,
                    ]);
                }
            }

            $db->commit();

            echo json_encode(['success' => true, 'quiz_id' => $quizId]);
        } catch (\Exception $e) {
            $db->rollBack();
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create quiz']);
        }
    }

    /**
     * GET /api/quizzes/:id
     */
    public static function get(int $quizId): void
    {
        $user = Auth::requireAuth();
        $db   = Database::getConnection();

        $stmt = $db->prepare('SELECT * FROM quizzes WHERE id = ?');
        $stmt->execute([$quizId]);
        $quiz = $stmt->fetch();

        if (!$quiz) {
            http_response_code(404);
            echo json_encode(['error' => 'Quiz not found']);
            return;
        }

        if ($quiz['settings']) {
            $quiz['settings'] = json_decode($quiz['settings'], true);
        }

        // Fetch questions
        $qStmt = $db->prepare('SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY sort_order');
        $qStmt->execute([$quizId]);
        $questions = $qStmt->fetchAll();

        foreach ($questions as &$q) {
            if ($q['options']) {
                $q['options'] = json_decode($q['options'], true);
            }
        }

        // Fetch assignments
        $aStmt = $db->prepare('
            SELECT qa.*, p.full_name AS student_name, p.email AS student_email
            FROM quiz_assignments qa
            JOIN profiles p ON p.id = qa.student_id
            WHERE qa.quiz_id = ?
        ');
        $aStmt->execute([$quizId]);
        $assignments = $aStmt->fetchAll();

        echo json_encode([
            'success'     => true,
            'quiz'        => $quiz,
            'questions'   => $questions,
            'assignments' => $assignments,
        ]);
    }

    /**
     * PATCH /api/quizzes/:id
     */
    public static function update(int $quizId, array $body): void
    {
        $user = Auth::requireAuth();
        Auth::requireTeacher($user);
        $db = Database::getConnection();

        // Verify ownership
        $stmt = $db->prepare('SELECT id FROM quizzes WHERE id = ? AND teacher_id = ?');
        $stmt->execute([$quizId, $user['id']]);
        if (!$stmt->fetch()) {
            http_response_code(403);
            echo json_encode(['error' => 'Not authorized to update this quiz']);
            return;
        }

        $fields = [];
        $values = [];

        foreach (['title', 'description', 'type', 'status', 'time_limit_mins', 'due_date'] as $field) {
            if (array_key_exists($field, $body)) {
                $fields[] = "{$field} = ?";
                $values[] = $body[$field];
            }
        }

        if (array_key_exists('settings', $body)) {
            $fields[] = 'settings = ?';
            $values[] = json_encode($body['settings']);
        }

        if (empty($fields)) {
            echo json_encode(['success' => true, 'message' => 'No changes']);
            return;
        }

        $values[] = $quizId;
        $db->prepare('UPDATE quizzes SET ' . implode(', ', $fields) . ' WHERE id = ?')
           ->execute($values);

        echo json_encode(['success' => true]);
    }

    /**
     * DELETE /api/quizzes/:id
     */
    public static function delete(int $quizId): void
    {
        $user = Auth::requireAuth();
        Auth::requireTeacher($user);
        $db = Database::getConnection();

        $stmt = $db->prepare('SELECT id FROM quizzes WHERE id = ? AND teacher_id = ?');
        $stmt->execute([$quizId, $user['id']]);
        if (!$stmt->fetch()) {
            http_response_code(403);
            echo json_encode(['error' => 'Not authorized to delete this quiz']);
            return;
        }

        $db->prepare('DELETE FROM quizzes WHERE id = ?')->execute([$quizId]);
        echo json_encode(['success' => true]);
    }

    /**
     * POST /api/quizzes/:id/assign
     */
    public static function assign(int $quizId, array $body): void
    {
        $user = Auth::requireAuth();
        Auth::requireTeacher($user);
        $db = Database::getConnection();

        $studentIds = $body['student_ids'] ?? [];

        if (empty($studentIds)) {
            http_response_code(400);
            echo json_encode(['error' => 'student_ids is required']);
            return;
        }

        // Verify quiz ownership
        $stmt = $db->prepare('SELECT id, status FROM quizzes WHERE id = ? AND teacher_id = ?');
        $stmt->execute([$quizId, $user['id']]);
        $quiz = $stmt->fetch();

        if (!$quiz) {
            http_response_code(403);
            echo json_encode(['error' => 'Not authorized']);
            return;
        }

        $db->beginTransaction();
        try {
            $insert = $db->prepare('
                INSERT IGNORE INTO quiz_assignments (quiz_id, student_id, teacher_id, status)
                VALUES (?, ?, ?, "assigned")
            ');

            $assigned = 0;
            foreach ($studentIds as $sid) {
                $insert->execute([$quizId, (int)$sid, $user['id']]);
                $assigned += $insert->rowCount();
            }

            // Auto-publish if still draft
            if ($quiz['status'] === 'draft') {
                $db->prepare('UPDATE quizzes SET status = "published" WHERE id = ?')->execute([$quizId]);
            }

            $db->commit();
            echo json_encode(['success' => true, 'assigned_count' => $assigned]);
        } catch (\Exception $e) {
            $db->rollBack();
            http_response_code(500);
            echo json_encode(['error' => 'Failed to assign quiz']);
        }
    }
}
