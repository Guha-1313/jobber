import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { JobsClient } from './JobsClient'
import type { JobPreferences, JobWithMatch, Resume } from '@/lib/types'

export default async function JobsPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch jobs with their latest match score
  const { data: jobRows } = await supabase
    .from('jobs')
    .select('*, job_matches(score, explanation)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const jobs: JobWithMatch[] = (jobRows ?? []).map(row => {
    const matches = (row.job_matches as { score: number; explanation: string | null }[]) ?? []
    const match = matches[0] ?? null
    const { job_matches: _jm, ...jobFields } = row
    void _jm
    return { ...jobFields, match }
  })

  // Fetch preferences, resume, and existing cover letters in parallel
  const [{ data: preferences }, { data: resumeRow }, { data: letterRows }] = await Promise.all([
    supabase
      .from('job_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle(),
    supabase
      .from('resumes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('generated_documents')
      .select('id, job_id')
      .eq('user_id', user.id)
      .eq('document_type', 'cover_letter')
      .order('created_at', { ascending: false }),
  ])

  // Build a map: job_id → most recent doc id (one per job is enough for the UI)
  const letterMap: Record<string, string> = {}
  for (const row of letterRows ?? []) {
    if (row.job_id && !letterMap[row.job_id]) {
      letterMap[row.job_id] = row.id
    }
  }

  return (
    <JobsClient
      userId={user.id}
      initialJobs={jobs}
      preferences={(preferences as JobPreferences) ?? null}
      resume={(resumeRow as Resume) ?? null}
      initialLetterMap={letterMap}
    />
  )
}
