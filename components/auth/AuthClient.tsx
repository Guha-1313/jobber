'use client'

import { useEffect } from 'react'
import '../landing/landing.css'

export function AuthClient() {
  useEffect(() => {
    const root = document.documentElement
    root.classList.add('landing-active')
    root.setAttribute('data-theme', 'dark')

    const applyHue = (h: number) => {
      root.style.setProperty('--blue', `hsl(${h} 100% 60%)`)
      root.style.setProperty('--blue-2', `hsl(${h} 100% 70%)`)
    }
    const applyGrain = (v: number) =>
      root.style.setProperty('--noise-opacity', (v / 100).toString())
    const applyMotion = (v: number) =>
      root.style.setProperty('--motion', (v / 10).toString())

    applyHue(220)
    applyGrain(7)
    applyMotion(8)

    // Stars
    const starsEl = document.getElementById('stars')
    const starNodes: HTMLElement[] = []
    if (starsEl) {
      for (let i = 0; i < 120; i++) {
        const s = document.createElement('div')
        s.className = 'star'
        s.style.left = Math.random() * 100 + '%'
        s.style.top = Math.random() * 100 + '%'
        s.style.setProperty('--d', 2 + Math.random() * 4 + 's')
        s.style.animationDelay = Math.random() * 3 + 's'
        const sz = Math.random() * 2 + 1 + 'px'
        s.style.width = sz
        s.style.height = sz
        starsEl.appendChild(s)
        starNodes.push(s)
      }
    }

    // Theme toggle
    const themeBtn = document.getElementById('themeToggle')
    const handleTheme = () => {
      const t = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
      root.setAttribute('data-theme', t)
    }
    themeBtn?.addEventListener('click', handleTheme)

    // Canvas cursor
    const coreEl = document.getElementById('core')
    const ringEl = document.getElementById('ring')
    const canvasEl = document.getElementById('pcanvas') as HTMLCanvasElement | null

    type Particle = { x: number; y: number; vx: number; vy: number; life: number; r: number }
    const particles: Particle[] = []
    let rafId = 0
    let mx = innerWidth / 2, my = innerHeight / 2
    let tx = mx, ty = my, rx = mx, ry = my
    let W = innerWidth, H = innerHeight
    let trailLen = 30

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
        const maxLife = trailLen / 30
        const blue = getComputedStyle(root).getPropertyValue('--blue').trim() || '#1E6BFF'
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i]
          p.x += p.vx; p.y += p.vy; p.life -= 0.025 / maxLife
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

    // Progress + parallax
    const progress = document.getElementById('progress')
    const gridBg = document.getElementById('gridBg')
    const orbs = document.querySelectorAll<HTMLElement>('.orb')

    const handleScroll = () => {
      const sy = window.scrollY
      const h = root.scrollHeight - innerHeight
      const p = h > 0 ? Math.min(1, sy / h) : 0
      if (progress) progress.style.width = p * 100 + '%'
      if (gridBg) gridBg.style.setProperty('--grid-y', sy * 0.25 + 'px')
      if (orbs[0]) orbs[0].style.transform = `translateY(${sy * 0.15}px)`
      if (orbs[1]) orbs[1].style.transform = `translateY(${sy * -0.1}px)`
      if (orbs[2]) orbs[2].style.transform = `translateY(${sy * 0.2}px)`
    }
    addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    // Tweaks panel
    document.getElementById('hueSwatches')?.addEventListener('click', e => {
      const sw = (e.target as Element).closest<HTMLElement>('.sw')
      if (!sw) return
      document.querySelectorAll('.sw').forEach(x => x.classList.remove('active'))
      sw.classList.add('active')
      applyHue(parseInt(sw.dataset.hue ?? '220', 10))
    })
    const motSl = document.getElementById('motionSlider') as HTMLInputElement | null
    const grnSl = document.getElementById('grainSlider') as HTMLInputElement | null
    const trlSl = document.getElementById('trailSlider') as HTMLInputElement | null
    motSl?.addEventListener('input', e => {
      const v = +(e.target as HTMLInputElement).value
      const mv = document.getElementById('motionVal'); if (mv) mv.textContent = String(v)
      applyMotion(v)
    })
    grnSl?.addEventListener('input', e => applyGrain(+(e.target as HTMLInputElement).value))
    trlSl?.addEventListener('input', e => {
      trailLen = +(e.target as HTMLInputElement).value
      const tv = document.getElementById('trailVal'); if (tv) tv.textContent = String(trailLen)
    })

    return () => {
      root.classList.remove('landing-active')
      root.removeAttribute('data-theme')
      cancelAnimationFrame(rafId)
      removeEventListener('resize', handleResize)
      removeEventListener('mousemove', handleMouseMove)
      removeEventListener('mouseover', handleOver)
      removeEventListener('mouseout', handleOut)
      removeEventListener('scroll', handleScroll)
      starNodes.forEach(s => s.remove())
    }
  }, [])

  return null
}
