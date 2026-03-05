-- ═══════════════════════════════════════════════════════════════════════════════
-- Migration 001: Add content_type to quizzes + create materials table
-- Run this against the `intengine` database AFTER schema.sql
-- ═══════════════════════════════════════════════════════════════════════════════

USE `intengine`;

-- ─── 1. Add content_type to quizzes ──────────────────────────────────────────
-- Distinguishes between a Quiz, Exam, or Assignment at the content level.
-- All existing rows default to 'quiz'.
-- MariaDB 10.0+ supports ADD COLUMN IF NOT EXISTS, so re-running is safe.
ALTER TABLE `quizzes`
  ADD COLUMN IF NOT EXISTS `content_type` ENUM('quiz','exam','assignment') NOT NULL DEFAULT 'quiz'
  AFTER `teacher_id`;

-- ─── 2. Create materials table ────────────────────────────────────────────────
-- Stores teacher-uploaded files (notes, PDFs, PPTs) for students to access.
CREATE TABLE IF NOT EXISTS `materials` (
  `id`          INT(11)       NOT NULL AUTO_INCREMENT,
  `teacher_id`  INT(11)       NOT NULL,
  `title`       VARCHAR(500)  NOT NULL,
  `description` TEXT          DEFAULT '',
  `file_name`   VARCHAR(500)  NOT NULL COMMENT 'Original uploaded filename (sanitised)',
  `file_path`   TEXT          NOT NULL COMMENT 'Server-relative path, e.g. uploads/abc.pdf',
  `file_type`   VARCHAR(100)  NOT NULL COMMENT 'MIME type',
  `file_size`   INT(11)       NOT NULL DEFAULT 0 COMMENT 'Bytes',
  `created_at`  DATETIME      DEFAULT CURRENT_TIMESTAMP(),
  `updated_at`  DATETIME      DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP(),

  PRIMARY KEY (`id`),
  KEY `idx_materials_teacher` (`teacher_id`),
  CONSTRAINT `fk_materials_teacher`
    FOREIGN KEY (`teacher_id`) REFERENCES `profiles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
