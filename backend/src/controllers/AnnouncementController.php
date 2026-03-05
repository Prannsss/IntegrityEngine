<?php
/**
 * Announcement Controller — CRUD for announcements
 */

namespace App\Controllers;

use App\Config\Database;
use App\Middleware\Auth;

class AnnouncementController
{
    /**
     * GET /api/announcements
     * Returns all active announcements, newest first.
     * Joins with profiles to include author full_name and avatar_url.
     * Accessible to any authenticated user.
     */
    public static function list(): void
    {
        Auth::requireAuth();

        $db   = Database::getConnection();
        $stmt = $db->query('
            SELECT
                a.id,
                a.author_id,
                COALESCE(p.full_name, a.author_label, \'System\') AS author_name,
                p.avatar_url                                        AS author_avatar,
                a.type,
                a.title,
                a.content,
                a.created_at
            FROM announcements a
            LEFT JOIN profiles p ON p.id = a.author_id
            WHERE a.is_active = 1
            ORDER BY a.created_at DESC
        ');

        $announcements = $stmt->fetchAll();

        echo json_encode(['success' => true, 'announcements' => $announcements]);
    }

    /**
     * POST /api/announcements
     * Creates a new announcement. Teachers only.
     */
    public static function create(array $body): void
    {
        $user = Auth::requireAuth();
        Auth::requireTeacher($user);

        $title   = trim($body['title']   ?? '');
        $content = trim($body['content'] ?? '');
        $type    = $body['type'] ?? 'user';

        if ($title === '' || $content === '') {
            http_response_code(422);
            echo json_encode(['error' => 'title and content are required']);
            return;
        }

        $allowed = ['user', 'system', 'alert'];
        if (!in_array($type, $allowed, true)) {
            http_response_code(422);
            echo json_encode(['error' => 'type must be one of: user, system, alert']);
            return;
        }

        $db   = Database::getConnection();
        $stmt = $db->prepare('
            INSERT INTO announcements (author_id, type, title, content)
            VALUES (?, ?, ?, ?)
        ');
        $stmt->execute([$user['id'], $type, $title, $content]);

        $id = (int)$db->lastInsertId();

        http_response_code(201);
        echo json_encode(['success' => true, 'id' => $id]);
    }

    /**
     * DELETE /api/announcements/:id
     * Soft-deletes (sets is_active=0). Teachers only and must own the announcement.
     */
    public static function delete(int $id): void
    {
        $user = Auth::requireAuth();
        Auth::requireTeacher($user);

        $db   = Database::getConnection();
        $stmt = $db->prepare('UPDATE announcements SET is_active = 0 WHERE id = ? AND author_id = ?');
        $stmt->execute([$id, $user['id']]);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Announcement not found or not yours']);
            return;
        }

        echo json_encode(['success' => true]);
    }
}
