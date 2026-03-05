<?php
/**
 * Telemetry Controller — Keystroke heartbeats, window changes, replays
 */

namespace App\Controllers;

use App\Config\Database;

class TelemetryController
{
    /**
     * POST /api/telemetry/heartbeat
     */
    public static function heartbeat(array $body): void
    {
        $qaId      = (int)($body['quiz_assignment_id'] ?? 0);
        $sessionId = $body['session_id'] ?? '';
        $events    = $body['events'] ?? [];
        $wpm       = (float)($body['wpm'] ?? 0);
        $burstScore = (float)($body['burst_score'] ?? 0);
        $avgLatency = (float)($body['avg_latency'] ?? 0);
        $peakWpm   = (float)($body['peak_wpm'] ?? 0);
        $pasteChars = (int)($body['paste_chars'] ?? 0);
        $pasteEvents = (int)($body['paste_events'] ?? 0);
        $totalKeys  = (int)($body['total_keys'] ?? 0);
        $wpmHistory = $body['wpm_history'] ?? [];
        $nonce     = $body['nonce'] ?? null;
        $signature = $body['signature'] ?? null;

        if (!$qaId || !$sessionId) {
            http_response_code(400);
            echo json_encode(['error' => 'quiz_assignment_id and session_id are required']);
            return;
        }

        $db = Database::getConnection();
        $stmt = $db->prepare('
            INSERT INTO keystroke_logs (quiz_assignment_id, session_id, events, wpm, burst_score, avg_latency, peak_wpm, paste_chars, paste_events, total_keys, wpm_history, nonce, signature)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ');
        $stmt->execute([
            $qaId, $sessionId, json_encode($events),
            $wpm, $burstScore, $avgLatency, $peakWpm,
            $pasteChars, $pasteEvents, $totalKeys,
            json_encode($wpmHistory), $nonce, $signature,
        ]);

        echo json_encode(['success' => true, 'id' => (int)$db->lastInsertId()]);
    }

    /**
     * POST /api/telemetry/window-change
     */
    public static function windowChange(array $body): void
    {
        $qaId       = (int)($body['quiz_assignment_id'] ?? 0);
        $sessionId  = $body['session_id'] ?? '';
        $eventType  = $body['event_type'] ?? '';
        $awayMs     = $body['away_duration_ms'] ?? null;

        if (!$qaId || !$sessionId || !in_array($eventType, ['blur', 'focus'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid parameters']);
            return;
        }

        $db = Database::getConnection();
        $stmt = $db->prepare('
            INSERT INTO window_change_logs (quiz_assignment_id, session_id, event_type, away_duration_ms)
            VALUES (?, ?, ?, ?)
        ');
        $stmt->execute([$qaId, $sessionId, $eventType, $awayMs]);

        echo json_encode(['success' => true]);
    }

    /**
     * GET /api/telemetry/window-change?quiz_assignment_id=X
     */
    public static function getWindowChanges(): void
    {
        $qaId = (int)($_GET['quiz_assignment_id'] ?? 0);
        if (!$qaId) {
            http_response_code(400);
            echo json_encode(['error' => 'quiz_assignment_id is required']);
            return;
        }

        $db   = Database::getConnection();
        $stmt = $db->prepare('SELECT * FROM window_change_logs WHERE quiz_assignment_id = ? ORDER BY timestamp ASC');
        $stmt->execute([$qaId]);

        echo json_encode(['success' => true, 'logs' => $stmt->fetchAll()]);
    }

    /**
     * POST /api/telemetry/replay
     */
    public static function saveReplay(array $body): void
    {
        $qaId         = (int)($body['quiz_assignment_id'] ?? 0);
        $sessionId    = $body['session_id'] ?? '';
        $questionId   = $body['question_id'] ?? null;
        $replayEvents = $body['replay_events'] ?? [];
        $textSnaps    = $body['text_snapshots'] ?? [];
        $durationMs   = (int)($body['duration_ms'] ?? 0);
        $totalEvents  = (int)($body['total_events'] ?? 0);

        if (!$qaId || !$sessionId) {
            http_response_code(400);
            echo json_encode(['error' => 'quiz_assignment_id and session_id are required']);
            return;
        }

        $db = Database::getConnection();
        $stmt = $db->prepare('
            INSERT INTO session_replays (quiz_assignment_id, session_id, question_id, replay_events, text_snapshots, duration_ms, total_events)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ');
        $stmt->execute([
            $qaId, $sessionId, $questionId,
            json_encode($replayEvents), json_encode($textSnaps),
            $durationMs, $totalEvents,
        ]);

        echo json_encode(['success' => true]);
    }

    /**
     * GET /api/telemetry/replay?quiz_assignment_id=X
     */
    public static function getReplays(): void
    {
        $qaId = (int)($_GET['quiz_assignment_id'] ?? 0);
        if (!$qaId) {
            http_response_code(400);
            echo json_encode(['error' => 'quiz_assignment_id is required']);
            return;
        }

        $db   = Database::getConnection();
        $stmt = $db->prepare('SELECT * FROM session_replays WHERE quiz_assignment_id = ? ORDER BY created_at ASC');
        $stmt->execute([$qaId]);
        $replays = $stmt->fetchAll();

        foreach ($replays as &$r) {
            $r['replay_events']  = json_decode($r['replay_events'], true);
            $r['text_snapshots'] = json_decode($r['text_snapshots'], true);
        }

        echo json_encode(['success' => true, 'replays' => $replays]);
    }
}
