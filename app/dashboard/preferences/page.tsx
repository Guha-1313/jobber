import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PreferencesClient } from './PreferencesClient'
import type { JobPreferences } from '@/lib/types'

export default async function PreferencesPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: preferences } = await supabase
    .from('job_preferences')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  return (
    <PreferencesClient
      userId={user.id}
      initialPreferences={(preferences as JobPreferences) ?? null}
    />
  )
}
