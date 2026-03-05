<?php
/**
 * Analysis Controller — Run integrity analysis on a submission
 */

namespace App\Controllers;

use App\Config\Database;
use App\Middleware\Auth;

class AnalysisController
{
    /**
     * POST /api/analysis/run
     * Body: { quiz_assignment_id: number }
     */
    public static function run(array $body): void
    {
        $user = Auth::requireAuth();
        $db   = Database::getConnection();

        $qaId = (int)($body['quiz_assignment_id'] ?? 0);

        if (!$qaId) {
            http_response_code(400);
            echo json_encode(['error' => 'quiz_assignment_id is required']);
            return;
        }

        // Get assignment + student
        $stmt = $db->prepare('
            SELECT qa.*, p.baseline_fingerprint, p.baseline_sample_count, p.full_name AS student_name
            FROM quiz_assignments qa
            JOIN profiles p ON p.id = qa.student_id
            WHERE qa.id = ?
        ');
        $stmt->execute([$qaId]);
        $assignment = $stmt->fetch();

        if (!$assignment) {
            http_response_code(404);
            echo json_encode(['error' => 'Assignment not found']);
            return;
        }

        // Get latest keystroke log
        $kStmt = $db->prepare('
            SELECT * FROM keystroke_logs
            WHERE quiz_assignment_id = ?
            ORDER BY timestamp DESC LIMIT 1
        ');
        $kStmt->execute([$qaId]);
        $keystrokeLog = $kStmt->fetch();

        // Get window change count
        $wStmt = $db->prepare('
            SELECT COUNT(*) AS cnt FROM window_change_logs
            WHERE quiz_assignment_id = ? AND event_type = "blur"
        ');
        $wStmt->execute([$qaId]);
        $windowCount = (int)$wStmt->fetch()['cnt'];

        // Get fingerprint for this assignment
        $fStmt = $db->prepare('SELECT * FROM fingerprints WHERE quiz_assignment_id = ?');
        $fStmt->execute([$qaId]);
        $fingerprint = $fStmt->fetch();

        // Build risk score (simplified server-side version)
        $riskScore = 0;
        $flags = [];
        $confidence = 0.5;

        // Factor: window changes
        if ($windowCount > 0) {
            $windowPenalty = min($windowCount * 5, 30);
            $riskScore += $windowPenalty;
            $flags[] = [
                'id' => 'window_changes',
                'severity' => $windowCount > 5 ? 'high' : 'medium',
                'label' => 'Tab Switching Detected',
                'detail' => "{$windowCount} window focus changes detected",
                'value' => $windowCount,
                'threshold' => 0,
            ];
        }

        // Factor: paste events
        if ($keystrokeLog) {
            $pasteEvents = (int)$keystrokeLog['paste_events'];
            $pasteChars  = (int)$keystrokeLog['paste_chars'];

            if ($pasteChars > 100) {
                $pastePenalty = min((int)($pasteChars / 50) * 5, 25);
                $riskScore += $pastePenalty;
                $flags[] = [
                    'id' => 'large_paste',
                    'severity' => $pasteChars > 300 ? 'critical' : 'high',
                    'label' => 'Large Paste Event',
                    'detail' => "{$pasteChars} characters pasted across {$pasteEvents} events",
                    'value' => $pasteChars,
                    'threshold' => 100,
                ];
            }

            // Factor: WPM anomaly
            $wpm = (float)$keystrokeLog['wpm'];
            if ($wpm > 150) {
                $riskScore += 15;
                $flags[] = [
                    'id' => 'wpm_spike',
                    'severity' => 'high',
                    'label' => 'WPM Spike Detected',
                    'detail' => "Current WPM ({$wpm}) is unusually high",
                    'value' => $wpm,
                    'threshold' => 150,
                ];
            }
        }

        // Factor: fingerprint deviation
        $deviation = [];
        $zScores = [];

        if ($fingerprint && $assignment['baseline_fingerprint']) {
            $baseline = json_decode($assignment['baseline_fingerprint'], true);
            $metrics = ['lexical_density', 'avg_sentence_length', 'vocabulary_diversity', 'burst_score', 'flesch_kincaid_score'];

            foreach ($metrics as $metric) {
                $current  = (float)($fingerprint[$metric] ?? 0);
                $base     = (float)($baseline[$metric] ?? 0);
                $dev      = $base > 0 ? abs($current - $base) / $base * 100 : 0;
                $deviation[$metric] = round($dev, 1);
                $zScores[$metric]   = round($base > 0 ? ($current - $base) / max($base * 0.15, 1) : 0, 2);

                if ($dev > 60) {
                    $riskScore += 10;
                    $flags[] = [
                        'id' => "deviation_{$metric}",
                        'severity' => 'high',
                        'label' => ucwords(str_replace('_', ' ', $metric)) . ' Deviation',
                        'detail' => "{$dev}% deviation from baseline",
                        'value' => $current,
                        'threshold' => $base,
                    ];
                } elseif ($dev > 30) {
                    $riskScore += 5;
                }
            }

            $confidence = min(0.5 + ($assignment['baseline_sample_count'] * 0.1), 1.0);
        }

        $riskScore = min($riskScore, 100);

        // Build explanation
        $explanation = self::buildExplanation($riskScore, $flags, $windowCount);

        // Save analysis result
        $stmt = $db->prepare('
            INSERT INTO analysis_results (quiz_assignment_id, student_id, risk_score, confidence, flags, deviation, z_scores, explanation, window_change_count)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ');
        $stmt->execute([
            $qaId,
            $assignment['student_id'],
            $riskScore,
            $confidence,
            json_encode($flags),
            json_encode($deviation),
            json_encode($zScores),
            $explanation,
            $windowCount,
        ]);

        // Update assignment risk score
        $db->prepare('UPDATE quiz_assignments SET risk_score = ? WHERE id = ?')
           ->execute([$riskScore, $qaId]);

        echo json_encode([
            'success'    => true,
            'risk_score' => $riskScore,
            'confidence' => $confidence,
            'flags'      => $flags,
            'deviation'  => $deviation,
            'z_scores'   => $zScores,
            'explanation' => $explanation,
        ]);
    }

    private static function buildExplanation(int $riskScore, array $flags, int $windowCount): string
    {
        if ($riskScore === 0) return 'No anomalies detected. Submission appears authentic.';

        $parts = [];
        if ($riskScore >= 76) {
            $parts[] = "High risk score ({$riskScore}/100) indicates significant anomalies.";
        } elseif ($riskScore >= 56) {
            $parts[] = "Elevated risk score ({$riskScore}/100) warrants review.";
        } elseif ($riskScore >= 26) {
            $parts[] = "Moderate risk score ({$riskScore}/100) with some flags.";
        } else {
            $parts[] = "Low risk score ({$riskScore}/100).";
        }

        foreach ($flags as $flag) {
            $parts[] = $flag['label'] . ': ' . $flag['detail'];
        }

        return implode(' ', $parts);
    }
}
