import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  Briefcase, FileText, Mail, TrendingUp, ArrowRight, Upload,
  SlidersHorizontal, Zap, BookOpen, ExternalLink,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { scoreClass } from '@/lib/scoring/job-score'
import { CATEGORY_MAP, type JobCategory } from '@/lib/job-categories'

export default async function DashboardPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const firstName = (profile?.full_name ?? user.email ?? 'there').split(' ')[0]

  const [
    { count: jobCount },
    { data: resumeRow },
    { data: prefs },
    { data: coverLetterCount },
    { data: topMatchRows },
    { data: avgScoreRow },
  ] = await Promise.all([
    supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('resumes').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('job_preferences')
      .select('id, preferred_titles, preferred_locations, work_mode, employment_type')
      .eq('user_id', user.id).maybeSingle(),
    supabase.from('generated_documents').select('id', { count: 'exact', head: false })
      .eq('user_id', user.id),
    supabase.from('job_matches')
      .select('score, explanation, jobs(title, company, status, work_mode)')
      .eq('user_id', user.id).order('score', { ascending: false }).limit(3),
    supabase.from('job_matches').select('score').eq('user_id', user.id),
  ])

  const hasResume      = !!resumeRow
  const hasPreferences = !!prefs
  const hasResumeText  = !!(resumeRow as { resume_text?: string | null } | null)?.resume_text
  const docCount       = coverLetterCount?.length ?? 0

  const scores = (avgScoreRow ?? []).map(r => r.score).filter(s => s != null)
  const avgScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : null

  // Score insights — which signals are missing and how many pts they'd add
  const prefsFull = prefs as (typeof prefs & {
    preferred_locations?: string[]
    work_mode?: string | null
    preferred_titles?: string[]
  }) | null

  const scoreInsights: { label: string; pts: number }[] = []
  if (scores.length > 0) {
    if (!hasResumeText)                         scoreInsights.push({ label: 'No resume text — keyword matching disabled', pts: 30 })
    if (!prefsFull?.preferred_titles?.length)   scoreInsights.push({ label: 'No job categories selected in preferences', pts: 30 })
    if (!prefsFull?.preferred_locations?.length) scoreInsights.push({ label: 'No preferred locations set', pts: 20 })
    if (!prefsFull?.work_mode)                  scoreInsights.push({ label: 'No work mode preference set', pts: 20 })
  }

  // Skills recommendations based on selected categories
  const selectedCategories: JobCategory[] = (prefsFull?.preferred_titles ?? [])
    .map((key: string) => CATEGORY_MAP.get(key))
    .filter((c: JobCategory | undefined): c is JobCategory => !!c)

  const stats = [
    { label: 'Jobs tracked',    value: String(jobCount ?? 0),                      icon: Briefcase,  href: '/dashboard/jobs' },
    { label: 'Avg match score', value: avgScore != null ? `${avgScore}/100` : '—', icon: TrendingUp, href: '/dashboard/jobs' },
    { label: 'Resume',          value: hasResumeText ? 'Ready' : hasResume ? 'Needs text' : 'None', icon: FileText, href: '/dashboard/resume' },
    { label: 'Cover letters',   value: String(docCount),                            icon: Mail,       href: '/dashboard/cover-letters' },
  ]

  const quickActions = [
    {
      label:       'Upload your resume',
      description: 'Upload once — text is auto-extracted and used to score every job you track.',
      href:        '/dashboard/resume',
      cta:         hasResumeText ? 'View resume' : hasResume ? 'Extract text' : 'Upload resume',
      icon:        Upload,
      done:        hasResumeText,
    },
    {
      label:       'Set your preferences',
      description: 'Pick your target job categories, employment type, and location to power smart matching.',
      href:        '/dashboard/preferences',
      cta:         hasPreferences ? 'Update preferences' : 'Set preferences',
      icon:        SlidersHorizontal,
      done:        hasPreferences && !!prefsFull?.preferred_titles?.length,
    },
    {
      label:       'Add your first job',
      description: 'Paste a URL to auto-fill a job listing and instantly get a detailed match score.',
      href:        '/dashboard/jobs',
      cta:         (jobCount ?? 0) > 0 ? 'View jobs' : 'Add a job',
      icon:        Briefcase,
      done:        (jobCount ?? 0) > 0,
    },
    {
      label:       'Generate a cover letter',
      description: 'Claude writes a tailored cover letter grounded in your resume and the specific job description.',
      href:        docCount > 0 ? '/dashboard/cover-letters' : '/dashboard/jobs',
      cta:         docCount > 0 ? 'View cover letters' : 'Generate one now',
      icon:        Mail,
      done:        docCount > 0,
    },
  ]

  const checklist = [
    { label: 'Create your account',                done: true,                            href: undefined,                   disabled: false },
    { label: 'Upload your resume',                 done: hasResume,                       href: '/dashboard/resume',         disabled: false },
    { label: 'Extract resume text for matching',   done: hasResumeText,                   href: '/dashboard/resume',         disabled: false },
    { label: 'Select job categories',              done: !!prefsFull?.preferred_titles?.length, href: '/dashboard/preferences', disabled: false },
    { label: 'Set location & work mode',           done: !!(prefsFull?.preferred_locations?.length && prefsFull?.work_mode), href: '/dashboard/preferences', disabled: false },
    { label: 'Add your first job',                 done: (jobCount ?? 0) > 0,             href: '/dashboard/jobs',           disabled: false },
    { label: 'Run your first match score',         done: scores.length > 0,               href: undefined,                   disabled: scores.length === 0 },
    { label: 'Generate a cover letter',            done: docCount > 0,                    href: '/dashboard/cover-letters',  disabled: false },
  ]

  return (
    <div style={{ maxWidth: 960 }}>

      {/* Header */}
      <div className="dash-page-eyebrow">DASHBOARD · OVERVIEW</div>
      <h2 className="dash-page-title">Welcome back, {firstName}.</h2>
      <p className="dash-page-sub">
        {!hasResumeText
          ? 'Start by uploading your resume — text is auto-extracted to power every match score.'
          : !prefsFull?.preferred_titles?.length
            ? 'Select job categories in preferences to activate smart title matching.'
            : 'Your pipeline is active. Add jobs and track your path to an offer.'}
      </p>

      {/* Stats */}
      <div className="dash-space-md" />
      <div className="dash-stats">
        {stats.map(s => (
          <Link key={s.label} href={s.href} className="dash-stat">
            <div className="dash-stat-top">
              <span className="dash-stat-label">{s.label}</span>
              <s.icon className="dash-stat-icon" width={16} height={16} />
            </div>
            <div className="dash-stat-value">{s.value}</div>
          </Link>
        ))}
      </div>

      {/* Score insights */}
      {scoreInsights.length > 0 && (
        <>
          <div className="dash-space-md" />
          <div className="dash-score-insights">
            <div className="dash-score-insights-label">What&apos;s limiting your scores</div>
            <div className="dash-score-insights-list">
              {scoreInsights.map(insight => (
                <div key={insight.label} className="dash-score-insight-row">
                  <span className="dash-score-insight-pts">−{insight.pts} pts</span>
                  <span className="dash-score-insight-text">{insight.label}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Get started */}
      <div className="dash-space-lg" />
      <div className="dash-section-label">Get started</div>
      <div className="dash-space-sm" />
      <div className="dash-cards" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {quickActions.map(a => (
          <div key={a.label} className="dash-card">
            <div className="dash-card-icon"><a.icon width={18} height={18} /></div>
            <h4>{a.label}</h4>
            <p>{a.description}</p>
            <div className="dash-card-footer">
              <Link href={a.href} className="dash-card-link">
                {a.cta}
                <ArrowRight width={12} height={12} />
              </Link>
              {a.done && (
                <span className="dash-badge" style={{ color: 'var(--d-green)', borderColor: 'rgba(34,197,94,0.2)', background: 'rgba(34,197,94,0.06)' }}>
                  Done
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Skills & roadmap recommendations */}
      {selectedCategories.length > 0 && (
        <>
          <div className="dash-space-lg" />
          <div className="dash-section-label">Your roadmap to getting hired</div>
          <div className="dash-space-sm" />
          {selectedCategories.map(cat => (
            <div key={cat.key} className="dash-box" style={{ marginBottom: 16 }}>
              <div className="dash-box-title">
                <Zap width={14} height={14} />
                {cat.label}
                {prefsFull?.employment_type && (
                  <span className="dash-badge" style={{ marginLeft: 8, textTransform: 'capitalize' }}>
                    {prefsFull.employment_type}
                  </span>
                )}
              </div>

              <div className="dash-roadmap-grid">
                <div>
                  <div className="dash-roadmap-section-label">Skills to build</div>
                  <ul className="dash-roadmap-list">
                    {cat.skills.map(s => <li key={s}>{s}</li>)}
                  </ul>
                </div>
                <div>
                  <div className="dash-roadmap-section-label">Projects that get attention</div>
                  <ul className="dash-roadmap-list">
                    {cat.projects.map(p => <li key={p}>{p}</li>)}
                  </ul>
                </div>
              </div>

              {cat.certifications && (
                <div style={{ marginTop: 14 }}>
                  <div className="dash-roadmap-section-label">Worth completing</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                    {cat.certifications.map(c => (
                      <span key={c} className="dash-badge">{c}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </>
      )}

      {/* Explore jobs */}
      {selectedCategories.length > 0 && (
        <>
          <div className="dash-space-lg" />
          <div className="dash-section-label">Find {prefsFull?.employment_type ?? 'jobs'} in your field</div>
          <div className="dash-space-sm" />
          <div className="dash-box">
            <div className="dash-box-title">
              <BookOpen width={14} height={14} />
              Recommended job boards
            </div>
            <p className="dash-page-sub" style={{ marginBottom: 16 }}>
              Job boards pre-filtered for your categories. Open any link to start applying.
            </p>
            <div className="dash-explore-grid">
              {selectedCategories.flatMap(cat =>
                cat.platforms.map(p => ({
                  ...p,
                  category: cat.label,
                })),
              )
                // deduplicate by platform name
                .filter((p, i, arr) => arr.findIndex(x => x.name === p.name) === i)
                .map(p => (
                  <a
                    key={p.name + p.category}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dash-explore-card"
                  >
                    <div className="dash-explore-card-name">{p.name}</div>
                    <div className="dash-explore-card-cat">{p.category}</div>
                    <ExternalLink width={12} height={12} className="dash-explore-icon" />
                  </a>
                ))}
            </div>
          </div>
        </>
      )}

      {/* Top matches */}
      {(topMatchRows ?? []).length > 0 && (
        <>
          <div className="dash-space-lg" />
          <div className="dash-section-label">Top matches</div>
          <div className="dash-space-sm" />
          <div className="dash-box">
            <div className="dash-box-title">
              <TrendingUp width={14} height={14} />
              Highest-scoring jobs
            </div>
            {(topMatchRows ?? []).map((m, i) => {
              const job = m.jobs as unknown as { title: string; company: string; status: string | null; work_mode: string | null } | null
              if (!job) return null
              const sc = scoreClass(m.score)
              return (
                <div key={i} className="dash-top-job">
                  <div style={{ flexShrink: 0 }}>
                    <span className={`dash-score ${sc}`}>{m.score}</span>
                  </div>
                  <div className="dash-top-job-info">
                    <div className="dash-top-job-title">{job.title}</div>
                    <div className="dash-top-job-company">{job.company}</div>
                  </div>
                  {job.status && <span className={`dash-status ${job.status}`}>{job.status}</span>}
                </div>
              )
            })}
            <div style={{ marginTop: 16 }}>
              <Link href="/dashboard/jobs" className="dash-card-link">
                View all jobs <ArrowRight width={12} height={12} />
              </Link>
            </div>
          </div>
        </>
      )}

      {/* Setup checklist */}
      <div className="dash-space-lg" />
      <div className="dash-checklist">
        <div className="dash-checklist-title">Setup checklist</div>
        {checklist.map(item => (
          <div key={item.label} className="dash-check-item">
            <div className={`dash-check-circle${item.done ? ' done' : ''}`}>
              {item.done && (
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            {item.href && !item.done ? (
              <Link href={item.href} className="dash-check-label">{item.label}</Link>
            ) : (
              <span className={`dash-check-label${item.done ? ' done' : item.disabled ? ' disabled' : ''}`}>
                {item.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
