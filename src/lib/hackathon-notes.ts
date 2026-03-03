/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * HACKATHON OPTIMIZATION NOTES
 * VeriType — Academic Integrity Intelligence System (AIIS)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * ─── WHAT TO FAKE / MOCK ──────────────────────────────────────────────────
 *
 * 1. Authentication
 *    - Skip Supabase Auth entirely. Use hardcoded user roles:
 *      { id: 'teacher_1', role: 'teacher' } and { id: 'student_1', role: 'student' }
 *    - No login/signup flow needed for demo.
 *
 * 2. Database
 *    - Use in-memory state (React useState) instead of Supabase tables.
 *    - Mock `keystroke_logs` as a local array that grows with each heartbeat.
 *    - Mock `fingerprints` table with 3 pre-seeded student baselines.
 *    - Console.log the telemetry payloads to prove they're structured correctly.
 *
 * 3. Historical Baselines
 *    - Pre-compute 3 student baseline fingerprints and hardcode them.
 *    - For Z-scores, generate 5-8 fake historical sample arrays per metric.
 *    - This is enough to demonstrate the comparison engine.
 *
 * 4. AI Explanation (Genkit)
 *    - Keep the Genkit flow but have a fallback static string if API key
 *      is unavailable during demo. The comparison engine already generates
 *      a deterministic explanation — the AI one is a nice-to-have.
 *
 * 5. Payload Signing
 *    - Implement the signing code (it's already done) but skip verification
 *      on the "server side" since there's no real server for hackathon.
 *    - Show the HMAC signature in the console log to demonstrate the concept.
 *
 * ─── WHAT TO SIMPLIFY ─────────────────────────────────────────────────────
 *
 * 1. RLS Policies
 *    - Include the SQL file to show you've designed them, but don't
 *      actually enforce them for the demo. Running the schema in Supabase
 *      dashboard is enough to show intent.
 *
 * 2. Real-time Sync
 *    - Heartbeat logs go to console.log instead of Supabase insert.
 *    - Add a small toast/badge showing "Heartbeat #N sent" for visual proof.
 *
 * 3. Offline Buffering
 *    - The tracker already handles it. For demo, toggle airplane mode
 *      briefly to show the "Offline (N queued)" badge, then reconnect.
 *
 * 4. Multi-Student Support
 *    - The dashboard uses hardcoded mock data for 3 students.
 *    - One student is flagged (Alex Rivera), two are clean.
 *    - This creates an instant visual contrast for judges.
 *
 * ─── WHAT TO PRIORITIZE FOR DEMO IMPACT ───────────────────────────────────
 *
 * Priority 1: The Editor (LIVE TYPING DEMO)
 *    - Open /editor and type naturally for 30 seconds.
 *    - Show the WPM meter, burst score, and heartbeat counter updating.
 *    - Then paste a large block of text — watch the red paste alert fire.
 *    - This is your "wow moment" #1.
 *
 * Priority 2: The Dashboard (DETECTION VISUALIZATION)
 *    - Open /dashboard immediately after.
 *    - Click on "Alex Rivera" — show the 84% risk score, red flags,
 *      burst timeline with the spike, and the interpretation summary.
 *    - Click on "Jordan Smith" — show 12% risk, all green.
 *    - This contrast is your "wow moment" #2.
 *
 * Priority 3: The Fingerprint Comparison (INTERPRETABILITY)
 *    - Zoom into the stylometric deviation bars.
 *    - Explain: "Each of these 5 metrics has a baseline. When the current
 *      submission deviates by >40%, it's flagged. The burst score — which
 *      measures typing rhythm consistency — jumped 133%. That's the hardest
 *      signal to fake because you'd need to physically mimic someone's
 *      keystroke cadence."
 *
 * ─── 2-MINUTE DEMO SCRIPT ────────────────────────────────────────────────
 *
 * [0:00 - 0:15] Landing Page
 *   "VeriType is an academic integrity engine that detects AI-assisted
 *    content using behavioral biometrics and stylometric fingerprinting."
 *
 * [0:15 - 0:45] Editor — Live Typing
 *   Open /editor. Type a sentence naturally.
 *   "Every keystroke is captured — inter-key latency, hold time, WPM.
 *    Watch the sidebar update in real time."
 *
 * [0:45 - 1:00] Editor — Paste Detection
 *   Paste a paragraph from ChatGPT.
 *   "342 characters pasted at once — flagged instantly.
 *    This telemetry is signed with HMAC-SHA256 and sent every 30 seconds."
 *
 * [1:00 - 1:30] Dashboard — Flagged Student
 *   Open /dashboard. Click Alex Rivera.
 *   "Alex has an 84% risk score. Burst score spiked 133%.
 *    Vocabulary richness jumped 52%. Two behavioral flags: large paste
 *    and WPM spike. The system explains exactly WHY in plain English."
 *
 * [1:30 - 1:50] Dashboard — Healthy Student
 *   Click Jordan Smith.
 *   "Jordan: 12% risk. All metrics within baseline. No flags.
 *    The system clearly distinguishes natural from anomalous."
 *
 * [1:50 - 2:00] Close
 *   "No black-box ML. Every point in the score is traceable.
 *    Built with Next.js, Tailwind, and designed for Supabase at scale."
 *
 * ─── TECHNICAL TALKING POINTS FOR Q&A ─────────────────────────────────────
 *
 * Q: "How is this different from Turnitin?"
 * A: "Turnitin compares text against a corpus. We analyze HOW the text
 *     was produced — the typing behavior itself. You can paraphrase
 *     AI output to fool Turnitin, but you can't fake the typing rhythm."
 *
 * Q: "Can students game the system?"
 * A: "The burst score (σ of IKL) is extremely hard to fake. You'd need
 *     to type at a specific cadence for 5+ minutes. The system also
 *     cross-references multiple signals — gaming one doesn't help if
 *     the others still flag."
 *
 * Q: "What about false positives?"
 * A: "We have four mitigation strategies: minimum baseline requirements,
 *     confidence scaling, single-signal dampening, and self-paste detection.
 *     The system never auto-penalizes — it flags for human review."
 *
 * Q: "Is this scalable?"
 * A: "Yes. Telemetry is append-only (insert into Supabase). Comparison
 *     is stateless (pure function). No training loop. The heaviest
 *     computation is the stylometry, which is O(n) on word count."
 */
export {};
