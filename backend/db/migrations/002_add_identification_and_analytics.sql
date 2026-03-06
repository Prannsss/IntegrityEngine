-- ═══════════════════════════════════════════════════════════════════════════════
-- Migration 002: Add identification question type + analytics support
-- Run this against the `intengine` database AFTER 001_add_content_type_and_materials.sql
-- ═══════════════════════════════════════════════════════════════════════════════

USE `intengine`;

-- ─── 1. Expand quiz_questions.question_type to include 'identification' ───────
-- MariaDB requires ALTER to change ENUM values.
ALTER TABLE `quiz_questions`
  MODIFY COLUMN `question_type` ENUM('essay','multiple_choice','identification') NOT NULL;

-- ─── 2. Add timer tracking columns to quiz_assignments ───────────────────────
-- time_remaining_secs: tracks the remaining seconds when student pauses/submits
-- This helps resume countdown accurately if the page refreshes.
ALTER TABLE `quiz_assignments`
  ADD COLUMN IF NOT EXISTS `time_remaining_secs` INT(11) DEFAULT NULL
  AFTER `window_changes`;
