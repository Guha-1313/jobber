'use client'

import { useEffect, useRef } from 'react'

export function CursorEffect() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    /* Hide default cursor while this component is mounted */
    document.documentElement.classList.add('cursor-custom')

    let mouseX = -100
    let mouseY = -100
    let ringX = -100
    let ringY = -100
    let rafId: number

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      /* Dot follows instantly */
      dot.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`
    }

    /* Ring lerps behind the cursor */
    const lerp = () => {
      ringX += (mouseX - ringX) * 0.1
      ringY += (mouseY - ringY) * 0.1
      ring.style.transform = `translate(${ringX}px, ${ringY}px)`
      rafId = requestAnimationFrame(lerp)
    }

    const onEnter = () => ring.classList.add('cursor-ring--hovered')
    const onLeave = () => ring.classList.remove('cursor-ring--hovered')

    document.addEventListener('mousemove', onMove)

    const updateListeners = () => {
      document.querySelectorAll('a, button, [role="button"]').forEach((el) => {
        el.removeEventListener('mouseenter', onEnter)
        el.removeEventListener('mouseleave', onLeave)
        el.addEventListener('mouseenter', onEnter)
        el.addEventListener('mouseleave', onLeave)
      })
    }

    updateListeners()
    rafId = requestAnimationFrame(lerp)

    return () => {
      document.documentElement.classList.remove('cursor-custom')
      document.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" />
    </>
  )
}
