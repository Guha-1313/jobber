import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateCoverLetter } from '@/lib/ai/cover-letter'
import type { Job, JobPreferences, Resume } from '@/lib/types'

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

  // Rate limit: 10 cover letters per user per 24 hours
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { count: usageCount } = await supabase
    .from('generated_documents')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', since)

  if ((usageCount ?? 0) >= 10) {
    return NextResponse.json(
      { error: 'Daily limit reached — you can generate up to 10 cover letters per day. Try again tomorrow.' },
      { status: 429 },
    )
  }

  // Fetch job — verify it belongs to this user
  const { data: job, error: jobErr } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .eq('user_id', user.id)
    .single()

  if (jobErr || !job) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

  // Fetch resume + preferences in parallel
  const [{ data: resumeRow }, { data: preferences }] = await Promise.all([
    supabase
      .from('resumes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('job_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  // Generate cover letter
  let content: string
  try {
    content = await generateCoverLetter(
      job as Job,
      preferences as JobPreferences | null,
      resumeRow as Resume | null,
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Generation failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  // Save to generated_documents
  const { data: doc, error: saveErr } = await supabase
    .from('generated_documents')
    .insert({
      user_id:       user.id,
      job_id:        jobId,
      document_type: 'cover_letter',
      content,
    })
    .select()
    .single()

  if (saveErr) return NextResponse.json({ error: saveErr.message }, { status: 500 })

  return NextResponse.json({ data: doc })
}
