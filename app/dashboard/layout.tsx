import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardClient } from '@/components/dashboard/DashboardClient'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopHeader } from '@/components/layout/TopHeader'

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
      <div className="dash-wrap">
        <Sidebar userName={displayName} userEmail={email} />
        <div className="dash-main">
          <TopHeader userName={displayName} />
          <main className="dash-content">{children}</main>
        </div>
      </div>
    </>
  )
}
