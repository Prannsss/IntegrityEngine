<?php
/**
 * IntegrityEngine PHP API — Main Entry Point
 * All requests are routed through this file via .htaccess rewrite.
 */

// ─── Bootstrap ────────────────────────────────────────────────────────────────

require_once __DIR__ . '/../vendor/autoload.php';

// Load .env if vlucas/phpdotenv is available
if (file_exists(__DIR__ . '/../.env')) {
    $dotenv = \Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
    $dotenv->safeLoad();
}

// CORS headers
$allowedOrigin = $_ENV['FRONTEND_URL'] ?? 'http://localhost:3000';
header("Access-Control-Allow-Origin: {$allowedOrigin}");
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ─── Autoloader for App namespace ─────────────────────────────────────────────

spl_autoload_register(function (string $class) {
    $prefix = 'App\\';
    if (strncmp($class, $prefix, strlen($prefix)) !== 0) return;

    $relative = substr($class, strlen($prefix));
    $file = __DIR__ . '/../src/' . str_replace('\\', '/', $relative) . '.php';

    if (file_exists($file)) {
        require_once $file;
    }
});

// ─── Simple Router ────────────────────────────────────────────────────────────

$method = $_SERVER['REQUEST_METHOD'];
$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Strip base path (adjust if project is in a subdirectory)
$basePath = '/IntegrityEngine/backend/public';
if (strpos($uri, $basePath) === 0) {
    $uri = substr($uri, strlen($basePath));
}
$uri = $uri ?: '/';

// Parse JSON body for POST/PATCH/PUT
$body = null;
if (in_array($method, ['POST', 'PATCH', 'PUT'])) {
    $raw = file_get_contents('php://input');
    $body = json_decode($raw, true) ?? [];
}

// ─── Route Definitions ────────────────────────────────────────────────────────

use App\Controllers\AuthController;
use App\Controllers\QuizController;
use App\Controllers\StudentController;
use App\Controllers\ResponseController;
use App\Controllers\TelemetryController;
use App\Controllers\AnalysisController;
use App\Controllers\MaterialsController;
use App\Controllers\AnnouncementController;

// Health check
if ($uri === '/' || $uri === '/api/health') {
    echo json_encode(['status' => 'ok', 'timestamp' => date('c')]);
    exit;
}

// ─── Auth Routes ──────────────────────────────────────────────────────────────

if ($uri === '/api/auth/signup' && $method === 'POST') {
    AuthController::signup($body);
    exit;
}

if ($uri === '/api/auth/login' && $method === 'POST') {
    AuthController::login($body);
    exit;
}

if ($uri === '/api/auth/me' && $method === 'GET') {
    AuthController::me();
    exit;
}

if ($uri === '/api/auth/forgot-password' && $method === 'POST') {
    AuthController::forgotPassword($body);
    exit;
}

if ($uri === '/api/auth/verify-email' && $method === 'POST') {
    AuthController::verifyEmail($body);
    exit;
}

if ($uri === '/api/auth/resend-verification' && $method === 'POST') {
    AuthController::resendVerification($body);
    exit;
}

// ─── Quiz Routes ──────────────────────────────────────────────────────────────

if ($uri === '/api/quizzes' && $method === 'GET') {
    QuizController::list();
    exit;
}

if ($uri === '/api/quizzes' && $method === 'POST') {
    QuizController::create($body);
    exit;
}

if (preg_match('#^/api/quizzes/(\d+)$#', $uri, $m) && $method === 'GET') {
    QuizController::get((int)$m[1]);
    exit;
}

if (preg_match('#^/api/quizzes/(\d+)$#', $uri, $m) && $method === 'PATCH') {
    QuizController::update((int)$m[1], $body);
    exit;
}

if (preg_match('#^/api/quizzes/(\d+)$#', $uri, $m) && $method === 'DELETE') {
    QuizController::delete((int)$m[1]);
    exit;
}

if (preg_match('#^/api/quizzes/(\d+)/assign$#', $uri, $m) && $method === 'POST') {
    QuizController::assign((int)$m[1], $body);
    exit;
}

// ─── Student Routes ───────────────────────────────────────────────────────────

if ($uri === '/api/students' && $method === 'GET') {
    StudentController::listAll();
    exit;
}

if ($uri === '/api/students/assignments' && $method === 'GET') {
    StudentController::myAssignments();
    exit;
}

if (preg_match('#^/api/students/(\d+)/analytics$#', $uri, $m) && $method === 'GET') {
    StudentController::analytics((int)$m[1]);
    exit;
}

// ─── Response Routes ──────────────────────────────────────────────────────────

if ($uri === '/api/quiz-responses/submit' && $method === 'POST') {
    ResponseController::submit($body);
    exit;
}

// ─── Telemetry Routes ─────────────────────────────────────────────────────────

if ($uri === '/api/telemetry/heartbeat' && $method === 'POST') {
    TelemetryController::heartbeat($body);
    exit;
}

if ($uri === '/api/telemetry/window-change' && $method === 'POST') {
    TelemetryController::windowChange($body);
    exit;
}

if ($uri === '/api/telemetry/window-change' && $method === 'GET') {
    TelemetryController::getWindowChanges();
    exit;
}

if ($uri === '/api/telemetry/replay' && $method === 'POST') {
    TelemetryController::saveReplay($body);
    exit;
}

if ($uri === '/api/telemetry/replay' && $method === 'GET') {
    TelemetryController::getReplays();
    exit;
}

// ─── Analysis Routes ──────────────────────────────────────────────────────────

if ($uri === '/api/analysis/run' && $method === 'POST') {
    AnalysisController::run($body);
    exit;
}

// ─── Materials Routes ─────────────────────────────────────────────────────────

if ($uri === '/api/materials' && $method === 'GET') {
    MaterialsController::list();
    exit;
}

// File upload uses multipart/form-data — body is in $_POST/$_FILES, not JSON
if ($uri === '/api/materials/upload' && $method === 'POST') {
    MaterialsController::upload();
    exit;
}

if (preg_match('#^/api/materials/(\d+)$#', $uri, $m) && $method === 'DELETE') {
    MaterialsController::delete((int)$m[1]);
    exit;
}

// ─── Announcement Routes ──────────────────────────────────────────────────────

if ($uri === '/api/announcements' && $method === 'GET') {
    AnnouncementController::list();
    exit;
}

if ($uri === '/api/announcements' && $method === 'POST') {
    AnnouncementController::create($body);
    exit;
}

if (preg_match('#^/api/announcements/(\d+)$#', $uri, $m) && $method === 'DELETE') {
    AnnouncementController::delete((int)$m[1]);
    exit;
}

// ─── 404 ──────────────────────────────────────────────────────────────────────

http_response_code(404);
echo json_encode(['error' => 'Route not found', 'uri' => $uri, 'method' => $method]);
