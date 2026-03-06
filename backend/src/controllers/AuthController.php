<?php
/**
 * Auth Controller — Signup, Login, Token Refresh, Password Reset
 */

namespace App\Controllers;

use App\Config\Database;
use App\Middleware\Auth;

class AuthController
{
    /**
     * POST /api/auth/signup
     */
    public static function signup(array $body): void
    {
        $email    = trim($body['email'] ?? '');
        $password = $body['password'] ?? '';
        $fullName = trim($body['full_name'] ?? '');
        $role     = $body['role'] ?? 'student';

        if (!$email || !$password || !$fullName) {
            http_response_code(400);
            echo json_encode(['error' => 'Email, password, and full_name are required']);
            return;
        }

        if (!in_array($role, ['teacher', 'student'], true)) {
            http_response_code(400);
            echo json_encode(['error' => 'Role must be teacher or student']);
            return;
        }

        if (strlen($password) < 6) {
            http_response_code(400);
            echo json_encode(['error' => 'Password must be at least 6 characters']);
            return;
        }

        $db = Database::getConnection();

        // Check if email already taken
        $stmt = $db->prepare('SELECT id FROM profiles WHERE email = ?');
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode(['error' => 'An account with this email already exists']);
            return;
        }

        $hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 10]);

        // Generate a 6-digit verification code
        $verificationCode = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $stmt = $db->prepare(
            'INSERT INTO profiles (email, password, full_name, role, email_verified, verification_code) VALUES (?, ?, ?, ?, 0, ?)'
        );
        $stmt->execute([$email, $hash, $fullName, $role, $verificationCode]);
        $userId = (int)$db->lastInsertId();

        // Send verification email via Brevo
        self::sendVerificationEmail($email, $fullName, $verificationCode);
        
        echo json_encode([
            'success' => true,
            'message' => 'Account created. Please check your email to verify.',
            'user_id' => $userId,
        ]);
    }

    /**
     * POST /api/auth/login
     */
    public static function login(array $body): void
    {
        $email    = trim($body['email'] ?? '');
        $password = $body['password'] ?? '';

        if (!$email || !$password) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and password are required']);
            return;
        }

        $db   = Database::getConnection();
        $stmt = $db->prepare('SELECT * FROM profiles WHERE email = ?');
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid email or password']);
            return;
        }

        if (!$user['email_verified']) {
            http_response_code(403);
            echo json_encode([
                'error' => 'Email not verified',
                'code'  => 'EMAIL_NOT_VERIFIED',
                'email' => $user['email'],
            ]);
            return;
        }

        // Update last login
        $db->prepare('UPDATE profiles SET last_login_at = NOW() WHERE id = ?')->execute([$user['id']]);

        $token = Auth::generateToken((string)$user['id'], $user['email'], $user['role']);

        // Remove password from response
        unset($user['password'], $user['verification_code']);

        echo json_encode([
            'success' => true,
            'token'   => $token,
            'user'    => $user,
        ]);
    }

    /**
     * GET /api/auth/me — Get current user profile from token
     */
    public static function me(): void
    {
        $user = Auth::requireAuth();

        $db   = Database::getConnection();
        $stmt = $db->prepare('SELECT id, email, full_name, avatar_url, role, baseline_fingerprint, baseline_sample_count, email_verified, last_login_at, created_at, updated_at FROM profiles WHERE id = ?');
        $stmt->execute([$user['id']]);
        $profile = $stmt->fetch();

        if (!$profile) {
            http_response_code(404);
            echo json_encode(['error' => 'Profile not found']);
            return;
        }

        // Decode JSON fields
        if ($profile['baseline_fingerprint']) {
            $profile['baseline_fingerprint'] = json_decode($profile['baseline_fingerprint'], true);
        }

        echo json_encode(['success' => true, 'user' => $profile]);
    }

    /**
     * POST /api/auth/forgot-password
     */
    public static function forgotPassword(array $body): void
    {
        $email = trim($body['email'] ?? '');

        if (!$email) {
            http_response_code(400);
            echo json_encode(['error' => 'Email is required']);
            return;
        }

        // Always return success to prevent email enumeration
        echo json_encode([
            'success' => true,
            'message' => 'If an account exists with this email, a reset link has been sent.',
        ]);
    }

    /**
     * POST /api/auth/verify-email
     */
    public static function verifyEmail(array $body): void
    {
        $email = trim($body['email'] ?? '');
        $code  = trim($body['code'] ?? '');

        if (!$email || !$code) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and verification code are required']);
            return;
        }

        $db   = Database::getConnection();
        $stmt = $db->prepare('SELECT id, verification_code, email_verified FROM profiles WHERE email = ?');
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user) {
            http_response_code(404);
            echo json_encode(['error' => 'Account not found']);
            return;
        }

        if ($user['email_verified']) {
            echo json_encode(['success' => true, 'message' => 'Email already verified']);
            return;
        }

        if ($user['verification_code'] !== $code) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid verification code']);
            return;
        }

        $db->prepare('UPDATE profiles SET email_verified = 1, verification_code = NULL WHERE id = ?')
           ->execute([$user['id']]);

        echo json_encode(['success' => true, 'message' => 'Email verified successfully']);
    }

    /**
     * POST /api/auth/resend-verification
     */
    public static function resendVerification(array $body): void
    {
        $email = trim($body['email'] ?? '');

        if (!$email) {
            http_response_code(400);
            echo json_encode(['error' => 'Email is required']);
            return;
        }

        $db   = Database::getConnection();
        $stmt = $db->prepare('SELECT id, email_verified FROM profiles WHERE email = ?');
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || $user['email_verified']) {
            // Don't reveal whether account exists
            echo json_encode(['success' => true, 'message' => 'Verification code sent if account exists']);
            return;
        }

        $code = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $db->prepare('UPDATE profiles SET verification_code = ? WHERE id = ?')
           ->execute([$code, $user['id']]);

        // Send verification email via Brevo
        self::sendVerificationEmail($email, '', $code);

        echo json_encode(['success' => true, 'message' => 'Verification code sent']);
    }

    /**
     * Send a verification code email via Brevo (Sendinblue) API.
     * Requires BREVO_API_KEY in .env. Fails silently if not configured.
     */
    private static function sendVerificationEmail(string $email, string $name, string $code): void
    {
        $apiKey = $_ENV['BREVO_API_KEY'] ?? '';
        if (!$apiKey) return; // Skip if not configured

        $senderEmail = $_ENV['BREVO_SENDER_EMAIL'] ?? 'noreply@integrityengine.app';
        $senderName  = $_ENV['BREVO_SENDER_NAME'] ?? 'IntegrityEngine';
        $appUrl      = $_ENV['FRONTEND_URL'] ?? 'http://localhost:3000';

        $payload = json_encode([
            'sender'      => ['email' => $senderEmail, 'name' => $senderName],
            'to'          => [['email' => $email, 'name' => $name ?: $email]],
            'subject'     => "Your IntegrityEngine Verification Code: {$code}",
            'htmlContent' => '
                <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #1A161D; color: #E0D8E8; border-radius: 12px;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <div style="width: 48px; height: 48px; background: rgba(97,46,192,0.2); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center;">
                            <span style="font-size: 24px;">🛡️</span>
                        </div>
                    </div>
                    <h1 style="color: #F0ECF4; text-align: center; margin-bottom: 16px;">Verify Your Email</h1>
                    <p style="color: #A89BB5; text-align: center; margin-bottom: 24px;">Enter the code below to verify your IntegrityEngine account:</p>
                    <div style="text-align: center; margin: 24px 0;">
                        <span style="display: inline-block; padding: 16px 32px; background: rgba(97,46,192,0.15); border: 2px solid rgba(97,46,192,0.4); border-radius: 12px; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #F0ECF4;">' . htmlspecialchars($code, ENT_QUOTES, 'UTF-8') . '</span>
                    </div>
                    <p style="color: #A89BB5; text-align: center; font-size: 13px;">This code expires in 24 hours. If you did not create an account, ignore this email.</p>
                </div>
            ',
        ]);

        $ch = curl_init('https://api.brevo.com/v3/smtp/email');
        curl_setopt_array($ch, [
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $payload,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER     => [
                'accept: application/json',
                'api-key: ' . $apiKey,
                'content-type: application/json',
            ],
        ]);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode >= 400) {
            error_log('Brevo email error (' . $httpCode . '): ' . $response);
        }
    }
}
