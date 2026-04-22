// Shared TypeScript types matching the Supabase database schema

export type Resume = {
  id: string
  user_id: string
  file_path: string | null
  file_name: string | null
  resume_text: string | null
  created_at: string
  updated_at: string
}

export type JobPreferences = {
  id: string
  user_id: string
  preferred_titles: string[] | null    // stores selected category keys
  preferred_locations: string[] | null
  work_mode: string | null
  employment_type: string | null       // full-time | part-time | internship
  salary_expectation: number | null
  work_authorization: string | null
  years_experience: number | null
  created_at: string
  updated_at: string
}

export type Job = {
  id: string
  user_id: string
  title: string
  company: string
  location: string | null
  work_mode: string | null
  status: string | null
  apply_url: string | null
  salary_range: string | null
  source: string | null
  description: string | null
  created_at: string
  updated_at: string
}

export type JobMatch = {
  id: string
  user_id: string
  job_id: string
  score: number
  explanation: string | null
  created_at: string
}

export type JobAnalysis = {
  employment_type: 'full-time' | 'part-time' | 'internship' | 'contract' | 'unknown'
  sponsorship:     'yes' | 'no' | 'unknown'
  required_skills: string[]
  matched_skills:  string[]
  missing_skills:  string[]
}

export type JobWithMatch = Job & {
  match: { score: number; explanation: string | null; analysis: JobAnalysis | null } | null
}

export type GeneratedDocument = {
  id: string
  user_id: string
  job_id: string | null
  document_type: string
  content: string
  created_at: string
  updated_at: string
}
