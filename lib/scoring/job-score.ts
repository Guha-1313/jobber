import type { Job, JobPreferences, Resume } from '@/lib/types'
import { getCategoryKeywords } from '@/lib/job-categories'

export type ScoreResult = {
  score: number      // 0–100
  explanation: string
}

// Common English stop-words to skip during keyword comparison
const STOP_WORDS = new Set([
  'about', 'also', 'and', 'are', 'been', 'come', 'from', 'have',
  'into', 'more', 'some', 'such', 'than', 'that', 'the', 'their',
  'then', 'these', 'they', 'this', 'those', 'what', 'when',
  'which', 'will', 'with', 'work', 'your',
])

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s\W]+/)
    .filter(w => w.length >= 4 && !STOP_WORDS.has(w))
}

/**
 * Deterministic, AI-free match scoring.
 *
 * Breakdown (max 100 pts):
 *   Category match   — up to 30 pts
 *   Location match   — up to 20 pts
 *   Work mode match  — up to 20 pts
 *   Keyword overlap  — up to 30 pts
 */
export function scoreJob(
  job: Job,
  preferences: JobPreferences | null,
  resume: Resume | null,
): ScoreResult {
  let score = 0
  const hits: string[] = []
  const misses: string[] = []

  // ── Category / title match ───────────────────────────────── 30 pts
  // preferred_titles stores category keys (e.g. "Software Engineering")
  // We expand each category to its keywords and check if the job title matches any
  if (preferences?.preferred_titles?.length) {
    const jobTitle = job.title.toLowerCase()
    let matchedCategory: string | null = null

    for (const category of preferences.preferred_titles) {
      const keywords = getCategoryKeywords(category)
      const matches = keywords.some(kw => jobTitle.includes(kw))
      if (matches) {
        matchedCategory = category
        break
      }
    }

    if (matchedCategory) {
      score += 30
      hits.push(`Title matches "${matchedCategory}" category (+30)`)
    } else {
      const cats = preferences.preferred_titles.slice(0, 2).join(', ')
      const more = preferences.preferred_titles.length > 2 ? ` +${preferences.preferred_titles.length - 2} more` : ''
      misses.push(`"${job.title}" doesn't match your categories (${cats}${more}) — 30 pts missing`)
    }
  } else {
    misses.push('No job categories selected in preferences — add them to unlock +30 pts')
  }

  // ── Employment type hint ─────────────────────────────────── (informational, no pts)
  if (preferences?.employment_type) {
    const titleLower = job.title.toLowerCase()
    const descLower  = (job.description ?? '').toLowerCase()
    const isInternship = titleLower.includes('intern') || descLower.includes('internship')
    const prefIsIntern = preferences.employment_type === 'internship'

    if (prefIsIntern && !isInternship) {
      misses.push(`You're looking for internships — this may be a full-time role`)
    } else if (!prefIsIntern && isInternship) {
      misses.push(`This appears to be an internship — you're looking for ${preferences.employment_type}`)
    }
  }

  // ── Location match ───────────────────────────────────────── 20 pts
  if (preferences?.preferred_locations?.length) {
    const jobLocation = (job.location ?? '').toLowerCase()
    const wantsRemote = preferences.preferred_locations.some(l => l.toLowerCase() === 'remote')
    const jobIsRemote  = job.work_mode === 'remote' || jobLocation.includes('remote')

    if (wantsRemote && jobIsRemote) {
      score += 20
      hits.push('Remote work available and preferred (+20)')
    } else {
      const matched = preferences.preferred_locations.find(l =>
        jobLocation.includes(l.toLowerCase()),
      )
      if (matched) {
        score += 20
        hits.push(`Location matches "${matched}" (+20)`)
      } else {
        const loc = job.location ?? 'not specified'
        misses.push(`Location "${loc}" doesn't match your preferred locations — 20 pts missing`)
      }
    }
  } else {
    misses.push('No preferred locations set — add them to unlock +20 pts')
  }

  // ── Work mode match ──────────────────────────────────────── 20 pts
  if (preferences?.work_mode && job.work_mode) {
    if (preferences.work_mode === job.work_mode) {
      score += 20
      hits.push(`Work mode "${job.work_mode}" matches preference (+20)`)
    } else if (job.work_mode === 'hybrid' || preferences.work_mode === 'hybrid') {
      score += 10
      hits.push('Hybrid partial match (+10)')
      misses.push('Exact work mode match would add another +10 pts')
    } else {
      misses.push(`Work mode mismatch: you want ${preferences.work_mode}, job is ${job.work_mode} — 20 pts missing`)
    }
  } else if (!preferences?.work_mode) {
    misses.push('Set work mode preference to unlock +20 pts')
  } else if (!job.work_mode) {
    misses.push('Job has no work mode listed — add it to enable matching')
  }

  // ── Keyword overlap ──────────────────────────────────────── 30 pts
  if (resume?.resume_text && job.description) {
    const resumeWords   = new Set(tokenize(resume.resume_text))
    const jobWords      = tokenize(job.description)
    const matchedKws    = Array.from(new Set(jobWords.filter(w => resumeWords.has(w))))

    const pts = Math.round(Math.min(matchedKws.length / 15, 1) * 30)
    if (pts > 0) {
      score += pts
      const top  = matchedKws.slice(0, 6).join(', ')
      const more = matchedKws.length > 6 ? ` +${matchedKws.length - 6} more` : ''
      hits.push(`${matchedKws.length} resume keywords match the JD: ${top}${more} (+${pts})`)
    } else {
      misses.push('Your resume has no keyword overlap with this JD — tailor your resume or add more skills')
    }
  } else if (!resume?.resume_text) {
    misses.push('Upload & extract your resume to unlock keyword matching (+30 pts)')
  } else {
    misses.push('Add a job description to enable keyword matching (+30 pts)')
  }

  const finalScore = Math.min(score, 100)

  const prefix =
    finalScore >= 70 ? 'Strong match' :
    finalScore >= 40 ? 'Partial match' :
    finalScore >  0  ? 'Early-stage fit' :
                       'Not yet matched'

  const lines: string[] = [`${prefix} — ${finalScore}/100`]
  if (hits.length)  lines.push(...hits.map(h => `✓ ${h}`))
  if (misses.length) lines.push(...misses.map(m => `✗ ${m}`))

  return { score: finalScore, explanation: lines.join('\n') }
}

export function scoreClass(score: number | null | undefined): string {
  if (score == null) return 'none'
  if (score >= 70) return 'high'
  if (score >= 40) return 'mid'
  return 'low'
}
