-- ═══════════════════════════════════════════════════════════════════════════════
-- Integrity Engine — Supabase PostgreSQL Schema v3
-- Academic Integrity Intelligence System (AIIS)
-- ═══════════════════════════════════════════════════════════════════════════════
--
-- Tables:
--   1.  profiles              — User accounts (teachers & students)
--   2.  quizzes               — Teacher-created quizzes/exams/assignments
--   3.  quiz_questions         — Questions within a quiz (essay or MCQ)
--   4.  quiz_assignments       — Quiz assigned to student (the "take" record)
--   5.  quiz_responses         — Student answers per question
--   6.  keystroke_logs         — Raw telemetry events per heartbeat
--   7.  window_change_logs     — Alt-tab / window focus changes
--   8.  session_replays        — Full replay data for typing sessions
--   9.  fingerprints           — Computed stylometric fingerprints
--   10. analysis_results       — Risk analysis snapshots
--
-- NOTE: profiles.id still references auth.users(id) which is UUID — this is
--       required by Supabase Auth. All other tables use SERIAL (auto-increment).
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── 1. PROFILES ────────────────────────────────────────────────────────────
-- id is UUID because Supabase Auth generates UUIDs for auth.users

CREATE TABLE profiles (
  id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                 TEXT NOT NULL,
  full_name             TEXT,
  avatar_url            TEXT,
  role                  TEXT NOT NULL CHECK (role IN ('teacher', 'student')),
  baseline_fingerprint  JSONB DEFAULT NULL,
  baseline_sample_count INTEGER DEFAULT 0,
  email_verified        BOOLEAN DEFAULT FALSE,
  last_login_at         TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);

-- ─── 2. QUIZZES ─────────────────────────────────────────────────────────────

CREATE TABLE quizzes (
  id               SERIAL PRIMARY KEY,
  teacher_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  description      TEXT DEFAULT '',
  type             TEXT NOT NULL CHECK (type IN ('essay', 'multiple_choice', 'mixed')),
  status           TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')),
  time_limit_mins  INTEGER DEFAULT NULL,
  due_date         TIMESTAMPTZ DEFAULT NULL,
  settings         JSONB DEFAULT '{}',
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quizzes_teacher ON quizzes(teacher_id);
CREATE INDEX idx_quizzes_status ON quizzes(status);

-- ─── 3. QUIZ_QUESTIONS ──────────────────────────────────────────────────────

CREATE TABLE quiz_questions (
  id            SERIAL PRIMARY KEY,
  quiz_id       INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('essay', 'multiple_choice')),
  options       JSONB DEFAULT NULL,
  correct_answer TEXT DEFAULT NULL,
  points        INTEGER DEFAULT 1,
  sort_order    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_questions_quiz ON quiz_questions(quiz_id);
CREATE INDEX idx_questions_order ON quiz_questions(quiz_id, sort_order);

-- ─── 4. QUIZ_ASSIGNMENTS ───────────────────────────────────────────────────

CREATE TABLE quiz_assignments (
  id              SERIAL PRIMARY KEY,
  quiz_id         INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  student_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  teacher_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  status          TEXT NOT NULL DEFAULT 'assigned'
                  CHECK (status IN ('assigned', 'in_progress', 'submitted', 'reviewed', 'flagged')),
  risk_score      INTEGER DEFAULT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  total_score     INTEGER DEFAULT NULL,
  max_score       INTEGER DEFAULT NULL,
  started_at      TIMESTAMPTZ DEFAULT NULL,
  submitted_at    TIMESTAMPTZ DEFAULT NULL,
  session_id      TEXT DEFAULT NULL,
  window_changes  INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(quiz_id, student_id)
);

CREATE INDEX idx_qa_student ON quiz_assignments(student_id);
CREATE INDEX idx_qa_teacher ON quiz_assignments(teacher_id);
CREATE INDEX idx_qa_quiz ON quiz_assignments(quiz_id);
CREATE INDEX idx_qa_status ON quiz_assignments(status);
CREATE INDEX idx_qa_risk ON quiz_assignments(risk_score DESC NULLS LAST);

-- ─── 5. QUIZ_RESPONSES ─────────────────────────────────────────────────────

CREATE TABLE quiz_responses (
  id                  SERIAL PRIMARY KEY,
  quiz_assignment_id  INTEGER NOT NULL REFERENCES quiz_assignments(id) ON DELETE CASCADE,
  question_id         INTEGER NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  answer_text         TEXT DEFAULT '',
  selected_option     TEXT DEFAULT NULL,
  is_correct          BOOLEAN DEFAULT NULL,
  score               INTEGER DEFAULT NULL,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(quiz_assignment_id, question_id)
);

CREATE INDEX idx_responses_assignment ON quiz_responses(quiz_assignment_id);
CREATE INDEX idx_responses_question ON quiz_responses(question_id);

-- ─── 6. KEYSTROKE_LOGS ──────────────────────────────────────────────────────

CREATE TABLE keystroke_logs (
  id                  SERIAL PRIMARY KEY,
  quiz_assignment_id  INTEGER NOT NULL REFERENCES quiz_assignments(id) ON DELETE CASCADE,
  session_id          TEXT NOT NULL,
  timestamp           TIMESTAMPTZ DEFAULT NOW(),
  events              JSONB NOT NULL DEFAULT '[]',
  wpm                 REAL DEFAULT 0,
  burst_score         REAL DEFAULT 0,
  avg_latency         REAL DEFAULT 0,
  peak_wpm            REAL DEFAULT 0,
  paste_chars         INTEGER DEFAULT 0,
  paste_events        INTEGER DEFAULT 0,
  total_keys          INTEGER DEFAULT 0,
  wpm_history         JSONB DEFAULT '[]',
  nonce               TEXT,
  signature           TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_keystroke_qa ON keystroke_logs(quiz_assignment_id);
CREATE INDEX idx_keystroke_session ON keystroke_logs(session_id);
CREATE INDEX idx_keystroke_timestamp ON keystroke_logs(quiz_assignment_id, timestamp DESC);

-- ─── 7. WINDOW_CHANGE_LOGS ─────────────────────────────────────────────────

CREATE TABLE window_change_logs (
  id                  SERIAL PRIMARY KEY,
  quiz_assignment_id  INTEGER NOT NULL REFERENCES quiz_assignments(id) ON DELETE CASCADE,
  session_id          TEXT NOT NULL,
  event_type          TEXT NOT NULL CHECK (event_type IN ('blur', 'focus')),
  timestamp           TIMESTAMPTZ DEFAULT NOW(),
  away_duration_ms    INTEGER DEFAULT NULL,
  page_url            TEXT DEFAULT NULL,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_window_qa ON window_change_logs(quiz_assignment_id);
CREATE INDEX idx_window_session ON window_change_logs(session_id);
CREATE INDEX idx_window_timestamp ON window_change_logs(quiz_assignment_id, timestamp DESC);

-- ─── 8. SESSION_REPLAYS ────────────────────────────────────────────────────

CREATE TABLE session_replays (
  id                  SERIAL PRIMARY KEY,
  quiz_assignment_id  INTEGER NOT NULL REFERENCES quiz_assignments(id) ON DELETE CASCADE,
  session_id          TEXT NOT NULL,
  question_id         INTEGER REFERENCES quiz_questions(id) ON DELETE SET NULL,
  replay_events       JSONB NOT NULL DEFAULT '[]',
  text_snapshots      JSONB NOT NULL DEFAULT '[]',
  duration_ms         INTEGER DEFAULT 0,
  total_events        INTEGER DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_replay_qa ON session_replays(quiz_assignment_id);
CREATE INDEX idx_replay_session ON session_replays(session_id);
CREATE INDEX idx_replay_question ON session_replays(question_id);

-- ─── 9. FINGERPRINTS ────────────────────────────────────────────────────────

CREATE TABLE fingerprints (
  id                    SERIAL PRIMARY KEY,
  quiz_assignment_id    INTEGER NOT NULL REFERENCES quiz_assignments(id) ON DELETE CASCADE,
  student_id            UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lexical_density       REAL NOT NULL DEFAULT 0,
  avg_sentence_length   REAL NOT NULL DEFAULT 0,
  vocabulary_diversity  REAL NOT NULL DEFAULT 0,
  burst_score           REAL NOT NULL DEFAULT 0,
  flesch_kincaid_score  REAL NOT NULL DEFAULT 0,
  fingerprint_json      JSONB,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-populate fingerprint_json from individual columns on insert/update
CREATE OR REPLACE FUNCTION sync_fingerprint_json()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fingerprint_json := jsonb_build_object(
    'lexical_density',      NEW.lexical_density,
    'avg_sentence_length',  NEW.avg_sentence_length,
    'vocabulary_diversity', NEW.vocabulary_diversity,
    'burst_score',          NEW.burst_score,
    'flesch_kincaid_score', NEW.flesch_kincaid_score
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER before_fingerprint_upsert
  BEFORE INSERT OR UPDATE ON fingerprints
  FOR EACH ROW
  EXECUTE FUNCTION sync_fingerprint_json();

CREATE INDEX idx_fingerprints_student ON fingerprints(student_id);
CREATE INDEX idx_fingerprints_qa ON fingerprints(quiz_assignment_id);
CREATE INDEX idx_fingerprints_created ON fingerprints(student_id, created_at DESC);
CREATE UNIQUE INDEX idx_fingerprints_unique_qa ON fingerprints(quiz_assignment_id);

-- ─── 10. ANALYSIS_RESULTS ───────────────────────────────────────────────────

CREATE TABLE analysis_results (
  id                  SERIAL PRIMARY KEY,
  quiz_assignment_id  INTEGER NOT NULL REFERENCES quiz_assignments(id) ON DELETE CASCADE,
  student_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  risk_score          INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  confidence          REAL NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  flags               JSONB NOT NULL DEFAULT '[]',
  deviation           JSONB NOT NULL DEFAULT '{}',
  z_scores            JSONB NOT NULL DEFAULT '{}',
  explanation         TEXT NOT NULL DEFAULT '',
  ai_explanation      TEXT DEFAULT NULL,
  window_change_count INTEGER DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analysis_qa ON analysis_results(quiz_assignment_id);
CREATE INDEX idx_analysis_risk ON analysis_results(risk_score DESC);

-- ═══════════════════════════════════════════════════════════════════════════════
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE keystroke_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE window_change_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_replays ENABLE ROW LEVEL SECURITY;
ALTER TABLE fingerprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_results ENABLE ROW LEVEL SECURITY;

-- ─── Profiles ───────────────────────────────────────────────────────────────

CREATE POLICY profiles_self_read ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY profiles_self_update ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY profiles_teacher_read ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'teacher')
  );

CREATE POLICY profiles_insert ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ─── Quizzes ────────────────────────────────────────────────────────────────

CREATE POLICY quizzes_teacher_all ON quizzes
  FOR ALL USING (auth.uid() = teacher_id);

CREATE POLICY quizzes_student_read ON quizzes
  FOR SELECT USING (
    status = 'published' AND EXISTS (
      SELECT 1 FROM quiz_assignments qa WHERE qa.quiz_id = id AND qa.student_id = auth.uid()
    )
  );

-- ─── Quiz Questions ─────────────────────────────────────────────────────────

CREATE POLICY questions_teacher_all ON quiz_questions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM quizzes q WHERE q.id = quiz_id AND q.teacher_id = auth.uid())
  );

CREATE POLICY questions_student_read ON quiz_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quizzes q
      JOIN quiz_assignments qa ON qa.quiz_id = q.id
      WHERE q.id = quiz_id AND qa.student_id = auth.uid() AND q.status = 'published'
    )
  );

-- ─── Quiz Assignments ───────────────────────────────────────────────────────

CREATE POLICY qa_student_read ON quiz_assignments
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY qa_student_update ON quiz_assignments
  FOR UPDATE USING (auth.uid() = student_id);

CREATE POLICY qa_teacher_all ON quiz_assignments
  FOR ALL USING (auth.uid() = teacher_id);

-- ─── Quiz Responses ─────────────────────────────────────────────────────────

CREATE POLICY responses_student_write ON quiz_responses
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM quiz_assignments qa WHERE qa.id = quiz_assignment_id AND qa.student_id = auth.uid())
  );

CREATE POLICY responses_student_update ON quiz_responses
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM quiz_assignments qa WHERE qa.id = quiz_assignment_id AND qa.student_id = auth.uid())
  );

CREATE POLICY responses_student_read ON quiz_responses
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM quiz_assignments qa WHERE qa.id = quiz_assignment_id AND qa.student_id = auth.uid())
  );

CREATE POLICY responses_teacher_read ON quiz_responses
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM quiz_assignments qa WHERE qa.id = quiz_assignment_id AND qa.teacher_id = auth.uid())
  );

-- ─── Keystroke Logs ─────────────────────────────────────────────────────────

CREATE POLICY keystroke_student_insert ON keystroke_logs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM quiz_assignments qa WHERE qa.id = quiz_assignment_id AND qa.student_id = auth.uid())
  );

CREATE POLICY keystroke_teacher_read ON keystroke_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM quiz_assignments qa WHERE qa.id = quiz_assignment_id AND qa.teacher_id = auth.uid())
  );

-- ─── Window Change Logs ─────────────────────────────────────────────────────

CREATE POLICY window_student_insert ON window_change_logs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM quiz_assignments qa WHERE qa.id = quiz_assignment_id AND qa.student_id = auth.uid())
  );

CREATE POLICY window_teacher_read ON window_change_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM quiz_assignments qa WHERE qa.id = quiz_assignment_id AND qa.teacher_id = auth.uid())
  );

-- ─── Session Replays ────────────────────────────────────────────────────────

CREATE POLICY replay_student_insert ON session_replays
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM quiz_assignments qa WHERE qa.id = quiz_assignment_id AND qa.student_id = auth.uid())
  );

CREATE POLICY replay_teacher_read ON session_replays
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM quiz_assignments qa WHERE qa.id = quiz_assignment_id AND qa.teacher_id = auth.uid())
  );

-- ─── Fingerprints ───────────────────────────────────────────────────────────

CREATE POLICY fingerprints_student_read ON fingerprints
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY fingerprints_teacher_read ON fingerprints
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM quiz_assignments qa WHERE qa.id = quiz_assignment_id AND qa.teacher_id = auth.uid())
  );

-- ─── Analysis Results ───────────────────────────────────────────────────────

CREATE POLICY analysis_teacher_read ON analysis_results
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM quiz_assignments qa WHERE qa.id = quiz_assignment_id AND qa.teacher_id = auth.uid())
  );

-- ═══════════════════════════════════════════════════════════════════════════════
-- HELPER FUNCTIONS & TRIGGERS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Auto-update student baseline when a new fingerprint is inserted
CREATE OR REPLACE FUNCTION update_student_baseline(p_student_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles SET
    baseline_fingerprint = (
      SELECT jsonb_build_object(
        'lexical_density', AVG(lexical_density),
        'avg_sentence_length', AVG(avg_sentence_length),
        'vocabulary_diversity', AVG(vocabulary_diversity),
        'burst_score', AVG(burst_score),
        'flesch_kincaid_score', AVG(flesch_kincaid_score)
      )
      FROM fingerprints WHERE student_id = p_student_id
    ),
    baseline_sample_count = (
      SELECT COUNT(*) FROM fingerprints WHERE student_id = p_student_id
    ),
    updated_at = NOW()
  WHERE id = p_student_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION trigger_update_baseline()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_student_baseline(NEW.student_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_fingerprint_insert
  AFTER INSERT ON fingerprints
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_baseline();

-- Auto-increment window_changes count on quiz_assignments
CREATE OR REPLACE FUNCTION trigger_increment_window_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.event_type = 'blur' THEN
    UPDATE quiz_assignments
    SET window_changes = window_changes + 1, updated_at = NOW()
    WHERE id = NEW.quiz_assignment_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_window_change_insert
  AFTER INSERT ON window_change_logs
  FOR EACH ROW
  EXECUTE FUNCTION trigger_increment_window_changes();

-- Auto-create profile after Supabase auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Updated_at auto-update trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_quizzes BEFORE UPDATE ON quizzes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_qa BEFORE UPDATE ON quiz_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_responses BEFORE UPDATE ON quiz_responses FOR EACH ROW EXECUTE FUNCTION update_updated_at();
