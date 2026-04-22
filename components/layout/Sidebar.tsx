'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Settings,
  Mail,
  LogOut,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Jobs', href: '/dashboard/jobs', icon: Briefcase },
  { label: 'Resume', href: '/dashboard/resume', icon: FileText },
  { label: 'Preferences', href: '/dashboard/preferences', icon: Settings },
  { label: 'Cover Letters', href: '/dashboard/cover-letters', icon: Mail },
]

interface SidebarProps {
  userName: string
  userEmail: string
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ userName, userEmail, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const initials = userName
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U'

  return (
    <aside className={`dash-sidebar${isOpen ? ' mobile-open' : ''}`}>
      {/* Logo */}
      <div className="dash-logo">
        Jobber<span className="dash-logo-dot">.</span>
      </div>

      {/* Nav */}
      <nav className="dash-nav">
        <div className="dash-nav-section">Navigation</div>

        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`dash-nav-item${isActive ? ' active' : ''}`}
              onClick={onClose}
            >
              <item.icon className="dash-nav-icon" width={16} height={16} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User + Sign out */}
      <div className="dash-user-section">
        <div className="dash-user-row">
          <div className="dash-avatar">{initials}</div>
          <div style={{ minWidth: 0 }}>
            <div className="dash-user-name">{userName}</div>
            <div className="dash-user-email">{userEmail}</div>
          </div>
        </div>

        <button onClick={handleSignOut} className="dash-signout">
          <LogOut width={15} height={15} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
