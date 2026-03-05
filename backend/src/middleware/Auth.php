<?php
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * Auth Middleware — JWT token verification for PHP backend
 * ═══════════════════════════════════════════════════════════════════════════════
 */

namespace App\Middleware;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use App\Config\Database;

class Auth
{
    /**
     * Verify Bearer token and return the user profile.
     * Returns user array on success, null on failure.
     */
    public static function getUser(): ?array
    {
        // Apache + mod_rewrite can strip the Authorization header.
        // Check multiple sources for robustness.
        $header = $_SERVER['HTTP_AUTHORIZATION']
            ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
            ?? '';

        if (!$header && function_exists('getallheaders')) {
            $allHeaders = getallheaders();
            $header = $allHeaders['Authorization'] ?? $allHeaders['authorization'] ?? '';
        }

        if (!str_starts_with($header, 'Bearer ')) {
            return null;
        }

        $token = substr($header, 7);
        $secret = $_ENV['JWT_SECRET'] ?? 'default-secret';

        try {
            $decoded = JWT::decode($token, new Key($secret, 'HS256'));
            $userId = $decoded->sub ?? null;

            if (!$userId) {
                return null;
            }

            // Fetch user profile from DB
            $db = Database::getConnection();
            $stmt = $db->prepare('SELECT id, email, full_name, role, avatar_url FROM profiles WHERE id = ?');
            $stmt->execute([$userId]);
            $user = $stmt->fetch();

            return $user ?: null;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Require authentication. Sends 401 and exits if no valid token.
     */
    public static function requireAuth(): array
    {
        $user = self::getUser();

        if (!$user) {
            http_response_code(401);
            echo json_encode(['error' => 'Missing or invalid authorization token']);
            exit;
        }

        return $user;
    }

    /**
     * Require teacher role. Sends 403 and exits if not a teacher.
     * Must be called after requireAuth().
     */
    public static function requireTeacher(array $user): array
    {
        if ($user['role'] !== 'teacher') {
            http_response_code(403);
            echo json_encode(['error' => 'Teachers only']);
            exit;
        }

        return $user;
    }

    /**
     * Generate a JWT token for a user.
     */
    public static function generateToken(string $userId, string $email, string $role): string
    {
        $secret = $_ENV['JWT_SECRET'] ?? 'default-secret';
        $expiry = (int)($_ENV['JWT_EXPIRY'] ?? 86400);

        $payload = [
            'sub'   => $userId,
            'email' => $email,
            'role'  => $role,
            'iat'   => time(),
            'exp'   => time() + $expiry,
        ];

        return JWT::encode($payload, $secret, 'HS256');
    }
}
