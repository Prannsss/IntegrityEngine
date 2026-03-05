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
-- 2. QUIZZES (2 quizzes from the teacher)
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT IGNORE INTO `quizzes` (`id`, `teacher_id`, `title`, `description`, `type`, `status`, `time_limit_mins`, `due_date`, `settings`, `created_at`, `updated_at`) VALUES
(1, 1, 'Data Structures Fundamentals', 'Essay quiz covering BST, AVL trees, and hash tables.', 'essay', 'published', 30, '2026-03-10 23:59:00', '{"allow_paste":false,"monitor_window":true}', '2026-03-01 10:00:00', '2026-03-01 10:00:00'),
(2, 1, 'Algorithm Analysis Midterm',   'Mixed quiz on sorting, searching, and complexity analysis.', 'mixed', 'published', 45, '2026-03-15 23:59:00', '{"allow_paste":false,"monitor_window":true}', '2026-03-02 14:00:00', '2026-03-02 14:00:00');


-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. QUIZ QUESTIONS
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT IGNORE INTO `quiz_questions` (`id`, `quiz_id`, `question_text`, `question_type`, `options`, `correct_answer`, `points`, `sort_order`, `created_at`) VALUES
-- Quiz 1: Data Structures Fundamentals (3 essay questions)
(1, 1, 'Explain the properties of a Binary Search Tree and describe how insertion and deletion operations work. Include time complexity analysis.', 'essay', NULL, NULL, 10, 0, '2026-03-01 10:05:00'),
(2, 1, 'Compare and contrast AVL trees with Red-Black trees. When would you prefer one over the other?', 'essay', NULL, NULL, 10, 1, '2026-03-01 10:06:00'),
(3, 1, 'Describe how hash tables handle collisions. Compare chaining vs open addressing with examples.', 'essay', NULL, NULL, 10, 2, '2026-03-01 10:07:00'),

-- Quiz 2: Algorithm Analysis Midterm (2 MCQ + 2 essay)
(4, 2, 'What is the average-case time complexity of QuickSort?', 'multiple_choice', '["O(n)", "O(n log n)", "O(n^2)", "O(log n)"]', 'O(n log n)', 5, 0, '2026-03-02 14:05:00'),
(5, 2, 'Which sorting algorithm is stable by default?', 'multiple_choice', '["QuickSort", "HeapSort", "MergeSort", "Selection Sort"]', 'MergeSort', 5, 1, '2026-03-02 14:06:00'),
(6, 2, 'Explain the Master Theorem and provide three examples showing each case.', 'essay', NULL, NULL, 15, 2, '2026-03-02 14:07:00'),
(7, 2, 'Discuss the trade-offs between BFS and DFS. Provide real-world use cases for each.', 'essay', NULL, NULL, 15, 3, '2026-03-02 14:08:00');


-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. QUIZ ASSIGNMENTS (all 5 students assigned to both quizzes)
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT IGNORE INTO `quiz_assignments` (`id`, `quiz_id`, `student_id`, `teacher_id`, `status`, `risk_score`, `total_score`, `max_score`, `started_at`, `submitted_at`, `session_id`, `window_changes`, `created_at`, `updated_at`) VALUES
-- Quiz 1 assignments
-- window_changes starts at 0; the after_window_change_insert trigger increments it per blur event
(1,  1, 2, 1, 'flagged',    75, 18, 30, '2026-03-05 19:00:00', '2026-03-05 19:28:00', 'sess-q1-alex-001',   0, '2026-03-03 09:00:00', '2026-03-05 19:28:00'),
(2,  1, 3, 1, 'submitted',  12, 27, 30, '2026-03-05 18:30:00', '2026-03-05 18:55:00', 'sess-q1-sarah-001',  0, '2026-03-03 09:00:00', '2026-03-05 18:55:00'),
(3,  1, 4, 1, 'flagged',    58, 22, 30, '2026-03-05 20:00:00', '2026-03-05 20:25:00', 'sess-q1-david-001',  0, '2026-03-03 09:00:00', '2026-03-05 20:25:00'),
(4,  1, 5, 1, 'submitted',  20, 25, 30, '2026-03-05 17:00:00', '2026-03-05 17:22:00', 'sess-q1-maria-001',  0, '2026-03-03 09:00:00', '2026-03-05 17:22:00'),
(5,  1, 6, 1, 'submitted',   8, 28, 30, '2026-03-05 16:00:00', '2026-03-05 16:18:00', 'sess-q1-james-001',  0, '2026-03-03 09:00:00', '2026-03-05 16:18:00'),

-- Quiz 2 assignments
(6,  2, 2, 1, 'submitted',  42, 28, 40, '2026-03-06 06:00:00', '2026-03-06 06:40:00', 'sess-q2-alex-001',   0, '2026-03-04 10:00:00', '2026-03-06 06:40:00'),
(7,  2, 3, 1, 'submitted',  10, 38, 40, '2026-03-06 05:30:00', '2026-03-06 06:10:00', 'sess-q2-sarah-001',  0, '2026-03-04 10:00:00', '2026-03-06 06:10:00'),
(8,  2, 4, 1, 'in_progress', NULL, NULL, NULL, '2026-03-06 07:00:00', NULL, 'sess-q2-david-001', 3, '2026-03-04 10:00:00', '2026-03-06 07:00:00'),
(9,  2, 5, 1, 'submitted',  15, 35, 40, '2026-03-06 04:00:00', '2026-03-06 04:38:00', 'sess-q2-maria-001',  1, '2026-03-04 10:00:00', '2026-03-06 04:38:00'),
(10, 2, 6, 1, 'assigned',   NULL, NULL, NULL, NULL, NULL, NULL, 0, '2026-03-04 10:00:00', '2026-03-04 10:00:00');


-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. QUIZ RESPONSES
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT IGNORE INTO `quiz_responses` (`id`, `quiz_assignment_id`, `question_id`, `answer_text`, `selected_option`, `is_correct`, `score`, `created_at`, `updated_at`) VALUES
-- Alex Johnson — Quiz 1 (flagged, high risk — contains pasted/AI text)
(1,  1, 1, 'The implementation of a binary search tree (BST) requires careful consideration of its core properties. A BST is a node-based binary tree data structure which has the following properties: The left subtree of a node contains only nodes with keys lesser than the node''s key. The right subtree of a node contains only nodes with keys greater than the node''s key. I started by defining the Node class with left and right children.', NULL, NULL, 6, '2026-03-05 19:15:00', '2026-03-05 19:15:00'),
(2,  1, 2, 'In computer science, a binary search tree, also called an ordered or sorted binary tree, is a rooted binary tree data structure with the key of each internal node being greater than all the keys in the respective node''s left subtree and less than the ones in its right subtree. This ensures that search operations can be performed in logarithmic time complexity, provided the tree remains balanced.', NULL, NULL, 5, '2026-03-05 19:22:00', '2026-03-05 19:22:00'),
(3,  1, 3, 'Hash tables handle collisions by two main strategies: chaining and open addressing. Chaining stores multiple entries in a linked list at each slot. Open addressing probes for the next available slot using linear probing, quadratic probing, or double hashing.', NULL, NULL, 7, '2026-03-05 19:27:00', '2026-03-05 19:27:00'),

-- Sarah Miller — Quiz 1 (safe, low risk — authentic typing)
(4,  2, 1, 'A BST has the property where left children are smaller and right children are larger than the parent node. For insertion you traverse down comparing keys. Deletion has three cases: leaf node, one child, or two children where you find the in-order successor. All operations are O(h) where h is tree height, so O(log n) for balanced trees.', NULL, NULL, 9, '2026-03-05 18:40:00', '2026-03-05 18:40:00'),
(5,  2, 2, 'AVL trees are strictly balanced (balance factor max 1) so lookups are faster. Red-Black trees are less strict so insertions and deletions are faster because they need fewer rotations. I would use AVL for read-heavy workloads like databases indexes and Red-Black for insertion-heavy use cases like the Java TreeMap.', NULL, NULL, 9, '2026-03-05 18:48:00', '2026-03-05 18:48:00'),
(6,  2, 3, 'Chaining is simpler to implement and degrades gracefully with high load factors. Open addressing has better cache performance because everything is in a contiguous array. With chaining each bucket points to a linked list. With open addressing you probe for the next empty slot. Example: Python dicts use open addressing, Java HashMaps use chaining.', NULL, NULL, 9, '2026-03-05 18:54:00', '2026-03-05 18:54:00'),

-- David Chen — Quiz 1 (flagged, medium risk)
(7,  3, 1, 'A binary search tree is a data structure that maintains sorted order. Each node has at most two children. The left subtree contains only nodes with keys less than the parent. The right subtree contains only nodes with keys greater than the parent. Insertion works by recursively comparing the new key with current nodes. Time complexity is O(log n) average case.', NULL, NULL, 7, '2026-03-05 20:10:00', '2026-03-05 20:10:00'),
(8,  3, 2, 'AVL trees maintain strict balance with rotation operations after every insert or delete. Red-Black trees use color properties to maintain approximate balance. AVL gives O(log n) guaranteed but Red-Black is more efficient for frequent modifications. I think AVL is better for search-heavy applications.', NULL, NULL, 7, '2026-03-05 20:18:00', '2026-03-05 20:18:00'),
(9,  3, 3, 'Collision handling in hash tables can be done via chaining where each slot has a linked list, or open addressing where you find another slot. Linear probing checks the next slot. Quadratic probing uses a quadratic function. Double hashing uses a second hash function.', NULL, NULL, 8, '2026-03-05 20:24:00', '2026-03-05 20:24:00'),

-- Maria Garcia — Quiz 1 (safe)
(10, 4, 1, 'BSTs work by storing data in a sorted manner. Left child is always less, right child is always more than the parent. To insert we compare and go left or right. To delete we handle leaf, single child, and two children cases. For two children we replace with in-order successor. Average is O(log n) but worst case O(n) for a skewed tree.', NULL, NULL, 8, '2026-03-05 17:10:00', '2026-03-05 17:10:00'),
(11, 4, 2, 'AVL trees strictly enforce balance so they never degrade. Red-Black trees allow some imbalance. AVL rotations are more frequent but searches are faster. For a read-heavy system Id pick AVL. For write-heavy Id pick Red-Black.', NULL, NULL, 8, '2026-03-05 17:16:00', '2026-03-05 17:16:00'),
(12, 4, 3, 'Chaining stores multiple items per slot using linked lists. Open addressing stores everything in the table and resolves collisions by probing. Chaining is easier to implement but uses more memory. Open addressing has better cache locality. Load factor affects performance of both.', NULL, NULL, 9, '2026-03-05 17:21:00', '2026-03-05 17:21:00'),

-- James Wilson — Quiz 1 (very safe, lowest risk)
(13, 5, 1, 'Binary search trees keep data organized so that searching is efficient. Every nodes left children have smaller keys and right children have larger keys. Inserting means walking down the tree and placing the new node at the right leaf position. Deleting is trickier especially when a node has two children. You find the minimum node in the right subtree and swap values. Time is O(h).', NULL, NULL, 10, '2026-03-05 16:08:00', '2026-03-05 16:08:00'),
(14, 5, 2, 'AVL trees are height-balanced BSTs that use rotations (LL, RR, LR, RL) to stay balanced after insertions or deletions. Red-Black trees relax the balancing constraint using color rules. AVL gives slightly faster lookups but more rotations. Red-Black has faster insertions. Linux kernel uses Red-Black trees extensively.', NULL, NULL, 9, '2026-03-05 16:13:00', '2026-03-05 16:13:00'),
(15, 5, 3, 'When two keys hash to the same bucket, thats a collision. Chaining puts overflow entries into a linked list hanging off the bucket. Open addressing searches for another empty spot in the table itself. Chaining is simpler, open addressing avoids pointer overhead. Robin Hood hashing is a cool variant that moves entries to reduce probe lengths.', NULL, NULL, 9, '2026-03-05 16:17:00', '2026-03-05 16:17:00'),

-- Alex Johnson — Quiz 2 (moderate risk)
(16, 6, 4, NULL, 'O(n log n)', 1, 5, '2026-03-06 06:05:00', '2026-03-06 06:05:00'),
(17, 6, 5, NULL, 'MergeSort', 1, 5, '2026-03-06 06:08:00', '2026-03-06 06:08:00'),
(18, 6, 6, 'The Master Theorem solves recurrences of the form T(n) = aT(n/b) + f(n). Case 1: if f(n) is polynomially smaller than n^(log_b a), T(n) = Theta(n^(log_b a)). Case 2: if they are equal, T(n) = Theta(n^(log_b a) * log n). Case 3: if f(n) is polynomially larger, T(n) = Theta(f(n)). Example 1: T(n)=2T(n/2)+1 => O(n). Example 2: T(n)=2T(n/2)+n => O(n log n). Example 3: T(n)=2T(n/2)+n^2 => O(n^2).', NULL, NULL, 10, '2026-03-06 06:25:00', '2026-03-06 06:25:00'),
(19, 6, 7, 'BFS explores layer by layer using a queue. DFS goes as deep as possible using a stack or recursion. BFS finds shortest paths in unweighted graphs. DFS uses less memory and is good for topological sorting. BFS is used in social network connections. DFS is used in maze solving and cycle detection.', NULL, NULL, 8, '2026-03-06 06:38:00', '2026-03-06 06:38:00'),

-- Sarah Miller — Quiz 2 (very safe)
(20, 7, 4, NULL, 'O(n log n)', 1, 5, '2026-03-06 05:35:00', '2026-03-06 05:35:00'),
(21, 7, 5, NULL, 'MergeSort', 1, 5, '2026-03-06 05:38:00', '2026-03-06 05:38:00'),
(22, 7, 6, 'The Master Theorem helps us solve divide and conquer recurrences T(n) = aT(n/b) + f(n). There are three cases based on comparing f(n) with n^(log_b a). In case 1 the recursive work dominates. In case 2 they contribute equally so we get a log factor. In case 3 the non-recursive work dominates. For T(n)=8T(n/2)+n^2 we get case 1 giving O(n^3). For T(n)=2T(n/2)+n we get case 2 giving O(n log n). For T(n)=3T(n/4)+n*log(n) we get case 3 giving O(n*log(n)).', NULL, NULL, 14, '2026-03-06 05:55:00', '2026-03-06 05:55:00'),
(23, 7, 7, 'BFS uses a queue to visit nodes level by level. Its great for finding the shortest path in an unweighted graph. DFS uses a stack (or recursion) to go deep before backtracking. DFS is memory efficient for deep graphs but doesnt guarantee shortest path. Real world BFS: Google Maps shortest route on unweighted grids. Real world DFS: web crawlers exploring links deeply, compiler dependency resolution.', NULL, NULL, 14, '2026-03-06 06:08:00', '2026-03-06 06:08:00'),

-- Maria Garcia — Quiz 2 (safe)
(24, 9, 4, NULL, 'O(n log n)', 1, 5, '2026-03-06 04:05:00', '2026-03-06 04:05:00'),
(25, 9, 5, NULL, 'HeapSort',  0, 0, '2026-03-06 04:08:00', '2026-03-06 04:08:00'),
(26, 9, 6, 'Master Theorem: T(n) = aT(n/b) + f(n). Compare f(n) with n^(log_b a). Case 1 recursive calls dominate, case 2 equal work, case 3 combine step dominates. T(n)=4T(n/2)+n gives O(n^2). T(n)=2T(n/2)+n gives O(n log n). T(n)=T(n/2)+n^2 gives O(n^2).', NULL, NULL, 12, '2026-03-06 04:28:00', '2026-03-06 04:28:00'),
(27, 9, 7, 'BFS visits neighbors first using a queue. DFS dives deep using a stack. BFS is good for shortest paths and peer-to-peer networks. DFS is good for topological sorting and solving puzzles. BFS uses more memory because it stores all neighbors. DFS can get stuck in infinite branches without depth limits.', NULL, NULL, 13, '2026-03-06 04:37:00', '2026-03-06 04:37:00');


-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. FINGERPRINTS (writing style baselines per student per assignment)
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT IGNORE INTO `fingerprints` (`id`, `quiz_assignment_id`, `student_id`, `lexical_density`, `avg_sentence_length`, `vocabulary_diversity`, `burst_score`, `flesch_kincaid_score`, `created_at`) VALUES
-- Alex Johnson — Quiz 1 (deviates from baseline: higher FK, lower diversity => AI-like)
(1,  1, 2, 0.41, 22.3, 0.52, 0.15, 12.4, '2026-03-05 19:28:00'),
-- Sarah Miller — Quiz 1 (close to baseline => authentic)
(2,  2, 3, 0.29, 12.8, 0.71, 0.37, 7.9,  '2026-03-05 18:55:00'),
-- David Chen — Quiz 1 (moderate deviation)
(3,  3, 4, 0.38, 19.1, 0.58, 0.25, 10.5, '2026-03-05 20:25:00'),
-- Maria Garcia — Quiz 1 (close to baseline)
(4,  4, 5, 0.31, 13.8, 0.69, 0.36, 8.0,  '2026-03-05 17:22:00'),
-- James Wilson — Quiz 1 (very close to baseline)
(5,  5, 6, 0.28, 11.9, 0.73, 0.33, 7.1,  '2026-03-05 16:18:00'),
-- Alex Johnson — Quiz 2 (moderate deviation)
(6,  6, 2, 0.37, 18.2, 0.60, 0.28, 10.1, '2026-03-06 06:40:00'),
-- Sarah Miller — Quiz 2 (close to baseline)
(7,  7, 3, 0.27, 12.5, 0.73, 0.34, 7.3,  '2026-03-06 06:10:00'),
-- Maria Garcia — Quiz 2 (close to baseline)
(8,  9, 5, 0.31, 13.5, 0.68, 0.37, 7.9,  '2026-03-06 04:38:00');


-- ═══════════════════════════════════════════════════════════════════════════════
-- 7. KEYSTROKE LOGS (telemetry heartbeats per session)
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT IGNORE INTO `keystroke_logs` (`id`, `quiz_assignment_id`, `session_id`, `timestamp`, `events`, `wpm`, `burst_score`, `avg_latency`, `peak_wpm`, `paste_chars`, `paste_events`, `total_keys`, `wpm_history`, `nonce`, `signature`, `created_at`) VALUES
-- Alex Johnson — Quiz 1 (high paste, WPM spikes => high risk)
(1, 1, 'sess-q1-alex-001', '2026-03-05 19:10:00', '[]', 35.2, 0.15, 280, 42, 420, 3, 180,
 '[30,32,28,35,120,35,25,110,38,30]',
 'nonce-a1-001', 'sig-a1-001', '2026-03-05 19:10:00'),
(2, 1, 'sess-q1-alex-001', '2026-03-05 19:20:00', '[]', 28.5, 0.12, 310, 35, 380, 2, 150,
 '[25,28,22,30,95,28,24,88,32,26]',
 'nonce-a1-002', 'sig-a1-002', '2026-03-05 19:20:00'),

-- Sarah Miller — Quiz 1 (consistent WPM, no paste => safe)
(3, 2, 'sess-q1-sarah-001', '2026-03-05 18:40:00', '[]', 62.1, 0.36, 145, 78, 0, 0, 520,
 '[58,60,63,65,61,62,64,60,59,63]',
 'nonce-s1-001', 'sig-s1-001', '2026-03-05 18:40:00'),
(4, 2, 'sess-q1-sarah-001', '2026-03-05 18:50:00', '[]', 64.3, 0.34, 140, 80, 0, 0, 540,
 '[62,63,65,64,66,63,61,65,64,62]',
 'nonce-s1-002', 'sig-s1-002', '2026-03-05 18:50:00'),

-- David Chen — Quiz 1 (some paste, moderate spikes => medium risk)
(5, 3, 'sess-q1-david-001', '2026-03-05 20:10:00', '[]', 45.8, 0.25, 210, 68, 180, 1, 380,
 '[42,44,46,48,85,45,43,44,47,46]',
 'nonce-d1-001', 'sig-d1-001', '2026-03-05 20:10:00'),
(6, 3, 'sess-q1-david-001', '2026-03-05 20:20:00', '[]', 42.1, 0.28, 225, 55, 95, 1, 340,
 '[40,42,38,44,60,42,41,43,40,42]',
 'nonce-d1-002', 'sig-d1-002', '2026-03-05 20:20:00'),

-- Maria Garcia — Quiz 1 (clean)
(7, 4, 'sess-q1-maria-001', '2026-03-05 17:10:00', '[]', 55.0, 0.38, 160, 68, 0, 0, 460,
 '[52,54,56,55,57,54,53,56,55,54]',
 'nonce-m1-001', 'sig-m1-001', '2026-03-05 17:10:00'),

-- James Wilson — Quiz 1 (very clean, consistent)
(8, 5, 'sess-q1-james-001', '2026-03-05 16:08:00', '[]', 70.2, 0.32, 128, 82, 0, 0, 620,
 '[68,70,71,69,72,70,68,71,70,69]',
 'nonce-j1-001', 'sig-j1-001', '2026-03-05 16:08:00'),

-- Alex Johnson — Quiz 2 (moderate issues)
(9, 6, 'sess-q2-alex-001', '2026-03-06 06:15:00', '[]', 40.5, 0.22, 240, 55, 200, 2, 320,
 '[38,40,35,42,80,40,38,75,42,38]',
 'nonce-a2-001', 'sig-a2-001', '2026-03-06 06:15:00'),

-- Sarah Miller — Quiz 2 (clean)
(10, 7, 'sess-q2-sarah-001', '2026-03-06 05:45:00', '[]', 63.8, 0.35, 142, 79, 0, 0, 560,
 '[60,62,64,65,63,64,62,65,63,62]',
 'nonce-s2-001', 'sig-s2-001', '2026-03-06 05:45:00');


-- ═══════════════════════════════════════════════════════════════════════════════
-- 8. WINDOW CHANGE LOGS (alt-tab activity)
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT IGNORE INTO `window_change_logs` (`id`, `quiz_assignment_id`, `session_id`, `event_type`, `timestamp`, `away_duration_ms`, `page_url`, `created_at`) VALUES
-- Alex Johnson — Quiz 1: 14 blur events (high risk)
(1,  1, 'sess-q1-alex-001', 'blur',  '2026-03-05 19:02:00', NULL,  '/quiz/1', '2026-03-05 19:02:00'),
(2,  1, 'sess-q1-alex-001', 'focus', '2026-03-05 19:02:15', 15000, '/quiz/1', '2026-03-05 19:02:15'),
(3,  1, 'sess-q1-alex-001', 'blur',  '2026-03-05 19:04:30', NULL,  '/quiz/1', '2026-03-05 19:04:30'),
(4,  1, 'sess-q1-alex-001', 'focus', '2026-03-05 19:05:00', 30000, '/quiz/1', '2026-03-05 19:05:00'),
(5,  1, 'sess-q1-alex-001', 'blur',  '2026-03-05 19:05:45', NULL,  '/quiz/1', '2026-03-05 19:05:45'),
(6,  1, 'sess-q1-alex-001', 'focus', '2026-03-05 19:06:10', 25000, '/quiz/1', '2026-03-05 19:06:10'),
(7,  1, 'sess-q1-alex-001', 'blur',  '2026-03-05 19:07:00', NULL,  '/quiz/1', '2026-03-05 19:07:00'),
(8,  1, 'sess-q1-alex-001', 'focus', '2026-03-05 19:07:45', 45000, '/quiz/1', '2026-03-05 19:07:45'),
(9,  1, 'sess-q1-alex-001', 'blur',  '2026-03-05 19:09:20', NULL,  '/quiz/1', '2026-03-05 19:09:20'),
(10, 1, 'sess-q1-alex-001', 'focus', '2026-03-05 19:10:00', 40000, '/quiz/1', '2026-03-05 19:10:00'),
(11, 1, 'sess-q1-alex-001', 'blur',  '2026-03-05 19:12:10', NULL,  '/quiz/1', '2026-03-05 19:12:10'),
(12, 1, 'sess-q1-alex-001', 'focus', '2026-03-05 19:12:30', 20000, '/quiz/1', '2026-03-05 19:12:30'),
(13, 1, 'sess-q1-alex-001', 'blur',  '2026-03-05 19:14:00', NULL,  '/quiz/1', '2026-03-05 19:14:00'),
(14, 1, 'sess-q1-alex-001', 'focus', '2026-03-05 19:14:35', 35000, '/quiz/1', '2026-03-05 19:14:35'),
(15, 1, 'sess-q1-alex-001', 'blur',  '2026-03-05 19:16:00', NULL,  '/quiz/1', '2026-03-05 19:16:00'),
(16, 1, 'sess-q1-alex-001', 'focus', '2026-03-05 19:16:10', 10000, '/quiz/1', '2026-03-05 19:16:10'),
(17, 1, 'sess-q1-alex-001', 'blur',  '2026-03-05 19:18:30', NULL,  '/quiz/1', '2026-03-05 19:18:30'),
(18, 1, 'sess-q1-alex-001', 'focus', '2026-03-05 19:19:00', 30000, '/quiz/1', '2026-03-05 19:19:00'),
(19, 1, 'sess-q1-alex-001', 'blur',  '2026-03-05 19:20:45', NULL,  '/quiz/1', '2026-03-05 19:20:45'),
(20, 1, 'sess-q1-alex-001', 'focus', '2026-03-05 19:21:10', 25000, '/quiz/1', '2026-03-05 19:21:10'),
(21, 1, 'sess-q1-alex-001', 'blur',  '2026-03-05 19:22:30', NULL,  '/quiz/1', '2026-03-05 19:22:30'),
(22, 1, 'sess-q1-alex-001', 'focus', '2026-03-05 19:23:00', 30000, '/quiz/1', '2026-03-05 19:23:00'),
(23, 1, 'sess-q1-alex-001', 'blur',  '2026-03-05 19:24:15', NULL,  '/quiz/1', '2026-03-05 19:24:15'),
(24, 1, 'sess-q1-alex-001', 'focus', '2026-03-05 19:24:40', 25000, '/quiz/1', '2026-03-05 19:24:40'),
(25, 1, 'sess-q1-alex-001', 'blur',  '2026-03-05 19:25:50', NULL,  '/quiz/1', '2026-03-05 19:25:50'),
(26, 1, 'sess-q1-alex-001', 'focus', '2026-03-05 19:26:20', 30000, '/quiz/1', '2026-03-05 19:26:20'),
(27, 1, 'sess-q1-alex-001', 'blur',  '2026-03-05 19:27:00', NULL,  '/quiz/1', '2026-03-05 19:27:00'),
(28, 1, 'sess-q1-alex-001', 'focus', '2026-03-05 19:27:15', 15000, '/quiz/1', '2026-03-05 19:27:15'),

-- Sarah Miller — Quiz 1: 1 blur event (safe)
(29, 2, 'sess-q1-sarah-001', 'blur',  '2026-03-05 18:42:00', NULL, '/quiz/1', '2026-03-05 18:42:00'),
(30, 2, 'sess-q1-sarah-001', 'focus', '2026-03-05 18:42:03', 3000, '/quiz/1', '2026-03-05 18:42:03'),

-- David Chen — Quiz 1: 8 blur events (medium risk)
(31, 3, 'sess-q1-david-001', 'blur',  '2026-03-05 20:03:00', NULL,  '/quiz/1', '2026-03-05 20:03:00'),
(32, 3, 'sess-q1-david-001', 'focus', '2026-03-05 20:03:20', 20000, '/quiz/1', '2026-03-05 20:03:20'),
(33, 3, 'sess-q1-david-001', 'blur',  '2026-03-05 20:06:00', NULL,  '/quiz/1', '2026-03-05 20:06:00'),
(34, 3, 'sess-q1-david-001', 'focus', '2026-03-05 20:06:30', 30000, '/quiz/1', '2026-03-05 20:06:30'),
(35, 3, 'sess-q1-david-001', 'blur',  '2026-03-05 20:09:00', NULL,  '/quiz/1', '2026-03-05 20:09:00'),
(36, 3, 'sess-q1-david-001', 'focus', '2026-03-05 20:09:25', 25000, '/quiz/1', '2026-03-05 20:09:25'),
(37, 3, 'sess-q1-david-001', 'blur',  '2026-03-05 20:12:00', NULL,  '/quiz/1', '2026-03-05 20:12:00'),
(38, 3, 'sess-q1-david-001', 'focus', '2026-03-05 20:12:15', 15000, '/quiz/1', '2026-03-05 20:12:15'),
(39, 3, 'sess-q1-david-001', 'blur',  '2026-03-05 20:14:30', NULL,  '/quiz/1', '2026-03-05 20:14:30'),
(40, 3, 'sess-q1-david-001', 'focus', '2026-03-05 20:15:00', 30000, '/quiz/1', '2026-03-05 20:15:00'),
(41, 3, 'sess-q1-david-001', 'blur',  '2026-03-05 20:17:00', NULL,  '/quiz/1', '2026-03-05 20:17:00'),
(42, 3, 'sess-q1-david-001', 'focus', '2026-03-05 20:17:20', 20000, '/quiz/1', '2026-03-05 20:17:20'),
(43, 3, 'sess-q1-david-001', 'blur',  '2026-03-05 20:19:45', NULL,  '/quiz/1', '2026-03-05 20:19:45'),
(44, 3, 'sess-q1-david-001', 'focus', '2026-03-05 20:20:10', 25000, '/quiz/1', '2026-03-05 20:20:10'),
(45, 3, 'sess-q1-david-001', 'blur',  '2026-03-05 20:22:30', NULL,  '/quiz/1', '2026-03-05 20:22:30'),
(46, 3, 'sess-q1-david-001', 'focus', '2026-03-05 20:22:50', 20000, '/quiz/1', '2026-03-05 20:22:50'),

-- Maria Garcia — Quiz 1: 2 blur events (safe)
(47, 4, 'sess-q1-maria-001', 'blur',  '2026-03-05 17:05:00', NULL, '/quiz/1', '2026-03-05 17:05:00'),
(48, 4, 'sess-q1-maria-001', 'focus', '2026-03-05 17:05:04', 4000, '/quiz/1', '2026-03-05 17:05:04'),
(49, 4, 'sess-q1-maria-001', 'blur',  '2026-03-05 17:15:00', NULL, '/quiz/1', '2026-03-05 17:15:00'),
(50, 4, 'sess-q1-maria-001', 'focus', '2026-03-05 17:15:02', 2000, '/quiz/1', '2026-03-05 17:15:02'),

-- James Wilson — Quiz 1: 0 blur events (perfect)
-- (none)

-- Alex Johnson — Quiz 2: 6 blur events
(51, 6, 'sess-q2-alex-001', 'blur',  '2026-03-06 06:05:00', NULL,  '/quiz/2', '2026-03-06 06:05:00'),
(52, 6, 'sess-q2-alex-001', 'focus', '2026-03-06 06:05:20', 20000, '/quiz/2', '2026-03-06 06:05:20'),
(53, 6, 'sess-q2-alex-001', 'blur',  '2026-03-06 06:10:00', NULL,  '/quiz/2', '2026-03-06 06:10:00'),
(54, 6, 'sess-q2-alex-001', 'focus', '2026-03-06 06:10:30', 30000, '/quiz/2', '2026-03-06 06:10:30'),
(55, 6, 'sess-q2-alex-001', 'blur',  '2026-03-06 06:18:00', NULL,  '/quiz/2', '2026-03-06 06:18:00'),
(56, 6, 'sess-q2-alex-001', 'focus', '2026-03-06 06:18:25', 25000, '/quiz/2', '2026-03-06 06:18:25'),
(57, 6, 'sess-q2-alex-001', 'blur',  '2026-03-06 06:22:00', NULL,  '/quiz/2', '2026-03-06 06:22:00'),
(58, 6, 'sess-q2-alex-001', 'focus', '2026-03-06 06:22:15', 15000, '/quiz/2', '2026-03-06 06:22:15'),
(59, 6, 'sess-q2-alex-001', 'blur',  '2026-03-06 06:30:00', NULL,  '/quiz/2', '2026-03-06 06:30:00'),
(60, 6, 'sess-q2-alex-001', 'focus', '2026-03-06 06:30:20', 20000, '/quiz/2', '2026-03-06 06:30:20'),
(61, 6, 'sess-q2-alex-001', 'blur',  '2026-03-06 06:35:00', NULL,  '/quiz/2', '2026-03-06 06:35:00'),
(62, 6, 'sess-q2-alex-001', 'focus', '2026-03-06 06:35:10', 10000, '/quiz/2', '2026-03-06 06:35:10');


-- ═══════════════════════════════════════════════════════════════════════════════
-- 9. SESSION REPLAYS
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT IGNORE INTO `session_replays` (`id`, `quiz_assignment_id`, `session_id`, `question_id`, `replay_events`, `text_snapshots`, `duration_ms`, `total_events`, `created_at`) VALUES
(1, 1, 'sess-q1-alex-001',  1, '[]', '[{"t":0,"text":""},{"t":5000,"text":"The impl"},{"t":15000,"text":"The implementation of a binary search tree"},{"t":20000,"text":"The implementation of a binary search tree (BST) requires careful consideration of its core properties. A BST is a node-based binary tree data structure which has the following properties: The left subtree of a node contains only nodes with keys lesser than the node''s key. The right subtree of a node contains only nodes with keys greater than the node''s key."},{"t":60000,"text":"The implementation of a binary search tree (BST) requires careful consideration of its core properties. A BST is a node-based binary tree data structure which has the following properties: The left subtree of a node contains only nodes with keys lesser than the node''s key. The right subtree of a node contains only nodes with keys greater than the node''s key. I started by defining the Node class with left and right children."}]', 900000, 180, '2026-03-05 19:28:00'),
(2, 2, 'sess-q1-sarah-001', 1, '[]', '[{"t":0,"text":""},{"t":3000,"text":"A BST"},{"t":30000,"text":"A BST has the property where left children are smaller and right children are larger"},{"t":120000,"text":"A BST has the property where left children are smaller and right children are larger than the parent node. For insertion you traverse down comparing keys."}]', 600000, 520, '2026-03-05 18:55:00'),
(3, 3, 'sess-q1-david-001', 1, '[]', '[{"t":0,"text":""},{"t":5000,"text":"A binary"},{"t":20000,"text":"A binary search tree is a data structure"},{"t":80000,"text":"A binary search tree is a data structure that maintains sorted order. Each node has at most two children."}]', 750000, 380, '2026-03-05 20:25:00');


-- ═══════════════════════════════════════════════════════════════════════════════
-- 10. ANALYSIS RESULTS (computed risk assessments)
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT IGNORE INTO `analysis_results` (`id`, `quiz_assignment_id`, `student_id`, `risk_score`, `confidence`, `flags`, `deviation`, `z_scores`, `explanation`, `ai_explanation`, `window_change_count`, `created_at`) VALUES
-- Alex Johnson — Quiz 1 (HIGH RISK: 75)
(1, 1, 2, 75, 0.82,
 '[{"type":"metric_deviation","metric":"wpm","current":35.2,"baseline":62,"deviation":43},{"type":"metric_deviation","metric":"burst_score","current":0.15,"baseline":0.42,"deviation":64},{"type":"excessive_window_changes","blur_count":14},{"type":"excessive_paste","paste_chars":420,"paste_events":3}]',
 '{"wpm":43,"burst_score":64,"avg_latency":93,"peak_wpm":46}',
 '{"wpm":1.72,"burst_score":2.56,"avg_latency":3.72,"peak_wpm":1.84}',
 'wpm deviated 43% from baseline. burst_score deviated 64% from baseline. 14 window switches detected. Large paste detected: 420 chars.',
 'This submission shows strong indicators of external assistance. The student''s typing speed dropped significantly below their baseline (35 vs 62 WPM), suggesting they were reading and copying rather than composing. The burst score is far below the established pattern, indicating uniform paste timing rather than natural keystroke rhythm. Combined with 14 window switches and 420 characters of pasted content, this submission has a high probability of containing AI-generated or externally sourced text.',
 14, '2026-03-05 19:30:00'),

-- Sarah Miller — Quiz 1 (SAFE: 12)
(2, 2, 3, 12, 0.88,
 '[]',
 '{"wpm":3,"burst_score":6,"avg_latency":7,"peak_wpm":3}',
 '{"wpm":0.12,"burst_score":0.24,"avg_latency":0.28,"peak_wpm":0.12}',
 'No anomalies detected.',
 NULL,
 1, '2026-03-05 18:57:00'),

-- David Chen — Quiz 1 (MEDIUM RISK: 58)
(3, 3, 4, 58, 0.75,
 '[{"type":"metric_deviation","metric":"burst_score","current":0.25,"baseline":0.48,"deviation":48},{"type":"excessive_window_changes","blur_count":8},{"type":"excessive_paste","paste_chars":180,"paste_events":1}]',
 '{"wpm":18,"burst_score":48,"avg_latency":25,"peak_wpm":30}',
 '{"wpm":0.72,"burst_score":1.92,"avg_latency":1.00,"peak_wpm":1.20}',
 'burst_score deviated 48% from baseline. 8 window switches detected. Large paste detected: 180 chars.',
 'This submission shows moderate indicators of external assistance. While less severe than a clear copy-paste submission, the burst score deviation and window switching frequency suggest the student may have been referencing external sources. The pasted content length is notable but not extreme.',
 8, '2026-03-05 20:27:00'),

-- Maria Garcia — Quiz 1 (SAFE: 20)
(4, 4, 5, 20, 0.85,
 '[]',
 '{"wpm":5,"burst_score":5,"avg_latency":8,"peak_wpm":9}',
 '{"wpm":0.20,"burst_score":0.20,"avg_latency":0.32,"peak_wpm":0.36}',
 'No anomalies detected.',
 NULL,
 2, '2026-03-05 17:24:00'),

-- James Wilson — Quiz 1 (VERY SAFE: 8)
(5, 5, 6, 8, 0.92,
 '[]',
 '{"wpm":2,"burst_score":3,"avg_latency":4,"peak_wpm":2}',
 '{"wpm":0.08,"burst_score":0.12,"avg_latency":0.16,"peak_wpm":0.08}',
 'No anomalies detected.',
 NULL,
 0, '2026-03-05 16:20:00'),

-- Alex Johnson — Quiz 2 (MODERATE RISK: 42)
(6, 6, 2, 42, 0.80,
 '[{"type":"excessive_window_changes","blur_count":6},{"type":"excessive_paste","paste_chars":200,"paste_events":2}]',
 '{"wpm":35,"burst_score":47,"avg_latency":66,"peak_wpm":33}',
 '{"wpm":1.40,"burst_score":1.88,"avg_latency":2.64,"peak_wpm":1.32}',
 '6 window switches detected. Large paste detected: 200 chars.',
 'This submission shows moderate risk indicators. Window switching and paste activity are elevated but less severe than previous submissions from this student.',
 6, '2026-03-06 06:42:00'),

-- Sarah Miller — Quiz 2 (SAFE: 10)
(7, 7, 3, 10, 0.90,
 '[]',
 '{"wpm":3,"burst_score":3,"avg_latency":5,"peak_wpm":4}',
 '{"wpm":0.12,"burst_score":0.12,"avg_latency":0.20,"peak_wpm":0.16}',
 'No anomalies detected.',
 NULL,
 0, '2026-03-06 06:12:00'),

-- Maria Garcia — Quiz 2 (SAFE: 15)
(8, 9, 5, 15, 0.86,
 '[]',
 '{"wpm":4,"burst_score":3,"avg_latency":6,"peak_wpm":5}',
 '{"wpm":0.16,"burst_score":0.12,"avg_latency":0.24,"peak_wpm":0.20}',
 'No anomalies detected.',
 NULL,
 1, '2026-03-06 04:40:00');


-- ═══════════════════════════════════════════════════════════════════════════════
-- Done! Verify counts:
--   profiles:           6 (1 teacher + 5 students)
--   quizzes:            2
--   quiz_questions:     7 (3 + 4)
--   quiz_assignments:  10 (5 per quiz)
--   quiz_responses:    27
--   fingerprints:       8
--   keystroke_logs:    10
--   window_change_logs: 62
--   session_replays:    3
--   analysis_results:   8
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


