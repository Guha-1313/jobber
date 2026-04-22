'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SlidersHorizontal, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { JOB_CATEGORIES } from '@/lib/job-categories'
import type { JobPreferences } from '@/lib/types'

interface Props {
  userId: string
  initialPreferences: JobPreferences | null
}

type SaveState = 'idle' | 'saving' | 'success' | 'error'

export function PreferencesClient({ userId, initialPreferences }: Props) {
  const router = useRouter()

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialPreferences?.preferred_titles ?? [],
  )
  const [locations, setLocations]     = useState(initialPreferences?.preferred_locations?.join(', ') ?? '')
  const [workMode, setWorkMode]       = useState(initialPreferences?.work_mode ?? '')
  const [employmentType, setEmploymentType] = useState(initialPreferences?.employment_type ?? '')
  const [salary, setSalary]           = useState(initialPreferences?.salary_expectation?.toString() ?? '')
  const [workAuth, setWorkAuth]       = useState(initialPreferences?.work_authorization ?? '')
  const [yearsExp, setYearsExp]       = useState(initialPreferences?.years_experience?.toString() ?? '')
  const [saveState, setSaveState]     = useState<SaveState>('idle')
  const [errorMsg, setErrorMsg]       = useState('')

  const toggleCategory = (key: string) => {
    setSelectedCategories(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key],
    )
  }

  const handleSave = async () => {
    setSaveState('saving')
    setErrorMsg('')

    const supabase = createClient()

    const payload = {
      user_id:              userId,
      preferred_titles:     selectedCategories,
      preferred_locations:  locations.split(',').map(s => s.trim()).filter(Boolean),
      work_mode:            workMode || null,
      employment_type:      employmentType || null,
      salary_expectation:   salary ? parseInt(salary, 10) : null,
      work_authorization:   workAuth || null,
      years_experience:     yearsExp ? parseInt(yearsExp, 10) : null,
    }

    const { error } = await supabase
      .from('job_preferences')
      .upsert(payload, { onConflict: 'user_id' })

    if (error) {
      setErrorMsg(error.message)
      setSaveState('error')
    } else {
      setSaveState('success')
      router.refresh()
      setTimeout(() => setSaveState('idle'), 3000)
    }
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <div className="dash-page-eyebrow">DASHBOARD · PREFERENCES</div>
      <h2 className="dash-page-title">Preferences</h2>
      <p className="dash-page-sub">
        Tell Jobber what you&apos;re looking for. These preferences drive every match score and guide
        your personalized recommendations.
      </p>

      <div className="dash-space-md" />

      <div className="dash-box">
        <div className="dash-box-title">
          <SlidersHorizontal width={14} height={14} />
          Job preferences
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

          {/* Job categories */}
          <div className="dash-field">
            <label>Target job categories</label>
            <span className="dash-field-hint" style={{ marginBottom: 10, display: 'block' }}>
              Select one or more. Used for smart title matching across many job titles.
            </span>
            <div className="dash-category-grid">
              {JOB_CATEGORIES.map(cat => (
                <button
                  key={cat.key}
                  type="button"
                  className={`dash-category-btn${selectedCategories.includes(cat.key) ? ' active' : ''}`}
                  onClick={() => toggleCategory(cat.key)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Employment type */}
          <div className="dash-field">
            <label>Employment type</label>
            <select value={employmentType} onChange={e => setEmploymentType(e.target.value)}>
              <option value="">Select type</option>
              <option value="internship">Internship</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract / Freelance</option>
            </select>
          </div>

          <div className="dash-field">
            <label>Preferred locations</label>
            <input
              value={locations}
              onChange={e => setLocations(e.target.value)}
              placeholder="e.g. Remote, New York, San Francisco"
            />
            <span className="dash-field-hint">Separate multiple locations with commas</span>
          </div>

          <div className="dash-field">
            <label>Work mode</label>
            <select value={workMode} onChange={e => setWorkMode(e.target.value)}>
              <option value="">Select work mode</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-site</option>
            </select>
          </div>

          <div className="dash-form-grid">
            <div className="dash-field">
              <label>Salary expectation (USD / yr)</label>
              <input
                type="number"
                value={salary}
                onChange={e => setSalary(e.target.value)}
                placeholder="e.g. 80000"
                min="0"
              />
            </div>
            <div className="dash-field">
              <label>Years of experience</label>
              <input
                type="number"
                value={yearsExp}
                onChange={e => setYearsExp(e.target.value)}
                placeholder="e.g. 0 for student"
                min="0"
              />
            </div>
          </div>

          <div className="dash-field">
            <label>Work authorization</label>
            <select value={workAuth} onChange={e => setWorkAuth(e.target.value)}>
              <option value="">Select authorization status</option>
              <option value="US Citizen / Permanent Resident">US Citizen / Permanent Resident</option>
              <option value="Requires H1-B Sponsorship">Requires H1-B Sponsorship</option>
              <option value="EAD / OPT / Work Permit">EAD / OPT / Work Permit</option>
              <option value="Canadian Citizen / PR">Canadian Citizen / PR</option>
              <option value="EU / UK Citizen">EU / UK Citizen</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="dash-divider" />

        <div className="dash-form-actions">
          <button
            className="dash-btn-primary"
            onClick={handleSave}
            disabled={saveState === 'saving'}
          >
            <Save width={14} height={14} />
            {saveState === 'saving' ? 'Saving…' : 'Save preferences'}
          </button>
          {saveState === 'success' && (
            <span className="dash-msg-success">Preferences saved</span>
          )}
          {saveState === 'error' && (
            <span className="dash-msg-error">{errorMsg}</span>
          )}
        </div>
      </div>

      <div className="dash-space-sm" />

      <div className="dash-info">
        <div className="dash-info-dot">
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v5M6 9v1" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <p>
          Your categories are matched against job titles using <strong style={{ color: 'var(--d-fg)' }}>keyword expansion</strong> —
          so &ldquo;Software Engineering&rdquo; will match &ldquo;Frontend Developer&rdquo;, &ldquo;Backend Engineer&rdquo;,
          and dozens of other titles automatically.
        </p>
      </div>
    </div>
  )
}
