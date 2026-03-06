-- ═══════════════════════════════════════════════════════════════════════════════
-- IntegrityEngine — Seed Data
-- Populates the database with realistic test data for development/demo.
-- Run AFTER schema.sql. Uses the `intengine` database.
-- ═══════════════════════════════════════════════════════════════════════════════

USE `intengine`;

-- Disable FK checks during seeding
SET FOREIGN_KEY_CHECKS = 0;

-- Clear existing data
-- Using DELETE FROM instead of TRUNCATE: MariaDB raises #1701 on TRUNCATE for
-- tables referenced by FK constraints even when FOREIGN_KEY_CHECKS = 0.
DELETE FROM `analysis_results`;
DELETE FROM `session_replays`;
DELETE FROM `window_change_logs`;
DELETE FROM `keystroke_logs`;
DELETE FROM `fingerprints`;
DELETE FROM `quiz_responses`;
DELETE FROM `quiz_assignments`;
DELETE FROM `quiz_questions`;
DELETE FROM `quizzes`;
DELETE FROM `announcements`;
DELETE FROM `profiles`;

-- Reset auto-increment sequences
ALTER TABLE `analysis_results`   AUTO_INCREMENT = 1;
ALTER TABLE `session_replays`    AUTO_INCREMENT = 1;
ALTER TABLE `window_change_logs` AUTO_INCREMENT = 1;
ALTER TABLE `keystroke_logs`     AUTO_INCREMENT = 1;
ALTER TABLE `fingerprints`       AUTO_INCREMENT = 1;
ALTER TABLE `quiz_responses`     AUTO_INCREMENT = 1;
ALTER TABLE `quiz_assignments`   AUTO_INCREMENT = 1;
ALTER TABLE `quiz_questions`     AUTO_INCREMENT = 1;
ALTER TABLE `quizzes`            AUTO_INCREMENT = 1;
ALTER TABLE `announcements`      AUTO_INCREMENT = 1;
ALTER TABLE `profiles`           AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. PROFILES (1 teacher + 5 students)
--    Passwords: teacher→ "Teacher@123"  students→ "Student@123"
--    (bcrypt hashed with cost 10)
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT IGNORE INTO `profiles` (`id`, `email`, `password`, `full_name`, `avatar_url`, `role`, `baseline_fingerprint`, `baseline_sample_count`, `email_verified`, `last_login_at`, `created_at`, `updated_at`) VALUES
(1,  'teacher@integ.com',       '$2y$10$mDo5/nvj9v3e.UaMKxAqeutewag2M0xf72BrQ2VbCd9vMXw0svDES', 'Dr. Emily Carter',  NULL, 'teacher', NULL, 0, 1, '2026-03-06 08:00:00', '2026-02-01 09:00:00', '2026-03-06 08:00:00'),
(2,  'alex.johnson@integ.com',  '$2y$10$mtiilNl1BccmhIs9uw4BM.w7YTWHJ1cmlt0RI0ITPptiL.23Wr0u.', 'Alex Johnson',      NULL, 'student', '{"lexical_density":0.32,"avg_sentence_length":14.5,"vocabulary_diversity":0.68,"burst_score":0.42,"flesch_kincaid_score":8.2}', 4, 1, '2026-03-06 07:50:00', '2026-02-05 10:00:00', '2026-03-06 07:50:00'),
(3,  'sarah.miller@integ.com',  '$2y$10$mtiilNl1BccmhIs9uw4BM.w7YTWHJ1cmlt0RI0ITPptiL.23Wr0u.', 'Sarah Miller',      NULL, 'student', '{"lexical_density":0.28,"avg_sentence_length":12.1,"vocabulary_diversity":0.72,"burst_score":0.35,"flesch_kincaid_score":7.5}', 5, 1, '2026-03-06 07:45:00', '2026-02-05 10:15:00', '2026-03-06 07:45:00'),
(4,  'david.chen@integ.com',    '$2y$10$mtiilNl1BccmhIs9uw4BM.w7YTWHJ1cmlt0RI0ITPptiL.23Wr0u.', 'David Chen',        NULL, 'student', '{"lexical_density":0.35,"avg_sentence_length":16.8,"vocabulary_diversity":0.65,"burst_score":0.48,"flesch_kincaid_score":9.1}', 3, 1, '2026-03-06 07:30:00', '2026-02-06 11:00:00', '2026-03-06 07:30:00'),
(5,  'maria.garcia@integ.com',  '$2y$10$mtiilNl1BccmhIs9uw4BM.w7YTWHJ1cmlt0RI0ITPptiL.23Wr0u.', 'Maria Garcia',      NULL, 'student', '{"lexical_density":0.30,"avg_sentence_length":13.2,"vocabulary_diversity":0.70,"burst_score":0.38,"flesch_kincaid_score":7.8}', 4, 1, '2026-03-05 22:10:00', '2026-02-07 09:30:00', '2026-03-05 22:10:00'),
(6,  'student@integ.com',  '$2y$10$mtiilNl1BccmhIs9uw4BM.w7YTWHJ1cmlt0RI0ITPptiL.23Wr0u.', 'James Wilson',      NULL, 'student', '{"lexical_density":0.27,"avg_sentence_length":11.5,"vocabulary_diversity":0.74,"burst_score":0.31,"flesch_kincaid_score":6.9}', 6, 1, '2026-03-06 06:20:00', '2026-02-08 14:00:00', '2026-03-06 06:20:00');


-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. QUIZZES — (empty: create content via the Teacher Dashboard)
-- ═══════════════════════════════════════════════════════════════════════════════


-- ═══════════════════════════════════════════════════════════════════════════════
-- 3–10. QUIZ DATA — (empty: all quiz-related data is created at runtime)
-- Tables left empty: quiz_questions, quiz_assignments, quiz_responses,
-- fingerprints, keystroke_logs, window_change_logs, session_replays,
-- analysis_results
-- ═══════════════════════════════════════════════════════════════════════════════


-- ═══════════════════════════════════════════════════════════════════════════════
-- Done! Verify counts:
--   profiles:           6 (1 teacher + 5 students)
--   quizzes:            0
--   announcements:      5
-- ═══════════════════════════════════════════════════════════════════════════════


-- ═══════════════════════════════════════════════════════════════════════════════
-- 9. ANNOUNCEMENTS (posted by teachers / system)
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT IGNORE INTO `announcements` (`id`, `author_id`, `author_label`, `type`, `title`, `content`, `is_active`, `created_at`, `updated_at`) VALUES
-- Teacher announcements (author_id = 1 = Dr. Emily Carter)
(1, 1, NULL, 'user', 'Algorithm Analysis Midterm — Instructions',
 'Hi everyone! The Algorithm Analysis Midterm (Quiz 2) is now live. You have 45 minutes to complete it. The quiz covers sorting algorithms, complexity analysis, BFS/DFS, and the Master Theorem. Read each question carefully before answering. Once you start, the timer cannot be paused. Good luck!',
 1, '2026-03-02 14:30:00', '2026-03-02 14:30:00'),

(2, 1, NULL, 'user', 'Data Structures Quiz — Feedback & Grades Posted',
 'Grades for the Data Structures Fundamentals quiz have been finalised. Overall the class performed well — average score was 23.5/30. A few submissions were flagged for review due to unusual typing patterns. If your submission was flagged, please come to office hours on Tuesday so we can discuss it. Keep up the great work!',
 1, '2026-03-06 09:00:00', '2026-03-06 09:00:00'),

(3, 1, NULL, 'user', 'Study Materials Uploaded — Week 5',
 'I have uploaded the Week 5 lecture slides covering Graph Algorithms (BFS, DFS, Dijkstra) to the Materials section. There is also a supplementary PDF with worked examples for the Master Theorem. Please review these before the next session on Thursday.',
 1, '2026-03-05 17:00:00', '2026-03-05 17:00:00'),

-- System / admin announcements (author_id = NULL)
(4, NULL, 'Admin Office', 'system', 'New Library Resources Available',
 'Access to the ACM Digital Library is now available for all Computer Science students. Log in with your student credentials at library.intengine.edu to explore the full catalog of journals and conference proceedings.',
 1, '2026-03-05 12:00:00', '2026-03-05 12:00:00'),

(5, NULL, 'System', 'alert', 'Scheduled Maintenance Tonight',
 'System maintenance is scheduled for tonight from 2 AM to 4 AM EST. The dashboard and quiz portal may be temporarily offline during this window. Please plan your study sessions accordingly and avoid starting any timed quizzes during that period.',
 1, '2026-03-04 18:00:00', '2026-03-04 18:00:00');


