'use client'

import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { TopHeader } from './TopHeader'

interface DashboardShellProps {
  children: React.ReactNode
  userName: string
  userEmail: string
}

export function DashboardShell({ children, userName, userEmail }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="dash-wrap">
      {sidebarOpen && (
        <div className="dash-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}
      <Sidebar
        userName={userName}
        userEmail={userEmail}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="dash-main">
        <TopHeader
          userName={userName}
          onMenuToggle={() => setSidebarOpen(o => !o)}
        />
        <main className="dash-content">{children}</main>
      </div>
    </div>
  )
}
