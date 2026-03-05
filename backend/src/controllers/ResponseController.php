<?php
/**
 * Response Controller — Submit quiz answers, auto-grade MCQ
 */

namespace App\Controllers;

use App\Config\Database;
use App\Middleware\Auth;

class ResponseController
{
    /**
     * POST /api/quiz-responses/submit
     */
    public static function submit(array $body): void
    {
        $qaId      = (int)($body['quiz_assignment_id'] ?? 0);
        $responses = $body['responses'] ?? [];

        if (!$qaId || empty($responses)) {
            http_response_code(400);
            echo json_encode(['error' => 'quiz_assignment_id and responses are required']);
            return;
        }

        $db = Database::getConnection();

        // Verify assignment exists
        $stmt = $db->prepare('SELECT * FROM quiz_assignments WHERE id = ?');
        $stmt->execute([$qaId]);
        $assignment = $stmt->fetch();

        if (!$assignment) {
            http_response_code(404);
            echo json_encode(['error' => 'Assignment not found']);
            return;
        }

        $db->beginTransaction();

        try {
            $totalScore = 0;
            $maxScore   = 0;

            $upsert = $db->prepare('
                INSERT INTO quiz_responses (quiz_assignment_id, question_id, answer_text, selected_option, is_correct, score)
                VALUES (?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE answer_text = VALUES(answer_text), selected_option = VALUES(selected_option), is_correct = VALUES(is_correct), score = VALUES(score)
            ');

            foreach ($responses as $resp) {
                $questionId = (int)($resp['question_id'] ?? 0);
                $answerText = $resp['answer_text'] ?? '';
                $selectedOpt = $resp['selected_option'] ?? null;

                // Fetch question for auto-grading
                $qStmt = $db->prepare('SELECT * FROM quiz_questions WHERE id = ?');
                $qStmt->execute([$questionId]);
                $question = $qStmt->fetch();

                if (!$question) continue;

                $maxScore += $question['points'];
                $isCorrect = null;
                $score = null;

                if ($question['question_type'] === 'multiple_choice' && $question['correct_answer']) {
                    $isCorrect = (trim($selectedOpt ?? '') === trim($question['correct_answer'])) ? 1 : 0;
                    $score = $isCorrect ? $question['points'] : 0;
                    $totalScore += $score;
                }

                $upsert->execute([$qaId, $questionId, $answerText, $selectedOpt, $isCorrect, $score]);
            }

            // Update assignment
            $db->prepare('
                UPDATE quiz_assignments SET status = "submitted", submitted_at = NOW(), total_score = ?, max_score = ?
                WHERE id = ?
            ')->execute([$totalScore, $maxScore, $qaId]);

            $db->commit();

            echo json_encode([
                'success'     => true,
                'total_score' => $totalScore,
                'max_score'   => $maxScore,
            ]);
        } catch (\Exception $e) {
            $db->rollBack();
            http_response_code(500);
            echo json_encode(['error' => 'Submission failed']);
        }
    }
}
