import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardClient } from '@/components/dashboard/DashboardClient'
import { DashboardShell } from '@/components/layout/DashboardShell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .single()

  const displayName = profile?.full_name ?? user.email?.split('@')[0] ?? 'User'
  const email = profile?.email ?? user.email ?? ''

  return (
    <>
      <DashboardClient />
      <canvas className="particles" id="pcanvas" />
      <div className="cursor-ring" id="ring" />
      <div className="cursor-core" id="core" />
      <DashboardShell userName={displayName} userEmail={email}>
        {children}
      </DashboardShell>
    </>
  )
}
