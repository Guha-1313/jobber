import Link from 'next/link'
import { LandingClient } from '@/components/landing/LandingClient'

export default function LandingPage() {
  return (
    <>
      {/* LandingClient imports CSS + runs all JS interactions */}
      <LandingClient />

      {/* Scroll progress bar */}
      <div className="progress" id="progress" />

      {/* Animated backdrop: grid floor + stars + orbs */}
      <div className="backdrop" aria-hidden="true">
        <div className="grid-bg" id="gridBg" />
        <div className="stars" id="stars" />
        <div className="orb a" />
        <div className="orb b" />
        <div className="orb c" />
      </div>
      <div className="scanlines" aria-hidden="true" />
      <div className="noise" aria-hidden="true" />

      {/* Custom cursor elements */}
      <canvas className="particles" id="pcanvas" />
      <div className="cursor-ring" id="ring" />
      <div className="cursor-core" id="core" />

      {/* ── NAV ─────────────────────────────────────── */}
      <nav className="nav">
        <div className="logo">
          <div className="logo-mark" />
          Jobber
        </div>
        <div className="links">
          <a href="#how" data-hover="">How it works</a>
          <a href="#features" data-hover="">Features</a>
          <a href="#" data-hover="">Changelog</a>
        </div>
        <div className="right">
          <button className="theme-toggle" id="themeToggle" aria-label="Toggle theme" data-hover="" />
          <Link href="/login" className="btn" data-hover="">Sign in</Link>
          <Link href="/signup" className="btn btn-primary" data-hover="">Sign up →</Link>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="hero">
        <div className="eyebrow">
          <span className="dot" />
          v1.0 · Now in private beta
        </div>

        <h1 className="headline">
          <span className="line">
            <span className="word">Land</span>{' '}
            <span className="word accent">the job.</span>
          </span>
          <span className="line">
            <span className="word">Skip</span>{' '}
            <span className="word glitch" data-text="the grind.">the grind.</span>
          </span>
        </h1>

        <p className="sub">
          Upload your resume. Paste any job description. Jobber scores the match, writes a tailored
          cover letter, and keeps your pipeline moving — all in one dashboard.
        </p>

        <div className="hero-cta">
          <Link href="/signup" className="btn btn-primary btn-lg" data-hover="">
            Start free →
          </Link>
          <button className="btn btn-lg" data-hover="">
            <span className="kbd">⌘</span>{' '}
            <span className="kbd">K</span>
            &nbsp; Watch 60s demo
          </button>
        </div>

        {/* Terminal preview */}
        <div className="terminal-wrap tilt" id="heroTerminal">
          <div className="terminal">
            <div className="terminal-bar">
              <div className="dots">
                <span /><span /><span />
              </div>
              <div className="path">jobber ~/senior-frontend-stripe</div>
              <div>● live</div>
            </div>
            <div className="terminal-body" id="term">
              <span className="tb-line">
                <span className="prompt">$</span>{' '}
                jobber match ./resume.pdf &quot;Senior Frontend, Stripe&quot;
              </span>
              <span className="tb-line">
                <span className="dim">→ parsing resume...</span>{' '}
                <span className="ok">done · 412 tokens</span>
              </span>
              <span className="tb-line">
                <span className="dim">→ analyzing JD...</span>{' '}
                <span className="ok">done · 7 requirements</span>
              </span>
              <span className="tb-line">
                <span className="dim">→ scoring alignment...</span>
              </span>
              <span className="tb-line">
                {'  '}<span className="score">■■■■■■■■■■■■■■■■■■□□</span>{' '}
                <span className="ok">87%</span>
              </span>
              <span className="tb-line">
                <span className="dim">→ generating cover letter...</span>{' '}
                <span className="ok">done · 284 words</span>
              </span>
              <span className="tb-line">
                <span className="prompt">$</span>{' '}
                <span className="caret" />
              </span>
            </div>
          </div>
        </div>

        {/* Marquee */}
        <div className="marquee">
          <div className="marquee-track">
            <span>AI match scoring</span>
            <span>Tailored cover letters</span>
            <span>One dashboard</span>
            <span>No auto-apply spam</span>
            <span>Supabase auth</span>
            <span>Claude powered</span>
            <span>AI match scoring</span>
            <span>Tailored cover letters</span>
            <span>One dashboard</span>
            <span>No auto-apply spam</span>
            <span>Supabase auth</span>
            <span>Claude powered</span>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────── */}
      <section className="how" id="how">
        <div className="how-inner">
          <div className="fade-up">
            <div className="section-eyebrow">Workflow / 003</div>
            <h2 className="section-title">
              Three moves<br />from resume to reply.
            </h2>
            <p className="section-sub">
              No scraping. No spam-apply. Just the three steps that actually move the needle —
              done in seconds instead of hours.
            </p>
          </div>

          <div className="how-stage" id="howStage">
            <div className="how-sticky">
              {/* Step buttons */}
              <div className="how-left">
                <button type="button" className="step active" data-step="0" data-hover="">
                  <div className="num">STEP / 01</div>
                  <h3>Drop your resume</h3>
                  <p>PDF, DOCX, whatever. We parse it once, cache the extracted text, and you never re-upload.</p>
                </button>
                <button type="button" className="step" data-step="1" data-hover="">
                  <div className="num">STEP / 02</div>
                  <h3>Paste a job description</h3>
                  <p>Claude scores 0–100 across skills, seniority, stack and domain. You see exactly what&apos;s missing.</p>
                </button>
                <button type="button" className="step" data-step="2" data-hover="">
                  <div className="num">STEP / 03</div>
                  <h3>Generate the cover letter</h3>
                  <p>Tailored to the JD, grounded in your actual resume. Edit, export, send.</p>
                </button>
              </div>

              {/* Scene panels */}
              <div className="how-right">
                {/* Scene 1: upload */}
                <div className="scene active" data-scene="0">
                  <div className="scene-card">
                    <div className="upload-zone">
                      <div className="upload-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 3v14M5 10l7-7 7 7M5 21h14" />
                        </svg>
                      </div>
                      <div className="filename">alex_ramirez_resume.pdf</div>
                      <div className="meta">412 KB · extracting text</div>
                      <div className="upload-progress" />
                    </div>
                  </div>
                </div>

                {/* Scene 2: match */}
                <div className="scene" data-scene="1">
                  <div className="scene-card match-scene">
                    <div className="match-head">
                      <h4>Senior Frontend Engineer</h4>
                      <div className="co">STRIPE · REMOTE</div>
                    </div>
                    <div className="match-score">
                      <div className="score-ring">
                        <svg viewBox="0 0 100 100">
                          <defs>
                            <linearGradient id="scoreGrad" x1="0" x2="1">
                              <stop offset="0" stopColor="#1E6BFF" />
                              <stop offset="1" stopColor="#00E5FF" />
                            </linearGradient>
                          </defs>
                          <circle className="track" cx="50" cy="50" r="45" />
                          <circle className="prog" cx="50" cy="50" r="45" />
                        </svg>
                        <div className="num">87</div>
                      </div>
                      <div className="match-breakdown">
                        <div className="bar">
                          <span className="lbl">React</span>
                          <span className="track"><i style={{ width: '96%' }} /></span>
                          <span>96</span>
                        </div>
                        <div className="bar">
                          <span className="lbl">TypeScript</span>
                          <span className="track"><i style={{ width: '92%' }} /></span>
                          <span>92</span>
                        </div>
                        <div className="bar">
                          <span className="lbl">Payments</span>
                          <span className="track"><i style={{ width: '64%' }} /></span>
                          <span>64</span>
                        </div>
                        <div className="bar">
                          <span className="lbl">Seniority</span>
                          <span className="track"><i style={{ width: '88%' }} /></span>
                          <span>88</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="match-head" style={{ marginTop: '4px' }}>
                        <div className="co">SIGNALS DETECTED</div>
                      </div>
                      <div className="match-tags">
                        <span className="tag on">React 18</span>
                        <span className="tag on">TypeScript</span>
                        <span className="tag on">Design systems</span>
                        <span className="tag on">A11y</span>
                        <span className="tag">Stripe API</span>
                        <span className="tag">Subscriptions</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scene 3: cover letter */}
                <div className="scene" data-scene="2">
                  <div className="scene-card letter-scene">
                    <div className="letter-head">
                      <span className="live">GENERATING</span>
                      <span>cover_letter · stripe_senior_frontend.md</span>
                    </div>
                    <div className="letter-body" id="letterBody">
                      <div className="para">Dear Stripe Hiring Team,</div>
                      <div className="para">
                        I&apos;ve spent the last four years shipping{' '}
                        <span className="hl">React + TypeScript</span> at consumer-facing scale —
                        most recently leading a{' '}
                        <span className="hl">design-system migration</span> across 140+ components
                        with measurable gains in velocity and Lighthouse.
                      </div>
                      <div className="para">
                        The Senior Frontend role caught my eye because{' '}
                        <span className="hl">payments UX is a trust surface</span> — every pixel
                        is load-bearing. That&apos;s the work I want to be doing.
                      </div>
                      <div className="para">
                        A few bets I&apos;d bring on day one
                        <span className="caret" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRANSFORM: resume → offer ────────────────── */}
      <section className="transform">
        <div className="transform-inner">
          <div className="fade-up" style={{ textAlign: 'center' }}>
            <div className="section-eyebrow" style={{ justifyContent: 'center' }}>
              Transformation / 003.5
            </div>
            <h2 className="section-title" style={{ margin: '0 auto 18px' }}>
              From a PDF on your desktop<br />
              to{' '}
              <span style={{
                background: 'linear-gradient(100deg,var(--blue),#00E5FF)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}>
                &ldquo;when can you start?&rdquo;
              </span>
            </h2>
            <p className="section-sub" style={{ margin: '0 auto' }}>
              Your resume goes in. Claude reads it, ranks the fit, writes the letter, handles
              follow-ups. An offer comes out. That&apos;s the pitch.
            </p>
          </div>

          <div className="tf-stage">
            {/* Resume card */}
            <div className="tf-card tf-resume">
              <div className="tf-label">
                <span className="pill">INPUT</span> resume.pdf
              </div>
              <h4>Alex Ramírez</h4>
              <div className="role">Senior Frontend Engineer · San Francisco</div>
              <div className="section">
                <h5>Experience</h5>
                <p>
                  <b style={{ color: 'var(--fg)' }}>Linear</b> — Frontend Engineer · 2023–2026
                  <br />Shipped design-system v2 across 140+ components.
                </p>
                <p style={{ marginTop: '8px' }}>
                  <b style={{ color: 'var(--fg)' }}>Figma</b> — Product Engineer · 2020–2023
                  <br />Owned canvas performance and a11y roadmap.
                </p>
              </div>
              <div className="section">
                <h5>Skills</h5>
                <div className="chips">
                  <span>React</span>
                  <span>TypeScript</span>
                  <span>Design Systems</span>
                  <span>A11y</span>
                  <span>Figma</span>
                  <span>GraphQL</span>
                </div>
              </div>
              <div className="section">
                <h5>Education</h5>
                <p>Cal Poly · B.S. Computer Science</p>
              </div>
            </div>

            {/* Engine pipe */}
            <div className="tf-pipe" aria-hidden="true">
              <div className="line" />
              <div className="beam" />
              <div className="beam" style={{ animationDelay: '1s' }} />
              <div className="beam" style={{ animationDelay: '2s' }} />
              <div className="core">
                <span>Jobber<br />engine</span>
              </div>
            </div>

            {/* Offer card */}
            <div className="tf-card tf-offer">
              <div className="tf-label">
                <span className="pill" style={{ borderColor: '#00E5FF', color: '#00E5FF' }}>
                  OUTPUT
                </span>{' '}
                offer_letter.pdf
              </div>
              <div className="stamp">• SIGNED</div>
              <h4>Senior Frontend Engineer</h4>
              <div className="co">STRIPE · REMOTE · START DATE 05.18.26</div>
              <div className="amount-label">Total Compensation</div>
              <div className="amount">$284,000</div>
              <div className="terms">
                <div><b>Base</b>$212,000</div>
                <div><b>Equity</b>$52k / yr</div>
                <div><b>Sign-on</b>$20,000</div>
                <div><b>PTO</b>Unlimited</div>
              </div>
              <div className="sig">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Accepted 04.22.26 · ref #JBR-8471
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────── */}
      <section className="features" id="features">
        <div className="features-inner">
          <div className="fade-up">
            <div className="section-eyebrow">Arsenal / 004</div>
            <h2 className="section-title">
              Built for the job hunt<br />you wish you didn&apos;t have to do.
            </h2>
            <p className="section-sub">
              Every feature answers one question: did this actually save me an hour today?
            </p>
          </div>

          <div className="feat-grid">
            {/* 01: Match engine — large card */}
            <div className="card lg tilt" data-hover="">
              <div className="c-head">
                <div className="c-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12l6-9 6 9-6 9-6-9zM15 3l6 9-6 9" />
                  </svg>
                </div>
                <div className="c-idx">01 / MATCH ENGINE</div>
              </div>
              <div>
                <h3 className="c-title">
                  Match scoring that tells you{' '}
                  <em style={{ fontStyle: 'normal', color: 'var(--blue)' }}>why</em>.
                </h3>
                <p className="c-desc">
                  Not a black-box percentage. We break the score into skills, seniority, domain and
                  stack — so you know exactly what to highlight in your letter.
                </p>
                <div className="spark">
                  <i /><i /><i /><i /><i /><i /><i /><i /><i />
                </div>
              </div>
              <div className="c-foot">
                <span className="kbd">0–100 score</span>
                <span className="kbd">4 dimensions</span>
                <span className="kbd">~2.1s per job</span>
              </div>
            </div>

            {/* 02: Letters */}
            <div className="card md tilt" data-hover="">
              <div className="c-head">
                <div className="c-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h12l4 4v12H4z M16 4v4h4 M8 12h8 M8 16h5" />
                  </svg>
                </div>
                <div className="c-idx">02 / LETTERS</div>
              </div>
              <div>
                <h3 className="c-title">Cover letters that don&apos;t smell like AI.</h3>
                <p className="c-desc">
                  Grounded in your resume. Written in your voice. No em-dashes unless you asked
                  for them.
                </p>
              </div>
              <div className="c-foot">
                <span className="kbd">Claude</span>
                <span className="kbd">Editable</span>
              </div>
            </div>

            {/* 03: Dashboard */}
            <div className="card md tilt" data-hover="">
              <div className="c-head">
                <div className="c-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 3v18 M3 12h18" />
                  </svg>
                </div>
                <div className="c-idx">03 / DASHBOARD</div>
              </div>
              <div>
                <h3 className="c-title">One pipeline, five statuses, zero spreadsheets.</h3>
                <p className="c-desc">
                  Saved → Applied → Interviewing → Offer → Rejected. Drag, drop, done.
                </p>
                <div className="pipeline">
                  <div className="col">
                    <h5>Saved</h5>
                    <div className="job-chip"><span className="ttl">Stripe · Sr FE</span><span className="mscore">87</span></div>
                    <div className="job-chip"><span className="ttl">Linear · FE</span><span className="mscore">81</span></div>
                  </div>
                  <div className="col">
                    <h5>Applied</h5>
                    <div className="job-chip"><span className="ttl">Vercel · FE</span><span className="mscore">79</span></div>
                  </div>
                  <div className="col">
                    <h5>Interview</h5>
                    <div className="job-chip"><span className="ttl">Figma · FE</span><span className="mscore">91</span></div>
                  </div>
                  <div className="col"><h5>Offer</h5></div>
                  <div className="col">
                    <h5>Closed</h5>
                    <div className="job-chip"><span className="ttl">Notion · FE</span><span className="mscore">72</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* 04: Resume */}
            <div className="card sm tilt" data-hover="">
              <div className="c-head">
                <div className="c-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3 9h18" />
                  </svg>
                </div>
                <div className="c-idx">04 / RESUME</div>
              </div>
              <div>
                <h3 className="c-title">Parse once. Reuse forever.</h3>
                <p className="c-desc">
                  Upload your resume once; we extract skills, companies, and dates and keep them
                  ready for every new JD.
                </p>
              </div>
              <div className="c-foot"><span className="kbd">PDF / DOCX</span></div>
            </div>

            {/* 05: Prefs */}
            <div className="card sm tilt" data-hover="">
              <div className="c-head">
                <div className="c-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-7 8-13a8 8 0 10-16 0c0 6 8 13 8 13z" />
                    <circle cx="12" cy="9" r="3" />
                  </svg>
                </div>
                <div className="c-idx">05 / PREFS</div>
              </div>
              <div>
                <h3 className="c-title">Tell us what you want.</h3>
                <p className="c-desc">
                  Roles, locations, salary floor, industries. Baked into every score so irrelevant
                  jobs don&apos;t eat your attention.
                </p>
              </div>
              <div className="c-foot">
                <span className="kbd">Remote</span>
                <span className="kbd">$180k+</span>
              </div>
            </div>

            {/* 06: Privacy */}
            <div className="card sm tilt" data-hover="">
              <div className="c-head">
                <div className="c-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2l9 4v6c0 5-4 9-9 10-5-1-9-5-9-10V6l9-4z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                </div>
                <div className="c-idx">06 / PRIVACY</div>
              </div>
              <div>
                <h3 className="c-title">Your data, your row.</h3>
                <p className="c-desc">
                  Supabase RLS on every table. Nothing leaks across accounts. Delete and it&apos;s
                  gone.
                </p>
              </div>
              <div className="c-foot">
                <span className="kbd">RLS</span>
                <span className="kbd">SOC-2 path</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────── */}
      <section className="cta">
        <div className="ring" aria-hidden="true">
          <svg viewBox="0 0 400 400">
            <defs>
              <linearGradient id="ringGrad" x1="0" x2="1">
                <stop offset="0" stopColor="#1E6BFF" />
                <stop offset="1" stopColor="#00E5FF" />
              </linearGradient>
            </defs>
            <circle cx="200" cy="200" r="190" fill="none" stroke="url(#ringGrad)" strokeWidth="0.6" strokeDasharray="2 8" />
            <circle cx="200" cy="200" r="160" fill="none" stroke="url(#ringGrad)" strokeWidth="0.4" strokeDasharray="1 12" />
            <circle cx="200" cy="200" r="120" fill="none" stroke="url(#ringGrad)" strokeWidth="0.8" />
            <circle cx="200" cy="200" r="80" fill="none" stroke="url(#ringGrad)" strokeWidth="0.4" strokeDasharray="4 4" />
          </svg>
        </div>
        <div className="cta-inner">
          <div className="section-eyebrow" style={{ justifyContent: 'center' }}>Enter / 007</div>
          <h2>
            Your next role<br />
            is{' '}
            <span style={{
              background: 'linear-gradient(100deg,var(--blue),#00E5FF)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}>
              two uploads away.
            </span>
          </h2>
          <p className="section-sub" style={{ margin: '0 auto 36px' }}>
            Private beta. No credit card. Bring your own resume.
          </p>
          <div className="hero-cta" style={{ justifyContent: 'center' }}>
            <Link href="/signup" className="btn btn-primary btn-lg" data-hover="">
              Get early access →
            </Link>
            <button className="btn btn-lg" data-hover="">Read the docs</button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────── */}
      <footer>
        <div className="foot-inner">
          <div>
            <div className="logo">
              <div className="logo-mark" />
              Jobber
            </div>
            <p style={{ color: 'var(--fg-dim)', fontSize: '13px', maxWidth: '300px', marginTop: '14px' }}>
              AI-powered job search assistant. Match, tailor, apply — without the spam-apply energy.
            </p>
          </div>
          <div className="foot-cols">
            <div className="foot-col">
              <h6>Product</h6>
              <a href="#" data-hover="">Features</a>
              <a href="#" data-hover="">Changelog</a>
              <a href="#" data-hover="">Roadmap</a>
            </div>
            <div className="foot-col">
              <h6>Resources</h6>
              <a href="#" data-hover="">Docs</a>
              <a href="#" data-hover="">Blog</a>
              <a href="#" data-hover="">Discord</a>
            </div>
            <div className="foot-col">
              <h6>Company</h6>
              <a href="#" data-hover="">About</a>
              <a href="#" data-hover="">Privacy</a>
              <a href="#" data-hover="">Terms</a>
            </div>
          </div>
        </div>
        <div className="foot-inner foot-bottom">
          <div>© 2026 Jobber Labs · Built with Supabase · Next.js</div>
          <div>v1.0.3 · status: <span style={{ color: '#00E5FF' }}>● all systems nominal</span></div>
        </div>
      </footer>

      {/* ── TWEAKS PANEL ─────────────────────────────── */}
      <button id="tweaksBtn" style={{ display: 'none' }} />
      <div className="tweaks-panel" id="tweaksPanel">
        <h4>Tweaks</h4>
        <div className="tweak-row">
          <label>Accent hue</label>
          <div className="swatches" id="hueSwatches">
            <div className="sw active" data-hue="220" style={{ background: '#1E6BFF' }} />
            <div className="sw" data-hue="190" style={{ background: '#00B8FF' }} />
            <div className="sw" data-hue="260" style={{ background: '#6B3BFF' }} />
            <div className="sw" data-hue="320" style={{ background: '#FF3BD1' }} />
            <div className="sw" data-hue="160" style={{ background: '#00FFAA' }} />
          </div>
        </div>
        <div className="tweak-row">
          <label>
            Motion intensity <span id="motionVal" style={{ color: 'var(--blue)' }}>8</span>
          </label>
          <input type="range" id="motionSlider" min="1" max="10" step="1" defaultValue="8" />
        </div>
        <div className="tweak-row">
          <label>Grain</label>
          <input type="range" id="grainSlider" min="0" max="20" step="1" defaultValue="7" />
        </div>
        <div className="tweak-row">
          <label>
            Cursor trail <span id="trailVal" style={{ color: 'var(--blue)' }}>30</span>
          </label>
          <input type="range" id="trailSlider" min="5" max="80" step="1" defaultValue="30" />
        </div>
      </div>
    </>
  )
}
