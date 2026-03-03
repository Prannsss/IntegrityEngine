# **App Name**: VeriType

## Core Features:

- Keystroke Tracking & Telemetry: Client-side capture of keystroke dynamics (latency, WPM, bursts) and paste events, with periodic telemetry payload submission.
- Stylometric Fingerprinting Tool: Calculates linguistic signals (lexical density, sentence length, vocabulary diversity, Flesch-Kincaid) from submitted text and keystroke data, acting as an analytical tool.
- Fingerprint Comparison Tool: Compares current student submission fingerprints against historical baselines using statistical methods (deviation, z-score) to derive a risk score and flags, functioning as an intelligent tool.
- Student Smart Editor: A Next.js component providing a rich text editing experience with real-time typing analytics and visual indicators (speed meter, paste warning).
- Teacher Dashboard & Reporting: A UI for teachers to view student assignments, compare current vs. historical fingerprints, visualize risk scores, red flags, and typing timelines.
- PostgreSQL Data Persistence: Manages user profiles, assignments, raw keystroke logs, and calculated fingerprints using a PostgreSQL database via Supabase.
- Real-time Risk Scoring & Alerts Tool: Applies a weighted scoring model and defined thresholds to keystroke and stylometric data, identifying behavioral anomalies and generating a real-time risk assessment.

## Style Guidelines:

- Primary color: Deep Indigo (#612EC0). A professional and intellectual tone, visible against a dark background.
- Background color: Dark muted violet (#1A161D). A desaturated and low-brightness base, maintaining theme consistency for a serious, data-rich application.
- Accent color: Vibrant Blue (#5C90FC). Provides strong contrast for interactive elements, highlights, and important notifications.
- Headline font: 'Space Grotesk' (sans-serif) for a modern, slightly technical feel. Body text font: 'Inter' (sans-serif) for objective readability in longer content blocks.
- Minimalist, line-based icons for clarity and to align with the professional, data-oriented nature of the system, focusing on data points, warnings, and analysis.
- Clean and structured layouts emphasizing readability and data hierarchy, particularly on the teacher dashboard with clear distinction between metrics, visualizations, and summary panels.
- Subtle, non-distracting animations for data updates and UI transitions, providing responsive feedback without overwhelming the user.