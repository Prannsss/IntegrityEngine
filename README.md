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
│   │   ├── student/              # Student dashboard + quiz taking
│   │   ├── dashboard/            # Legacy dashboard
│   │   └── editor/               # Smart editor
│   ├── components/               # React components (ui/, dashboard/, editor/)
│   ├── context/                  # AuthContext (Supabase auth provider)
│   ├── hooks/                    # Custom hooks (toast, mobile)
│   └── lib/                      # Utilities, analysis engines, telemetry
│
├── backend/                      # Express.js API server
│   ├── src/
│   │   ├── server.ts             # Entry point (port 3001)
│   │   ├── config/               # Supabase client config
│   │   ├── middleware/            # Auth middleware (requireAuth, requireTeacher)
│   │   ├── models/               # Data access layer (6 models)
│   │   ├── controllers/          # Business logic (5 controllers)
│   │   ├── routes/               # Express route definitions (5 routers)
│   │   └── services/             # Email service (Brevo)
│   └── db/
│       └── schema.sql            # PostgreSQL schema (10 tables, SERIAL IDs)
│
├── .env                          # Frontend environment variables
├── backend/.env                  # Backend environment variables
└── package.json                  # Frontend dependencies
```

---

## Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Supabase** project (free tier works)
- **Brevo** account (optional — for transactional emails)

---

## Setup & Run

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/IntegrityEngine.git
cd IntegrityEngine
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### 4. Configure Environment Variables

#### Frontend (`.env` in project root)

```env
NEXT_PUBLIC_API_URL=https://YOUR_BACKEND_URL/api
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_BACKEND_URL=https://YOUR_BACKEND_URL
```

#### Backend (`backend/.env`)

```env
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=postgresql://postgres:PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres

BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=noreply@yourdomain.com
BREVO_SENDER_NAME=IntegrityEngine

FRONTEND_URL=https://integrity-engine.vercel.app
PORT=3001
```

### 5. Set Up the Database

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard) → SQL Editor
2. Copy and paste the contents of `backend/db/schema.sql`
3. Run the SQL — this creates all 10 tables, indexes, RLS policies, and triggers

> **Note:** `profiles.id` remains UUID (required by Supabase Auth). All other tables use `SERIAL` auto-incrementing integer IDs.

### 6. Run in Development

Open **two terminals**:

**Terminal 1 — Frontend (Next.js)**:
```bash
npm run dev
```
Frontend runs at `http://localhost:9002`

**Terminal 2 — Backend (Express.js)**:
```bash
cd backend
npm run dev
```
Backend runs at `http://localhost:3001`

### 7. Build for Production

**Frontend:**
```bash
npm run build
npm run start
```

**Backend:**
```bash
cd backend
npm run build
npm run start
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/health` | – | Health check |
| `GET` | `/api/quizzes` | Teacher | List teacher's quizzes |
| `POST` | `/api/quizzes` | Teacher | Create a quiz with questions |
| `GET` | `/api/quizzes/:id` | Auth | Get quiz details |
| `PUT` | `/api/quizzes/:id` | Teacher | Update quiz |
| `DELETE` | `/api/quizzes/:id` | Teacher | Delete quiz |
| `POST` | `/api/quizzes/:id/assign` | Teacher | Assign quiz to students |
| `POST` | `/api/telemetry/heartbeat` | Optional | Submit keystroke telemetry |
| `POST` | `/api/telemetry/window-change` | Optional | Report tab switch event |
| `GET` | `/api/telemetry/window-changes/:qaId` | Optional | Get window changes for assignment |
| `POST` | `/api/telemetry/replay` | Optional | Save typing replay data |
| `GET` | `/api/telemetry/replays/:qaId` | Optional | Get replay data |
| `POST` | `/api/analysis/run` | Auth | Run risk analysis on assignment |
| `GET` | `/api/students` | Teacher | List all students |
| `POST` | `/api/quiz-responses/submit` | Optional | Submit quiz answers |

---

## Testing

### Manual Testing Flow

1. **Sign up** two accounts: one **teacher**, one **student**
2. **Teacher**: Create a quiz (essay or MCQ), then assign it to the student
3. **Student**: Open the assigned quiz, complete it (type answers — the system tracks keystrokes)
4. **Teacher**: View submissions, check risk scores, and replay typing sessions
5. **Verify** window-change detection: switch tabs while taking a quiz — the badge counter should increment

### Type Checking

```bash
# Frontend
npm run typecheck

# Backend
cd backend
npm run typecheck
```

### Build Verification

```bash
# Frontend
npm run build

# Backend
cd backend
npm run build
```

---

## Database Schema

The schema uses **SERIAL (auto-increment) IDs** for all tables except `profiles` (which uses UUID from Supabase Auth):

| # | Table | PK Type | Description |
|---|-------|---------|-------------|
| 1 | `profiles` | UUID | User accounts (linked to `auth.users`) |
| 2 | `quizzes` | SERIAL | Teacher-created quizzes |
| 3 | `quiz_questions` | SERIAL | Questions within quizzes |
| 4 | `quiz_assignments` | SERIAL | Quiz ↔ student assignment records |
| 5 | `quiz_responses` | SERIAL | Student answers per question |
| 6 | `keystroke_logs` | SERIAL | Raw keystroke telemetry |
| 7 | `window_change_logs` | SERIAL | Tab switch / focus events |
| 8 | `session_replays` | SERIAL | Full typing replay data |
| 9 | `fingerprints` | SERIAL | Stylometric fingerprints |
| 10 | `analysis_results` | SERIAL | Risk analysis snapshots |

---

## Deployment

### Frontend → Vercel

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Set environment variables in Vercel dashboard
4. Deploy — the app auto-builds with `next build`

### Backend → Render / Railway

1. Set the root directory to `backend/`
2. Build command: `npm run build`
3. Start command: `npm run start`
4. Set environment variables (see `backend/.env` template above)
5. Ensure CORS `FRONTEND_URL` matches your Vercel deployment URL

---

## License

MIT
