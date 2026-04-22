'use client'

import { useEffect } from 'react'
import './dashboard.css'

export function DashboardClient() {
  useEffect(() => {
    const root = document.documentElement
    root.classList.add('dashboard-active')

    return () => {
      root.classList.remove('dashboard-active')
    }
  }, [])

  return null
}
