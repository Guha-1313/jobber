-- ============================================================
-- Jobber — Day 3 Schema Migrations
-- Run this in Supabase SQL Editor after the initial schema
-- ============================================================

-- 1. Add status column to jobs (saved → applied → interviewing → offer → rejected)
ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'saved';

-- 2. Make resumes.file_path and file_name nullable
--    (allows text-only resume entries without a file upload)
ALTER TABLE public.resumes
  ALTER COLUMN file_path DROP NOT NULL;

ALTER TABLE public.resumes
  ALTER COLUMN file_name DROP NOT NULL;

-- 3. Add unique constraint on job_matches.job_id
--    (one match record per job — enables clean upsert)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'job_matches_job_id_unique'
  ) THEN
    ALTER TABLE public.job_matches
      ADD CONSTRAINT job_matches_job_id_unique UNIQUE (job_id);
  END IF;
END$$;
