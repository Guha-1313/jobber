-- Add AI analysis column to job_matches
ALTER TABLE job_matches ADD COLUMN IF NOT EXISTS analysis JSONB;
