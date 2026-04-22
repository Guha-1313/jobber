import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeJob } from '@/lib/ai/analyze-job'
import type { Job, Resume } from '@/lib/types'

export async function POST(req: NextRequest) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let jobId: string
  try {
    const body = await req.json() as { job_id?: unknown }
    jobId = typeof body.job_id === 'string' ? body.job_id.trim() : ''
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  if (!jobId) return NextResponse.json({ error: 'job_id is required' }, { status: 400 })

  const [{ data: job, error: jobErr }, { data: resumeRow }] = await Promise.all([
    supabase.from('jobs').select('*').eq('id', jobId).eq('user_id', user.id).single(),
    supabase.from('resumes').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false }).limit(1).maybeSingle(),
  ])

  if (jobErr || !job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

  const analysis = await analyzeJob(job as Job, resumeRow as Resume | null)

  const { data: existing } = await supabase
    .from('job_matches').select('id').eq('job_id', jobId).maybeSingle()

  if (existing?.id) {
    await supabase.from('job_matches').update({ analysis }).eq('id', existing.id)
  } else {
    await supabase.from('job_matches').insert({ user_id: user.id, job_id: jobId, analysis })
  }

  return NextResponse.json({ data: analysis })
}
