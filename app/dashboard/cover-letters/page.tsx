import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CoverLettersClient } from './CoverLettersClient'
import type { GeneratedDocument } from '@/lib/types'

type DocWithJob = GeneratedDocument & {
  job: { title: string; company: string; status: string | null } | null
}

export default async function CoverLettersPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rows } = await supabase
    .from('generated_documents')
    .select('*, jobs(title, company, status)')
    .eq('user_id', user.id)
    .eq('document_type', 'cover_letter')
    .order('created_at', { ascending: false })

  const docs: DocWithJob[] = (rows ?? []).map(row => {
    const { jobs: jobData, ...docFields } = row
    const job = jobData as { title: string; company: string; status: string | null } | null
    return { ...docFields, job }
  })

  return (
    <CoverLettersClient
      userId={user.id}
      initialDocs={docs}
    />
  )
}
