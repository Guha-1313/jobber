-- Migration 002: add employment_type to job_preferences
-- Run this in the Supabase SQL Editor after 001_day3.sql

ALTER TABLE public.job_preferences
  ADD COLUMN IF NOT EXISTS employment_type TEXT;
