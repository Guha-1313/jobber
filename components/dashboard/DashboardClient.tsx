'use client'

import { useEffect } from 'react'
import './dashboard.css'

export function DashboardClient() {
  useEffect(() => {
    const root = document.documentElement
    root.classList.add('dashboard-active')

    const coreEl = document.getElementById('core')
    const ringEl = document.getElementById('ring')
    const canvasEl = document.getElementById('pcanvas') as HTMLCanvasElement | null

    type Particle = { x: number; y: number; vx: number; vy: number; life: number; r: number }
    const particles: Particle[] = []
    let rafId = 0
    let mx = innerWidth / 2, my = innerHeight / 2
    let tx = mx, ty = my, rx = mx, ry = my
    let W = innerWidth, H = innerHeight

    const handleResize = () => {
      if (canvasEl) { W = canvasEl.width = innerWidth; H = canvasEl.height = innerHeight }
    }
    const handleMouseMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY
      const spd = Math.hypot(e.movementX, e.movementY)
      const count = Math.min(3, Math.max(1, Math.floor(spd / 8)))
      for (let i = 0; i < count; i++) {
        particles.push({
          x: mx + (Math.random() - 0.5) * 4, y: my + (Math.random() - 0.5) * 4,
          vx: (Math.random() - 0.5) * 1.2, vy: (Math.random() - 0.5) * 1.2,
          life: 1, r: Math.random() * 2 + 1,
        })
      }
    }
    const handleOver = (e: MouseEvent) => {
      if ((e.target as Element).closest?.('[data-hover], a, button, input'))
        coreEl?.classList.add('hover')
    }
    const handleOut = (e: MouseEvent) => {
      if ((e.target as Element).closest?.('[data-hover], a, button, input'))
        coreEl?.classList.remove('hover')
    }

    if (coreEl && canvasEl) {
      const ctx = canvasEl.getContext('2d')!
      canvasEl.width = W; canvasEl.height = H
      addEventListener('resize', handleResize)
      addEventListener('mousemove', handleMouseMove)
      addEventListener('mouseover', handleOver)
      addEventListener('mouseout', handleOut)

      const tick = () => {
        tx += (mx - tx) * 0.5; ty += (my - ty) * 0.5
        rx += (mx - rx) * 0.15; ry += (my - ry) * 0.15
        coreEl.style.transform = `translate(${tx}px,${ty}px) translate(-50%,-50%)`
        if (ringEl) ringEl.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`
        ctx.clearRect(0, 0, W, H)
        const blue = getComputedStyle(root).getPropertyValue('--d-blue').trim() || '#1E6BFF'
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i]
          p.x += p.vx; p.y += p.vy; p.life -= 0.025
          if (p.life <= 0) { particles.splice(i, 1); continue }
          ctx.beginPath()
          ctx.fillStyle = blue; ctx.globalAlpha = p.life * 0.9
          ctx.shadowColor = blue; ctx.shadowBlur = 12
          ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.globalAlpha = 1; ctx.shadowBlur = 0
        rafId = requestAnimationFrame(tick)
      }
      tick()
    }

    return () => {
      root.classList.remove('dashboard-active')
      cancelAnimationFrame(rafId)
      removeEventListener('resize', handleResize)
      removeEventListener('mousemove', handleMouseMove)
      removeEventListener('mouseover', handleOver)
      removeEventListener('mouseout', handleOut)
    }
  }, [])

  return null
}
