'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileText, RefreshCw, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { uploadResume, deleteResume } from '@/lib/supabase/storage'
import type { Resume } from '@/lib/types'

interface Props {
  userId: string
  initialResume: Resume | null
}

type UploadState = 'idle' | 'uploading' | 'saving' | 'extracting' | 'success' | 'error'
type TextState   = 'idle' | 'saving' | 'success' | 'error'

export function ResumeClient({ userId, initialResume }: Props) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [resume, setResume]             = useState<Resume | null>(initialResume)
  const [resumeText, setResumeText]     = useState(initialResume?.resume_text ?? '')
  const [dragOver, setDragOver]         = useState(false)
  const [uploadState, setUploadState]   = useState<UploadState>('idle')
  const [textState, setTextState]       = useState<TextState>('idle')
  const [uploadError, setUploadError]   = useState('')
  const [textError, setTextError]       = useState('')
  const [deleteState, setDeleteState]   = useState<'idle' | 'confirming'>('idle')
  const [isDeleting, setIsDeleting]     = useState(false)

  const handleFile = useCallback(
    async (file: File) => {
      const allowed = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ]
      if (!allowed.includes(file.type)) {
        setUploadError('Please upload a PDF or DOCX file.')
        setUploadState('error')
        return
      }
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File must be under 10 MB.')
        setUploadState('error')
        return
      }

      setUploadState('uploading')
      setUploadError('')

      const { path, error: storageError } = await uploadResume(userId, file)
      if (storageError) {
        setUploadError(storageError)
        setUploadState('error')
        return
      }

      setUploadState('saving')
      const supabase = createClient()

      // Delete previous storage file if replacing
      if (resume?.file_path) await deleteResume(resume.file_path)

      let resumeId = resume?.id ?? ''

      if (resume?.id) {
        const { error } = await supabase
          .from('resumes')
          .update({ file_path: path, file_name: file.name })
          .eq('id', resume.id)
        if (error) { setUploadError(error.message); setUploadState('error'); return }
      } else {
        const { data, error } = await supabase
          .from('resumes')
          .insert({ user_id: userId, file_path: path, file_name: file.name })
          .select()
          .single()
        if (error) { setUploadError(error.message); setUploadState('error'); return }
        if (data) {
          setResume(data as Resume)
          resumeId = (data as Resume).id
        }
      }

      // Auto-extract text from the uploaded file
      setUploadState('extracting')
      try {
        const extractForm = new FormData()
        extractForm.append('file', file)
        const res = await fetch('/api/extract-resume-text', {
          method: 'POST',
          body: extractForm,
        })
        const json = await res.json() as { text?: string; error?: string }

        if (!res.ok || json.error) {
          // Show error but don't block the upload — user can paste manually
          setUploadError(`File uploaded, but text extraction failed: ${json.error ?? 'unknown error'}. Paste your resume text manually below.`)
          setUploadState('error')
          router.refresh()
          return
        }

        if (json.text && resumeId) {
          setResumeText(json.text)
          await supabase
            .from('resumes')
            .update({ resume_text: json.text })
            .eq('id', resumeId)
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'unknown'
        setUploadError(`File uploaded, but text extraction failed: ${msg}. Paste your resume text manually below.`)
        setUploadState('error')
        router.refresh()
        return
      }

      setUploadState('success')
      router.refresh()
      setTimeout(() => setUploadState('idle'), 4000)
    },
    [resume, userId, router],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  const saveText = async () => {
    setTextState('saving')
    setTextError('')
    const supabase = createClient()

    if (resume?.id) {
      const { error } = await supabase
        .from('resumes')
        .update({ resume_text: resumeText })
        .eq('id', resume.id)
      if (error) { setTextError(error.message); setTextState('error'); return }
    } else {
      const { data, error } = await supabase
        .from('resumes')
        .insert({ user_id: userId, resume_text: resumeText })
        .select()
        .single()
      if (error) { setTextError(error.message); setTextState('error'); return }
      if (data) setResume(data as Resume)
    }

    setTextState('success')
    router.refresh()
    setTimeout(() => setTextState('idle'), 3000)
  }

  const deleteResumeData = async () => {
    setIsDeleting(true)
    const supabase = createClient()

    if (resume?.file_path) await deleteResume(resume.file_path)

    if (resume?.id) {
      await supabase.from('resumes').delete().eq('id', resume.id)
    }

    setResume(null)
    setResumeText('')
    setDeleteState('idle')
    setIsDeleting(false)
    router.refresh()
  }

  const isUploading = ['uploading', 'saving', 'extracting'].includes(uploadState)

  const uploadLabel =
    uploadState === 'uploading'  ? 'Uploading…' :
    uploadState === 'saving'     ? 'Saving…' :
    uploadState === 'extracting' ? 'Extracting text…' :
    'Replace file'

  return (
    <div style={{ maxWidth: 720 }}>
      <div className="dash-page-eyebrow">DASHBOARD · RESUME</div>
      <h2 className="dash-page-title">Resume</h2>
      <p className="dash-page-sub">
        Upload your resume file — text is automatically extracted and used for keyword matching
        against every job you track.
      </p>

      <div className="dash-space-md" />

      {/* ── File upload section ──────────────────────────────── */}
      <div className="dash-box">
        <div className="dash-box-title">
          <Upload width={14} height={14} />
          Resume file
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          style={{ display: 'none' }}
          onChange={e => {
            const f = e.target.files?.[0]
            if (f) handleFile(f)
            e.target.value = ''
          }}
        />

        {resume?.file_name ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="dash-file-card">
              <div className="dash-file-icon">
                <FileText width={18} height={18} />
              </div>
              <div className="dash-file-meta">
                <div className="dash-file-name">{resume.file_name}</div>
                <div className="dash-file-date">
                  Uploaded{' '}
                  {new Date(resume.updated_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="dash-btn-secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || deleteState !== 'idle'}
              >
                <RefreshCw width={13} height={13} />
                {isUploading ? uploadLabel : 'Replace file'}
              </button>

              {deleteState === 'confirming' ? (
                <>
                  <button
                    className="dash-btn-danger"
                    onClick={deleteResumeData}
                    disabled={isDeleting}
                  >
                    Confirm remove
                  </button>
                  <button
                    className="dash-btn-secondary"
                    onClick={() => setDeleteState('idle')}
                    style={{ fontSize: 11, padding: '4px 10px' }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  className="dash-icon-action danger"
                  onClick={() => setDeleteState('confirming')}
                  disabled={isUploading}
                  title="Remove resume"
                  style={{ padding: '6px 10px', height: 34 }}
                >
                  <Trash2 width={13} height={13} />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div
            className={`dash-upload-zone${dragOver ? ' drag-over' : ''}`}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <div className="dash-empty-icon" style={{ margin: 0, pointerEvents: 'none' }}>
              <Upload width={22} height={22} />
            </div>
            <div style={{ pointerEvents: 'none' }}>
              <p style={{ color: '#f1f5f9', fontWeight: 600, marginBottom: 4 }}>
                {isUploading ? uploadLabel : 'Drop your resume here'}
              </p>
              <p>or click to browse · PDF or DOCX · max 10 MB</p>
            </div>
          </div>
        )}

        {uploadState === 'success' && (
          <div className="dash-msg-success" style={{ marginTop: 12 }}>
            Resume uploaded and text extracted successfully
          </div>
        )}
        {uploadState === 'error' && (
          <div className="dash-msg-error" style={{ marginTop: 12 }}>
            {uploadError}
          </div>
        )}
      </div>

      <div className="dash-space-md" />

      {/* ── Resume text section ──────────────────────────────── */}
      <div className="dash-box">
        <div className="dash-box-title">
          <FileText width={14} height={14} />
          Resume text
        </div>
        <p className="dash-page-sub" style={{ marginBottom: 16 }}>
          Auto-extracted from your uploaded file. Edit if needed — this is what drives keyword matching against job descriptions.
        </p>

        <div className="dash-field">
          <textarea
            value={resumeText}
            onChange={e => setResumeText(e.target.value)}
            placeholder="Upload a PDF/DOCX above to auto-extract, or paste your resume text here — work experience, skills, education, projects…"
            style={{ minHeight: 280 }}
          />
        </div>

        <div style={{ marginTop: 16 }} className="dash-form-actions">
          <button
            className="dash-btn-primary"
            onClick={saveText}
            disabled={textState === 'saving'}
          >
            {textState === 'saving' ? 'Saving…' : 'Save text'}
          </button>
          {textState === 'success' && <span className="dash-msg-success">Saved</span>}
          {textState === 'error' && <span className="dash-msg-error">{textError}</span>}
        </div>
      </div>

      <div className="dash-space-sm" />
      <p
        style={{
          fontSize: 11,
          fontFamily: 'var(--font-jetbrains-mono)',
          letterSpacing: '0.1em',
          opacity: 0.4,
        }}
      >
        SUPPORTED: PDF · DOCX · MAX 10 MB
      </p>
    </div>
  )
}
