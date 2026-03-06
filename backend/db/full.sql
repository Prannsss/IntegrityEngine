-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 06, 2026 at 02:20 AM
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

--
-- Dumping data for table `analysis_results`
--

INSERT INTO `analysis_results` (`id`, `quiz_assignment_id`, `student_id`, `risk_score`, `confidence`, `flags`, `deviation`, `z_scores`, `explanation`, `ai_explanation`, `window_change_count`, `created_at`) VALUES
(1, 1, 2, 75, 0.82, '[{\"type\":\"metric_deviation\",\"metric\":\"wpm\",\"current\":35.2,\"baseline\":62,\"deviation\":43},{\"type\":\"metric_deviation\",\"metric\":\"burst_score\",\"current\":0.15,\"baseline\":0.42,\"deviation\":64},{\"type\":\"excessive_window_changes\",\"blur_count\":14},{\"type\":\"excessive_paste\",\"paste_chars\":420,\"paste_events\":3}]', '{\"wpm\":43,\"burst_score\":64,\"avg_latency\":93,\"peak_wpm\":46}', '{\"wpm\":1.72,\"burst_score\":2.56,\"avg_latency\":3.72,\"peak_wpm\":1.84}', 'wpm deviated 43% from baseline. burst_score deviated 64% from baseline. 14 window switches detected. Large paste detected: 420 chars.', 'This submission shows strong indicators of external assistance. The student\'s typing speed dropped significantly below their baseline (35 vs 62 WPM), suggesting they were reading and copying rather than composing. The burst score is far below the established pattern, indicating uniform paste timing rather than natural keystroke rhythm. Combined with 14 window switches and 420 characters of pasted content, this submission has a high probability of containing AI-generated or externally sourced text.', 14, '2026-03-05 19:30:00'),
(2, 2, 3, 12, 0.88, '[]', '{\"wpm\":3,\"burst_score\":6,\"avg_latency\":7,\"peak_wpm\":3}', '{\"wpm\":0.12,\"burst_score\":0.24,\"avg_latency\":0.28,\"peak_wpm\":0.12}', 'No anomalies detected.', NULL, 1, '2026-03-05 18:57:00'),
(3, 3, 4, 58, 0.75, '[{\"type\":\"metric_deviation\",\"metric\":\"burst_score\",\"current\":0.25,\"baseline\":0.48,\"deviation\":48},{\"type\":\"excessive_window_changes\",\"blur_count\":8},{\"type\":\"excessive_paste\",\"paste_chars\":180,\"paste_events\":1}]', '{\"wpm\":18,\"burst_score\":48,\"avg_latency\":25,\"peak_wpm\":30}', '{\"wpm\":0.72,\"burst_score\":1.92,\"avg_latency\":1.00,\"peak_wpm\":1.20}', 'burst_score deviated 48% from baseline. 8 window switches detected. Large paste detected: 180 chars.', 'This submission shows moderate indicators of external assistance. While less severe than a clear copy-paste submission, the burst score deviation and window switching frequency suggest the student may have been referencing external sources. The pasted content length is notable but not extreme.', 8, '2026-03-05 20:27:00'),
(4, 4, 5, 20, 0.85, '[]', '{\"wpm\":5,\"burst_score\":5,\"avg_latency\":8,\"peak_wpm\":9}', '{\"wpm\":0.20,\"burst_score\":0.20,\"avg_latency\":0.32,\"peak_wpm\":0.36}', 'No anomalies detected.', NULL, 2, '2026-03-05 17:24:00'),
(5, 5, 6, 8, 0.92, '[]', '{\"wpm\":2,\"burst_score\":3,\"avg_latency\":4,\"peak_wpm\":2}', '{\"wpm\":0.08,\"burst_score\":0.12,\"avg_latency\":0.16,\"peak_wpm\":0.08}', 'No anomalies detected.', NULL, 0, '2026-03-05 16:20:00'),
(6, 6, 2, 42, 0.8, '[{\"type\":\"excessive_window_changes\",\"blur_count\":6},{\"type\":\"excessive_paste\",\"paste_chars\":200,\"paste_events\":2}]', '{\"wpm\":35,\"burst_score\":47,\"avg_latency\":66,\"peak_wpm\":33}', '{\"wpm\":1.40,\"burst_score\":1.88,\"avg_latency\":2.64,\"peak_wpm\":1.32}', '6 window switches detected. Large paste detected: 200 chars.', 'This submission shows moderate risk indicators. Window switching and paste activity are elevated but less severe than previous submissions from this student.', 6, '2026-03-06 06:42:00'),
(7, 7, 3, 10, 0.9, '[]', '{\"wpm\":3,\"burst_score\":3,\"avg_latency\":5,\"peak_wpm\":4}', '{\"wpm\":0.12,\"burst_score\":0.12,\"avg_latency\":0.20,\"peak_wpm\":0.16}', 'No anomalies detected.', NULL, 0, '2026-03-06 06:12:00'),
(8, 9, 5, 15, 0.86, '[]', '{\"wpm\":4,\"burst_score\":3,\"avg_latency\":6,\"peak_wpm\":5}', '{\"wpm\":0.16,\"burst_score\":0.12,\"avg_latency\":0.24,\"peak_wpm\":0.20}', 'No anomalies detected.', NULL, 1, '2026-03-06 04:40:00'),
(9, 11, 2, 30, 0.5, '[{\"id\":\"window_changes\",\"severity\":\"high\",\"label\":\"Tab Switching Detected\",\"detail\":\"11 window focus changes detected\",\"value\":11,\"threshold\":0}]', '[]', '[]', 'Moderate risk score (30/100) with some flags. Tab Switching Detected: 11 window focus changes detected', NULL, 11, '2026-03-06 04:51:47'),
(10, 8, 4, 72, 0.7, '[{\"id\":\"paste_volume\",\"severity\":\"critical\",\"label\":\"Massive Paste\",\"detail\":\"620 chars pasted in 8 events\",\"value\":620,\"threshold\":100},{\"id\":\"style_deviation\",\"severity\":\"high\",\"label\":\"Style Shift\",\"detail\":\"Writing complexity jumped 3σ\",\"value\":3.0,\"threshold\":2.0}]', '{\"lexical_density\":0.20,\"avg_sentence_length\":8.0,\"vocabulary_diversity\":0.25,\"burst_score\":0.34,\"flesch_kincaid_score\":4.5}', '{\"lexical_density\":2.8,\"avg_sentence_length\":3.5,\"vocabulary_diversity\":2.5,\"burst_score\":3.0,\"flesch_kincaid_score\":2.8}', 'Critical: massive paste events, significant style deviation from baseline.', 'Multiple large paste events totaling 620 characters were detected. The writing complexity shifted 3 standard deviations from this student\'s baseline, suggesting external source material.', 12, '2026-03-06 05:14:28'),
(11, 13, 4, 78, 0.68, '[{\"id\":\"paste_volume\",\"severity\":\"critical\",\"label\":\"Massive Paste\",\"detail\":\"780 chars pasted\",\"value\":780,\"threshold\":100},{\"id\":\"burst_anomaly\",\"severity\":\"critical\",\"label\":\"Burst Anomaly\",\"detail\":\"Burst score 0.82 vs baseline 0.48\",\"value\":0.82,\"threshold\":0.55},{\"id\":\"window_switch\",\"severity\":\"high\",\"label\":\"Excessive Tab Switches\",\"detail\":\"15 switches\",\"value\":15,\"threshold\":5}]', '{\"lexical_density\":0.22,\"avg_sentence_length\":9.5,\"vocabulary_diversity\":0.28,\"burst_score\":0.38,\"flesch_kincaid_score\":5.2}', '{\"lexical_density\":3.0,\"avg_sentence_length\":4.2,\"vocabulary_diversity\":2.8,\"burst_score\":3.5,\"flesch_kincaid_score\":3.2}', 'Critical: highest risk submission. Extreme paste, burst anomaly, and tab switching.', 'This submission exhibits the highest risk indicators across all metrics. The student pasted 780 characters, had a burst score 70% above baseline, and switched tabs 15 times — strongly suggesting external assistance.', 15, '2026-03-06 05:14:28'),
(13, 4, 5, 18, 0.86, '[]', '{\"lexical_density\":0.02,\"avg_sentence_length\":0.6,\"vocabulary_diversity\":0.01,\"burst_score\":0.02,\"flesch_kincaid_score\":0.2}', '{\"lexical_density\":0.2,\"avg_sentence_length\":0.3,\"vocabulary_diversity\":0.1,\"burst_score\":0.2,\"flesch_kincaid_score\":0.2}', 'Consistent with baseline. No anomalies.', NULL, 0, '2026-03-06 05:14:28'),
(14, 9, 5, 25, 0.84, '[]', '{\"lexical_density\":0.03,\"avg_sentence_length\":1.0,\"vocabulary_diversity\":0.02,\"burst_score\":0.03,\"flesch_kincaid_score\":0.3}', '{\"lexical_density\":0.3,\"avg_sentence_length\":0.5,\"vocabulary_diversity\":0.2,\"burst_score\":0.3,\"flesch_kincaid_score\":0.3}', 'Minor deviations within normal range.', NULL, 1, '2026-03-06 05:14:28'),
(15, 14, 5, 22, 0.85, '[]', '{\"lexical_density\":0.02,\"avg_sentence_length\":0.8,\"vocabulary_diversity\":0.01,\"burst_score\":0.02,\"flesch_kincaid_score\":0.2}', '{\"lexical_density\":0.2,\"avg_sentence_length\":0.4,\"vocabulary_diversity\":0.1,\"burst_score\":0.2,\"flesch_kincaid_score\":0.2}', 'Writing pattern consistent. Low risk.', NULL, 2, '2026-03-06 05:14:28'),
(17, 5, 6, 12, 0.92, '[]', '{\"lexical_density\":0.01,\"avg_sentence_length\":0.4,\"vocabulary_diversity\":0.01,\"burst_score\":0.01,\"flesch_kincaid_score\":0.1}', '{\"lexical_density\":0.1,\"avg_sentence_length\":0.2,\"vocabulary_diversity\":0.1,\"burst_score\":0.1,\"flesch_kincaid_score\":0.1}', 'Excellent consistency. Very low risk.', NULL, 2, '2026-03-06 05:14:28'),
(18, 10, 6, 10, 0.93, '[]', '{\"lexical_density\":0.01,\"avg_sentence_length\":0.3,\"vocabulary_diversity\":0.01,\"burst_score\":0.01,\"flesch_kincaid_score\":0.1}', '{\"lexical_density\":0.1,\"avg_sentence_length\":0.2,\"vocabulary_diversity\":0.1,\"burst_score\":0.1,\"flesch_kincaid_score\":0.1}', 'All metrics within expected range. Minimal deviation.', NULL, 0, '2026-03-06 05:14:28'),
(19, 15, 6, 14, 0.91, '[]', '{\"lexical_density\":0.01,\"avg_sentence_length\":0.5,\"vocabulary_diversity\":0.01,\"burst_score\":0.01,\"flesch_kincaid_score\":0.1}', '{\"lexical_density\":0.1,\"avg_sentence_length\":0.3,\"vocabulary_diversity\":0.1,\"burst_score\":0.1,\"flesch_kincaid_score\":0.1}', 'Consistent writing and typing patterns.', NULL, 1, '2026-03-06 05:14:28');

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `id` int(11) NOT NULL,
  `author_id` int(11) DEFAULT NULL COMMENT 'FK to profiles; NULL for system-generated announcements',
  `author_label` varchar(255) DEFAULT NULL COMMENT 'Fallback display name when author_id is NULL (e.g. "Admin Office")',
  `type` enum('user','system','alert') NOT NULL DEFAULT 'user',
  `title` varchar(500) NOT NULL,
  `content` text NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `announcements`
--

INSERT INTO `announcements` (`id`, `author_id`, `author_label`, `type`, `title`, `content`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, NULL, 'user', 'Algorithm Analysis Midterm — Instructions', 'Hi everyone! The Algorithm Analysis Midterm (Quiz 2) is now live. You have 45 minutes to complete it. The quiz covers sorting algorithms, complexity analysis, BFS/DFS, and the Master Theorem. Read each question carefully before answering. Once you start, the timer cannot be paused. Good luck!', 1, '2026-03-02 14:30:00', '2026-03-02 14:30:00'),
(2, 1, NULL, 'user', 'Data Structures Quiz — Feedback & Grades Posted', 'Grades for the Data Structures Fundamentals quiz have been finalised. Overall the class performed well — average score was 23.5/30. A few submissions were flagged for review due to unusual typing patterns. If your submission was flagged, please come to office hours on Tuesday so we can discuss it. Keep up the great work!', 1, '2026-03-06 09:00:00', '2026-03-06 09:00:00'),
(3, 1, NULL, 'user', 'Study Materials Uploaded — Week 5', 'I have uploaded the Week 5 lecture slides covering Graph Algorithms (BFS, DFS, Dijkstra) to the Materials section. There is also a supplementary PDF with worked examples for the Master Theorem. Please review these before the next session on Thursday.', 1, '2026-03-05 17:00:00', '2026-03-05 17:00:00'),
(4, NULL, 'Admin Office', 'system', 'New Library Resources Available', 'Access to the ACM Digital Library is now available for all Computer Science students. Log in with your student credentials at library.intengine.edu to explore the full catalog of journals and conference proceedings.', 1, '2026-03-05 12:00:00', '2026-03-05 12:00:00'),
(5, NULL, 'System', 'alert', 'Scheduled Maintenance Tonight', 'System maintenance is scheduled for tonight from 2 AM to 4 AM EST. The dashboard and quiz portal may be temporarily offline during this window. Please plan your study sessions accordingly and avoid starting any timed quizzes during that period.', 1, '2026-03-04 18:00:00', '2026-03-04 18:00:00');

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
-- Dumping data for table `fingerprints`
--

INSERT INTO `fingerprints` (`id`, `quiz_assignment_id`, `student_id`, `lexical_density`, `avg_sentence_length`, `vocabulary_diversity`, `burst_score`, `flesch_kincaid_score`, `fingerprint_json`, `created_at`) VALUES
(1, 1, 2, 0.41, 22.3, 0.52, 0.15, 12.4, '{\"lexical_density\": 0.41, \"avg_sentence_length\": 22.3, \"vocabulary_diversity\": 0.52, \"burst_score\": 0.15, \"flesch_kincaid_score\": 12.4}', '2026-03-05 19:28:00'),
(2, 2, 3, 0.29, 12.8, 0.71, 0.37, 7.9, '{\"lexical_density\": 0.29, \"avg_sentence_length\": 12.8, \"vocabulary_diversity\": 0.71, \"burst_score\": 0.37, \"flesch_kincaid_score\": 7.9}', '2026-03-05 18:55:00'),
(3, 3, 4, 0.38, 19.1, 0.58, 0.25, 10.5, '{\"lexical_density\": 0.38, \"avg_sentence_length\": 19.1, \"vocabulary_diversity\": 0.58, \"burst_score\": 0.25, \"flesch_kincaid_score\": 10.5}', '2026-03-05 20:25:00'),
(4, 4, 5, 0.31, 13.8, 0.69, 0.36, 8, '{\"lexical_density\": 0.31, \"avg_sentence_length\": 13.8, \"vocabulary_diversity\": 0.69, \"burst_score\": 0.36, \"flesch_kincaid_score\": 8}', '2026-03-05 17:22:00'),
(5, 5, 6, 0.28, 11.9, 0.73, 0.33, 7.1, '{\"lexical_density\": 0.28, \"avg_sentence_length\": 11.9, \"vocabulary_diversity\": 0.73, \"burst_score\": 0.33, \"flesch_kincaid_score\": 7.1}', '2026-03-05 16:18:00'),
(6, 6, 2, 0.37, 18.2, 0.6, 0.28, 10.1, '{\"lexical_density\": 0.37, \"avg_sentence_length\": 18.2, \"vocabulary_diversity\": 0.6, \"burst_score\": 0.28, \"flesch_kincaid_score\": 10.1}', '2026-03-06 06:40:00'),
(7, 7, 3, 0.27, 12.5, 0.73, 0.34, 7.3, '{\"lexical_density\": 0.27, \"avg_sentence_length\": 12.5, \"vocabulary_diversity\": 0.73, \"burst_score\": 0.34, \"flesch_kincaid_score\": 7.3}', '2026-03-06 06:10:00'),
(8, 9, 5, 0.31, 13.5, 0.68, 0.37, 7.9, '{\"lexical_density\": 0.31, \"avg_sentence_length\": 13.5, \"vocabulary_diversity\": 0.68, \"burst_score\": 0.37, \"flesch_kincaid_score\": 7.9}', '2026-03-06 04:38:00'),
(10, 8, 4, 0.52, 24, 0.42, 0.78, 13.2, '{\"lexical_density\": 0.52, \"avg_sentence_length\": 24, \"vocabulary_diversity\": 0.42, \"burst_score\": 0.78, \"flesch_kincaid_score\": 13.2}', '2026-03-06 05:14:28'),
(11, 13, 4, 0.55, 25.8, 0.4, 0.82, 14.1, '{\"lexical_density\": 0.55, \"avg_sentence_length\": 25.8, \"vocabulary_diversity\": 0.4, \"burst_score\": 0.82, \"flesch_kincaid_score\": 14.1}', '2026-03-06 05:14:28'),
(15, 14, 5, 0.3, 13.2, 0.7, 0.38, 7.8, '{\"lexical_density\": 0.3, \"avg_sentence_length\": 13.2, \"vocabulary_diversity\": 0.7, \"burst_score\": 0.38, \"flesch_kincaid_score\": 7.8}', '2026-03-06 05:14:28'),
(18, 10, 6, 0.27, 11.5, 0.74, 0.31, 6.9, '{\"lexical_density\": 0.27, \"avg_sentence_length\": 11.5, \"vocabulary_diversity\": 0.74, \"burst_score\": 0.31, \"flesch_kincaid_score\": 6.9}', '2026-03-06 05:14:28'),
(19, 15, 6, 0.27, 11.8, 0.75, 0.32, 7, '{\"lexical_density\": 0.27, \"avg_sentence_length\": 11.8, \"vocabulary_diversity\": 0.75, \"burst_score\": 0.32, \"flesch_kincaid_score\": 7}', '2026-03-06 05:14:28');

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

--
-- Dumping data for table `keystroke_logs`
--

INSERT INTO `keystroke_logs` (`id`, `quiz_assignment_id`, `session_id`, `timestamp`, `events`, `wpm`, `burst_score`, `avg_latency`, `peak_wpm`, `paste_chars`, `paste_events`, `total_keys`, `wpm_history`, `nonce`, `signature`, `created_at`) VALUES
(1, 1, 'sess-q1-alex-001', '2026-03-05 19:10:00', '[]', 35.2, 0.15, 280, 42, 420, 3, 180, '[30,32,28,35,120,35,25,110,38,30]', 'nonce-a1-001', 'sig-a1-001', '2026-03-05 19:10:00'),
(2, 1, 'sess-q1-alex-001', '2026-03-05 19:20:00', '[]', 28.5, 0.12, 310, 35, 380, 2, 150, '[25,28,22,30,95,28,24,88,32,26]', 'nonce-a1-002', 'sig-a1-002', '2026-03-05 19:20:00'),
(3, 2, 'sess-q1-sarah-001', '2026-03-05 18:40:00', '[]', 62.1, 0.36, 145, 78, 0, 0, 520, '[58,60,63,65,61,62,64,60,59,63]', 'nonce-s1-001', 'sig-s1-001', '2026-03-05 18:40:00'),
(4, 2, 'sess-q1-sarah-001', '2026-03-05 18:50:00', '[]', 64.3, 0.34, 140, 80, 0, 0, 540, '[62,63,65,64,66,63,61,65,64,62]', 'nonce-s1-002', 'sig-s1-002', '2026-03-05 18:50:00'),
(5, 3, 'sess-q1-david-001', '2026-03-05 20:10:00', '[]', 45.8, 0.25, 210, 68, 180, 1, 380, '[42,44,46,48,85,45,43,44,47,46]', 'nonce-d1-001', 'sig-d1-001', '2026-03-05 20:10:00'),
(6, 3, 'sess-q1-david-001', '2026-03-05 20:20:00', '[]', 42.1, 0.28, 225, 55, 95, 1, 340, '[40,42,38,44,60,42,41,43,40,42]', 'nonce-d1-002', 'sig-d1-002', '2026-03-05 20:20:00'),
(7, 4, 'sess-q1-maria-001', '2026-03-05 17:10:00', '[]', 55, 0.38, 160, 68, 0, 0, 460, '[52,54,56,55,57,54,53,56,55,54]', 'nonce-m1-001', 'sig-m1-001', '2026-03-05 17:10:00'),
(8, 5, 'sess-q1-james-001', '2026-03-05 16:08:00', '[]', 70.2, 0.32, 128, 82, 0, 0, 620, '[68,70,71,69,72,70,68,71,70,69]', 'nonce-j1-001', 'sig-j1-001', '2026-03-05 16:08:00'),
(9, 6, 'sess-q2-alex-001', '2026-03-06 06:15:00', '[]', 40.5, 0.22, 240, 55, 200, 2, 320, '[38,40,35,42,80,40,38,75,42,38]', 'nonce-a2-001', 'sig-a2-001', '2026-03-06 06:15:00'),
(10, 7, 'sess-q2-sarah-001', '2026-03-06 05:45:00', '[]', 63.8, 0.35, 142, 79, 0, 0, 560, '[60,62,64,65,63,64,62,65,63,62]', 'nonce-s2-001', 'sig-s2-001', '2026-03-06 05:45:00'),
(11, 13, 'sess_q3_s4', '2026-03-05 11:30:00', '[]', 25, 0.82, 275, 95, 780, 10, 1100, '[12,18,22,25,90,88,85]', NULL, NULL, '2026-03-06 05:14:28'),
(13, 4, 'sess_q1_s5', '2026-03-02 09:24:00', '[]', 46, 0.37, 175, 60, 0, 0, 850, '[42,45,47,48,46]', NULL, NULL, '2026-03-06 05:14:28'),
(14, 9, 'sess_q2_s5', '2026-03-04 14:36:00', '[]', 48.5, 0.39, 170, 64, 0, 0, 1700, '[44,47,49,50,48,47]', NULL, NULL, '2026-03-06 05:14:28'),
(15, 14, 'sess_q3_s5', '2026-03-05 11:45:00', '[]', 47, 0.38, 173, 62, 0, 0, 1500, '[42,46,48,49,47,46]', NULL, NULL, '2026-03-06 05:14:28'),
(17, 5, 'sess_q1_s6', '2026-03-02 09:29:00', '[]', 50.2, 0.3, 165, 65, 0, 0, 900, '[46,49,51,52,50]', NULL, NULL, '2026-03-06 05:14:28'),
(18, 10, 'sess_q2_s6', '2026-03-04 14:35:00', '[]', 52, 0.31, 162, 68, 0, 0, 1800, '[48,51,53,54,52,51]', NULL, NULL, '2026-03-06 05:14:28'),
(19, 15, 'sess_q3_s6', '2026-03-05 11:10:00', '[]', 51.5, 0.32, 164, 66, 8, 1, 1550, '[47,50,52,53,51,50]', NULL, NULL, '2026-03-06 05:14:28');

-- --------------------------------------------------------

--
-- Table structure for table `materials`
--

CREATE TABLE `materials` (
  `id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `title` varchar(500) NOT NULL,
  `description` text DEFAULT '',
  `file_name` varchar(500) NOT NULL COMMENT 'Original uploaded filename (sanitised)',
  `file_path` text NOT NULL COMMENT 'Server-relative path, e.g. uploads/abc.pdf',
  `file_type` varchar(100) NOT NULL COMMENT 'MIME type',
  `file_size` int(11) NOT NULL DEFAULT 0 COMMENT 'Bytes',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `materials`
--

INSERT INTO `materials` (`id`, `teacher_id`, `title`, `description`, `file_name`, `file_path`, `file_type`, `file_size`, `created_at`, `updated_at`) VALUES
(1, 1, 'Test', 'Test', 'Chapter_2_-_MIS.pptx', 'uploads/1772743130_a388cdf81756e29e.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 5746341, '2026-03-06 04:38:50', '2026-03-06 04:38:50');

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
  `last_login_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `profiles`
--

INSERT INTO `profiles` (`id`, `email`, `password`, `full_name`, `avatar_url`, `role`, `baseline_fingerprint`, `baseline_sample_count`, `email_verified`, `last_login_at`, `created_at`, `updated_at`) VALUES
(1, 'teacher@integ.com', '$2y$10$mDo5/nvj9v3e.UaMKxAqeutewag2M0xf72BrQ2VbCd9vMXw0svDES', 'Dr. Emily Carter', NULL, 'teacher', NULL, 0, 1, '2026-03-06 08:00:00', '2026-02-01 09:00:00', '2026-03-06 08:00:00'),
(2, 'alex.johnson@integ.com', '$2y$10$mtiilNl1BccmhIs9uw4BM.w7YTWHJ1cmlt0RI0ITPptiL.23Wr0u.', 'Alex Johnson', NULL, 'student', '{\"lexical_density\": 0.39000000059604645, \"avg_sentence_length\": 20.25, \"vocabulary_diversity\": 0.5600000023841858, \"burst_score\": 0.2150000035762787, \"flesch_kincaid_score\": 11.25}', 2, 1, '2026-03-06 07:50:00', '2026-02-05 10:00:00', '2026-03-06 03:43:49'),
(3, 'sarah.miller@integ.com', '$2y$10$mtiilNl1BccmhIs9uw4BM.w7YTWHJ1cmlt0RI0ITPptiL.23Wr0u.', 'Sarah Miller', NULL, 'student', '{\"lexical_density\": 0.2800000011920929, \"avg_sentence_length\": 12.650000095367432, \"vocabulary_diversity\": 0.7199999988079071, \"burst_score\": 0.35500000417232513, \"flesch_kincaid_score\": 7.6000001430511475}', 2, 1, '2026-03-06 07:45:00', '2026-02-05 10:15:00', '2026-03-06 03:43:49'),
(4, 'david.chen@integ.com', '$2y$10$mtiilNl1BccmhIs9uw4BM.w7YTWHJ1cmlt0RI0ITPptiL.23Wr0u.', 'David Chen', NULL, 'student', '{\"lexical_density\": 0.48333332935969037, \"avg_sentence_length\": 22.96666653951009, \"vocabulary_diversity\": 0.4666666587193807, \"burst_score\": 0.6166666547457377, \"flesch_kincaid_score\": 12.600000063578287}', 3, 1, '2026-03-06 07:30:00', '2026-02-06 11:00:00', '2026-03-06 05:14:28'),
(5, 'maria.garcia@integ.com', '$2y$10$mtiilNl1BccmhIs9uw4BM.w7YTWHJ1cmlt0RI0ITPptiL.23Wr0u.', 'Maria Garcia', NULL, 'student', '{\"lexical_density\": 0.30666667222976685, \"avg_sentence_length\": 13.5, \"vocabulary_diversity\": 0.6899999976158142, \"burst_score\": 0.3700000047683716, \"flesch_kincaid_score\": 7.900000095367432}', 3, 1, '2026-03-05 22:10:00', '2026-02-07 09:30:00', '2026-03-06 05:14:28'),
(6, 'student@integ.com', '$2y$10$mtiilNl1BccmhIs9uw4BM.w7YTWHJ1cmlt0RI0ITPptiL.23Wr0u.', 'James Wilson', NULL, 'student', '{\"lexical_density\": 0.273333340883255, \"avg_sentence_length\": 11.733333269755045, \"vocabulary_diversity\": 0.7400000095367432, \"burst_score\": 0.3200000027815501, \"flesch_kincaid_score\": 7}', 3, 1, '2026-03-06 05:02:54', '2026-02-08 14:00:00', '2026-03-06 05:14:28');

-- --------------------------------------------------------

--
-- Table structure for table `quizzes`
--

CREATE TABLE `quizzes` (
  `id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `content_type` enum('quiz','exam','assignment') NOT NULL DEFAULT 'quiz',
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

--
-- Dumping data for table `quizzes`
--

INSERT INTO `quizzes` (`id`, `teacher_id`, `content_type`, `title`, `description`, `type`, `status`, `time_limit_mins`, `due_date`, `settings`, `created_at`, `updated_at`) VALUES
(1, 1, 'quiz', 'Data Structures Fundamentals', 'Essay quiz covering BST, AVL trees, and hash tables.', 'essay', 'published', 30, '2026-03-10 23:59:00', '{\"allow_paste\":false,\"monitor_window\":true}', '2026-03-01 10:00:00', '2026-03-01 10:00:00'),
(2, 1, 'quiz', 'Algorithm Analysis Midterm', 'Mixed quiz on sorting, searching, and complexity analysis.', 'mixed', 'closed', 45, '2026-03-15 23:59:00', '{\"allow_paste\":false,\"monitor_window\":true}', '2026-03-02 14:00:00', '2026-03-06 05:29:00'),
(3, 1, 'assignment', 'Graph Algorithms Essay', 'Write an analysis of shortest-path algorithms.', 'essay', 'published', NULL, '2026-03-15 23:59:00', NULL, '2026-02-25 11:00:00', '2026-02-25 11:00:00'),
(4, 1, 'quiz', 'Test Essay', 'Test', 'essay', 'published', 3, NULL, NULL, '2026-03-06 04:47:59', '2026-03-06 04:48:11'),
(5, 1, 'quiz', 'Test', 'Test', 'multiple_choice', 'published', 2, '2026-03-06 05:26:00', NULL, '2026-03-06 05:26:07', '2026-03-06 05:26:18'),
(6, 1, 'quiz', 'New Test', 'Test', 'essay', 'published', NULL, '2026-03-06 05:55:00', NULL, '2026-03-06 05:54:03', '2026-03-06 05:54:08');

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
  `time_remaining_secs` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Dumping data for table `quiz_assignments`
--

INSERT INTO `quiz_assignments` (`id`, `quiz_id`, `student_id`, `teacher_id`, `status`, `risk_score`, `total_score`, `max_score`, `started_at`, `submitted_at`, `session_id`, `window_changes`, `time_remaining_secs`, `created_at`, `updated_at`) VALUES
(1, 1, 2, 1, 'flagged', 75, 18, 30, '2026-03-05 19:00:00', '2026-03-05 19:28:00', 'sess-q1-alex-001', 14, NULL, '2026-03-03 09:00:00', '2026-03-06 03:43:49'),
(2, 1, 3, 1, 'submitted', 12, 27, 30, '2026-03-05 18:30:00', '2026-03-05 18:55:00', 'sess-q1-sarah-001', 1, NULL, '2026-03-03 09:00:00', '2026-03-06 03:43:49'),
(3, 1, 4, 1, 'flagged', 58, 22, 30, '2026-03-05 20:00:00', '2026-03-05 20:25:00', 'sess-q1-david-001', 8, NULL, '2026-03-03 09:00:00', '2026-03-06 03:43:49'),
(4, 1, 5, 1, 'submitted', 20, 25, 30, '2026-03-05 17:00:00', '2026-03-05 17:22:00', 'sess-q1-maria-001', 2, NULL, '2026-03-03 09:00:00', '2026-03-06 03:43:49'),
(5, 1, 6, 1, 'submitted', 8, 28, 30, '2026-03-05 16:00:00', '2026-03-05 16:18:00', 'sess-q1-james-001', 0, NULL, '2026-03-03 09:00:00', '2026-03-05 16:18:00'),
(6, 2, 2, 1, 'submitted', 42, 28, 40, '2026-03-06 06:00:00', '2026-03-06 06:40:00', 'sess-q2-alex-001', 6, NULL, '2026-03-04 10:00:00', '2026-03-06 03:43:49'),
(7, 2, 3, 1, 'submitted', 10, 38, 40, '2026-03-06 05:30:00', '2026-03-06 06:10:00', 'sess-q2-sarah-001', 0, NULL, '2026-03-04 10:00:00', '2026-03-06 06:10:00'),
(8, 2, 4, 1, 'in_progress', NULL, NULL, NULL, '2026-03-06 07:00:00', NULL, 'sess-q2-david-001', 3, NULL, '2026-03-04 10:00:00', '2026-03-06 07:00:00'),
(9, 2, 5, 1, 'submitted', 15, 35, 40, '2026-03-06 04:00:00', '2026-03-06 04:38:00', 'sess-q2-maria-001', 1, NULL, '2026-03-04 10:00:00', '2026-03-06 04:38:00'),
(10, 2, 6, 1, 'assigned', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-03-04 10:00:00', '2026-03-04 10:00:00'),
(11, 4, 2, 1, 'submitted', 30, 0, 1, NULL, '2026-03-06 04:51:12', NULL, 11, NULL, '2026-03-06 04:48:11', '2026-03-06 04:51:47'),
(12, 4, 4, 1, 'assigned', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-03-06 04:48:11', '2026-03-06 04:48:11'),
(13, 4, 6, 1, 'submitted', NULL, 0, 21, NULL, '2026-03-06 05:42:11', NULL, 8, NULL, '2026-03-06 04:48:11', '2026-03-06 05:42:11'),
(14, 4, 5, 1, 'assigned', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-03-06 04:48:11', '2026-03-06 04:48:11'),
(15, 4, 3, 1, 'assigned', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-03-06 04:48:11', '2026-03-06 04:48:11'),
(16, 5, 2, 1, 'assigned', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-03-06 05:26:18', '2026-03-06 05:26:18'),
(17, 5, 4, 1, 'assigned', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-03-06 05:26:18', '2026-03-06 05:26:18'),
(18, 5, 6, 1, 'submitted', NULL, 5, 10, NULL, '2026-03-06 05:28:23', NULL, 1, NULL, '2026-03-06 05:26:18', '2026-03-06 05:28:23'),
(19, 5, 5, 1, 'assigned', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-03-06 05:26:18', '2026-03-06 05:26:18'),
(20, 5, 3, 1, 'assigned', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-03-06 05:26:18', '2026-03-06 05:26:18'),
(21, 6, 2, 1, 'assigned', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-03-06 05:54:08', '2026-03-06 05:54:08'),
(22, 6, 4, 1, 'assigned', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-03-06 05:54:08', '2026-03-06 05:54:08'),
(23, 6, 6, 1, 'assigned', NULL, NULL, NULL, NULL, NULL, NULL, 10, NULL, '2026-03-06 05:54:08', '2026-03-06 08:57:42'),
(24, 6, 5, 1, 'assigned', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-03-06 05:54:08', '2026-03-06 05:54:08'),
(25, 6, 3, 1, 'assigned', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, '2026-03-06 05:54:08', '2026-03-06 05:54:08');

-- --------------------------------------------------------

--
-- Table structure for table `quiz_questions`
--

CREATE TABLE `quiz_questions` (
  `id` int(11) NOT NULL,
  `quiz_id` int(11) NOT NULL,
  `question_text` text NOT NULL,
  `question_type` enum('essay','multiple_choice','identification') NOT NULL,
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`options`)),
  `correct_answer` varchar(500) DEFAULT NULL,
  `points` int(11) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `quiz_questions`
--

INSERT INTO `quiz_questions` (`id`, `quiz_id`, `question_text`, `question_type`, `options`, `correct_answer`, `points`, `sort_order`, `created_at`) VALUES
(1, 1, 'Explain the properties of a Binary Search Tree and describe how insertion and deletion operations work. Include time complexity analysis.', 'essay', NULL, NULL, 10, 0, '2026-03-01 10:05:00'),
(2, 1, 'Compare and contrast AVL trees with Red-Black trees. When would you prefer one over the other?', 'essay', NULL, NULL, 10, 1, '2026-03-01 10:06:00'),
(3, 1, 'Describe how hash tables handle collisions. Compare chaining vs open addressing with examples.', 'essay', NULL, NULL, 10, 2, '2026-03-01 10:07:00'),
(4, 2, 'What is the average-case time complexity of QuickSort?', 'multiple_choice', '[\"O(n)\", \"O(n log n)\", \"O(n^2)\", \"O(log n)\"]', 'O(n log n)', 5, 0, '2026-03-02 14:05:00'),
(5, 2, 'Which sorting algorithm is stable by default?', 'multiple_choice', '[\"QuickSort\", \"HeapSort\", \"MergeSort\", \"Selection Sort\"]', 'MergeSort', 5, 1, '2026-03-02 14:06:00'),
(6, 2, 'Explain the Master Theorem and provide three examples showing each case.', 'essay', NULL, NULL, 15, 2, '2026-03-02 14:07:00'),
(7, 2, 'Discuss the trade-offs between BFS and DFS. Provide real-world use cases for each.', 'essay', NULL, NULL, 15, 3, '2026-03-02 14:08:00'),
(8, 4, 'What is your name?', 'essay', NULL, NULL, 1, 0, '2026-03-06 04:47:59'),
(9, 4, 'Which scheduling algorithm is non-preemptive?', 'multiple_choice', '[\"Round Robin\",\"FCFS\",\"SRTF\",\"Priority (preemptive)\"]', 'FCFS', 5, 0, '2026-03-06 05:14:28'),
(10, 4, 'What is a race condition?', 'multiple_choice', '[\"A deadlock scenario\",\"When two processes access shared data concurrently with at least one write\",\"A starvation issue\",\"A memory leak\"]', 'When two processes access shared data concurrently with at least one write', 5, 1, '2026-03-06 05:14:28'),
(11, 4, 'Which page replacement algorithm suffers from Belady\'s anomaly?', 'multiple_choice', '[\"LRU\",\"FIFO\",\"Optimal\",\"LFU\"]', 'FIFO', 5, 2, '2026-03-06 05:14:28'),
(12, 4, 'What is thrashing?', 'multiple_choice', '[\"Excessive paging causing performance degradation\",\"A CPU scheduling bug\",\"A type of deadlock\",\"A memory corruption error\"]', 'Excessive paging causing performance degradation', 5, 3, '2026-03-06 05:14:28'),
(13, 5, 'What is this', 'multiple_choice', '[\"A\",\"B\",\"C\",\"D\"]', 'A', 5, 0, '2026-03-06 05:26:07'),
(14, 5, 'Who is this?', 'multiple_choice', '[\"A\",\"C\",\"D\",\"H\"]', 'C', 5, 1, '2026-03-06 05:26:07'),
(15, 6, 'What is this', 'essay', NULL, NULL, 5, 0, '2026-03-06 05:54:03');

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

--
-- Dumping data for table `quiz_responses`
--

INSERT INTO `quiz_responses` (`id`, `quiz_assignment_id`, `question_id`, `answer_text`, `selected_option`, `is_correct`, `score`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'The implementation of a binary search tree (BST) requires careful consideration of its core properties. A BST is a node-based binary tree data structure which has the following properties: The left subtree of a node contains only nodes with keys lesser than the node\'s key. The right subtree of a node contains only nodes with keys greater than the node\'s key. I started by defining the Node class with left and right children.', NULL, NULL, 6, '2026-03-05 19:15:00', '2026-03-05 19:15:00'),
(2, 1, 2, 'In computer science, a binary search tree, also called an ordered or sorted binary tree, is a rooted binary tree data structure with the key of each internal node being greater than all the keys in the respective node\'s left subtree and less than the ones in its right subtree. This ensures that search operations can be performed in logarithmic time complexity, provided the tree remains balanced.', NULL, NULL, 5, '2026-03-05 19:22:00', '2026-03-05 19:22:00'),
(3, 1, 3, 'Hash tables handle collisions by two main strategies: chaining and open addressing. Chaining stores multiple entries in a linked list at each slot. Open addressing probes for the next available slot using linear probing, quadratic probing, or double hashing.', NULL, NULL, 7, '2026-03-05 19:27:00', '2026-03-05 19:27:00'),
(4, 2, 1, 'A BST has the property where left children are smaller and right children are larger than the parent node. For insertion you traverse down comparing keys. Deletion has three cases: leaf node, one child, or two children where you find the in-order successor. All operations are O(h) where h is tree height, so O(log n) for balanced trees.', NULL, NULL, 9, '2026-03-05 18:40:00', '2026-03-05 18:40:00'),
(5, 2, 2, 'AVL trees are strictly balanced (balance factor max 1) so lookups are faster. Red-Black trees are less strict so insertions and deletions are faster because they need fewer rotations. I would use AVL for read-heavy workloads like databases indexes and Red-Black for insertion-heavy use cases like the Java TreeMap.', NULL, NULL, 9, '2026-03-05 18:48:00', '2026-03-05 18:48:00'),
(6, 2, 3, 'Chaining is simpler to implement and degrades gracefully with high load factors. Open addressing has better cache performance because everything is in a contiguous array. With chaining each bucket points to a linked list. With open addressing you probe for the next empty slot. Example: Python dicts use open addressing, Java HashMaps use chaining.', NULL, NULL, 9, '2026-03-05 18:54:00', '2026-03-05 18:54:00'),
(7, 3, 1, 'A binary search tree is a data structure that maintains sorted order. Each node has at most two children. The left subtree contains only nodes with keys less than the parent. The right subtree contains only nodes with keys greater than the parent. Insertion works by recursively comparing the new key with current nodes. Time complexity is O(log n) average case.', NULL, NULL, 7, '2026-03-05 20:10:00', '2026-03-05 20:10:00'),
(8, 3, 2, 'AVL trees maintain strict balance with rotation operations after every insert or delete. Red-Black trees use color properties to maintain approximate balance. AVL gives O(log n) guaranteed but Red-Black is more efficient for frequent modifications. I think AVL is better for search-heavy applications.', NULL, NULL, 7, '2026-03-05 20:18:00', '2026-03-05 20:18:00'),
(9, 3, 3, 'Collision handling in hash tables can be done via chaining where each slot has a linked list, or open addressing where you find another slot. Linear probing checks the next slot. Quadratic probing uses a quadratic function. Double hashing uses a second hash function.', NULL, NULL, 8, '2026-03-05 20:24:00', '2026-03-05 20:24:00'),
(10, 4, 1, 'BSTs work by storing data in a sorted manner. Left child is always less, right child is always more than the parent. To insert we compare and go left or right. To delete we handle leaf, single child, and two children cases. For two children we replace with in-order successor. Average is O(log n) but worst case O(n) for a skewed tree.', NULL, NULL, 8, '2026-03-05 17:10:00', '2026-03-05 17:10:00'),
(11, 4, 2, 'AVL trees strictly enforce balance so they never degrade. Red-Black trees allow some imbalance. AVL rotations are more frequent but searches are faster. For a read-heavy system Id pick AVL. For write-heavy Id pick Red-Black.', NULL, NULL, 8, '2026-03-05 17:16:00', '2026-03-05 17:16:00'),
(12, 4, 3, 'Chaining stores multiple items per slot using linked lists. Open addressing stores everything in the table and resolves collisions by probing. Chaining is easier to implement but uses more memory. Open addressing has better cache locality. Load factor affects performance of both.', NULL, NULL, 9, '2026-03-05 17:21:00', '2026-03-05 17:21:00'),
(13, 5, 1, 'Binary search trees keep data organized so that searching is efficient. Every nodes left children have smaller keys and right children have larger keys. Inserting means walking down the tree and placing the new node at the right leaf position. Deleting is trickier especially when a node has two children. You find the minimum node in the right subtree and swap values. Time is O(h).', NULL, NULL, 10, '2026-03-05 16:08:00', '2026-03-05 16:08:00'),
(14, 5, 2, 'AVL trees are height-balanced BSTs that use rotations (LL, RR, LR, RL) to stay balanced after insertions or deletions. Red-Black trees relax the balancing constraint using color rules. AVL gives slightly faster lookups but more rotations. Red-Black has faster insertions. Linux kernel uses Red-Black trees extensively.', NULL, NULL, 9, '2026-03-05 16:13:00', '2026-03-05 16:13:00'),
(15, 5, 3, 'When two keys hash to the same bucket, thats a collision. Chaining puts overflow entries into a linked list hanging off the bucket. Open addressing searches for another empty spot in the table itself. Chaining is simpler, open addressing avoids pointer overhead. Robin Hood hashing is a cool variant that moves entries to reduce probe lengths.', NULL, NULL, 9, '2026-03-05 16:17:00', '2026-03-05 16:17:00'),
(16, 6, 4, NULL, 'O(n log n)', 1, 5, '2026-03-06 06:05:00', '2026-03-06 06:05:00'),
(17, 6, 5, NULL, 'MergeSort', 1, 5, '2026-03-06 06:08:00', '2026-03-06 06:08:00'),
(18, 6, 6, 'The Master Theorem solves recurrences of the form T(n) = aT(n/b) + f(n). Case 1: if f(n) is polynomially smaller than n^(log_b a), T(n) = Theta(n^(log_b a)). Case 2: if they are equal, T(n) = Theta(n^(log_b a) * log n). Case 3: if f(n) is polynomially larger, T(n) = Theta(f(n)). Example 1: T(n)=2T(n/2)+1 => O(n). Example 2: T(n)=2T(n/2)+n => O(n log n). Example 3: T(n)=2T(n/2)+n^2 => O(n^2).', NULL, NULL, 10, '2026-03-06 06:25:00', '2026-03-06 06:25:00'),
(19, 6, 7, 'BFS explores layer by layer using a queue. DFS goes as deep as possible using a stack or recursion. BFS finds shortest paths in unweighted graphs. DFS uses less memory and is good for topological sorting. BFS is used in social network connections. DFS is used in maze solving and cycle detection.', NULL, NULL, 8, '2026-03-06 06:38:00', '2026-03-06 06:38:00'),
(20, 7, 4, NULL, 'O(n log n)', 1, 5, '2026-03-06 05:35:00', '2026-03-06 05:35:00'),
(21, 7, 5, NULL, 'MergeSort', 1, 5, '2026-03-06 05:38:00', '2026-03-06 05:38:00'),
(22, 7, 6, 'The Master Theorem helps us solve divide and conquer recurrences T(n) = aT(n/b) + f(n). There are three cases based on comparing f(n) with n^(log_b a). In case 1 the recursive work dominates. In case 2 they contribute equally so we get a log factor. In case 3 the non-recursive work dominates. For T(n)=8T(n/2)+n^2 we get case 1 giving O(n^3). For T(n)=2T(n/2)+n we get case 2 giving O(n log n). For T(n)=3T(n/4)+n*log(n) we get case 3 giving O(n*log(n)).', NULL, NULL, 14, '2026-03-06 05:55:00', '2026-03-06 05:55:00'),
(23, 7, 7, 'BFS uses a queue to visit nodes level by level. Its great for finding the shortest path in an unweighted graph. DFS uses a stack (or recursion) to go deep before backtracking. DFS is memory efficient for deep graphs but doesnt guarantee shortest path. Real world BFS: Google Maps shortest route on unweighted grids. Real world DFS: web crawlers exploring links deeply, compiler dependency resolution.', NULL, NULL, 14, '2026-03-06 06:08:00', '2026-03-06 06:08:00'),
(24, 9, 4, NULL, 'O(n log n)', 1, 5, '2026-03-06 04:05:00', '2026-03-06 04:05:00'),
(25, 9, 5, NULL, 'HeapSort', 0, 0, '2026-03-06 04:08:00', '2026-03-06 04:08:00'),
(26, 9, 6, 'Master Theorem: T(n) = aT(n/b) + f(n). Compare f(n) with n^(log_b a). Case 1 recursive calls dominate, case 2 equal work, case 3 combine step dominates. T(n)=4T(n/2)+n gives O(n^2). T(n)=2T(n/2)+n gives O(n log n). T(n)=T(n/2)+n^2 gives O(n^2).', NULL, NULL, 12, '2026-03-06 04:28:00', '2026-03-06 04:28:00'),
(27, 9, 7, 'BFS visits neighbors first using a queue. DFS dives deep using a stack. BFS is good for shortest paths and peer-to-peer networks. DFS is good for topological sorting and solving puzzles. BFS uses more memory because it stores all neighbors. DFS can get stuck in infinite branches without depth limits.', NULL, NULL, 13, '2026-03-06 04:37:00', '2026-03-06 04:37:00'),
(28, 11, 8, 'secret', NULL, NULL, NULL, '2026-03-06 04:51:12', '2026-03-06 04:51:12'),
(29, 18, 13, '', 'D', 0, 0, '2026-03-06 05:28:23', '2026-03-06 05:28:23'),
(30, 18, 14, '', 'C', 1, 5, '2026-03-06 05:28:23', '2026-03-06 05:28:23'),
(31, 13, 8, '', NULL, NULL, NULL, '2026-03-06 05:42:11', '2026-03-06 05:42:11'),
(33, 13, 9, '', NULL, 0, 0, '2026-03-06 05:42:11', '2026-03-06 05:42:11'),
(34, 13, 10, '', NULL, 0, 0, '2026-03-06 05:42:11', '2026-03-06 05:42:11'),
(35, 13, 11, '', NULL, 0, 0, '2026-03-06 05:42:11', '2026-03-06 05:42:11'),
(36, 13, 12, '', NULL, 0, 0, '2026-03-06 05:42:11', '2026-03-06 05:42:11');

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

--
-- Dumping data for table `session_replays`
--

INSERT INTO `session_replays` (`id`, `quiz_assignment_id`, `session_id`, `question_id`, `replay_events`, `text_snapshots`, `duration_ms`, `total_events`, `created_at`) VALUES
(1, 1, 'sess-q1-alex-001', 1, '[]', '[{\"t\":0,\"text\":\"\"},{\"t\":5000,\"text\":\"The impl\"},{\"t\":15000,\"text\":\"The implementation of a binary search tree\"},{\"t\":20000,\"text\":\"The implementation of a binary search tree (BST) requires careful consideration of its core properties. A BST is a node-based binary tree data structure which has the following properties: The left subtree of a node contains only nodes with keys lesser than the node\'s key. The right subtree of a node contains only nodes with keys greater than the node\'s key.\"},{\"t\":60000,\"text\":\"The implementation of a binary search tree (BST) requires careful consideration of its core properties. A BST is a node-based binary tree data structure which has the following properties: The left subtree of a node contains only nodes with keys lesser than the node\'s key. The right subtree of a node contains only nodes with keys greater than the node\'s key. I started by defining the Node class with left and right children.\"}]', 900000, 180, '2026-03-05 19:28:00'),
(2, 2, 'sess-q1-sarah-001', 1, '[]', '[{\"t\":0,\"text\":\"\"},{\"t\":3000,\"text\":\"A BST\"},{\"t\":30000,\"text\":\"A BST has the property where left children are smaller and right children are larger\"},{\"t\":120000,\"text\":\"A BST has the property where left children are smaller and right children are larger than the parent node. For insertion you traverse down comparing keys.\"}]', 600000, 520, '2026-03-05 18:55:00'),
(3, 3, 'sess-q1-david-001', 1, '[]', '[{\"t\":0,\"text\":\"\"},{\"t\":5000,\"text\":\"A binary\"},{\"t\":20000,\"text\":\"A binary search tree is a data structure\"},{\"t\":80000,\"text\":\"A binary search tree is a data structure that maintains sorted order. Each node has at most two children.\"}]', 750000, 380, '2026-03-05 20:25:00'),
(4, 11, 'session_1772743706266_v2k6kcvaw5t', NULL, '[{\"timestamp\":3368,\"type\":\"keystroke\",\"data\":{\"question_id\":8,\"text_length\":1}},{\"timestamp\":3522,\"type\":\"keystroke\",\"data\":{\"question_id\":8,\"text_length\":2}},{\"timestamp\":3631,\"type\":\"keystroke\",\"data\":{\"question_id\":8,\"text_length\":3}},{\"timestamp\":3752,\"type\":\"keystroke\",\"data\":{\"question_id\":8,\"text_length\":4}},{\"timestamp\":3954,\"type\":\"keystroke\",\"data\":{\"question_id\":8,\"text_length\":5}},{\"timestamp\":4107,\"type\":\"keystroke\",\"data\":{\"question_id\":8,\"text_length\":6}},{\"timestamp\":4187,\"type\":\"keystroke\",\"data\":{\"question_id\":8,\"text_length\":7}},{\"timestamp\":4501,\"type\":\"keystroke\",\"data\":{\"question_id\":8,\"text_length\":8}},{\"timestamp\":4875,\"type\":\"keystroke\",\"data\":{\"question_id\":8,\"text_length\":7}},{\"timestamp\":5381,\"type\":\"keystroke\",\"data\":{\"question_id\":8,\"text_length\":6}},{\"timestamp\":5423,\"type\":\"keystroke\",\"data\":{\"question_id\":8,\"text_length\":5}},{\"timestamp\":5462,\"type\":\"keystroke\",\"data\":{\"question_id\":8,\"text_length\":4}},{\"timestamp\":5502,\"type\":\"keystroke\",\"data\":{\"question_id\":8,\"text_length\":3}},{\"timestamp\":5543,\"type\":\"keystroke\",\"data\":{\"question_id\":8,\"text_length\":2}},{\"timestamp\":5584,\"type\":\"keystroke\",\"data\":{\"question_id\":8,\"text_length\":1}},{\"timestamp\":5625,\"type\":\"keystroke\",\"data\":{\"question_id\":8,\"text_length\":0}},{\"timestamp\":6315,\"type\":\"keystroke\",\"data\":{\"question_id\":8,\"text_length\":1}},{\"timestamp\":6516,\"type\":\"keystroke\",\"data\":{\"question_id\":8,\"text_length\":2}},{\"timestamp\":6730,\"type\":\"keystroke\",\"data\":{\"question_id\":8,\"text_length\":3}},{\"timestamp\":6962,\"type\":\"keystroke\",\"data\":{\"question_id\":8,\"text_length\":4}},{\"timestamp\":7114,\"type\":\"keystroke\",\"data\":{\"question_id\":8,\"text_length\":5}},{\"timestamp\":7236,\"type\":\"keystroke\",\"data\":{\"question_id\":8,\"text_length\":6}},{\"timestamp\":13928,\"type\":\"window_change\",\"data\":{\"event_type\":\"blur\"}},{\"timestamp\":24058,\"type\":\"window_change\",\"data\":{\"event_type\":\"focus\",\"away_duration_ms\":10130}},{\"timestamp\":25971,\"type\":\"window_change\",\"data\":{\"event_type\":\"blur\"}},{\"timestamp\":26562,\"type\":\"window_change\",\"data\":{\"event_type\":\"focus\",\"away_duration_ms\":591}},{\"timestamp\":27175,\"type\":\"window_change\",\"data\":{\"event_type\":\"blur\"}},{\"timestamp\":27614,\"type\":\"window_change\",\"data\":{\"event_type\":\"focus\",\"away_duration_ms\":439}},{\"timestamp\":27855,\"type\":\"window_change\",\"data\":{\"event_type\":\"blur\"}},{\"timestamp\":28287,\"type\":\"window_change\",\"data\":{\"event_type\":\"focus\",\"away_duration_ms\":432}},{\"timestamp\":30540,\"type\":\"window_change\",\"data\":{\"event_type\":\"blur\"}},{\"timestamp\":37043,\"type\":\"window_change\",\"data\":{\"event_type\":\"focus\",\"away_duration_ms\":6503}},{\"timestamp\":38958,\"type\":\"window_change\",\"data\":{\"event_type\":\"blur\"}},{\"timestamp\":53481,\"type\":\"window_change\",\"data\":{\"event_type\":\"focus\",\"away_duration_ms\":14523}},{\"timestamp\":53977,\"type\":\"window_change\",\"data\":{\"event_type\":\"blur\"}},{\"timestamp\":72345,\"type\":\"window_change\",\"data\":{\"event_type\":\"focus\",\"away_duration_ms\":18368}},{\"timestamp\":74223,\"type\":\"window_change\",\"data\":{\"event_type\":\"blur\"}},{\"timestamp\":158426,\"type\":\"window_change\",\"data\":{\"event_type\":\"focus\",\"away_duration_ms\":84203}},{\"timestamp\":160560,\"type\":\"window_change\",\"data\":{\"event_type\":\"blur\"}},{\"timestamp\":161132,\"type\":\"window_change\",\"data\":{\"event_type\":\"focus\",\"away_duration_ms\":572}},{\"timestamp\":161559,\"type\":\"window_change\",\"data\":{\"event_type\":\"blur\"}},{\"timestamp\":162011,\"type\":\"window_change\",\"data\":{\"event_type\":\"focus\",\"away_duration_ms\":452}},{\"timestamp\":162181,\"type\":\"window_change\",\"data\":{\"event_type\":\"blur\"}},{\"timestamp\":162598,\"type\":\"window_change\",\"data\":{\"event_type\":\"focus\",\"away_duration_ms\":417}}]', '[{\"timestamp\":17242,\"text\":\"secret\"},{\"timestamp\":27262,\"text\":\"secret\"},{\"timestamp\":37244,\"text\":\"secret\"},{\"timestamp\":47246,\"text\":\"secret\"},{\"timestamp\":57259,\"text\":\"secret\"},{\"timestamp\":67287,\"text\":\"secret\"},{\"timestamp\":77262,\"text\":\"secret\"},{\"timestamp\":87260,\"text\":\"secret\"},{\"timestamp\":97246,\"text\":\"secret\"},{\"timestamp\":107247,\"text\":\"secret\"},{\"timestamp\":117255,\"text\":\"secret\"},{\"timestamp\":127381,\"text\":\"secret\"},{\"timestamp\":158417,\"text\":\"secret\"}]', 166170, 44, '2026-03-06 04:51:12'),
(5, 18, 'session_1772745991034_vwdz4fjcxhl', NULL, '[{\"timestamp\":4554,\"type\":\"window_change\",\"data\":{\"event_type\":\"blur\"}},{\"timestamp\":98724,\"type\":\"window_change\",\"data\":{\"event_type\":\"focus\",\"away_duration_ms\":94170}}]', '[{\"timestamp\":10475,\"text\":\"\"},{\"timestamp\":20472,\"text\":\"\"},{\"timestamp\":30474,\"text\":\"\"},{\"timestamp\":40484,\"text\":\"\"},{\"timestamp\":50481,\"text\":\"\"},{\"timestamp\":60483,\"text\":\"\"},{\"timestamp\":98684,\"text\":\"\"},{\"timestamp\":100225,\"text\":\"\"}]', 112585, 2, '2026-03-06 05:28:23'),
(6, 13, 'session_1772746750862_sp00ow0k73', NULL, '[{\"timestamp\":5229,\"type\":\"window_change\",\"data\":{\"event_type\":\"blur\"}}]', '[{\"timestamp\":10209,\"text\":\"\"},{\"timestamp\":20202,\"text\":\"\"},{\"timestamp\":30205,\"text\":\"\"},{\"timestamp\":40209,\"text\":\"\"},{\"timestamp\":50203,\"text\":\"\"},{\"timestamp\":60210,\"text\":\"\"},{\"timestamp\":70204,\"text\":\"\"},{\"timestamp\":80207,\"text\":\"\"},{\"timestamp\":90214,\"text\":\"\"},{\"timestamp\":100204,\"text\":\"\"},{\"timestamp\":110209,\"text\":\"\"},{\"timestamp\":120202,\"text\":\"\"},{\"timestamp\":130208,\"text\":\"\"},{\"timestamp\":140210,\"text\":\"\"},{\"timestamp\":150205,\"text\":\"\"},{\"timestamp\":160207,\"text\":\"\"},{\"timestamp\":170202,\"text\":\"\"},{\"timestamp\":180210,\"text\":\"\"}]', 180246, 1, '2026-03-06 05:42:11'),
(7, 13, 'session_1772746750862_sp00ow0k73', NULL, '[{\"timestamp\":5229,\"type\":\"window_change\",\"data\":{\"event_type\":\"blur\"}}]', '[{\"timestamp\":10209,\"text\":\"\"},{\"timestamp\":20202,\"text\":\"\"},{\"timestamp\":30205,\"text\":\"\"},{\"timestamp\":40209,\"text\":\"\"},{\"timestamp\":50203,\"text\":\"\"},{\"timestamp\":60210,\"text\":\"\"},{\"timestamp\":70204,\"text\":\"\"},{\"timestamp\":80207,\"text\":\"\"},{\"timestamp\":90214,\"text\":\"\"},{\"timestamp\":100204,\"text\":\"\"},{\"timestamp\":110209,\"text\":\"\"},{\"timestamp\":120202,\"text\":\"\"},{\"timestamp\":130208,\"text\":\"\"},{\"timestamp\":140210,\"text\":\"\"},{\"timestamp\":150205,\"text\":\"\"},{\"timestamp\":160207,\"text\":\"\"},{\"timestamp\":170202,\"text\":\"\"},{\"timestamp\":180210,\"text\":\"\"}]', 180245, 1, '2026-03-06 05:42:11');

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
-- Dumping data for table `window_change_logs`
--

INSERT INTO `window_change_logs` (`id`, `quiz_assignment_id`, `session_id`, `event_type`, `timestamp`, `away_duration_ms`, `page_url`, `created_at`) VALUES
(1, 1, 'sess-q1-alex-001', 'blur', '2026-03-05 19:02:00', NULL, '/quiz/1', '2026-03-05 19:02:00'),
(2, 1, 'sess-q1-alex-001', 'focus', '2026-03-05 19:02:15', 15000, '/quiz/1', '2026-03-05 19:02:15'),
(3, 1, 'sess-q1-alex-001', 'blur', '2026-03-05 19:04:30', NULL, '/quiz/1', '2026-03-05 19:04:30'),
(4, 1, 'sess-q1-alex-001', 'focus', '2026-03-05 19:05:00', 30000, '/quiz/1', '2026-03-05 19:05:00'),
(5, 1, 'sess-q1-alex-001', 'blur', '2026-03-05 19:05:45', NULL, '/quiz/1', '2026-03-05 19:05:45'),
(6, 1, 'sess-q1-alex-001', 'focus', '2026-03-05 19:06:10', 25000, '/quiz/1', '2026-03-05 19:06:10'),
(7, 1, 'sess-q1-alex-001', 'blur', '2026-03-05 19:07:00', NULL, '/quiz/1', '2026-03-05 19:07:00'),
(8, 1, 'sess-q1-alex-001', 'focus', '2026-03-05 19:07:45', 45000, '/quiz/1', '2026-03-05 19:07:45'),
(9, 1, 'sess-q1-alex-001', 'blur', '2026-03-05 19:09:20', NULL, '/quiz/1', '2026-03-05 19:09:20'),
(10, 1, 'sess-q1-alex-001', 'focus', '2026-03-05 19:10:00', 40000, '/quiz/1', '2026-03-05 19:10:00'),
(11, 1, 'sess-q1-alex-001', 'blur', '2026-03-05 19:12:10', NULL, '/quiz/1', '2026-03-05 19:12:10'),
(12, 1, 'sess-q1-alex-001', 'focus', '2026-03-05 19:12:30', 20000, '/quiz/1', '2026-03-05 19:12:30'),
(13, 1, 'sess-q1-alex-001', 'blur', '2026-03-05 19:14:00', NULL, '/quiz/1', '2026-03-05 19:14:00'),
(14, 1, 'sess-q1-alex-001', 'focus', '2026-03-05 19:14:35', 35000, '/quiz/1', '2026-03-05 19:14:35'),
(15, 1, 'sess-q1-alex-001', 'blur', '2026-03-05 19:16:00', NULL, '/quiz/1', '2026-03-05 19:16:00'),
(16, 1, 'sess-q1-alex-001', 'focus', '2026-03-05 19:16:10', 10000, '/quiz/1', '2026-03-05 19:16:10'),
(17, 1, 'sess-q1-alex-001', 'blur', '2026-03-05 19:18:30', NULL, '/quiz/1', '2026-03-05 19:18:30'),
(18, 1, 'sess-q1-alex-001', 'focus', '2026-03-05 19:19:00', 30000, '/quiz/1', '2026-03-05 19:19:00'),
(19, 1, 'sess-q1-alex-001', 'blur', '2026-03-05 19:20:45', NULL, '/quiz/1', '2026-03-05 19:20:45'),
(20, 1, 'sess-q1-alex-001', 'focus', '2026-03-05 19:21:10', 25000, '/quiz/1', '2026-03-05 19:21:10'),
(21, 1, 'sess-q1-alex-001', 'blur', '2026-03-05 19:22:30', NULL, '/quiz/1', '2026-03-05 19:22:30'),
(22, 1, 'sess-q1-alex-001', 'focus', '2026-03-05 19:23:00', 30000, '/quiz/1', '2026-03-05 19:23:00'),
(23, 1, 'sess-q1-alex-001', 'blur', '2026-03-05 19:24:15', NULL, '/quiz/1', '2026-03-05 19:24:15'),
(24, 1, 'sess-q1-alex-001', 'focus', '2026-03-05 19:24:40', 25000, '/quiz/1', '2026-03-05 19:24:40'),
(25, 1, 'sess-q1-alex-001', 'blur', '2026-03-05 19:25:50', NULL, '/quiz/1', '2026-03-05 19:25:50'),
(26, 1, 'sess-q1-alex-001', 'focus', '2026-03-05 19:26:20', 30000, '/quiz/1', '2026-03-05 19:26:20'),
(27, 1, 'sess-q1-alex-001', 'blur', '2026-03-05 19:27:00', NULL, '/quiz/1', '2026-03-05 19:27:00'),
(28, 1, 'sess-q1-alex-001', 'focus', '2026-03-05 19:27:15', 15000, '/quiz/1', '2026-03-05 19:27:15'),
(29, 2, 'sess-q1-sarah-001', 'blur', '2026-03-05 18:42:00', NULL, '/quiz/1', '2026-03-05 18:42:00'),
(30, 2, 'sess-q1-sarah-001', 'focus', '2026-03-05 18:42:03', 3000, '/quiz/1', '2026-03-05 18:42:03'),
(31, 3, 'sess-q1-david-001', 'blur', '2026-03-05 20:03:00', NULL, '/quiz/1', '2026-03-05 20:03:00'),
(32, 3, 'sess-q1-david-001', 'focus', '2026-03-05 20:03:20', 20000, '/quiz/1', '2026-03-05 20:03:20'),
(33, 3, 'sess-q1-david-001', 'blur', '2026-03-05 20:06:00', NULL, '/quiz/1', '2026-03-05 20:06:00'),
(34, 3, 'sess-q1-david-001', 'focus', '2026-03-05 20:06:30', 30000, '/quiz/1', '2026-03-05 20:06:30'),
(35, 3, 'sess-q1-david-001', 'blur', '2026-03-05 20:09:00', NULL, '/quiz/1', '2026-03-05 20:09:00'),
(36, 3, 'sess-q1-david-001', 'focus', '2026-03-05 20:09:25', 25000, '/quiz/1', '2026-03-05 20:09:25'),
(37, 3, 'sess-q1-david-001', 'blur', '2026-03-05 20:12:00', NULL, '/quiz/1', '2026-03-05 20:12:00'),
(38, 3, 'sess-q1-david-001', 'focus', '2026-03-05 20:12:15', 15000, '/quiz/1', '2026-03-05 20:12:15'),
(39, 3, 'sess-q1-david-001', 'blur', '2026-03-05 20:14:30', NULL, '/quiz/1', '2026-03-05 20:14:30'),
(40, 3, 'sess-q1-david-001', 'focus', '2026-03-05 20:15:00', 30000, '/quiz/1', '2026-03-05 20:15:00'),
(41, 3, 'sess-q1-david-001', 'blur', '2026-03-05 20:17:00', NULL, '/quiz/1', '2026-03-05 20:17:00'),
(42, 3, 'sess-q1-david-001', 'focus', '2026-03-05 20:17:20', 20000, '/quiz/1', '2026-03-05 20:17:20'),
(43, 3, 'sess-q1-david-001', 'blur', '2026-03-05 20:19:45', NULL, '/quiz/1', '2026-03-05 20:19:45'),
(44, 3, 'sess-q1-david-001', 'focus', '2026-03-05 20:20:10', 25000, '/quiz/1', '2026-03-05 20:20:10'),
(45, 3, 'sess-q1-david-001', 'blur', '2026-03-05 20:22:30', NULL, '/quiz/1', '2026-03-05 20:22:30'),
(46, 3, 'sess-q1-david-001', 'focus', '2026-03-05 20:22:50', 20000, '/quiz/1', '2026-03-05 20:22:50'),
(47, 4, 'sess-q1-maria-001', 'blur', '2026-03-05 17:05:00', NULL, '/quiz/1', '2026-03-05 17:05:00'),
(48, 4, 'sess-q1-maria-001', 'focus', '2026-03-05 17:05:04', 4000, '/quiz/1', '2026-03-05 17:05:04'),
(49, 4, 'sess-q1-maria-001', 'blur', '2026-03-05 17:15:00', NULL, '/quiz/1', '2026-03-05 17:15:00'),
(50, 4, 'sess-q1-maria-001', 'focus', '2026-03-05 17:15:02', 2000, '/quiz/1', '2026-03-05 17:15:02'),
(51, 6, 'sess-q2-alex-001', 'blur', '2026-03-06 06:05:00', NULL, '/quiz/2', '2026-03-06 06:05:00'),
(52, 6, 'sess-q2-alex-001', 'focus', '2026-03-06 06:05:20', 20000, '/quiz/2', '2026-03-06 06:05:20'),
(53, 6, 'sess-q2-alex-001', 'blur', '2026-03-06 06:10:00', NULL, '/quiz/2', '2026-03-06 06:10:00'),
(54, 6, 'sess-q2-alex-001', 'focus', '2026-03-06 06:10:30', 30000, '/quiz/2', '2026-03-06 06:10:30'),
(55, 6, 'sess-q2-alex-001', 'blur', '2026-03-06 06:18:00', NULL, '/quiz/2', '2026-03-06 06:18:00'),
(56, 6, 'sess-q2-alex-001', 'focus', '2026-03-06 06:18:25', 25000, '/quiz/2', '2026-03-06 06:18:25'),
(57, 6, 'sess-q2-alex-001', 'blur', '2026-03-06 06:22:00', NULL, '/quiz/2', '2026-03-06 06:22:00'),
(58, 6, 'sess-q2-alex-001', 'focus', '2026-03-06 06:22:15', 15000, '/quiz/2', '2026-03-06 06:22:15'),
(59, 6, 'sess-q2-alex-001', 'blur', '2026-03-06 06:30:00', NULL, '/quiz/2', '2026-03-06 06:30:00'),
(60, 6, 'sess-q2-alex-001', 'focus', '2026-03-06 06:30:20', 20000, '/quiz/2', '2026-03-06 06:30:20'),
(61, 6, 'sess-q2-alex-001', 'blur', '2026-03-06 06:35:00', NULL, '/quiz/2', '2026-03-06 06:35:00'),
(62, 6, 'sess-q2-alex-001', 'focus', '2026-03-06 06:35:10', 10000, '/quiz/2', '2026-03-06 06:35:10'),
(63, 11, 'session_1772743706266_v2k6kcvaw5t', 'blur', '2026-03-06 04:48:40', NULL, NULL, '2026-03-06 04:48:40'),
(64, 11, 'session_1772743706266_v2k6kcvaw5t', 'focus', '2026-03-06 04:48:50', 10130, NULL, '2026-03-06 04:48:50'),
(65, 11, 'session_1772743706266_v2k6kcvaw5t', 'blur', '2026-03-06 04:48:52', NULL, NULL, '2026-03-06 04:48:52'),
(66, 11, 'session_1772743706266_v2k6kcvaw5t', 'focus', '2026-03-06 04:48:52', 591, NULL, '2026-03-06 04:48:52'),
(67, 11, 'session_1772743706266_v2k6kcvaw5t', 'blur', '2026-03-06 04:48:53', NULL, NULL, '2026-03-06 04:48:53'),
(68, 11, 'session_1772743706266_v2k6kcvaw5t', 'focus', '2026-03-06 04:48:53', 439, NULL, '2026-03-06 04:48:53'),
(69, 11, 'session_1772743706266_v2k6kcvaw5t', 'blur', '2026-03-06 04:48:54', NULL, NULL, '2026-03-06 04:48:54'),
(70, 11, 'session_1772743706266_v2k6kcvaw5t', 'focus', '2026-03-06 04:48:54', 432, NULL, '2026-03-06 04:48:54'),
(71, 11, 'session_1772743706266_v2k6kcvaw5t', 'blur', '2026-03-06 04:48:56', NULL, NULL, '2026-03-06 04:48:56'),
(72, 11, 'session_1772743706266_v2k6kcvaw5t', 'focus', '2026-03-06 04:49:03', 6503, NULL, '2026-03-06 04:49:03'),
(73, 11, 'session_1772743706266_v2k6kcvaw5t', 'blur', '2026-03-06 04:49:05', NULL, NULL, '2026-03-06 04:49:05'),
(74, 11, 'session_1772743706266_v2k6kcvaw5t', 'focus', '2026-03-06 04:49:19', 14523, NULL, '2026-03-06 04:49:19'),
(75, 11, 'session_1772743706266_v2k6kcvaw5t', 'blur', '2026-03-06 04:49:20', NULL, NULL, '2026-03-06 04:49:20'),
(76, 11, 'session_1772743706266_v2k6kcvaw5t', 'focus', '2026-03-06 04:49:38', 18368, NULL, '2026-03-06 04:49:38'),
(77, 11, 'session_1772743706266_v2k6kcvaw5t', 'blur', '2026-03-06 04:49:40', NULL, NULL, '2026-03-06 04:49:40'),
(78, 11, 'session_1772743706266_v2k6kcvaw5t', 'focus', '2026-03-06 04:51:04', 84203, NULL, '2026-03-06 04:51:04'),
(79, 11, 'session_1772743706266_v2k6kcvaw5t', 'blur', '2026-03-06 04:51:06', NULL, NULL, '2026-03-06 04:51:06'),
(80, 11, 'session_1772743706266_v2k6kcvaw5t', 'focus', '2026-03-06 04:51:07', 572, NULL, '2026-03-06 04:51:07'),
(81, 11, 'session_1772743706266_v2k6kcvaw5t', 'blur', '2026-03-06 04:51:07', NULL, NULL, '2026-03-06 04:51:07'),
(82, 11, 'session_1772743706266_v2k6kcvaw5t', 'focus', '2026-03-06 04:51:08', 452, NULL, '2026-03-06 04:51:08'),
(83, 11, 'session_1772743706266_v2k6kcvaw5t', 'blur', '2026-03-06 04:51:08', NULL, NULL, '2026-03-06 04:51:08'),
(84, 11, 'session_1772743706266_v2k6kcvaw5t', 'focus', '2026-03-06 04:51:08', 417, NULL, '2026-03-06 04:51:08'),
(85, 18, 'session_1772745991034_vwdz4fjcxhl', 'blur', '2026-03-06 05:26:35', NULL, NULL, '2026-03-06 05:26:35'),
(86, 18, 'session_1772745991034_vwdz4fjcxhl', 'focus', '2026-03-06 05:28:09', 94170, NULL, '2026-03-06 05:28:09'),
(87, 13, 'session_1772746726227_1roczakjpjv', 'blur', '2026-03-06 05:39:02', NULL, NULL, '2026-03-06 05:39:02'),
(88, 13, 'session_1772746726227_1roczakjpjv', 'focus', '2026-03-06 05:39:03', 620, NULL, '2026-03-06 05:39:03'),
(89, 13, 'session_1772746726227_1roczakjpjv', 'blur', '2026-03-06 05:39:03', NULL, NULL, '2026-03-06 05:39:03'),
(90, 13, 'session_1772746726227_1roczakjpjv', 'focus', '2026-03-06 05:39:03', 437, NULL, '2026-03-06 05:39:03'),
(91, 13, 'session_1772746726227_1roczakjpjv', 'blur', '2026-03-06 05:39:03', NULL, NULL, '2026-03-06 05:39:03'),
(92, 13, 'session_1772746726227_1roczakjpjv', 'focus', '2026-03-06 05:39:04', 400, NULL, '2026-03-06 05:39:04'),
(93, 13, 'session_1772746726227_1roczakjpjv', 'blur', '2026-03-06 05:39:04', NULL, NULL, '2026-03-06 05:39:04'),
(94, 13, 'session_1772746726227_1roczakjpjv', 'focus', '2026-03-06 05:39:04', 405, NULL, '2026-03-06 05:39:04'),
(95, 13, 'session_1772746726227_1roczakjpjv', 'blur', '2026-03-06 05:39:05', NULL, NULL, '2026-03-06 05:39:05'),
(96, 13, 'session_1772746726227_1roczakjpjv', 'focus', '2026-03-06 05:39:05', 421, NULL, '2026-03-06 05:39:05'),
(97, 13, 'session_1772746726227_1roczakjpjv', 'blur', '2026-03-06 05:39:05', NULL, NULL, '2026-03-06 05:39:05'),
(98, 13, 'session_1772746726227_1roczakjpjv', 'focus', '2026-03-06 05:39:06', 430, NULL, '2026-03-06 05:39:06'),
(99, 13, 'session_1772746726227_1roczakjpjv', 'blur', '2026-03-06 05:39:06', NULL, NULL, '2026-03-06 05:39:06'),
(100, 13, 'session_1772746726227_1roczakjpjv', 'focus', '2026-03-06 05:39:07', 772, NULL, '2026-03-06 05:39:07'),
(101, 13, 'session_1772746750862_sp00ow0k73', 'blur', '2026-03-06 05:39:16', NULL, NULL, '2026-03-06 05:39:16'),
(102, 23, 'session_1772747660544_tvln9s19sg', 'blur', '2026-03-06 05:54:39', NULL, NULL, '2026-03-06 05:54:39'),
(103, 23, 'session_1772747660544_tvln9s19sg', 'focus', '2026-03-06 05:54:44', 5229, NULL, '2026-03-06 05:54:44'),
(104, 23, 'session_1772747660544_tvln9s19sg', 'blur', '2026-03-06 05:55:03', NULL, NULL, '2026-03-06 05:55:03'),
(105, 23, 'session_1772747660544_tvln9s19sg', 'focus', '2026-03-06 05:55:10', 7233, NULL, '2026-03-06 05:55:10'),
(106, 23, 'session_1772747660544_tvln9s19sg', 'blur', '2026-03-06 05:55:13', NULL, NULL, '2026-03-06 05:55:13'),
(107, 23, 'session_1772747660544_tvln9s19sg', 'focus', '2026-03-06 06:00:52', 338577, NULL, '2026-03-06 06:00:52'),
(108, 23, 'session_1772748059946_mtb76ek7fzm', 'blur', '2026-03-06 06:01:02', NULL, NULL, '2026-03-06 06:01:02'),
(109, 23, 'session_1772748059946_mtb76ek7fzm', 'focus', '2026-03-06 06:01:06', 4077, NULL, '2026-03-06 06:01:06'),
(110, 23, 'session_1772748059946_mtb76ek7fzm', 'blur', '2026-03-06 06:01:19', NULL, NULL, '2026-03-06 06:01:19'),
(111, 23, 'session_1772748059946_mtb76ek7fzm', 'focus', '2026-03-06 06:01:27', 8381, NULL, '2026-03-06 06:01:27'),
(112, 23, 'session_1772748059946_mtb76ek7fzm', 'blur', '2026-03-06 06:01:31', NULL, NULL, '2026-03-06 06:01:31'),
(113, 23, 'session_1772748059946_mtb76ek7fzm', 'focus', '2026-03-06 06:01:34', 3382, NULL, '2026-03-06 06:01:34'),
(114, 23, 'session_1772748059946_mtb76ek7fzm', 'blur', '2026-03-06 06:01:41', NULL, NULL, '2026-03-06 06:01:41'),
(115, 23, 'session_1772748059946_mtb76ek7fzm', 'focus', '2026-03-06 06:01:49', 7544, NULL, '2026-03-06 06:01:49'),
(116, 23, 'session_1772748059946_mtb76ek7fzm', 'blur', '2026-03-06 06:02:04', NULL, NULL, '2026-03-06 06:02:04'),
(117, 23, 'session_1772748059946_mtb76ek7fzm', 'focus', '2026-03-06 06:02:05', 896, NULL, '2026-03-06 06:02:05'),
(118, 23, 'session_1772748059946_mtb76ek7fzm', 'blur', '2026-03-06 06:02:08', NULL, NULL, '2026-03-06 06:02:08'),
(119, 23, 'session_1772748059946_mtb76ek7fzm', 'focus', '2026-03-06 08:57:40', 10529022, NULL, '2026-03-06 08:57:40'),
(120, 23, 'session_1772748059946_mtb76ek7fzm', 'blur', '2026-03-06 08:57:42', NULL, NULL, '2026-03-06 08:57:42');

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
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_ann_author` (`author_id`),
  ADD KEY `idx_ann_active` (`is_active`),
  ADD KEY `idx_ann_created` (`created_at`);

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
-- Indexes for table `materials`
--
ALTER TABLE `materials`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_materials_teacher` (`teacher_id`);

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
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `fingerprints`
--
ALTER TABLE `fingerprints`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `keystroke_logs`
--
ALTER TABLE `keystroke_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `materials`
--
ALTER TABLE `materials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `profiles`
--
ALTER TABLE `profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `quizzes`
--
ALTER TABLE `quizzes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `quiz_assignments`
--
ALTER TABLE `quiz_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `quiz_questions`
--
ALTER TABLE `quiz_questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `quiz_responses`
--
ALTER TABLE `quiz_responses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `session_replays`
--
ALTER TABLE `session_replays`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `window_change_logs`
--
ALTER TABLE `window_change_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=121;

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
-- Constraints for table `announcements`
--
ALTER TABLE `announcements`
  ADD CONSTRAINT `fk_ann_author` FOREIGN KEY (`author_id`) REFERENCES `profiles` (`id`) ON DELETE SET NULL;

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
-- Constraints for table `materials`
--
ALTER TABLE `materials`
  ADD CONSTRAINT `fk_materials_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `profiles` (`id`) ON DELETE CASCADE;

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
