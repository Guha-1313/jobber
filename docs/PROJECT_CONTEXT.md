# Project Context

## What is Jobber?

Jobber is an AI-powered job search assistant. Users upload their resume, set job preferences, manually add job listings, get match scores, and generate tailored cover letters using Claude.

## MVP Scope

### Included
- User authentication (Supabase Auth — email/password)
- Resume upload (Supabase Storage) + resume text editing
- Job preferences form (roles, location, work mode, salary, experience, work auth)
- Manual job entry (paste job descriptions) + URL auto-fill
- Deterministic match scoring (resume vs. job — no AI, pure TypeScript)
- Cover letter generation (Claude API — `claude-opus-4-7`) ✅ Day 4
- Dashboard with live stats, top matches, setup checklist, roadmap
- Generated documents list with copy, download, and delete

### Excluded from MVP
- LinkedIn / Indeed / Workday scraping
- Auto-apply
- Billing / subscriptions
- Browser automation
- OAuth (Google, GitHub) — UI exists, wiring is post-MVP

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + custom CSS |
| UI Components | shadcn/ui (limited use) |
| Database / Auth / Storage | Supabase |
| AI | Claude API (Anthropic) — `claude-opus-4-7` |

## Architecture Overview

- **Server/Client split**: every page is a server component (data fetch, auth check) that passes props to a `*Client.tsx` component (mutations, local state)
- `router.refresh()` is called after mutations to re-sync server data without a full reload
- Auth is handled via Supabase Auth with middleware-based route protection
- `middleware.ts` at root guards `/dashboard/*` and redirects auth pages if already signed in
- Resume files are stored in Supabase Storage (`resume` bucket, private)
- Match scoring runs client-side in `lib/scoring/job-score.ts` — no AI, no API call
- Cover letter generation runs server-side via `app/api/generate-cover-letter/route.ts`

## Auth Flow

1. User signs up at `/signup` → Supabase creates `auth.users` row → trigger auto-creates `profiles` row
2. User signs in at `/login` → Supabase session cookie is set
3. Middleware refreshes session on every request
4. `/dashboard/*` routes: redirect to `/login` if no session
5. `/login`, `/signup`: redirect to `/dashboard` if already signed in
6. Sign out: browser client calls `supabase.auth.signOut()` → redirect to `/login`

## Cover Letter Generation Flow

1. User clicks the ✦ (Sparkles) icon on any job card in `/dashboard/jobs`
2. `JobsClient` POSTs to `/api/generate-cover-letter` with `{ job_id }`
3. The route handler:
   - Verifies auth via Supabase server client
   - Fetches the job (verifying ownership), user's latest resume, and preferences in parallel
   - Calls `generateCoverLetter()` from `lib/ai/cover-letter.ts`
   - Saves the result to `generated_documents` table
   - Returns the saved document
4. Client updates local `letterMap` state — the Sparkles icon becomes a FileText (view) icon
5. User can navigate to `/dashboard/cover-letters` to read, copy, download, or delete letters

### AI prompt strategy (`lib/ai/cover-letter.ts`)

- **System prompt**: instructs Claude to write focused, non-generic cover letters ≤320 words
- **User prompt**: assembled from resume text (truncated to 4000 chars), preferences, and job details (title, company, location, description truncated to 3000 chars)
- **Mock fallback**: when `ANTHROPIC_API_KEY` is absent, returns a realistic placeholder letter with the job title and company substituted in — the app remains fully demo-able

## Match Scoring

Scoring is deterministic (no AI). Lives in `lib/scoring/job-score.ts`.

| Signal | Max points |
|--------|-----------|
| Title keyword overlap | 30 |
| Location match | 20 |
| Work mode match | 20 |
| Resume text ↔ JD keyword overlap | 30 |

`scoreJob(job, preferences, resume)` returns `{ score: number, explanation: string }`.
`scoreClass(score)` returns `'high' | 'mid' | 'low' | 'none'` for CSS styling.

Scores are saved to `job_matches` (upsert by `job_id`). Users can also bulk re-score all jobs via the "Recalculate all scores" button on the Jobs page.

## Environment Variables

| Variable | Where to find it |
|----------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase Dashboard → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Project Settings → API (keep secret) |
| `ANTHROPIC_API_KEY` | https://console.anthropic.com/settings/keys |

> Note: If `ANTHROPIC_API_KEY` is not set, generation falls back to a mock letter. The app is fully demo-able without the key.

## Supabase Client Files

| File | Usage |
|------|-------|
| `lib/supabase/client.ts` | Browser (client components, event handlers) |
| `lib/supabase/server.ts` | Server (server components, layouts) |
| `lib/supabase/middleware.ts` | Session refresh in Next.js middleware |
| `lib/supabase/storage.ts` | `uploadResume()`, `deleteResume()` |

## Design System

- **Landing + auth**: cyberpunk dark aesthetic — CSS lives in `components/landing/landing.css`
- **Dashboard**: same cyberpunk dark — CSS lives in `components/dashboard/dashboard.css`, scoped to `html.dashboard-active`
- CSS variables: `--d-ink`, `--d-surface`, `--d-blue`, `--d-glow`, `--d-green`, `--d-red`
- All dashboard classes use `dash-*` prefix

## Day Status

| Day | Status | Scope |
|-----|--------|-------|
| Day 1 | ✅ Complete | Landing page, auth pages (design), dashboard shell |
| Day 2 | ✅ Complete | Supabase auth, DB schema, route protection, profile trigger |
| Day 3 | ✅ Complete | Resume upload, preferences, jobs CRUD, match scoring, dashboard live data |
| Day 4 | ✅ Complete | Cover letter generation (Claude API), cover letters list, demo polish |
