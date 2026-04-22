'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthClient } from '@/components/auth/AuthClient'
import { createClient } from '@/lib/supabase/client'

type StrengthLevel = 0 | 1 | 2 | 3 | 4
const STRENGTH_LABELS = ['—', 'WEAK', 'OKAY', 'STRONG', 'ELITE'] as const

function calcStrength(pw: string): StrengthLevel {
  let s = 0
  if (pw.length >= 8) s++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++
  if (/\d/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw) && pw.length >= 12) s++
  return s as StrengthLevel
}

export default function SignupPage() {
  const router = useRouter()
  const [pwVisible, setPwVisible] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [step, setStep] = useState(0) // 0=Account, 1=Done
  const [error, setError] = useState<string | null>(null)
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null)

  const strength = calcStrength(password)

  async function handleOAuth(provider: 'google' | 'github') {
    setOauthLoading(provider)
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting || step > 0) return
    setError(null)
    setSubmitting(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: `${firstName} ${lastName}`.trim() },
      },
    })

    if (authError) {
      setSubmitting(false)
      setError(authError.message)
      return
    }

    setSubmitting(false)
    setStep(1)

    // Brief pause so the user sees the "Welcome aboard ✓" state, then redirect
    setTimeout(() => router.push('/dashboard'), 1000)
  }

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

          {/* Rotating ring decoration */}
          <div className="float-chart" aria-hidden="true" />

          <div>
            <div className="status-line">INITIALIZING · ONBOARDING/01</div>
            <h2>
              Your new<br />
              <span className="gr">job search stack.</span>
            </h2>
            <p className="sub">
              Sixty seconds from here to your first tailored cover letter. No card. No spam. No
              LinkedIn scraping.
            </p>

            <div className="perks">
              <div className="perk">
                <div className="perk-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12l6-9 6 9-6 9-6-9z M15 3l6 9-6 9" />
                  </svg>
                </div>
                <div>
                  <h4>Match scores in seconds</h4>
                  <p>Not a vibes check. Real alignment across skills, seniority, stack and domain.</p>
                </div>
              </div>
              <div className="perk">
                <div className="perk-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h12l4 4v12H4z M8 12h8 M8 16h5" />
                  </svg>
                </div>
                <div>
                  <h4>Cover letters in your voice</h4>
                  <p>Grounded in your resume, tuned to the JD, edited by you — not a generic template.</p>
                </div>
              </div>
              <div className="perk">
                <div className="perk-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2l9 4v6c0 5-4 9-9 10-5-1-9-5-9-10V6l9-4z M9 12l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <h4>Your data, locked down</h4>
                  <p>Supabase RLS on every table. Delete your account and everything is gone.</p>
                </div>
              </div>
            </div>
          </div>

          <div style={{
            fontFamily: 'var(--font-jetbrains-mono), JetBrains Mono, monospace',
            fontSize: '10px',
            letterSpacing: '0.2em',
            color: 'var(--fg-dim)',
            textTransform: 'uppercase',
            opacity: 0.7,
          }}>
            © 2026 Jobber Labs · v1.0.3 · SOC-2 in progress
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

          <div className="status-line">/CREATE ACCOUNT · PRIVATE BETA</div>
          <h1>Create your account</h1>
          <p className="sub">
            One minute setup. We&apos;ll walk you to your first match right after.
          </p>

          {/* Step indicator */}
          <div className="steps-ind" aria-hidden="true">
            <span className={`dot ${step === 0 ? 'active' : 'done'}`}>1</span>
            <span>Account</span>
            <span className={`bar ${step > 0 ? 'done' : ''}`} />
            <span className={`dot ${step === 1 ? 'active' : step > 1 ? 'done' : ''}`}>2</span>
            <span>Resume</span>
            <span className={`bar ${step > 1 ? 'done' : ''}`} />
            <span className={`dot ${step === 2 ? 'active' : step > 2 ? 'done' : ''}`}>3</span>
            <span>Match</span>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} autoComplete="on">
            <div className="two-col">
              <div className="field">
                <label htmlFor="fn">First name</label>
                <input
                  id="fn"
                  type="text"
                  required
                  placeholder="Alex"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  data-hover=""
                />
              </div>
              <div className="field">
                <label htmlFor="ln">Last name</label>
                <input
                  id="ln"
                  type="text"
                  required
                  placeholder="Ramírez"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  data-hover=""
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="email">Work email</label>
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
                minLength={8}
                placeholder="At least 8 characters"
                autoComplete="new-password"
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
              {/* Strength meter */}
              <div className={`strength${password ? ' s' + strength : ''}`}>
                <i /><i /><i /><i />
              </div>
              <div className="strength-label">
                <span>Password strength</span>
                <span>{password ? STRENGTH_LABELS[strength] : '—'}</span>
              </div>
            </div>

            <label className="check" data-hover="">
              <input type="checkbox" required />
              <span>
                I agree to Jobber&apos;s{' '}
                <a href="#" data-hover="">Terms of Service</a> and{' '}
                <a href="#" data-hover="">Privacy Policy</a>.
                I understand my data is encrypted and never sold.
              </span>
            </label>

            <label className="check" data-hover="" style={{ marginTop: '-4px' }}>
              <input type="checkbox" defaultChecked />
              <span>
                Send me product updates and the occasional &ldquo;how&rsquo;s your search
                going?&rdquo; note. Max once a week.
              </span>
            </label>

            {error && (
              <div className="auth-error" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-submit"
              data-hover=""
              disabled={submitting || step > 0}
            >
              {submitting ? (
                <>
                  <span className="spinner" />
                  Provisioning account…
                </>
              ) : step > 0 ? (
                'Welcome aboard ✓'
              ) : (
                <>
                  Create account &amp; continue
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>

            <div className="divider">or sign up with</div>

            <div className="oauth">
              <button
                type="button"
                data-hover=""
                disabled={!!oauthLoading}
                onClick={() => handleOAuth('google')}
              >
                {oauthLoading === 'google' ? <span className="spinner" /> : (
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M21.35 11.1H12v2.8h5.35c-.22 1.4-1.66 4.12-5.35 4.12-3.22 0-5.85-2.66-5.85-5.95s2.63-5.95 5.85-5.95c1.83 0 3.06.78 3.77 1.45l2.57-2.48C16.79 3.64 14.6 2.7 12 2.7 6.94 2.7 2.85 6.79 2.85 12s4.09 9.3 9.15 9.3c5.28 0 8.78-3.71 8.78-8.93 0-.6-.07-1.06-.14-1.5z" />
                  </svg>
                )}
                Google
              </button>
              <button
                type="button"
                data-hover=""
                disabled={!!oauthLoading}
                onClick={() => handleOAuth('github')}
              >
                {oauthLoading === 'github' ? <span className="spinner" /> : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 .3a12 12 0 00-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.8.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 016 0C17 4 18 4.3 18 4.3c.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.5.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0012 .3z" />
                  </svg>
                )}
                GitHub
              </button>
            </div>
          </form>

          <div className="switch">
            Already on Jobber?{' '}
            <Link href="/login" data-hover="">Sign in →</Link>
          </div>
        </main>
      </div>
    </>
  )
}
