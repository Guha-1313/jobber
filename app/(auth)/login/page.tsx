'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthClient } from '@/components/auth/AuthClient'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [pwVisible, setPwVisible] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting || done) return
    setError(null)
    setSubmitting(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setSubmitting(false)
      setError(authError.message)
      return
    }

    setDone(true)
    router.push('/dashboard')
  }

  // Reset on unmount
  useEffect(() => () => { setDone(false) }, [])

  return (
    <>
      <AuthClient />

      {/* Progress bar */}
      <div className="progress" id="progress" />

      {/* Backdrop */}
      <div className="backdrop" aria-hidden="true">
        <div className="grid-bg" id="gridBg" />
        <div className="stars" id="stars" />
        <div className="orb a" />
        <div className="orb b" />
        <div className="orb c" />
      </div>
      <div className="scanlines" aria-hidden="true" />
      <div className="noise" aria-hidden="true" />

      {/* Cursor */}
      <canvas className="particles" id="pcanvas" />
      <div className="cursor-ring" id="ring" />
      <div className="cursor-core" id="core" />

      {/* Split layout */}
      <div className="auth-wrap">

        {/* ── ART PANEL ── */}
        <aside className="auth-art">
          <div className="auth-brand">
            <div className="logo-mark" />
            Jobber
          </div>

          {/* Animated orb decoration */}
          <div className="mini-demo" aria-hidden="true">
            <div className="orb-core" />
          </div>

          <div style={{ position: 'relative', zIndex: 2 }}>
            <div className="status-line">SECURE SESSION · SUPABASE AUTH</div>
            <h2>
              Welcome back.<br />
              <span className="gr">Pick up where you left off.</span>
            </h2>
            <p className="sub">
              Your pipeline is waiting. Match scores, cover letters, and tracked jobs — exactly
              where you left them.
            </p>
            <div className="auth-foot-stats">
              <div className="stat">
                <b>12,847</b>
                <span>jobs matched</span>
              </div>
              <div className="stat">
                <b>87%</b>
                <span>avg match</span>
              </div>
              <div className="stat">
                <b>2.1s</b>
                <span>per score</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ── FORM PANEL ── */}
        <main className="auth-form-wrap">
          <div className="top-right">
            <button
              className="theme-toggle"
              id="themeToggle"
              aria-label="Toggle theme"
              data-hover=""
            />
            <Link href="/" className="btn" data-hover="">← Back</Link>
          </div>

          <div className="status-line">/ACCESS · PRIVATE BETA</div>
          <h1>Sign in to Jobber</h1>
          <p className="sub">
            Your resumes, scores and letters — exactly where you left them.
          </p>

          <form className="auth-form" onSubmit={handleSubmit} autoComplete="on">
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                placeholder="alex@domain.com"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                data-hover=""
              />
            </div>

            <div className="field">
              <label htmlFor="pw">Password</label>
              <input
                id="pw"
                type={pwVisible ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                data-hover=""
              />
              <button
                type="button"
                className="toggle-pw"
                data-hover=""
                onClick={() => setPwVisible(v => !v)}
              >
                {pwVisible ? 'HIDE' : 'SHOW'}
              </button>
            </div>

            <div className="row-between">
              <label className="check" data-hover="">
                <input type="checkbox" defaultChecked />
                <span>Keep me signed in</span>
              </label>
              <a href="#" className="forgot" data-hover="">Forgot?</a>
            </div>

            {error && (
              <div className="auth-error" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-submit"
              data-hover=""
              disabled={submitting || done}
            >
              {submitting ? (
                <>
                  <span className="spinner" />
                  Authenticating…
                </>
              ) : done ? (
                'Redirecting… ✓'
              ) : (
                <>
                  Enter dashboard
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>

            <div className="divider">or continue with</div>

            <div className="oauth">
              <button type="button" data-hover="">
                <svg width="16" height="16" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M21.35 11.1H12v2.8h5.35c-.22 1.4-1.66 4.12-5.35 4.12-3.22 0-5.85-2.66-5.85-5.95s2.63-5.95 5.85-5.95c1.83 0 3.06.78 3.77 1.45l2.57-2.48C16.79 3.64 14.6 2.7 12 2.7 6.94 2.7 2.85 6.79 2.85 12s4.09 9.3 9.15 9.3c5.28 0 8.78-3.71 8.78-8.93 0-.6-.07-1.06-.14-1.5z" />
                </svg>
                Google
              </button>
              <button type="button" data-hover="">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 .3a12 12 0 00-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.8.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 016 0C17 4 18 4.3 18 4.3c.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.5.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0012 .3z" />
                </svg>
                GitHub
              </button>
            </div>
          </form>

          <div className="switch">
            New to Jobber?{' '}
            <Link href="/signup" data-hover="">Create an account →</Link>
          </div>

          <div className="auth-terms">
            By continuing you accept our{' '}
            <a href="#" data-hover="">Terms</a> and{' '}
            <a href="#" data-hover="">Privacy Policy</a>.
          </div>
        </main>
      </div>
    </>
  )
}
