-- ═══════════════════════════════════════════════════════════════════════════════
-- Migration 003: Seed realistic quiz & analytics data for line graph charts
-- Run this against the `intengine` database AFTER 002_add_identification_and_analytics.sql
-- Requires seed.sql profiles (teacher=1, students=2-6) to exist.
-- ═══════════════════════════════════════════════════════════════════════════════

USE `intengine`;

SET FOREIGN_KEY_CHECKS = 0;

-- ─── 1. QUIZZES (4 items: 2 quizzes, 1 exam, 1 assignment) ─────────────────
INSERT IGNORE INTO `quizzes` (`id`, `teacher_id`, `content_type`, `title`, `description`, `type`, `status`, `time_limit_mins`, `due_date`, `created_at`, `updated_at`) VALUES
(1, 1, 'quiz',       'Data Structures Fundamentals',          'Covers stacks, queues, linked lists, and trees.',          'mixed',           'published', 30,  '2026-03-10 23:59:00', '2026-02-15 10:00:00', '2026-02-15 10:00:00'),
(2, 1, 'exam',       'Algorithm Analysis Midterm',            'Sorting, complexity analysis, BFS/DFS, Master Theorem.',   'essay',            'published', 45,  '2026-03-12 14:00:00', '2026-02-20 09:00:00', '2026-02-20 09:00:00'),
(3, 1, 'assignment', 'Graph Algorithms Essay',                'Write an analysis of shortest-path algorithms.',           'essay',            'published', NULL,'2026-03-15 23:59:00', '2026-02-25 11:00:00', '2026-02-25 11:00:00'),
(4, 1, 'quiz',       'Operating Systems Concepts',            'Processes, threads, memory management, scheduling.',       'multiple_choice',  'published', 20,  '2026-03-20 23:59:00', '2026-03-01 08:00:00', '2026-03-01 08:00:00');

-- ─── 2. QUIZ QUESTIONS ──────────────────────────────────────────────────────
INSERT IGNORE INTO `quiz_questions` (`id`, `quiz_id`, `question_text`, `question_type`, `options`, `correct_answer`, `points`, `sort_order`) VALUES
-- Quiz 1 (mixed)
(1,  1, 'Explain the difference between a stack and a queue. Provide real-world examples for each.', 'essay', NULL, NULL, 10, 0),
(2,  1, 'Which data structure uses LIFO ordering?', 'multiple_choice', '["Stack","Queue","Linked List","Tree"]', 'Stack', 5, 1),
(3,  1, 'What is the time complexity of inserting an element at the head of a singly linked list?', 'multiple_choice', '["O(1)","O(n)","O(log n)","O(n^2)"]', 'O(1)', 5, 2),
(4,  1, 'Describe how a binary search tree maintains sorted order and its average-case lookup complexity.', 'essay', NULL, NULL, 10, 3),
-- Exam 2 (essay)
(5,  2, 'Compare and contrast merge sort and quicksort. Discuss their time complexity in best, average, and worst cases.', 'essay', NULL, NULL, 15, 0),
(6,  2, 'Explain Big-O, Big-Theta, and Big-Omega notation with examples.', 'essay', NULL, NULL, 15, 1),
(7,  2, 'Describe the BFS and DFS graph traversal algorithms. When would you choose one over the other?', 'essay', NULL, NULL, 20, 2),
-- Assignment 3 (essay)
(8,  3, 'Write a comprehensive analysis comparing Dijkstra''s algorithm, Bellman-Ford, and Floyd-Warshall for shortest path computation. Include time complexities and use-cases.', 'essay', NULL, NULL, 30, 0),
-- Quiz 4 (MCQ)
(9,  4, 'Which scheduling algorithm is non-preemptive?', 'multiple_choice', '["Round Robin","FCFS","SRTF","Priority (preemptive)"]', 'FCFS', 5, 0),
(10, 4, 'What is a race condition?', 'multiple_choice', '["A deadlock scenario","When two processes access shared data concurrently with at least one write","A starvation issue","A memory leak"]', 'When two processes access shared data concurrently with at least one write', 5, 1),
(11, 4, 'Which page replacement algorithm suffers from Belady''s anomaly?', 'multiple_choice', '["LRU","FIFO","Optimal","LFU"]', 'FIFO', 5, 2),
(12, 4, 'What is thrashing?', 'multiple_choice', '["Excessive paging causing performance degradation","A CPU scheduling bug","A type of deadlock","A memory corruption error"]', 'Excessive paging causing performance degradation', 5, 3);

-- ─── 3. QUIZ ASSIGNMENTS (all 5 students assigned to all 4 quizzes) ─────────
INSERT IGNORE INTO `quiz_assignments` (`id`, `quiz_id`, `student_id`, `teacher_id`, `status`, `risk_score`, `total_score`, `max_score`, `started_at`, `submitted_at`, `session_id`, `window_changes`, `created_at`, `updated_at`) VALUES
-- Quiz 1 - Data Structures (all submitted)
(1,  1, 2, 1, 'submitted', 15, 25, 30, '2026-03-02 09:00:00', '2026-03-02 09:22:00', 'sess_q1_s2', 1, '2026-03-01 10:00:00', '2026-03-02 09:22:00'),
(2,  1, 3, 1, 'submitted', 22, 28, 30, '2026-03-02 09:05:00', '2026-03-02 09:28:00', 'sess_q1_s3', 3, '2026-03-01 10:00:00', '2026-03-02 09:28:00'),
(3,  1, 4, 1, 'submitted', 65, 20, 30, '2026-03-02 09:10:00', '2026-03-02 09:35:00', 'sess_q1_s4', 8, '2026-03-01 10:00:00', '2026-03-02 09:35:00'),
(4,  1, 5, 1, 'submitted', 18, 27, 30, '2026-03-02 09:02:00', '2026-03-02 09:24:00', 'sess_q1_s5', 0, '2026-03-01 10:00:00', '2026-03-02 09:24:00'),
(5,  1, 6, 1, 'submitted', 12, 26, 30, '2026-03-02 09:08:00', '2026-03-02 09:29:00', 'sess_q1_s6', 2, '2026-03-01 10:00:00', '2026-03-02 09:29:00'),
-- Exam 2 - Algorithm Midterm (all submitted)
(6,  2, 2, 1, 'submitted', 20, 38, 50, '2026-03-04 14:00:00', '2026-03-04 14:40:00', 'sess_q2_s2', 2, '2026-03-03 09:00:00', '2026-03-04 14:40:00'),
(7,  2, 3, 1, 'submitted', 35, 42, 50, '2026-03-04 14:00:00', '2026-03-04 14:38:00', 'sess_q2_s3', 5, '2026-03-03 09:00:00', '2026-03-04 14:38:00'),
(8,  2, 4, 1, 'submitted', 72, 30, 50, '2026-03-04 14:00:00', '2026-03-04 14:42:00', 'sess_q2_s4', 12,'2026-03-03 09:00:00', '2026-03-04 14:42:00'),
(9,  2, 5, 1, 'submitted', 25, 44, 50, '2026-03-04 14:02:00', '2026-03-04 14:36:00', 'sess_q2_s5', 1, '2026-03-03 09:00:00', '2026-03-04 14:36:00'),
(10, 2, 6, 1, 'submitted', 10, 40, 50, '2026-03-04 14:01:00', '2026-03-04 14:35:00', 'sess_q2_s6', 0, '2026-03-03 09:00:00', '2026-03-04 14:35:00'),
-- Assignment 3 - Graph Essay (all submitted)
(11, 3, 2, 1, 'submitted', 18, 24, 30, '2026-03-05 10:00:00', '2026-03-05 11:20:00', 'sess_q3_s2', 3, '2026-03-04 18:00:00', '2026-03-05 11:20:00'),
(12, 3, 3, 1, 'submitted', 28, 26, 30, '2026-03-05 10:10:00', '2026-03-05 11:15:00', 'sess_q3_s3', 4, '2026-03-04 18:00:00', '2026-03-05 11:15:00'),
(13, 3, 4, 1, 'submitted', 78, 18, 30, '2026-03-05 10:05:00', '2026-03-05 11:30:00', 'sess_q3_s4', 15,'2026-03-04 18:00:00', '2026-03-05 11:30:00'),
(14, 3, 5, 1, 'submitted', 22, 25, 30, '2026-03-05 10:30:00', '2026-03-05 11:45:00', 'sess_q3_s5', 2, '2026-03-04 18:00:00', '2026-03-05 11:45:00'),
(15, 3, 6, 1, 'submitted', 14, 27, 30, '2026-03-05 10:20:00', '2026-03-05 11:10:00', 'sess_q3_s6', 1, '2026-03-04 18:00:00', '2026-03-05 11:10:00'),
-- Quiz 4 - OS Concepts (all submitted)
(16, 4, 2, 1, 'submitted', 12, 18, 20, '2026-03-06 08:00:00', '2026-03-06 08:15:00', 'sess_q4_s2', 0, '2026-03-05 20:00:00', '2026-03-06 08:15:00'),
(17, 4, 3, 1, 'submitted', 30, 16, 20, '2026-03-06 08:05:00', '2026-03-06 08:18:00', 'sess_q4_s3', 6, '2026-03-05 20:00:00', '2026-03-06 08:18:00'),
(18, 4, 4, 1, 'submitted', 55, 14, 20, '2026-03-06 08:02:00', '2026-03-06 08:20:00', 'sess_q4_s4', 10,'2026-03-05 20:00:00', '2026-03-06 08:20:00'),
(19, 4, 5, 1, 'submitted', 20, 19, 20, '2026-03-06 08:10:00', '2026-03-06 08:16:00', 'sess_q4_s5', 1, '2026-03-05 20:00:00', '2026-03-06 08:16:00'),
(20, 4, 6, 1, 'submitted', 8,  17, 20, '2026-03-06 08:08:00', '2026-03-06 08:14:00', 'sess_q4_s6', 0, '2026-03-05 20:00:00', '2026-03-06 08:14:00');

-- ─── 4. FINGERPRINTS (one per assignment — feeds baseline computation) ──────
-- Student 2 (Alex Johnson) — consistent writer
INSERT IGNORE INTO `fingerprints` (`id`, `quiz_assignment_id`, `student_id`, `lexical_density`, `avg_sentence_length`, `vocabulary_diversity`, `burst_score`, `flesch_kincaid_score`) VALUES
(1,  1,  2, 0.31, 14.2, 0.67, 0.40, 8.0),
(2,  6,  2, 0.33, 15.0, 0.69, 0.43, 8.4),
(3,  11, 2, 0.32, 14.8, 0.68, 0.41, 8.1),
(4,  16, 2, 0.30, 13.9, 0.66, 0.39, 7.9),
-- Student 3 (Sarah Miller) — consistent writer
(5,  2,  3, 0.27, 11.8, 0.71, 0.34, 7.3),
(6,  7,  3, 0.29, 12.5, 0.73, 0.36, 7.6),
(7,  12, 3, 0.28, 12.0, 0.72, 0.35, 7.4),
(8,  17, 3, 0.27, 11.6, 0.70, 0.33, 7.2),
(9,  0,  3, 0.29, 12.8, 0.74, 0.37, 7.8);

-- We can't use quiz_assignment_id=0 since it won't exist. Let me fix that.
-- Delete the bad row and use valid IDs only.
DELETE FROM `fingerprints` WHERE `id` = 9;

-- Student 4 (David Chen) — erratic writer (outlier for flagging)
INSERT IGNORE INTO `fingerprints` (`id`, `quiz_assignment_id`, `student_id`, `lexical_density`, `avg_sentence_length`, `vocabulary_diversity`, `burst_score`, `flesch_kincaid_score`) VALUES
(9,  3,  4, 0.50, 22.5, 0.45, 0.72, 12.5),
(10, 8,  4, 0.52, 24.0, 0.42, 0.78, 13.2),
(11, 13, 4, 0.55, 25.8, 0.40, 0.82, 14.1),
(12, 18, 4, 0.36, 17.0, 0.64, 0.49, 9.2),
-- Student 5 (Maria Garcia) — steady writer
(13, 4,  5, 0.29, 13.0, 0.69, 0.37, 7.7),
(14, 9,  5, 0.31, 13.5, 0.71, 0.39, 7.9),
(15, 14, 5, 0.30, 13.2, 0.70, 0.38, 7.8),
(16, 19, 5, 0.30, 12.8, 0.69, 0.36, 7.6),
-- Student 6 (James Wilson — student@integ.com) — very consistent
(17, 5,  6, 0.26, 11.2, 0.73, 0.30, 6.8),
(18, 10, 6, 0.27, 11.5, 0.74, 0.31, 6.9),
(19, 15, 6, 0.27, 11.8, 0.75, 0.32, 7.0),
(20, 20, 6, 0.26, 11.0, 0.73, 0.30, 6.7);

-- ─── 5. KEYSTROKE LOGS (one summary log per assignment) ─────────────────────
INSERT IGNORE INTO `keystroke_logs` (`id`, `quiz_assignment_id`, `session_id`, `timestamp`, `events`, `wpm`, `burst_score`, `avg_latency`, `peak_wpm`, `paste_chars`, `paste_events`, `total_keys`, `wpm_history`) VALUES
-- Student 2 (Alex)
(1,  1,  'sess_q1_s2', '2026-03-02 09:22:00', '[]', 42.5, 0.40, 185, 58.0,  0, 0, 820,  '[38,42,45,44,42,40]'),
(2,  6,  'sess_q2_s2', '2026-03-04 14:40:00', '[]', 45.0, 0.43, 178, 62.0,  0, 0, 1650, '[40,43,46,48,45,44,42]'),
(3,  11, 'sess_q3_s2', '2026-03-05 11:20:00', '[]', 44.2, 0.41, 180, 60.0, 12, 1, 1420, '[38,42,45,46,44,43,44]'),
(4,  16, 'sess_q4_s2', '2026-03-06 08:15:00', '[]', 40.8, 0.38, 190, 55.0,  0, 0, 480,  '[36,40,42,41]'),
-- Student 3 (Sarah)
(5,  2,  'sess_q1_s3', '2026-03-02 09:28:00', '[]', 38.0, 0.34, 200, 52.0, 0, 0, 780,  '[34,37,39,40,38]'),
(6,  7,  'sess_q2_s3', '2026-03-04 14:38:00', '[]', 40.5, 0.36, 195, 55.0, 0, 0, 1550, '[36,39,41,43,42,40]'),
(7,  12, 'sess_q3_s3', '2026-03-05 11:15:00', '[]', 39.8, 0.35, 198, 53.0, 0, 0, 1380, '[35,38,40,42,40,39]'),
(8,  17, 'sess_q4_s3', '2026-03-06 08:18:00', '[]', 36.2, 0.33, 205, 48.0, 0, 0, 420,  '[32,35,38,37]'),
-- Student 4 (David — suspicious patterns)
(9,  3,  'sess_q1_s4', '2026-03-02 09:35:00', '[]', 28.0, 0.72, 260, 85.0, 450, 5, 650,  '[15,20,25,28,80,75]'),
(10, 8,  'sess_q2_s4', '2026-03-04 14:42:00', '[]', 30.5, 0.78, 250, 92.0, 620, 8, 1200, '[18,22,25,30,88,82,78]'),
(11, 13, 'sess_q3_s4', '2026-03-05 11:30:00', '[]', 25.0, 0.82, 275, 95.0, 780, 10,1100, '[12,18,22,25,90,88,85]'),
(12, 18, 'sess_q4_s4', '2026-03-06 08:20:00', '[]', 35.0, 0.49, 220, 48.0, 120, 2, 400,  '[30,34,36,35]'),
-- Student 5 (Maria)
(13, 4,  'sess_q1_s5', '2026-03-02 09:24:00', '[]', 46.0, 0.37, 175, 60.0, 0, 0, 850,  '[42,45,47,48,46]'),
(14, 9,  'sess_q2_s5', '2026-03-04 14:36:00', '[]', 48.5, 0.39, 170, 64.0, 0, 0, 1700, '[44,47,49,50,48,47]'),
(15, 14, 'sess_q3_s5', '2026-03-05 11:45:00', '[]', 47.0, 0.38, 173, 62.0, 0, 0, 1500, '[42,46,48,49,47,46]'),
(16, 19, 'sess_q4_s5', '2026-03-06 08:16:00', '[]', 44.0, 0.36, 180, 58.0, 0, 0, 460,  '[40,43,45,44]'),
-- Student 6 (James / student@integ.com)
(17, 5,  'sess_q1_s6', '2026-03-02 09:29:00', '[]', 50.2, 0.30, 165, 65.0, 0, 0, 900,  '[46,49,51,52,50]'),
(18, 10, 'sess_q2_s6', '2026-03-04 14:35:00', '[]', 52.0, 0.31, 162, 68.0, 0, 0, 1800, '[48,51,53,54,52,51]'),
(19, 15, 'sess_q3_s6', '2026-03-05 11:10:00', '[]', 51.5, 0.32, 164, 66.0, 8, 1, 1550, '[47,50,52,53,51,50]'),
(20, 20, 'sess_q4_s6', '2026-03-06 08:14:00', '[]', 48.8, 0.30, 168, 63.0, 0, 0, 500,  '[44,48,50,49]');

-- ─── 6. ANALYSIS RESULTS (one per assignment) ──────────────────────────────
INSERT IGNORE INTO `analysis_results` (`id`, `quiz_assignment_id`, `student_id`, `risk_score`, `confidence`, `flags`, `deviation`, `z_scores`, `explanation`, `ai_explanation`, `window_change_count`) VALUES
-- Student 2 (Alex — low risk)
(1,  1,  2, 15, 0.88, '[]',
 '{"lexical_density":0.02,"avg_sentence_length":0.8,"vocabulary_diversity":0.01,"burst_score":0.02,"flesch_kincaid_score":0.3}',
 '{"lexical_density":0.3,"avg_sentence_length":0.4,"vocabulary_diversity":0.1,"burst_score":0.2,"flesch_kincaid_score":0.2}',
 'Writing style consistent with baseline. Low risk.', NULL, 1),
(2,  6,  2, 20, 0.85, '[]',
 '{"lexical_density":0.03,"avg_sentence_length":1.2,"vocabulary_diversity":0.02,"burst_score":0.03,"flesch_kincaid_score":0.4}',
 '{"lexical_density":0.4,"avg_sentence_length":0.6,"vocabulary_diversity":0.2,"burst_score":0.3,"flesch_kincaid_score":0.3}',
 'Slightly elevated metrics but within normal range.', NULL, 2),
(3,  11, 2, 18, 0.87, '[]',
 '{"lexical_density":0.02,"avg_sentence_length":1.0,"vocabulary_diversity":0.01,"burst_score":0.02,"flesch_kincaid_score":0.2}',
 '{"lexical_density":0.3,"avg_sentence_length":0.5,"vocabulary_diversity":0.1,"burst_score":0.2,"flesch_kincaid_score":0.2}',
 'Consistent writing pattern. No anomalies detected.', NULL, 3),
(4,  16, 2, 12, 0.90, '[]',
 '{"lexical_density":0.01,"avg_sentence_length":0.5,"vocabulary_diversity":0.01,"burst_score":0.01,"flesch_kincaid_score":0.1}',
 '{"lexical_density":0.1,"avg_sentence_length":0.3,"vocabulary_diversity":0.1,"burst_score":0.1,"flesch_kincaid_score":0.1}',
 'All metrics within expected range. Very low risk.', NULL, 0),

-- Student 3 (Sarah — medium risk on some)
(5,  2,  3, 22, 0.82, '[]',
 '{"lexical_density":0.03,"avg_sentence_length":1.0,"vocabulary_diversity":0.02,"burst_score":0.03,"flesch_kincaid_score":0.3}',
 '{"lexical_density":0.4,"avg_sentence_length":0.5,"vocabulary_diversity":0.2,"burst_score":0.3,"flesch_kincaid_score":0.3}',
 'Writing mostly consistent. Minor variations noted.', NULL, 3),
(6,  7,  3, 35, 0.78, '[{"id":"tab_switch","severity":"medium","label":"Tab Switches","detail":"5 tab switches during exam","value":5,"threshold":3}]',
 '{"lexical_density":0.05,"avg_sentence_length":1.8,"vocabulary_diversity":0.04,"burst_score":0.05,"flesch_kincaid_score":0.5}',
 '{"lexical_density":0.6,"avg_sentence_length":0.9,"vocabulary_diversity":0.4,"burst_score":0.5,"flesch_kincaid_score":0.4}',
 'Multiple tab switches during exam. Writing style shows some deviation.', NULL, 5),
(7,  12, 3, 28, 0.80, '[]',
 '{"lexical_density":0.04,"avg_sentence_length":1.3,"vocabulary_diversity":0.03,"burst_score":0.04,"flesch_kincaid_score":0.4}',
 '{"lexical_density":0.5,"avg_sentence_length":0.7,"vocabulary_diversity":0.3,"burst_score":0.4,"flesch_kincaid_score":0.3}',
 'Slightly elevated deviation but within acceptable range.', NULL, 4),
(8,  17, 3, 30, 0.79, '[{"id":"tab_switch","severity":"medium","label":"Tab Switches","detail":"6 tab switches","value":6,"threshold":3}]',
 '{"lexical_density":0.04,"avg_sentence_length":1.5,"vocabulary_diversity":0.03,"burst_score":0.04,"flesch_kincaid_score":0.5}',
 '{"lexical_density":0.5,"avg_sentence_length":0.8,"vocabulary_diversity":0.3,"burst_score":0.4,"flesch_kincaid_score":0.4}',
 'Tab switching pattern flagged. Writing style within tolerance.', NULL, 6),

-- Student 4 (David — HIGH risk / flagged)
(9,  3,  4, 65, 0.72, '[{"id":"paste_volume","severity":"high","label":"Large Paste","detail":"450 chars pasted","value":450,"threshold":100},{"id":"burst_anomaly","severity":"high","label":"Burst Anomaly","detail":"Burst score 0.72 vs baseline 0.48","value":0.72,"threshold":0.55}]',
 '{"lexical_density":0.18,"avg_sentence_length":6.2,"vocabulary_diversity":0.22,"burst_score":0.28,"flesch_kincaid_score":3.8}',
 '{"lexical_density":2.5,"avg_sentence_length":2.8,"vocabulary_diversity":2.2,"burst_score":2.6,"flesch_kincaid_score":2.4}',
 'Significant deviation from baseline. High paste volume and burst anomaly.', 'The writing style in this submission differs markedly from the student''s established baseline. The lexical density jumped significantly, sentence structure changed, and large paste events suggest external content.', 8),
(10, 8,  4, 72, 0.70, '[{"id":"paste_volume","severity":"critical","label":"Massive Paste","detail":"620 chars pasted in 8 events","value":620,"threshold":100},{"id":"style_deviation","severity":"high","label":"Style Shift","detail":"Writing complexity jumped 3σ","value":3.0,"threshold":2.0}]',
 '{"lexical_density":0.20,"avg_sentence_length":8.0,"vocabulary_diversity":0.25,"burst_score":0.34,"flesch_kincaid_score":4.5}',
 '{"lexical_density":2.8,"avg_sentence_length":3.5,"vocabulary_diversity":2.5,"burst_score":3.0,"flesch_kincaid_score":2.8}',
 'Critical: massive paste events, significant style deviation from baseline.', 'Multiple large paste events totaling 620 characters were detected. The writing complexity shifted 3 standard deviations from this student''s baseline, suggesting external source material.', 12),
(11, 13, 4, 78, 0.68, '[{"id":"paste_volume","severity":"critical","label":"Massive Paste","detail":"780 chars pasted","value":780,"threshold":100},{"id":"burst_anomaly","severity":"critical","label":"Burst Anomaly","detail":"Burst score 0.82 vs baseline 0.48","value":0.82,"threshold":0.55},{"id":"window_switch","severity":"high","label":"Excessive Tab Switches","detail":"15 switches","value":15,"threshold":5}]',
 '{"lexical_density":0.22,"avg_sentence_length":9.5,"vocabulary_diversity":0.28,"burst_score":0.38,"flesch_kincaid_score":5.2}',
 '{"lexical_density":3.0,"avg_sentence_length":4.2,"vocabulary_diversity":2.8,"burst_score":3.5,"flesch_kincaid_score":3.2}',
 'Critical: highest risk submission. Extreme paste, burst anomaly, and tab switching.', 'This submission exhibits the highest risk indicators across all metrics. The student pasted 780 characters, had a burst score 70% above baseline, and switched tabs 15 times — strongly suggesting external assistance.', 15),
(12, 18, 4, 55, 0.75, '[{"id":"paste_volume","severity":"medium","label":"Paste Detected","detail":"120 chars pasted","value":120,"threshold":100},{"id":"tab_switch","severity":"high","label":"Tab Switches","detail":"10 switches","value":10,"threshold":5}]',
 '{"lexical_density":0.04,"avg_sentence_length":1.5,"vocabulary_diversity":0.03,"burst_score":0.05,"flesch_kincaid_score":0.5}',
 '{"lexical_density":0.5,"avg_sentence_length":0.7,"vocabulary_diversity":0.3,"burst_score":0.5,"flesch_kincaid_score":0.3}',
 'Moderate risk. Tab switching and minor paste detected. MCQ format limits style analysis.', NULL, 10),

-- Student 5 (Maria — low risk)
(13, 4,  5, 18, 0.86, '[]',
 '{"lexical_density":0.02,"avg_sentence_length":0.6,"vocabulary_diversity":0.01,"burst_score":0.02,"flesch_kincaid_score":0.2}',
 '{"lexical_density":0.2,"avg_sentence_length":0.3,"vocabulary_diversity":0.1,"burst_score":0.2,"flesch_kincaid_score":0.2}',
 'Consistent with baseline. No anomalies.', NULL, 0),
(14, 9,  5, 25, 0.84, '[]',
 '{"lexical_density":0.03,"avg_sentence_length":1.0,"vocabulary_diversity":0.02,"burst_score":0.03,"flesch_kincaid_score":0.3}',
 '{"lexical_density":0.3,"avg_sentence_length":0.5,"vocabulary_diversity":0.2,"burst_score":0.3,"flesch_kincaid_score":0.3}',
 'Minor deviations within normal range.', NULL, 1),
(15, 14, 5, 22, 0.85, '[]',
 '{"lexical_density":0.02,"avg_sentence_length":0.8,"vocabulary_diversity":0.01,"burst_score":0.02,"flesch_kincaid_score":0.2}',
 '{"lexical_density":0.2,"avg_sentence_length":0.4,"vocabulary_diversity":0.1,"burst_score":0.2,"flesch_kincaid_score":0.2}',
 'Writing pattern consistent. Low risk.', NULL, 2),
(16, 19, 5, 20, 0.86, '[]',
 '{"lexical_density":0.02,"avg_sentence_length":0.5,"vocabulary_diversity":0.01,"burst_score":0.01,"flesch_kincaid_score":0.1}',
 '{"lexical_density":0.2,"avg_sentence_length":0.3,"vocabulary_diversity":0.1,"burst_score":0.1,"flesch_kincaid_score":0.1}',
 'All clear. Consistent typing and writing style.', NULL, 1),

-- Student 6 (James — very low risk)
(17, 5,  6, 12, 0.92, '[]',
 '{"lexical_density":0.01,"avg_sentence_length":0.4,"vocabulary_diversity":0.01,"burst_score":0.01,"flesch_kincaid_score":0.1}',
 '{"lexical_density":0.1,"avg_sentence_length":0.2,"vocabulary_diversity":0.1,"burst_score":0.1,"flesch_kincaid_score":0.1}',
 'Excellent consistency. Very low risk.', NULL, 2),
(18, 10, 6, 10, 0.93, '[]',
 '{"lexical_density":0.01,"avg_sentence_length":0.3,"vocabulary_diversity":0.01,"burst_score":0.01,"flesch_kincaid_score":0.1}',
 '{"lexical_density":0.1,"avg_sentence_length":0.2,"vocabulary_diversity":0.1,"burst_score":0.1,"flesch_kincaid_score":0.1}',
 'All metrics within expected range. Minimal deviation.', NULL, 0),
(19, 15, 6, 14, 0.91, '[]',
 '{"lexical_density":0.01,"avg_sentence_length":0.5,"vocabulary_diversity":0.01,"burst_score":0.01,"flesch_kincaid_score":0.1}',
 '{"lexical_density":0.1,"avg_sentence_length":0.3,"vocabulary_diversity":0.1,"burst_score":0.1,"flesch_kincaid_score":0.1}',
 'Consistent writing and typing patterns.', NULL, 1),
(20, 20, 6, 8,  0.94, '[]',
 '{"lexical_density":0.01,"avg_sentence_length":0.2,"vocabulary_diversity":0.01,"burst_score":0.01,"flesch_kincaid_score":0.1}',
 '{"lexical_density":0.1,"avg_sentence_length":0.1,"vocabulary_diversity":0.1,"burst_score":0.1,"flesch_kincaid_score":0.1}',
 'Highest confidence, lowest risk. Exemplary consistency.', NULL, 0);

-- ─── 7. WINDOW CHANGE LOGS (sample blur/focus events) ──────────────────────
INSERT IGNORE INTO `window_change_logs` (`id`, `quiz_assignment_id`, `session_id`, `event_type`, `timestamp`, `away_duration_ms`) VALUES
-- Student 4 (David — heavy tab switcher)
(1,  3,  'sess_q1_s4', 'blur',  '2026-03-02 09:12:00', NULL),
(2,  3,  'sess_q1_s4', 'focus', '2026-03-02 09:12:15', 15000),
(3,  3,  'sess_q1_s4', 'blur',  '2026-03-02 09:18:00', NULL),
(4,  3,  'sess_q1_s4', 'focus', '2026-03-02 09:18:22', 22000),
(5,  8,  'sess_q2_s4', 'blur',  '2026-03-04 14:08:00', NULL),
(6,  8,  'sess_q2_s4', 'focus', '2026-03-04 14:08:30', 30000),
(7,  8,  'sess_q2_s4', 'blur',  '2026-03-04 14:15:00', NULL),
(8,  8,  'sess_q2_s4', 'focus', '2026-03-04 14:15:45', 45000),
(9,  8,  'sess_q2_s4', 'blur',  '2026-03-04 14:22:00', NULL),
(10, 8,  'sess_q2_s4', 'focus', '2026-03-04 14:22:20', 20000),
(11, 13, 'sess_q3_s4', 'blur',  '2026-03-05 10:15:00', NULL),
(12, 13, 'sess_q3_s4', 'focus', '2026-03-05 10:15:25', 25000),
(13, 13, 'sess_q3_s4', 'blur',  '2026-03-05 10:25:00', NULL),
(14, 13, 'sess_q3_s4', 'focus', '2026-03-05 10:25:40', 40000),
(15, 13, 'sess_q3_s4', 'blur',  '2026-03-05 10:35:00', NULL),
(16, 13, 'sess_q3_s4', 'focus', '2026-03-05 10:35:55', 55000),
-- Student 3 (Sarah — moderate switches)
(17, 7,  'sess_q2_s3', 'blur',  '2026-03-04 14:12:00', NULL),
(18, 7,  'sess_q2_s3', 'focus', '2026-03-04 14:12:08', 8000),
(19, 7,  'sess_q2_s3', 'blur',  '2026-03-04 14:25:00', NULL),
(20, 7,  'sess_q2_s3', 'focus', '2026-03-04 14:25:05', 5000),
-- Student 2 (Alex — minimal)
(21, 1,  'sess_q1_s2', 'blur',  '2026-03-02 09:12:00', NULL),
(22, 1,  'sess_q1_s2', 'focus', '2026-03-02 09:12:03', 3000);

SET FOREIGN_KEY_CHECKS = 1;

-- ═══════════════════════════════════════════════════════════════════════════════
-- Done! This seeds:
--   quizzes:             4
--   quiz_questions:     12
--   quiz_assignments:   20 (5 students × 4 quizzes)
--   fingerprints:       20
--   keystroke_logs:     20
--   analysis_results:   20
--   window_change_logs: 22
-- Line graphs on student analytics will now show data points across 4 quizzes.
-- ═══════════════════════════════════════════════════════════════════════════════
