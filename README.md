# Integrity *Engine*

> Academic Integrity Intelligence System (AIIS) — Real-time behavioral biometrics, stylometric fingerprinting, and transparent risk scoring for educational environments.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, React 19, Tailwind CSS, shadcn/ui, Recharts |
| **Backend** | Express.js 4, TypeScript, MVC architecture |
| **Database** | Supabase (PostgreSQL) with RLS policies |
| **Auth** | Supabase Auth (email/password, JWT) |
| **AI** | Google Gemini 2.5 Flash via Genkit |
| **Email** | Brevo (Sendinblue) transactional API |
| **Fonts** | Inter, Space Grotesk, Playfair Display |

---

## Project Structure

```
IntegrityEngine/
├── src/                          # Next.js frontend
│   ├── app/                      # App Router pages
│   │   ├── page.tsx              # Landing page
│   │   ├── auth/                 # Login, Signup, Forgot Password
│   │   ├── teacher/              # Teacher dashboard
│   │   └── student/              # Student dashboard + quiz taking
│   ├── components/               # React components (ui/)
│   ├── context/                  # AuthContext (Supabase auth provider)
│   ├── hooks/                    # Custom hooks (toast, mobile)
│   └── lib/                      # Utilities, API client, analysis, telemetry
│       ├── api/client.ts         # Typed API client (auto-attaches auth)
│       └── telemetry/            # KeystrokeTracker, telemetry types
│
├── backend/                      # Express.js API server
│   ├── src/
│   │   ├── server.ts             # Entry point (port 3001)
│   │   ├── config/               # Supabase client config
│   │   ├── middleware/            # Auth middleware (requireAuth, requireTeacher)
│   │   ├── models/               # Data access layer
│   │   ├── controllers/          # Business logic
│   │   ├── routes/               # Express route definitions
│   │   └── services/             # Email service (Brevo)
│   └── db/
│       └── schema.sql            # PostgreSQL schema (10 tables, SERIAL IDs)
│
├── .env.example                  # Frontend env template
├── backend/.env.example          # Backend env template
└── package.json                  # Root scripts (unified dev command)
```

---

## Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Supabase** project (free tier works)

---

## Setup & Run

### 1. Clone and Install

```bash
git clone https://github.com/YOUR_USERNAME/IntegrityEngine.git
cd IntegrityEngine
npm install
cd backend && npm install && cd ..
```

### 2. Configure Environment Variables

Copy the example files and fill in your values:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

See `.env.example` and `backend/.env.example` for required variables.

### 3. Set Up the Database

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard) → SQL Editor
2. Copy and paste the contents of `backend/db/schema.sql`
3. Run the SQL — this creates all 10 tables, indexes, RLS policies, and triggers

> **Note:** `profiles.id` remains UUID (required by Supabase Auth). All other tables use `SERIAL` auto-incrementing integer IDs.

### 4. Run in Development (One Command)

```bash
npm run dev
```

This starts both the **Next.js frontend** on `http://localhost:9002` and the **Express backend** on `http://localhost:3001` concurrently.

Individual scripts are also available:

| Script | Description |
|--------|-------------|
| `npm run dev` | Start frontend + backend together |
| `npm run dev:frontend` | Start Next.js only (port 9002) |
| `npm run dev:backend` | Start Express only (port 3001) |

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/health` | -- | Health check |
| `GET` | `/api/quizzes` | Teacher | List teacher's quizzes |
| `POST` | `/api/quizzes` | Teacher | Create a quiz with questions |
| `GET` | `/api/quizzes/:id` | Auth | Get quiz details |
| `PATCH` | `/api/quizzes/:id` | Teacher | Update quiz |
| `DELETE` | `/api/quizzes/:id` | Teacher | Delete quiz |
| `POST` | `/api/quizzes/:id/assign` | Teacher | Assign quiz to students |
| `POST` | `/api/telemetry/heartbeat` | Auth | Submit keystroke telemetry |
| `POST` | `/api/telemetry/window-change` | Auth | Report tab switch event |
| `GET` | `/api/telemetry/window-change` | Teacher | Get window changes |
| `GET` | `/api/telemetry/keystroke-logs` | Teacher | Get keystroke logs |
| `GET` | `/api/telemetry/summary` | Teacher | Get telemetry summary |
| `POST` | `/api/telemetry/replay` | Auth | Save typing replay data |
| `GET` | `/api/telemetry/replay` | Teacher | Get replay data |
| `POST` | `/api/analysis/run` | Auth | Run risk analysis on assignment |
| `GET` | `/api/students` | Teacher | List all students |
| `GET` | `/api/students/:id/assignments` | Teacher | List student assignments |
| `POST` | `/api/quiz-responses/submit` | Auth | Submit quiz answers |

---

## Testing

### Manual Testing Flow

1. **Sign up** two accounts: one **teacher**, one **student**
2. **Teacher**: Create a quiz (essay or MCQ), then assign it to the student
3. **Student**: Open the assigned quiz, complete it (type answers — the system tracks keystrokes)
4. **Teacher**: View submissions, click a student to see typing data, WPM chart, replay, and tab-switch events
5. **Verify** window-change detection: switch tabs while taking a quiz — the badge counter should increment

### Type Checking

```bash
# Frontend
npm run typecheck

# Backend
cd backend
npm run typecheck
```

---

## Database Schema

| # | Table | PK Type | Description |
|---|-------|---------|-------------|
| 1 | `profiles` | UUID | User accounts (linked to `auth.users`) |
| 2 | `quizzes` | SERIAL | Teacher-created quizzes |
| 3 | `quiz_questions` | SERIAL | Questions within quizzes |
| 4 | `quiz_assignments` | SERIAL | Quiz <-> student assignment records |
| 5 | `quiz_responses` | SERIAL | Student answers per question |
| 6 | `keystroke_logs` | SERIAL | Raw keystroke telemetry |
| 7 | `window_change_logs` | SERIAL | Tab switch / focus events |
| 8 | `session_replays` | SERIAL | Full typing replay data |
| 9 | `fingerprints` | SERIAL | Stylometric fingerprints |
| 10 | `analysis_results` | SERIAL | Risk analysis snapshots |

---

## License

MIT
