-- ═══════════════════════════════════════════════════════════════════════════════
-- Migration: Create announcements table
-- Run this AFTER schema.sql against the `intengine` database.
-- ═══════════════════════════════════════════════════════════════════════════════

USE `intengine`;

CREATE TABLE IF NOT EXISTS `announcements` (
  `id`           int(11)                          NOT NULL AUTO_INCREMENT,
  `author_id`    int(11)                          DEFAULT NULL COMMENT 'FK to profiles; NULL for system-generated announcements',
  `author_label` varchar(255)                     DEFAULT NULL COMMENT 'Fallback display name when author_id is NULL (e.g. "Admin Office")',
  `type`         enum('user','system','alert')    NOT NULL DEFAULT 'user',
  `title`        varchar(500)                     NOT NULL,
  `content`      text                             NOT NULL,
  `is_active`    tinyint(1)                       NOT NULL DEFAULT 1,
  `created_at`   datetime                         DEFAULT current_timestamp(),
  `updated_at`   datetime                         DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_ann_author`    (`author_id`),
  KEY `idx_ann_active`    (`is_active`),
  KEY `idx_ann_created`   (`created_at`),
  CONSTRAINT `fk_ann_author` FOREIGN KEY (`author_id`) REFERENCES `profiles` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
