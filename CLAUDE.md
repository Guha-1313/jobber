# CLAUDE.md — Jobber

AI job search assistant. Next.js 14 App Router + Supabase + TypeScript. 4-day MVP build, currently at end of Day 3.

## Commands

```bash
npm run dev      # start dev server
npm run build    # production build (run to verify no TS errors)
npm run lint     # eslint
```

## Key Env Vars

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY   # NOT anon_key — Supabase renamed it
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY                      # Day 4 only
```

## Folder Map

```
app/
  page.tsx                     # landing page (server)
  (auth)/login|signup/         # auth pages
  dashboard/
    page.tsx                   # overview (server) — 6 parallel fetches
    layout.tsx                 # sidebar + header shell
    resume/page.tsx            # server → ResumeClient
    preferences/page.tsx       # server → PreferencesClient
    jobs/page.tsx              # server → JobsClient
    cover-letters/             # Day 4 stub

components/
  landing/                     # landing page components + landing.css
  dashboard/
    DashboardClient.tsx        # sidebar nav state
    dashboard.css              # ALL dashboard styles (scoped to html.dashboard-active)
  layout/Sidebar.tsx TopHeader.tsx
  auth/AuthClient.tsx

lib/
  types.ts                     # Resume, JobPreferences, Job, JobMatch, JobWithMatch
  scoring/job-score.ts         # scoreJob() + scoreClass() — deterministic, no AI
  supabase/
    client.ts                  # browser client (use in 'use client' components)
    server.ts                  # server client (use in server components / API routes)
    middleware.ts              # session refresh
    storage.ts                 # uploadResume() deleteResume()

supabase/
  schema.sql                   # initial schema
  migrations/001_day3.sql      # Day 3 ALTER TABLE statements (run manually in Supabase SQL Editor)

docs/
  PROJECT_CONTEXT.md DB_SCHEMA.md ROADMAP.md
design-system/jobber/MASTER.md  # cyberpunk design tokens
```

## Architecture Rules

- **Server/Client split**: every page = server component (data fetch) → client component (mutations + state). After mutations call `router.refresh()`.
- **Supabase clients**: `createClient()` from `lib/supabase/client.ts` in `'use client'` files; from `lib/supabase/server.ts` in server components.
- **No AI until Day 4**: `scoreJob()` in `lib/scoring/job-score.ts` is pure TS — title/location/work_mode/keyword overlap.
- **Dashboard CSS**: all styles in `components/dashboard/dashboard.css`, scoped to `html.dashboard-active`. Use `dash-*` class prefix. Never add Tailwind utility classes to dashboard components — use the CSS variables.
- **Design**: cyberpunk dark. CSS vars: `--d-ink`, `--d-surface`, `--d-blue`, `--d-glow`, `--d-green`, `--d-red`. Consistent across landing, auth, dashboard.

## Day 3 Status (complete)

- Resume upload (Supabase Storage) + text editing
- Preferences form (upsert to `job_preferences`)
- Jobs CRUD with modal form + status filter tabs
- Deterministic match scoring → saved to `job_matches`
- Dashboard overview with live stats + top matches + setup checklist

**Manual steps still needed by user:**
1. Run `supabase/migrations/001_day3.sql` in Supabase SQL Editor
2. Create `resume` storage bucket in Supabase Dashboard (private, 10MB limit, PDF/DOCX)

## Day 4 Plan

- Cover letter generation via Claude API (`anthropic` SDK, model `claude-opus-4-7`)
- Route: `app/api/generate-cover-letter/route.ts`
- Store results in `generated_documents` table
- Cover letters list view at `/dashboard/cover-letters`
- Mock/fallback when `ANTHROPIC_API_KEY` absent

## Coding Standards

- No comments unless the WHY is non-obvious
- No unnecessary abstractions — three similar lines > a premature helper
- No error handling for impossible cases — only validate at boundaries (user input, API)
- TypeScript strict — no `any`, use types from `lib/types.ts`
- Keep components beginner-readable: flat, explicit, minimal nesting
