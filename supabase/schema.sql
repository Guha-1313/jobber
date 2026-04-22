-- ============================================================
-- Jobber — Initial Database Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================


-- ── Utility: auto-update updated_at on any table ───────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- TABLE: profiles
-- One row per auth user. Created automatically via trigger.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  email       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create a profile row whenever a new auth user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- ============================================================
-- TABLE: resumes
-- Metadata for uploaded resume files.
-- File content lives in Supabase Storage bucket: resumes
-- ============================================================
CREATE TABLE IF NOT EXISTS public.resumes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_path    TEXT NOT NULL,         -- Storage path: {user_id}/{filename}
  file_name    TEXT NOT NULL,         -- Original filename shown to user
  resume_text  TEXT,                  -- Extracted plain text (populated Day 3)
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER resumes_updated_at
  BEFORE UPDATE ON public.resumes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- TABLE: job_preferences
-- User's job search preferences. One row per user.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.job_preferences (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  preferred_titles     TEXT[],             -- e.g. ["Software Engineer", "Backend Dev"]
  preferred_locations  TEXT[],             -- e.g. ["Remote", "New York"]
  work_mode            TEXT,               -- remote | hybrid | onsite
  salary_expectation   INTEGER,            -- annual, in USD
  work_authorization   TEXT,               -- e.g. "US Citizen", "Requires Sponsorship"
  years_experience     INTEGER,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TRIGGER job_preferences_updated_at
  BEFORE UPDATE ON public.job_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- TABLE: jobs
-- Job listings added manually by the user.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.jobs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  company      TEXT NOT NULL,
  location     TEXT,
  work_mode    TEXT,                  -- remote | hybrid | onsite
  apply_url    TEXT,
  salary_range TEXT,
  source       TEXT,                  -- e.g. "LinkedIn", "Greenhouse", "manual"
  description  TEXT,                  -- Full JD text (pasted by user)
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- TABLE: job_matches
-- AI-computed match score between a resume and a job.
-- Populated in Day 3 by the scoring pipeline.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.job_matches (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id      UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  score       INTEGER CHECK (score >= 0 AND score <= 100),
  explanation TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- TABLE: generated_documents
-- AI-generated cover letters and future document types.
-- Populated in Day 4 by the Claude generation pipeline.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.generated_documents (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id         UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  document_type  TEXT NOT NULL DEFAULT 'cover_letter',  -- extensible
  content        TEXT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER generated_documents_updated_at
  BEFORE UPDATE ON public.generated_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- ROW LEVEL SECURITY
-- All tables: users can only read/write their own rows.
-- ============================================================

ALTER TABLE public.profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_preferences    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_matches        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_documents ENABLE ROW LEVEL SECURITY;

-- profiles: users manage their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- resumes
CREATE POLICY "Users can manage own resumes"
  ON public.resumes FOR ALL
  USING (auth.uid() = user_id);

-- job_preferences
CREATE POLICY "Users can manage own preferences"
  ON public.job_preferences FOR ALL
  USING (auth.uid() = user_id);

-- jobs
CREATE POLICY "Users can manage own jobs"
  ON public.jobs FOR ALL
  USING (auth.uid() = user_id);

-- job_matches
CREATE POLICY "Users can read own matches"
  ON public.job_matches FOR ALL
  USING (auth.uid() = user_id);

-- generated_documents
CREATE POLICY "Users can manage own documents"
  ON public.generated_documents FOR ALL
  USING (auth.uid() = user_id);


-- ============================================================
-- STORAGE RLS POLICIES
-- Supabase Storage also requires explicit RLS policies.
-- Files are stored at: {user_id}/{timestamp}-{filename}
-- The first path segment is the user_id folder.
-- ============================================================

CREATE POLICY "Users can upload own resumes"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'resume'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can read own resumes"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'resume'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own resumes"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'resume'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
