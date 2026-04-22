import Anthropic from '@anthropic-ai/sdk'
import type { Job, JobPreferences, Resume } from '@/lib/types'

const SYSTEM_PROMPT = `You are a professional cover letter writer. Write focused, authentic cover letters that:
- Open by referencing the specific role and company — no generic openers
- Connect the candidate's real experience directly to the job's requirements
- Reference 1–2 concrete details from the job description
- Avoid clichés: "team player", "fast learner", "excited to apply", "passionate about"
- Stay concise — 3 tight paragraphs, under 320 words total
- Use a professional but direct tone — not stiff or overly formal
- Close with a clear, confident call to action
- Sign off with "Sincerely," on its own line
- NEVER mention citizenship, visa status, or work authorization unless the candidate's work authorization is explicitly provided — do not assume or infer it`

function buildUserPrompt(
  job: Job,
  preferences: JobPreferences | null,
  resume: Resume | null,
): string {
  const parts: string[] = []

  if (resume?.resume_text) {
    parts.push(`RESUME (use this to ground the letter in real experience):\n${resume.resume_text.slice(0, 4000)}`)
  } else {
    parts.push('RESUME: Not provided — write a strong letter with bracketed placeholders like [X years of experience] where specific details are needed.')
  }

  if (preferences) {
    const prefs: string[] = []
    if (preferences.preferred_titles?.length) prefs.push(`Target roles: ${preferences.preferred_titles.join(', ')}`)
    if (preferences.work_mode)               prefs.push(`Work mode preference: ${preferences.work_mode}`)
    if (preferences.years_experience)        prefs.push(`Years of experience: ${preferences.years_experience}`)
    if (preferences.work_authorization)      prefs.push(`Work authorization: ${preferences.work_authorization}`)
    if (prefs.length) parts.push(`CANDIDATE PREFERENCES:\n${prefs.join('\n')}`)
  }

  const jobLines = [
    `Title: ${job.title}`,
    `Company: ${job.company}`,
    job.location  ? `Location: ${job.location}` : null,
    job.work_mode ? `Work mode: ${job.work_mode}` : null,
    job.salary_range ? `Salary: ${job.salary_range}` : null,
  ].filter(Boolean)

  const descSection = job.description
    ? `\n\nJob description:\n${job.description.slice(0, 3000)}`
    : ''

  parts.push(`JOB POSTING:\n${jobLines.join('\n')}${descSection}`)

  return `Write a tailored cover letter for this candidate applying to the role above.\n\n${parts.join('\n\n')}`
}

function mockLetter(job: Job): string {
  return `Dear Hiring Manager,

I am writing to express my interest in the ${job.title} position at ${job.company}. Having built a career focused on delivering quality work and solving real problems, I believe I can contribute meaningfully to your team from day one.

My background includes hands-on experience with the core responsibilities this role demands. I have consistently taken ownership of challenging projects, collaborated across functions, and shipped results in environments where the bar for quality is high — which from what I understand about ${job.company}, is exactly the standard you hold.

What draws me to this opportunity specifically is the combination of an ambitious product and a team that takes craftsmanship seriously. I would welcome the chance to bring that same standard to your work.

Thank you for your time. I look forward to the opportunity to discuss further.

Sincerely,`
}

export async function generateCoverLetter(
  job: Job,
  preferences: JobPreferences | null,
  resume: Resume | null,
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    return mockLetter(job)
  }

  const client = new Anthropic({ apiKey })

  const message = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: buildUserPrompt(job, preferences, resume),
      },
    ],
  })

  const block = message.content[0]
  if (block.type !== 'text') throw new Error('Unexpected response type from Claude')
  return block.text.trim()
}
