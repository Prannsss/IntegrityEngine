-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 05, 2026 at 07:00 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `intengine`
--

-- --------------------------------------------------------

--
-- Table structure for table `analysis_results`
--

CREATE TABLE `analysis_results` (
  `id` int(11) NOT NULL,
  `quiz_assignment_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `risk_score` int(11) NOT NULL,
  `confidence` float NOT NULL,
  `flags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`flags`)),
  `deviation` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`deviation`)),
  `z_scores` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`z_scores`)),
  `explanation` text NOT NULL DEFAULT '',
  `ai_explanation` text DEFAULT NULL,
  `window_change_count` int(11) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp()
) ;

-- --------------------------------------------------------

--
-- Table structure for table `fingerprints`
--

CREATE TABLE `fingerprints` (
  `id` int(11) NOT NULL,
  `quiz_assignment_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `lexical_density` float NOT NULL DEFAULT 0,
  `avg_sentence_length` float NOT NULL DEFAULT 0,
  `vocabulary_diversity` float NOT NULL DEFAULT 0,
  `burst_score` float NOT NULL DEFAULT 0,
  `flesch_kincaid_score` float NOT NULL DEFAULT 0,
  `fingerprint_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`fingerprint_json`)),
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `fingerprints`
--
DELIMITER $$
CREATE TRIGGER `after_fingerprint_insert` AFTER INSERT ON `fingerprints` FOR EACH ROW BEGIN
  UPDATE profiles SET
    baseline_fingerprint = (
      SELECT JSON_OBJECT(
        'lexical_density',      AVG(lexical_density),
        'avg_sentence_length',  AVG(avg_sentence_length),
        'vocabulary_diversity', AVG(vocabulary_diversity),
        'burst_score',          AVG(burst_score),
        'flesch_kincaid_score', AVG(flesch_kincaid_score)
      )
      FROM fingerprints WHERE student_id = NEW.student_id
    ),
    baseline_sample_count = (
      SELECT COUNT(*) FROM fingerprints WHERE student_id = NEW.student_id
    )
  WHERE id = NEW.student_id;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `before_fingerprint_insert` BEFORE INSERT ON `fingerprints` FOR EACH ROW BEGIN
  SET NEW.fingerprint_json = JSON_OBJECT(
    'lexical_density',      NEW.lexical_density,
    'avg_sentence_length',  NEW.avg_sentence_length,
    'vocabulary_diversity', NEW.vocabulary_diversity,
    'burst_score',          NEW.burst_score,
    'flesch_kincaid_score', NEW.flesch_kincaid_score
  );
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `before_fingerprint_update` BEFORE UPDATE ON `fingerprints` FOR EACH ROW BEGIN
  SET NEW.fingerprint_json = JSON_OBJECT(
    'lexical_density',      NEW.lexical_density,
    'avg_sentence_length',  NEW.avg_sentence_length,
    'vocabulary_diversity', NEW.vocabulary_diversity,
    'burst_score',          NEW.burst_score,
    'flesch_kincaid_score', NEW.flesch_kincaid_score
  );
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `keystroke_logs`
--

CREATE TABLE `keystroke_logs` (
  `id` int(11) NOT NULL,
  `quiz_assignment_id` int(11) NOT NULL,
  `session_id` varchar(255) NOT NULL,
  `timestamp` datetime DEFAULT current_timestamp(),
  `events` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`events`)),
  `wpm` float DEFAULT 0,
  `burst_score` float DEFAULT 0,
  `avg_latency` float DEFAULT 0,
  `peak_wpm` float DEFAULT 0,
  `paste_chars` int(11) DEFAULT 0,
  `paste_events` int(11) DEFAULT 0,
  `total_keys` int(11) DEFAULT 0,
  `wpm_history` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`wpm_history`)),
  `nonce` varchar(255) DEFAULT NULL,
  `signature` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `profiles`
--

CREATE TABLE `profiles` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `avatar_url` text DEFAULT NULL,
  `role` enum('teacher','student') NOT NULL,
  `baseline_fingerprint` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`baseline_fingerprint`)),
  `baseline_sample_count` int(11) DEFAULT 0,
  `email_verified` tinyint(1) DEFAULT 0,
  `verification_code` varchar(6) DEFAULT NULL,
  `last_login_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `profiles`
--

INSERT INTO `profiles` (`id`, `email`, `password`, `full_name`, `avatar_url`, `role`, `baseline_fingerprint`, `baseline_sample_count`, `email_verified`, `last_login_at`, `created_at`, `updated_at`) VALUES
(1, 'teacher@integ.com', '$2y$10$mDo5/nvj9v3e.UaMKxAqeutewag2M0xf72BrQ2VbCd9vMXw0svDES', 'Default Teacher', NULL, 'teacher', NULL, 0, 1, NULL, '2026-03-06 00:47:21', '2026-03-06 00:47:21'),
(2, 'student@integ.com', '$2y$10$mtiilNl1BccmhIs9uw4BM.w7YTWHJ1cmlt0RI0ITPptiL.23Wr0u.', 'Default Student', NULL, 'student', NULL, 0, 1, '2026-03-06 01:09:38', '2026-03-06 00:47:21', '2026-03-06 01:09:38');

-- --------------------------------------------------------

--
-- Table structure for table `quizzes`
--

CREATE TABLE `quizzes` (
  `id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `title` varchar(500) NOT NULL,
  `description` text DEFAULT '',
  `type` enum('essay','multiple_choice','mixed') NOT NULL,
  `status` enum('draft','published','closed') NOT NULL DEFAULT 'draft',
  `time_limit_mins` int(11) DEFAULT NULL,
  `due_date` datetime DEFAULT NULL,
  `settings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`settings`)),
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `quiz_assignments`
--

CREATE TABLE `quiz_assignments` (
  `id` int(11) NOT NULL,
  `quiz_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `status` enum('assigned','in_progress','submitted','reviewed','flagged') NOT NULL DEFAULT 'assigned',
  `risk_score` int(11) DEFAULT NULL,
  `total_score` int(11) DEFAULT NULL,
  `max_score` int(11) DEFAULT NULL,
  `started_at` datetime DEFAULT NULL,
  `submitted_at` datetime DEFAULT NULL,
  `session_id` varchar(255) DEFAULT NULL,
  `window_changes` int(11) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

-- --------------------------------------------------------

--
-- Table structure for table `quiz_questions`
--

CREATE TABLE `quiz_questions` (
  `id` int(11) NOT NULL,
  `quiz_id` int(11) NOT NULL,
  `question_text` text NOT NULL,
  `question_type` enum('essay','multiple_choice') NOT NULL,
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`options`)),
  `correct_answer` varchar(500) DEFAULT NULL,
  `points` int(11) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `quiz_responses`
--

CREATE TABLE `quiz_responses` (
  `id` int(11) NOT NULL,
  `quiz_assignment_id` int(11) NOT NULL,
  `question_id` int(11) NOT NULL,
  `answer_text` text DEFAULT '',
  `selected_option` varchar(500) DEFAULT NULL,
  `is_correct` tinyint(1) DEFAULT NULL,
  `score` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `session_replays`
--

CREATE TABLE `session_replays` (
  `id` int(11) NOT NULL,
  `quiz_assignment_id` int(11) NOT NULL,
  `session_id` varchar(255) NOT NULL,
  `question_id` int(11) DEFAULT NULL,
  `replay_events` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`replay_events`)),
  `text_snapshots` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`text_snapshots`)),
  `duration_ms` int(11) DEFAULT 0,
  `total_events` int(11) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `window_change_logs`
--

CREATE TABLE `window_change_logs` (
  `id` int(11) NOT NULL,
  `quiz_assignment_id` int(11) NOT NULL,
  `session_id` varchar(255) NOT NULL,
  `event_type` enum('blur','focus') NOT NULL,
  `timestamp` datetime DEFAULT current_timestamp(),
  `away_duration_ms` int(11) DEFAULT NULL,
  `page_url` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `window_change_logs`
--
DELIMITER $$
CREATE TRIGGER `after_window_change_insert` AFTER INSERT ON `window_change_logs` FOR EACH ROW BEGIN
  IF NEW.event_type = 'blur' THEN
    UPDATE quiz_assignments
    SET window_changes = window_changes + 1
    WHERE id = NEW.quiz_assignment_id;
  END IF;
END
$$
DELIMITER ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `analysis_results`
--
ALTER TABLE `analysis_results`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_analysis_qa` (`quiz_assignment_id`),
  ADD KEY `idx_analysis_risk` (`risk_score`),
  ADD KEY `fk_analysis_student` (`student_id`);

--
-- Indexes for table `fingerprints`
--
ALTER TABLE `fingerprints`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_fingerprints_unique_qa` (`quiz_assignment_id`),
  ADD KEY `idx_fingerprints_student` (`student_id`),
  ADD KEY `idx_fingerprints_qa` (`quiz_assignment_id`),
  ADD KEY `idx_fingerprints_created` (`student_id`,`created_at`);

--
-- Indexes for table `keystroke_logs`
--
ALTER TABLE `keystroke_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_keystroke_qa` (`quiz_assignment_id`),
  ADD KEY `idx_keystroke_session` (`session_id`),
  ADD KEY `idx_keystroke_timestamp` (`quiz_assignment_id`,`timestamp`);

--
-- Indexes for table `profiles`
--
ALTER TABLE `profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_profiles_email` (`email`),
  ADD KEY `idx_profiles_role` (`role`),
  ADD KEY `idx_profiles_email` (`email`);

--
-- Indexes for table `quizzes`
--
ALTER TABLE `quizzes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_quizzes_teacher` (`teacher_id`),
  ADD KEY `idx_quizzes_status` (`status`);

--
-- Indexes for table `quiz_assignments`
--
ALTER TABLE `quiz_assignments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_qa_quiz_student` (`quiz_id`,`student_id`),
  ADD KEY `idx_qa_student` (`student_id`),
  ADD KEY `idx_qa_teacher` (`teacher_id`),
  ADD KEY `idx_qa_quiz` (`quiz_id`),
  ADD KEY `idx_qa_status` (`status`),
  ADD KEY `idx_qa_risk` (`risk_score`);

--
-- Indexes for table `quiz_questions`
--
ALTER TABLE `quiz_questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_questions_quiz` (`quiz_id`),
  ADD KEY `idx_questions_order` (`quiz_id`,`sort_order`);

--
-- Indexes for table `quiz_responses`
--
ALTER TABLE `quiz_responses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_responses_qa_question` (`quiz_assignment_id`,`question_id`),
  ADD KEY `idx_responses_assignment` (`quiz_assignment_id`),
  ADD KEY `idx_responses_question` (`question_id`);

--
-- Indexes for table `session_replays`
--
ALTER TABLE `session_replays`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_replay_qa` (`quiz_assignment_id`),
  ADD KEY `idx_replay_session` (`session_id`),
  ADD KEY `idx_replay_question` (`question_id`);

--
-- Indexes for table `window_change_logs`
--
ALTER TABLE `window_change_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_window_qa` (`quiz_assignment_id`),
  ADD KEY `idx_window_session` (`session_id`),
  ADD KEY `idx_window_timestamp` (`quiz_assignment_id`,`timestamp`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `analysis_results`
--
ALTER TABLE `analysis_results`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `fingerprints`
--
ALTER TABLE `fingerprints`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `keystroke_logs`
--
ALTER TABLE `keystroke_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `profiles`
--
ALTER TABLE `profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `quizzes`
--
ALTER TABLE `quizzes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `quiz_assignments`
--
ALTER TABLE `quiz_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `quiz_questions`
--
ALTER TABLE `quiz_questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `quiz_responses`
--
ALTER TABLE `quiz_responses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `session_replays`
--
ALTER TABLE `session_replays`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `window_change_logs`
--
ALTER TABLE `window_change_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `analysis_results`
--
ALTER TABLE `analysis_results`
  ADD CONSTRAINT `fk_analysis_qa` FOREIGN KEY (`quiz_assignment_id`) REFERENCES `quiz_assignments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_analysis_student` FOREIGN KEY (`student_id`) REFERENCES `profiles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `fingerprints`
--
ALTER TABLE `fingerprints`
  ADD CONSTRAINT `fk_fingerprints_qa` FOREIGN KEY (`quiz_assignment_id`) REFERENCES `quiz_assignments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_fingerprints_student` FOREIGN KEY (`student_id`) REFERENCES `profiles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `keystroke_logs`
--
ALTER TABLE `keystroke_logs`
  ADD CONSTRAINT `fk_keystroke_qa` FOREIGN KEY (`quiz_assignment_id`) REFERENCES `quiz_assignments` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `quizzes`
--
ALTER TABLE `quizzes`
  ADD CONSTRAINT `fk_quizzes_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `profiles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `quiz_assignments`
--
ALTER TABLE `quiz_assignments`
  ADD CONSTRAINT `fk_qa_quiz` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_qa_student` FOREIGN KEY (`student_id`) REFERENCES `profiles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_qa_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `profiles` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `quiz_questions`
--
ALTER TABLE `quiz_questions`
  ADD CONSTRAINT `fk_questions_quiz` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `quiz_responses`
--
ALTER TABLE `quiz_responses`
  ADD CONSTRAINT `fk_responses_assignment` FOREIGN KEY (`quiz_assignment_id`) REFERENCES `quiz_assignments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_responses_question` FOREIGN KEY (`question_id`) REFERENCES `quiz_questions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `session_replays`
--
ALTER TABLE `session_replays`
  ADD CONSTRAINT `fk_replay_qa` FOREIGN KEY (`quiz_assignment_id`) REFERENCES `quiz_assignments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_replay_question` FOREIGN KEY (`question_id`) REFERENCES `quiz_questions` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `window_change_logs`
--
ALTER TABLE `window_change_logs`
  ADD CONSTRAINT `fk_window_qa` FOREIGN KEY (`quiz_assignment_id`) REFERENCES `quiz_assignments` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
