'use client'

import { usePathname } from 'next/navigation'
import { Bell, Menu } from 'lucide-react'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Overview',
  '/dashboard/jobs': 'Jobs',
  '/dashboard/resume': 'Resume',
  '/dashboard/preferences': 'Preferences',
  '/dashboard/cover-letters': 'Cover Letters',
}

interface TopHeaderProps {
  userName: string
  onMenuToggle: () => void
}

export function TopHeader({ userName, onMenuToggle }: TopHeaderProps) {
  const pathname = usePathname()
  const title = pageTitles[pathname] ?? 'Dashboard'

  const initials = userName
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U'

  return (
    <header className="dash-header">
      <div className="dash-header-left">
        <button aria-label="Open menu" className="dash-menu-btn" onClick={onMenuToggle}>
          <Menu width={18} height={18} />
        </button>
        <div className="dash-header-title">
          <span>/</span>{title.toUpperCase()}
        </div>
      </div>

      <div className="dash-header-actions">
        <button aria-label="Notifications" className="dash-icon-btn">
          <Bell width={16} height={16} />
        </button>

        <div title={userName} className="dash-header-avatar">
          {initials}
        </div>
      </div>
    </header>
  )
}
