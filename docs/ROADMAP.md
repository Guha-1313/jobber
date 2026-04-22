# Roadmap

## Day 1 — Foundation ✅
- [x] Initialize Next.js 14 project with TypeScript and Tailwind
- [x] Install and configure shadcn/ui
- [x] Landing page with cyberpunk dark aesthetic
- [x] Auth pages (login, signup) — design only
- [x] Dashboard shell layout (sidebar, top header, route group)

## Day 2 — Auth & Database ✅
- [x] Set up Supabase project and connect to app
- [x] Implement authentication (signup, login, session handling)
- [x] Middleware for route protection (`/dashboard/*`)
- [x] DB schema: profiles, resumes, job_preferences, jobs, job_matches, generated_documents
- [x] Auto-profile trigger on signup
- [x] Auth redirect logic (signed-in → dashboard, signed-out → login)
- [x] Sign out via sidebar

## Day 3 — Resume, Preferences, Jobs & Scoring ✅
- [x] Resume upload (PDF/DOCX → Supabase Storage) with drag-and-drop
- [x] Resume text editing (paste plain text, save to `resume_text`)
- [x] Resume replace flow (delete old storage file before uploading new)
- [x] Job preferences form: titles, locations, work mode, salary, years of experience, work auth
- [x] Preferences save/update via upsert
- [x] Jobs CRUD: add, edit, delete with modal form
- [x] Job status tracking: saved / applied / interviewing / offer / rejected
- [x] Status filter tabs on Jobs page
- [x] Deterministic match scoring (`lib/scoring/job-score.ts`) — no AI
- [x] Score saved to `job_matches` on every job add/edit
- [x] Bulk "Recalculate all scores" button
- [x] Dashboard overview: live stats, top 3 matches, setup checklist
- [x] Day 3 DB migration (`supabase/migrations/001_day3.sql`)

## Day 4 — Cover Letters & Polish ✅
- [x] Cover letter generation via Claude API (`claude-opus-4-7`)
- [x] AI utility layer: `lib/ai/cover-letter.ts` (prompt assembly, mock fallback)
- [x] API route: `app/api/generate-cover-letter/route.ts`
- [x] Store generated letters in `generated_documents` table
- [x] Cover letters list view at `/dashboard/cover-letters`
- [x] Reader modal — full letter view with copy + download as .txt + delete
- [x] Generate / View Letter actions on each job card in Jobs page
- [x] Loading spinner while generation is running
- [x] Mock/fallback response when `ANTHROPIC_API_KEY` is absent
- [x] Dashboard: cover letter count stat, quick action card, checklist item enabled
- [x] @anthropic-ai/sdk installed

---

## Post-MVP Ideas
- Job import from URL (LinkedIn, Indeed, Greenhouse)
- Auto-apply via browser automation
- Email digests / job alerts
- Multi-resume support
- Billing and subscription tiers (Stripe)
- OAuth (Google, GitHub)
- AI-powered scoring (replace deterministic scoring with Claude)
- Collaboration / team accounts
