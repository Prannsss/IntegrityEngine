<?php
/**
 * Materials Controller — Upload and manage teacher study materials
 * (notes, PDFs, PowerPoints, etc.)
 */

namespace App\Controllers;

use App\Config\Database;
use App\Middleware\Auth;

class MaterialsController
{
    /** Allowed MIME types for upload */
    private static array $ALLOWED_TYPES = [
        'application/pdf',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
    ];

    /** Max upload size: 20 MB */
    private const MAX_SIZE = 20 * 1024 * 1024;

    /**
     * GET /api/materials
     * Returns all materials belonging to the authenticated teacher.
     */
    public static function list(): void
    {
        $user = Auth::requireAuth();
        Auth::requireTeacher($user);

        $db   = Database::getConnection();
        $stmt = $db->prepare(
            'SELECT id, teacher_id, title, description, file_name, file_path, file_type, file_size, created_at, updated_at
             FROM materials
             WHERE teacher_id = ?
             ORDER BY created_at DESC'
        );
        $stmt->execute([$user['id']]);
        $materials = $stmt->fetchAll();

        echo json_encode(['success' => true, 'materials' => $materials]);
    }

    /**
     * POST /api/materials/upload  (multipart/form-data)
     * Fields: file (required), title (required), description (optional)
     */
    public static function upload(): void
    {
        $user = Auth::requireAuth();
        Auth::requireTeacher($user);

        if (empty($_FILES['file'])) {
            http_response_code(400);
            echo json_encode(['error' => 'No file uploaded']);
            return;
        }

        $file        = $_FILES['file'];
        $title       = trim($_POST['title'] ?? '');
        $description = trim($_POST['description'] ?? '');

        if (!$title) {
            http_response_code(400);
            echo json_encode(['error' => 'Title is required']);
            return;
        }

        if ($file['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(['error' => 'Upload failed. Code: ' . $file['error']]);
            return;
        }

        // Size check
        if ($file['size'] > self::MAX_SIZE) {
            http_response_code(400);
            echo json_encode(['error' => 'File exceeds 20 MB limit']);
            return;
        }

        // MIME type check via finfo (not client-supplied type)
        $finfo    = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!in_array($mimeType, self::$ALLOWED_TYPES, true)) {
            http_response_code(400);
            echo json_encode(['error' => 'File type not allowed. Accepted: PDF, PPT/PPTX, DOC/DOCX, TXT, images']);
            return;
        }

        // Build a safe, unique filename
        $ext        = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $safeName   = preg_replace('/[^a-zA-Z0-9._-]/', '_', basename($file['name']));
        $uniqueName = time() . '_' . bin2hex(random_bytes(8)) . '.' . $ext;

        // Ensure upload directory exists
        $uploadDir = realpath(__DIR__ . '/../../') . '/uploads/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        $destPath = $uploadDir . $uniqueName;

        if (!move_uploaded_file($file['tmp_name'], $destPath)) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to save uploaded file']);
            return;
        }

        $db   = Database::getConnection();
        $stmt = $db->prepare(
            'INSERT INTO materials (teacher_id, title, description, file_name, file_path, file_type, file_size)
             VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $user['id'],
            $title,
            $description,
            $safeName,
            'uploads/' . $uniqueName,
            $mimeType,
            $file['size'],
        ]);
        $materialId = (int)$db->lastInsertId();

        // Fetch and return the created record
        $row = $db->prepare('SELECT * FROM materials WHERE id = ?');
        $row->execute([$materialId]);
        $material = $row->fetch();

        echo json_encode(['success' => true, 'material' => $material]);
    }

    /**
     * DELETE /api/materials/:id
     */
    public static function delete(int $materialId): void
    {
        $user = Auth::requireAuth();
        Auth::requireTeacher($user);

        $db   = Database::getConnection();
        $stmt = $db->prepare('SELECT * FROM materials WHERE id = ? AND teacher_id = ?');
        $stmt->execute([$materialId, $user['id']]);
        $material = $stmt->fetch();

        if (!$material) {
            http_response_code(404);
            echo json_encode(['error' => 'Material not found']);
            return;
        }

        // Delete the physical file
        $filePath = realpath(__DIR__ . '/../../') . '/' . $material['file_path'];
        if ($filePath && file_exists($filePath)) {
            unlink($filePath);
        }

        $db->prepare('DELETE FROM materials WHERE id = ?')->execute([$materialId]);
        echo json_encode(['success' => true]);
    }
}
