'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Plus, Pencil, Trash2, ExternalLink, X, RefreshCw, Briefcase, Link as LinkIcon,
  Sparkles, Loader2, FileText,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { scoreJob, scoreClass } from '@/lib/scoring/job-score'
import type { Job, JobPreferences, Resume, JobWithMatch } from '@/lib/types'

// ── Constants ───────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { key: 'saved',        label: 'Saved' },
  { key: 'applied',      label: 'Applied' },
  { key: 'interviewing', label: 'Interviewing' },
  { key: 'offer',        label: 'Offer' },
  { key: 'rejected',     label: 'Rejected' },
]

const FILTER_OPTIONS = [{ key: 'all', label: 'All' }, ...STATUS_OPTIONS]

const EMPTY_FORM = {
  title:        '',
  company:      '',
  location:     '',
  work_mode:    '',
  status:       'saved',
  apply_url:    '',
  salary_range: '',
  source:       'manual',
  description:  '',
}

type FormState = typeof EMPTY_FORM

// ── Score badge ──────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number | null | undefined }) {
  if (score == null) return <span className="dash-score none">—</span>
  return <span className={`dash-score ${scoreClass(score)}`}>{score}</span>
}

// ── Job card ─────────────────────────────────────────────────────────────────

interface JobCardProps {
  job:             JobWithMatch
  onEdit:          () => void
  onDeleteClick:   () => void
  onDeleteConfirm: () => void
  onDeleteCancel:  () => void
  confirmDelete:   boolean
  hasLetter:       boolean
  isGenerating:    boolean
  generateError:   string
  onGenerate:      () => void
}

function JobCard({
  job, onEdit, onDeleteClick, onDeleteConfirm, onDeleteCancel, confirmDelete,
  hasLetter, isGenerating, generateError, onGenerate,
}: JobCardProps) {
  const sc = scoreClass(job.match?.score)

  return (
    <div className="dash-job-card">
      {/* Header: title + score */}
      <div className="dash-job-card-header">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="dash-job-card-title">{job.title}</div>
          <div className="dash-job-card-company">{job.company}</div>
        </div>
        <ScoreBadge score={job.match?.score} />
      </div>

      {/* Score bar */}
      {job.match?.score != null && (
        <div className="dash-score-bar-wrap">
          <div
            className={`dash-score-bar-fill ${sc}`}
            style={{ width: `${job.match.score}%` }}
          />
        </div>
      )}

      {/* Badges row */}
      <div className="dash-job-card-meta">
        {job.status && (
          <span className={`dash-status ${job.status}`}>{job.status}</span>
        )}
        {job.work_mode && (
          <span className="dash-badge">{job.work_mode}</span>
        )}
        {job.location && (
          <span
            style={{
              fontSize: 11,
              color: 'var(--d-fg-dim)',
              fontFamily: 'var(--font-jetbrains-mono)',
              letterSpacing: '0.04em',
            }}
          >
            {job.location}
          </span>
        )}
        {job.salary_range && (
          <span style={{ fontSize: 11, color: 'var(--d-fg-dim)' }}>
            {job.salary_range}
          </span>
        )}
      </div>

      {/* Match explanation */}
      {job.match?.explanation && (
        <div className="dash-job-card-explanation">
          {job.match.explanation.split('\n').map((line, i) => (
            <div
              key={i}
              style={{
                color: line.startsWith('✓')
                  ? 'var(--d-green)'
                  : line.startsWith('✗')
                    ? 'var(--d-red)'
                    : 'var(--d-fg)',
                opacity: line.startsWith('✗') ? 0.75 : 1,
                fontWeight: i === 0 ? 600 : 400,
              }}
            >
              {line}
            </div>
          ))}
        </div>
      )}

      {/* Generate error */}
      {generateError && (
        <p className="dash-msg-error" style={{ fontSize: 11, padding: '5px 10px' }}>
          {generateError}
        </p>
      )}

      {/* Actions */}
      <div className="dash-job-card-actions">
        {job.apply_url && (
          <a
            href={job.apply_url}
            target="_blank"
            rel="noopener noreferrer"
            className="dash-icon-action"
            title="Open apply link"
          >
            <ExternalLink width={13} height={13} />
          </a>
        )}

        {/* Cover letter: generate or view */}
        {hasLetter ? (
          <Link
            href="/dashboard/cover-letters"
            className="dash-icon-action"
            title="View cover letter"
            style={{ textDecoration: 'none' }}
          >
            <FileText width={13} height={13} />
          </Link>
        ) : (
          <button
            className="dash-icon-action"
            onClick={onGenerate}
            disabled={isGenerating}
            title={isGenerating ? 'Generating…' : 'Generate cover letter'}
          >
            {isGenerating
              ? <Loader2 width={13} height={13} className="dash-spin" />
              : <Sparkles width={13} height={13} />
            }
          </button>
        )}

        <button className="dash-icon-action" onClick={onEdit} title="Edit job">
          <Pencil width={13} height={13} />
        </button>

        {confirmDelete ? (
          <>
            <button className="dash-btn-danger" onClick={onDeleteConfirm}>
              Confirm delete
            </button>
            <button className="dash-btn-secondary" style={{ fontSize: 11, padding: '4px 10px' }} onClick={onDeleteCancel}>
              Cancel
            </button>
          </>
        ) : (
          <button
            className="dash-icon-action danger"
            onClick={onDeleteClick}
            title="Delete job"
          >
            <Trash2 width={13} height={13} />
          </button>
        )}
      </div>
    </div>
  )
}

// ── Job form modal ────────────────────────────────────────────────────────────

interface JobFormProps {
  form:      FormState
  onChange:  (patch: Partial<FormState>) => void
  onSave:    () => void
  onCancel:  () => void
  isSaving:  boolean
  isEdit:    boolean
  error:     string
}

function JobForm({ form, onChange, onSave, onCancel, isSaving, isEdit, error }: JobFormProps) {
  return (
    <div
      className="dash-modal-overlay"
      onClick={e => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div className="dash-modal">
        <div className="dash-modal-header">
          <span className="dash-modal-title">{isEdit ? 'Edit job' : 'Add job'}</span>
          <button className="dash-modal-close" onClick={onCancel}>
            <X width={14} height={14} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="dash-form-grid">
            <div className="dash-field">
              <label>Job title *</label>
              <input
                value={form.title}
                onChange={e => onChange({ title: e.target.value })}
                placeholder="e.g. Software Engineer"
                autoFocus
              />
            </div>
            <div className="dash-field">
              <label>Company *</label>
              <input
                value={form.company}
                onChange={e => onChange({ company: e.target.value })}
                placeholder="e.g. Acme Corp"
              />
            </div>
          </div>

          <div className="dash-form-grid">
            <div className="dash-field">
              <label>Location</label>
              <input
                value={form.location}
                onChange={e => onChange({ location: e.target.value })}
                placeholder="e.g. New York, Remote"
              />
            </div>
            <div className="dash-field">
              <label>Work mode</label>
              <select
                value={form.work_mode}
                onChange={e => onChange({ work_mode: e.target.value })}
              >
                <option value="">Select</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
              </select>
            </div>
          </div>

          <div className="dash-form-grid">
            <div className="dash-field">
              <label>Status</label>
              <select
                value={form.status}
                onChange={e => onChange({ status: e.target.value })}
              >
                {STATUS_OPTIONS.map(s => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="dash-field">
              <label>Salary range</label>
              <input
                value={form.salary_range}
                onChange={e => onChange({ salary_range: e.target.value })}
                placeholder="e.g. $120k–$150k"
              />
            </div>
          </div>

          <div className="dash-field">
            <label>Apply URL</label>
            <input
              value={form.apply_url}
              onChange={e => onChange({ apply_url: e.target.value })}
              placeholder="https://…"
            />
          </div>

          <div className="dash-field">
            <label>Job description</label>
            <textarea
              value={form.description}
              onChange={e => onChange({ description: e.target.value })}
              placeholder="Paste the full job description here — better description = better match score."
              style={{ minHeight: 180 }}
            />
          </div>
        </div>

        <div className="dash-divider" />

        <div className="dash-form-actions">
          <button
            className="dash-btn-primary"
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving…' : isEdit ? 'Update job' : 'Add job'}
          </button>
          <button className="dash-btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          {error && <span className="dash-msg-error">{error}</span>}
        </div>
      </div>
    </div>
  )
}

// ── Main client component ────────────────────────────────────────────────────

interface Props {
  userId:           string
  initialJobs:      JobWithMatch[]
  preferences:      JobPreferences | null
  resume:           Resume | null
  initialLetterMap: Record<string, string>
}

export function JobsClient({ userId, initialJobs, preferences, resume, initialLetterMap }: Props) {
  const router = useRouter()

  const [jobs, setJobs]               = useState<JobWithMatch[]>(initialJobs)
  const [filter, setFilter]           = useState('all')
  const [showForm, setShowForm]       = useState(false)
  const [editingJob, setEditingJob]   = useState<JobWithMatch | null>(null)
  const [form, setForm]               = useState<FormState>(EMPTY_FORM)
  const [formSaving, setFormSaving]   = useState(false)
  const [formError, setFormError]     = useState('')
  const [deleteId, setDeleteId]       = useState<string | null>(null)
  const [recalcState, setRecalcState] = useState<'idle' | 'running' | 'done'>('idle')
  const [importUrl, setImportUrl]     = useState('')
  const [importState, setImportState] = useState<'idle' | 'loading' | 'error'>('idle')
  const [importError, setImportError] = useState('')

  // Cover letter state
  const [letterMap, setLetterMap]         = useState<Record<string, string>>(initialLetterMap)
  const [generatingId, setGeneratingId]   = useState<string | null>(null)
  const [generateErrors, setGenerateErrors] = useState<Record<string, string>>({})

  // Filtered view
  const visibleJobs =
    filter === 'all' ? jobs : jobs.filter(j => j.status === filter)

  // Generate cover letter for a job
  const generateLetter = async (jobId: string) => {
    setGeneratingId(jobId)
    setGenerateErrors(prev => ({ ...prev, [jobId]: '' }))

    try {
      const res = await fetch('/api/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId }),
      })
      const json = await res.json() as { data?: { id: string }; error?: string }

      if (!res.ok || json.error) {
        setGenerateErrors(prev => ({ ...prev, [jobId]: json.error ?? 'Generation failed.' }))
      } else if (json.data) {
        setLetterMap(prev => ({ ...prev, [jobId]: json.data!.id }))
        router.refresh()
      }
    } catch {
      setGenerateErrors(prev => ({ ...prev, [jobId]: 'Network error — please try again.' }))
    } finally {
      setGeneratingId(null)
    }
  }

  // Import job data from a URL and pre-fill the add form
  const handleImport = async () => {
    const url = importUrl.trim()
    if (!url) return

    setImportState('loading')
    setImportError('')

    try {
      const res = await fetch('/api/extract-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const json = await res.json() as { data?: Partial<FormState>; error?: string }

      if (!res.ok || json.error) {
        setImportError(json.error ?? 'Could not extract job data from that URL.')
        setImportState('error')
        return
      }

      const d = json.data ?? {}
      setEditingJob(null)
      setForm({
        title:        d.title        ?? '',
        company:      d.company      ?? '',
        location:     d.location     ?? '',
        work_mode:    d.work_mode    ?? '',
        status:       'saved',
        apply_url:    d.apply_url    ?? url,
        salary_range: d.salary_range ?? '',
        source:       d.source       ?? 'manual',
        description:  d.description  ?? '',
      })
      setFormError('')
      setShowForm(true)
      setImportUrl('')
      setImportState('idle')
    } catch {
      setImportError('Network error — could not reach the extraction API.')
      setImportState('error')
    }
  }

  const openAdd = () => {
    setEditingJob(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setShowForm(true)
  }

  const openEdit = useCallback((job: JobWithMatch) => {
    setEditingJob(job)
    setForm({
      title:        job.title,
      company:      job.company,
      location:     job.location     ?? '',
      work_mode:    job.work_mode    ?? '',
      status:       job.status       ?? 'saved',
      apply_url:    job.apply_url    ?? '',
      salary_range: job.salary_range ?? '',
      source:       job.source       ?? 'manual',
      description:  job.description  ?? '',
    })
    setFormError('')
    setShowForm(true)
  }, [])

  const closeForm = () => {
    setShowForm(false)
    setEditingJob(null)
    setFormSaving(false)
    setFormError('')
  }

  const saveJob = async () => {
    if (!form.title.trim() || !form.company.trim()) {
      setFormError('Job title and company are required.')
      return
    }

    setFormSaving(true)
    setFormError('')

    const supabase = createClient()
    const payload = {
      user_id:      userId,
      title:        form.title.trim(),
      company:      form.company.trim(),
      location:     form.location     || null,
      work_mode:    form.work_mode    || null,
      status:       form.status       || 'saved',
      apply_url:    form.apply_url    || null,
      salary_range: form.salary_range || null,
      source:       form.source       || 'manual',
      description:  form.description  || null,
    }

    let savedJob: Job | null = null

    if (editingJob) {
      const { data, error } = await supabase
        .from('jobs')
        .update(payload)
        .eq('id', editingJob.id)
        .select()
        .single()
      if (error) { setFormError(error.message); setFormSaving(false); return }
      savedJob = data as Job
    } else {
      const { data, error } = await supabase
        .from('jobs')
        .insert(payload)
        .select()
        .single()
      if (error) { setFormError(error.message); setFormSaving(false); return }
      savedJob = data as Job
    }

    let match: JobWithMatch['match'] = null
    if (savedJob) {
      const { score, explanation } = scoreJob(savedJob, preferences, resume)

      const { data: existing } = await supabase
        .from('job_matches')
        .select('id')
        .eq('job_id', savedJob.id)
        .maybeSingle()

      if (existing?.id) {
        await supabase
          .from('job_matches')
          .update({ score, explanation })
          .eq('id', existing.id)
      } else {
        await supabase
          .from('job_matches')
          .insert({ user_id: userId, job_id: savedJob.id, score, explanation })
      }

      match = { score, explanation }
    }

    if (editingJob) {
      setJobs(prev =>
        prev.map(j => j.id === editingJob.id ? { ...savedJob!, match } : j),
      )
    } else {
      setJobs(prev => [...prev, { ...savedJob!, match }])
    }

    closeForm()
    router.refresh()
  }

  const deleteJob = async (jobId: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('jobs').delete().eq('id', jobId)
    if (!error) {
      setJobs(prev => prev.filter(j => j.id !== jobId))
      setLetterMap(prev => { const m = { ...prev }; delete m[jobId]; return m })
    }
    setDeleteId(null)
  }

  const recalculateAll = async () => {
    if (!jobs.length) return
    setRecalcState('running')
    const supabase = createClient()

    const updated: JobWithMatch[] = []
    for (const job of jobs) {
      const { score, explanation } = scoreJob(job, preferences, resume)

      const { data: existing } = await supabase
        .from('job_matches')
        .select('id')
        .eq('job_id', job.id)
        .maybeSingle()

      if (existing?.id) {
        await supabase
          .from('job_matches')
          .update({ score, explanation })
          .eq('id', existing.id)
      } else {
        await supabase
          .from('job_matches')
          .insert({ user_id: userId, job_id: job.id, score, explanation })
      }

      updated.push({ ...job, match: { score, explanation } })
    }

    setJobs(updated)
    setRecalcState('done')
    setTimeout(() => setRecalcState('idle'), 3000)
  }

  return (
    <div style={{ maxWidth: 960 }}>

      {/* Page header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div>
          <div className="dash-page-eyebrow">DASHBOARD · JOBS</div>
          <h2 className="dash-page-title">Jobs</h2>
          <p className="dash-page-sub">
            Track applications and AI match scores in one place.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 28, flexShrink: 0 }}>
          {jobs.length > 0 && (
            <button
              className="dash-btn-secondary"
              onClick={recalculateAll}
              disabled={recalcState === 'running'}
              title="Recalculate match scores for all jobs"
            >
              <RefreshCw width={13} height={13} />
              {recalcState === 'running'
                ? 'Recalculating…'
                : recalcState === 'done'
                  ? 'Done!'
                  : 'Recalculate'}
            </button>
          )}
          <button className="dash-btn-primary" onClick={openAdd}>
            <Plus width={15} height={15} />
            Add job
          </button>
        </div>
      </div>

      {/* URL import bar */}
      <div className="dash-space-md" />
      <div className="dash-import-bar">
        <div className="dash-import-input-wrap">
          <LinkIcon width={13} height={13} className="dash-import-icon" />
          <input
            className="dash-import-input"
            type="url"
            value={importUrl}
            onChange={e => { setImportUrl(e.target.value); setImportState('idle'); setImportError('') }}
            onKeyDown={e => { if (e.key === 'Enter') handleImport() }}
            placeholder="Paste a job posting URL to auto-fill the form…"
            disabled={importState === 'loading'}
          />
        </div>
        <button
          className="dash-btn-secondary"
          onClick={handleImport}
          disabled={importState === 'loading' || !importUrl.trim()}
        >
          <Sparkles width={13} height={13} />
          {importState === 'loading' ? 'Fetching…' : 'Auto-fill'}
        </button>
      </div>
      {importState === 'error' && (
        <p className="dash-msg-error" style={{ marginTop: 8, fontSize: 12 }}>
          {importError}
        </p>
      )}

      {/* Status filter */}
      {jobs.length > 0 && (
        <>
          <div className="dash-space-md" />
          <div className="dash-filter-row">
            {FILTER_OPTIONS.map(opt => {
              const count =
                opt.key === 'all'
                  ? jobs.length
                  : jobs.filter(j => j.status === opt.key).length
              return (
                <button
                  key={opt.key}
                  className={`dash-filter-btn${filter === opt.key ? ' active' : ''}`}
                  onClick={() => setFilter(opt.key)}
                >
                  {opt.label}
                  {count > 0 && (
                    <span style={{ marginLeft: 6, opacity: 0.65 }}>{count}</span>
                  )}
                </button>
              )
            })}
          </div>
        </>
      )}

      <div className="dash-space-md" />

      {/* Job list or empty state */}
      {visibleJobs.length === 0 ? (
        <div className="dash-empty">
          <div className="dash-empty-icon">
            <Briefcase width={24} height={24} />
          </div>
          <h3>
            {jobs.length === 0 ? 'No jobs tracked yet' : 'No jobs in this status'}
          </h3>
          <p>
            {jobs.length === 0
              ? 'Add your first job to start tracking and get an instant match score based on your resume and preferences.'
              : 'Try selecting a different status filter above.'}
          </p>
          {jobs.length === 0 && (
            <button className="dash-btn-primary" onClick={openAdd}>
              <Plus width={15} height={15} />
              Add your first job
            </button>
          )}
        </div>
      ) : (
        <div className="dash-job-grid">
          {visibleJobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              onEdit={() => openEdit(job)}
              onDeleteClick={() => setDeleteId(job.id)}
              onDeleteConfirm={() => deleteJob(job.id)}
              onDeleteCancel={() => setDeleteId(null)}
              confirmDelete={deleteId === job.id}
              hasLetter={!!letterMap[job.id]}
              isGenerating={generatingId === job.id}
              generateError={generateErrors[job.id] ?? ''}
              onGenerate={() => generateLetter(job.id)}
            />
          ))}
        </div>
      )}

      {/* Add / Edit modal */}
      {showForm && (
        <JobForm
          form={form}
          onChange={patch => setForm(f => ({ ...f, ...patch }))}
          onSave={saveJob}
          onCancel={closeForm}
          isSaving={formSaving}
          isEdit={!!editingJob}
          error={formError}
        />
      )}
    </div>
  )
}
