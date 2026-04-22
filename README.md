# Jobber

AI-powered job search assistant. Upload your resume, set preferences, track jobs, get match scores, and generate tailored cover letters.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Custom CSS (cyberpunk dark design system)
- **Backend:** Supabase (Postgres, Auth, Storage)
- **AI:** Claude API (Anthropic) — cover letter generation (Day 4)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

| Variable | Where to find it |
|----------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase Dashboard → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Project Settings → API (**keep secret**) |
| `ANTHROPIC_API_KEY` | https://console.anthropic.com/settings/keys (Day 4 only) |

> Note: Supabase renamed the key from `ANON_KEY` to `PUBLISHABLE_KEY`.

### 3. Set up Supabase

**a. Run the base schema**

Supabase Dashboard → **SQL Editor → New query** → paste `supabase/schema.sql` → Run.

Creates all tables, RLS policies, and the auto-profile trigger.

**b. Run the Day 3 migration**

Paste `supabase/migrations/001_day3.sql` → Run.

Adds the `status` column to `jobs`, makes `file_path`/`file_name` nullable on `resumes`, and adds a UNIQUE constraint on `job_matches.job_id`.

**c. Disable email confirmation (local dev)**

Supabase Dashboard → **Authentication → Email** → toggle off "Confirm email".

**d. Create the Storage bucket**

Supabase Dashboard → **Storage → New bucket**:
- Name: `resume`
- Public: **No** (private)
- Max file size: `10 MB`
- Allowed MIME types: `application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document`

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Pages

| Route | Description | Status |
|-------|-------------|--------|
| `/` | Landing page | ✅ Day 1 |
| `/login` | Sign in | ✅ Day 2 |
| `/signup` | Create account | ✅ Day 2 |
| `/dashboard` | Overview: stats, top matches, setup checklist | ✅ Day 3 |
| `/dashboard/resume` | Upload resume (PDF/DOCX) or paste text | ✅ Day 3 |
| `/dashboard/preferences` | Set job preferences (roles, location, salary, etc.) | ✅ Day 3 |
| `/dashboard/jobs` | Track jobs, view match scores, filter by status | ✅ Day 3 |
| `/dashboard/cover-letters` | Generate cover letters with Claude | Day 4 |

---

## How It Works

### Resume
Upload a PDF or DOCX (≤10MB), or paste your resume as plain text. Stored in Supabase Storage. Used as context for match scoring.

### Preferences
Set your target roles, preferred locations, work mode (remote/hybrid/on-site), salary, years of experience, and work authorization. Stored in `job_preferences`. Used as context for match scoring.

### Job Tracking
Add jobs by pasting a job title, company, and description. Set status to track where you are in the process (saved → applied → interviewing → offer / rejected).

### Match Scoring
Scoring is deterministic — no AI, no API call. Pure TypeScript in `lib/scoring/job-score.ts`:

| Signal | Points |
|--------|--------|
| Job title keyword overlap with your preferred roles | 0–30 |
| Location match with your preferred locations | 0–20 |
| Work mode match | 0–20 |
| Keyword overlap between resume text and job description | 0–30 |

Scores are calculated on every save and shown as a 0–100 badge on each job card.

---

## Folder Structure

```
app/
  (auth)/              # Login + signup
  dashboard/           # Protected dashboard: layout + all sub-pages
  layout.tsx           # Root layout
  globals.css          # Tailwind base + root CSS vars
  page.tsx             # Landing page

components/
  auth/                # AuthClient — cyberpunk backdrop for auth pages
  dashboard/
    DashboardClient.tsx  # Sidebar nav state
    dashboard.css        # All dashboard styles (scoped to html.dashboard-active)
  landing/             # LandingClient + landing.css (cyberpunk design system)
  layout/              # Sidebar, TopHeader
  ui/                  # shadcn/ui components

lib/
  types.ts             # Shared TypeScript types (Resume, Job, JobPreferences, etc.)
  scoring/
    job-score.ts       # scoreJob() + scoreClass() — deterministic match scoring
  supabase/
    client.ts          # Browser Supabase client (use in 'use client' components)
    server.ts          # Server Supabase client (use in server components)
    middleware.ts      # Session refresh helper
    storage.ts         # uploadResume(), deleteResume()
  utils.ts             # cn() utility

middleware.ts          # Route protection

supabase/
  schema.sql           # Base schema: tables, RLS, triggers
  migrations/
    001_day3.sql       # Day 3 additions (run after schema.sql)

docs/
  PROJECT_CONTEXT.md   # Architecture, flows, env vars, day status
  DB_SCHEMA.md         # All tables, columns, storage bucket docs
  ROADMAP.md           # Day-by-day build plan
```

---

## Project Docs

- [Project Context](docs/PROJECT_CONTEXT.md) — architecture, auth flow, scoring, env vars
- [Database Schema](docs/DB_SCHEMA.md) — all tables, columns, migrations, storage bucket
- [Roadmap](docs/ROADMAP.md) — day-by-day build plan and Day 4 checklist
