import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ResumeClient } from './ResumeClient'
import type { Resume } from '@/lib/types'

export default async function ResumePage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: resume } = await supabase
    .from('resumes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return <ResumeClient userId={user.id} initialResume={(resume as Resume) ?? null} />
}
