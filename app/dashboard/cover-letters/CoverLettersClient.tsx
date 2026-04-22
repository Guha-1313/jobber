'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Mail, X, Copy, Check, Trash2, ArrowRight, FileText, Building2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { GeneratedDocument } from '@/lib/types'

type DocWithJob = GeneratedDocument & {
  job: { title: string; company: string; status: string | null } | null
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Reader Modal ─────────────────────────────────────────────────────────────

interface ReaderProps {
  doc: DocWithJob
  onClose: () => void
  onDelete: (id: string) => void
}

function ReaderModal({ doc, onClose, onDelete }: ReaderProps) {
  const [copied, setCopied]         = useState(false)
  const [confirmDelete, setConfirm] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(doc.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const jobSlug = doc.job
      ? `${doc.job.company}-${doc.job.title}`.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      : 'cover-letter'
    const filename = `${jobSlug}.txt`
    const blob = new Blob([doc.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div
      className="dash-modal-overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="dash-cl-reader">
        {/* Header */}
        <div className="dash-cl-reader-header">
          <div style={{ flex: 1, minWidth: 0 }}>
            {doc.job && (
              <>
                <div className="dash-cl-reader-role">{doc.job.title}</div>
                <div className="dash-cl-reader-company">{doc.job.company}</div>
              </>
            )}
            {!doc.job && <div className="dash-cl-reader-role">Cover Letter</div>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <button
              className="dash-icon-action"
              onClick={handleCopy}
              title="Copy to clipboard"
            >
              {copied
                ? <Check width={13} height={13} style={{ color: 'var(--d-green)' }} />
                : <Copy width={13} height={13} />
              }
            </button>
            <button
              className="dash-icon-action"
              onClick={handleDownload}
              title="Download as .txt"
            >
              <FileText width={13} height={13} />
            </button>
            {confirmDelete ? (
              <>
                <button
                  className="dash-btn-danger"
                  onClick={() => onDelete(doc.id)}
                >
                  Confirm delete
                </button>
                <button
                  className="dash-btn-secondary"
                  style={{ fontSize: 11, padding: '4px 10px' }}
                  onClick={() => setConfirm(false)}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                className="dash-icon-action danger"
                onClick={() => setConfirm(true)}
                title="Delete this letter"
              >
                <Trash2 width={13} height={13} />
              </button>
            )}
            <button className="dash-modal-close" onClick={onClose}>
              <X width={14} height={14} />
            </button>
          </div>
        </div>

        <div className="dash-divider" style={{ margin: '0 0 20px' }} />

        {/* Letter body */}
        <div className="dash-cl-reader-body">
          {doc.content.split('\n').map((line, i) => (
            <p key={i} className="dash-cl-line">{line || <>&nbsp;</>}</p>
          ))}
        </div>

        <div className="dash-divider" style={{ margin: '20px 0 16px' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <span
            style={{
              fontFamily: 'var(--font-jetbrains-mono)',
              fontSize: 9,
              letterSpacing: '0.12em',
              color: 'var(--d-fg-dim)',
              textTransform: 'uppercase',
            }}
          >
            Generated {formatDate(doc.created_at)}
          </span>
          <button className="dash-btn-primary" style={{ fontSize: 12, padding: '8px 16px' }} onClick={handleCopy}>
            {copied ? (
              <><Check width={13} height={13} /> Copied!</>
            ) : (
              <><Copy width={13} height={13} /> Copy letter</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Cover letter card ─────────────────────────────────────────────────────────

interface CardProps {
  doc:     DocWithJob
  onClick: () => void
}

function CoverLetterCard({ doc, onClick }: CardProps) {
  const preview = doc.content.slice(0, 160).replace(/\n/g, ' ').trim()

  return (
    <div className="dash-cl-card" onClick={onClick} role="button" tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onClick() }}>
      <div className="dash-cl-card-top">
        <div className="dash-cl-card-icon">
          <Mail width={16} height={16} />
        </div>
        <div className="dash-cl-card-meta">
          <span
            style={{
              fontFamily: 'var(--font-jetbrains-mono)',
              fontSize: 9,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--d-fg-dim)',
            }}
          >
            {formatDate(doc.created_at)}
          </span>
        </div>
      </div>

      {doc.job && (
        <div className="dash-cl-card-job">
          <div className="dash-cl-card-role">{doc.job.title}</div>
          <div className="dash-cl-card-company">
            <Building2 width={11} height={11} />
            {doc.job.company}
          </div>
        </div>
      )}

      <p className="dash-cl-card-preview">{preview}…</p>

      <div className="dash-cl-card-footer">
        <span className="dash-card-link">
          Open letter <ArrowRight width={11} height={11} />
        </span>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  userId:      string
  initialDocs: DocWithJob[]
}

export function CoverLettersClient({ userId, initialDocs }: Props) {
  void userId
  const router = useRouter()
  const [docs, setDocs]           = useState<DocWithJob[]>(initialDocs)
  const [selected, setSelected]   = useState<DocWithJob | null>(null)

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('generated_documents')
      .delete()
      .eq('id', id)

    if (!error) {
      setDocs(prev => prev.filter(d => d.id !== id))
      setSelected(null)
      router.refresh()
    }
  }

  return (
    <div style={{ maxWidth: 960 }}>
      <div className="dash-page-eyebrow">DASHBOARD · COVER LETTERS</div>
      <h2 className="dash-page-title">Cover Letters</h2>
      <p className="dash-page-sub">
        AI-generated cover letters tailored to each job — grounded in your resume, not a template.
      </p>

      <div className="dash-space-md" />

      {docs.length === 0 ? (
        <div className="dash-empty">
          <div className="dash-empty-icon">
            <Mail width={24} height={24} />
          </div>
          <h3>No cover letters yet</h3>
          <p>
            Head to the Jobs page, open any tracked job, and hit the{' '}
            <span style={{ color: 'var(--d-blue)' }}>generate</span> icon to create your first letter in seconds.
          </p>
          <Link href="/dashboard/jobs" className="dash-btn-primary" style={{ textDecoration: 'none' }}>
            Go to Jobs
            <ArrowRight width={14} height={14} />
          </Link>
          <div className="dash-empty-note" style={{ marginTop: 24 }}>
            REQUIRES RESUME + JOB DESCRIPTION FOR BEST RESULTS
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <span
              style={{
                fontFamily: 'var(--font-jetbrains-mono)',
                fontSize: 10,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--d-fg-dim)',
              }}
            >
              {docs.length} {docs.length === 1 ? 'letter' : 'letters'} generated
            </span>
            <Link href="/dashboard/jobs" className="dash-card-link" style={{ fontSize: 12 }}>
              Generate more <ArrowRight width={11} height={11} />
            </Link>
          </div>

          <div className="dash-cl-grid">
            {docs.map(doc => (
              <CoverLetterCard
                key={doc.id}
                doc={doc}
                onClick={() => setSelected(doc)}
              />
            ))}
          </div>
        </>
      )}

      {selected && (
        <ReaderModal
          doc={selected}
          onClose={() => setSelected(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
