# Database Schema

All tables live in Supabase (Postgres). Row Level Security (RLS) is enabled on every table — users can only read and write their own rows.

Run `supabase/schema.sql` in the Supabase SQL Editor to create everything, then run `supabase/migrations/001_day3.sql` for Day 3 additions.

---

## profiles

Extends `auth.users` with display info. **Created automatically** via a Postgres trigger when a new user signs up.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, FK → auth.users.id |
| full_name | text | From signup form meta |
| email | text | Copied from auth.users |
| created_at | timestamptz | Auto |
| updated_at | timestamptz | Auto-updated on change |

---

## resumes

Metadata for resume files. The file itself lives in Supabase Storage (`resume` bucket). Both `file_path` and `file_name` are nullable — users can save text-only resumes without uploading a file.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → profiles.id |
| file_path | text \| null | Storage path: `{user_id}/{timestamp}-{filename}` |
| file_name | text \| null | Original filename shown to the user |
| resume_text | text \| null | Plain text content (pasted or extracted) |
| created_at | timestamptz | Auto |
| updated_at | timestamptz | Auto-updated on change |

**Day 3 migration:** `file_path` and `file_name` were made nullable to allow text-only entries.

---

## job_preferences

One row per user (enforced by UNIQUE constraint on `user_id`). Saved via upsert.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → profiles.id, UNIQUE |
| preferred_titles | text[] | e.g. `["Software Engineer", "Backend Dev"]` |
| preferred_locations | text[] | e.g. `["Remote", "New York"]` |
| work_mode | text \| null | remote \| hybrid \| onsite |
| salary_expectation | integer \| null | Annual, in USD |
| work_authorization | text \| null | e.g. "US Citizen", "Requires Sponsorship" |
| years_experience | integer \| null | |
| created_at | timestamptz | Auto |
| updated_at | timestamptz | Auto-updated on change |

---

## jobs

Job listings added manually by the user.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → profiles.id |
| title | text | Job title (required) |
| company | text | Company name (required) |
| location | text \| null | |
| work_mode | text \| null | remote \| hybrid \| onsite |
| status | text \| null | saved \| applied \| interviewing \| offer \| rejected (default: 'saved') |
| apply_url | text \| null | Optional application URL |
| salary_range | text \| null | e.g. "$120k–$150k" |
| source | text \| null | e.g. "LinkedIn", "manual" |
| description | text \| null | Full JD text (pasted by user) |
| created_at | timestamptz | Auto |
| updated_at | timestamptz | Auto-updated on change |

**Day 3 migration:** `status` column added (`ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'saved'`).

---

## job_matches

Deterministic match score between a user's resume and a job. Populated when a job is saved or when the user clicks "Recalculate all scores".

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → profiles.id |
| job_id | uuid | FK → jobs.id, UNIQUE |
| score | integer | 0–100 |
| explanation | text \| null | Human-readable breakdown of the score |
| created_at | timestamptz | Auto |

**Day 3 migration:** UNIQUE constraint added on `job_id` to allow clean upserts.

Scoring is deterministic (no AI) — see `lib/scoring/job-score.ts` and `docs/PROJECT_CONTEXT.md` for the breakdown.

---

## generated_documents

AI-generated cover letters. Populated in Day 4.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → profiles.id |
| job_id | uuid \| null | FK → jobs.id (SET NULL on delete) |
| document_type | text | `cover_letter` (extensible) |
| content | text | Full generated text |
| created_at | timestamptz | Auto |
| updated_at | timestamptz | Auto-updated on change |

---

## Supabase Storage

| Bucket | Access | Path pattern |
|--------|--------|--------------|
| `resume` | Private | `{user_id}/{timestamp}-{filename}` |

Files are accessed via **signed URLs** (60-second expiry). See `lib/supabase/storage.ts`.

Allowed MIME types: `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

---

## Auto-Profile Trigger

```sql
-- Runs automatically after every INSERT on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

Copies `full_name` from signup metadata and `email` from the auth row into `public.profiles`.

---

## Day 3 Migration

Run `supabase/migrations/001_day3.sql` in the Supabase SQL Editor after the initial schema:

```sql
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'saved';
ALTER TABLE public.resumes ALTER COLUMN file_path DROP NOT NULL;
ALTER TABLE public.resumes ALTER COLUMN file_name DROP NOT NULL;
ALTER TABLE public.job_matches ADD CONSTRAINT IF NOT EXISTS job_matches_job_id_unique UNIQUE (job_id);
```
