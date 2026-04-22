import Anthropic from '@anthropic-ai/sdk'
import type { Job, Resume, JobAnalysis } from '@/lib/types'

const SYSTEM_PROMPT = `You are a job analysis assistant. Extract structured information from job descriptions and compare them with a candidate's resume. Respond with valid JSON only — no markdown, no explanation, no code blocks.`

function buildPrompt(job: Job, resume: Resume | null): string {
  const resumeText = resume?.resume_text?.slice(0, 3000) ?? 'No resume provided.'
  const description = job.description?.slice(0, 4000) ?? 'No description provided.'

  return `Analyze this job posting and compare it with the candidate's resume.

JOB TITLE: ${job.title}
COMPANY: ${job.company}
DESCRIPTION:
${description}

CANDIDATE RESUME:
${resumeText}

Return a JSON object with EXACTLY this shape:
{
  "employment_type": "full-time" | "part-time" | "internship" | "contract" | "unknown",
  "sponsorship": "yes" | "no" | "unknown",
  "required_skills": ["skill1", "skill2"],
  "matched_skills": ["skill1"],
  "missing_skills": ["skill2"]
}

Rules:
- employment_type: infer from job title and description (intern/internship → "internship")
- sponsorship: "yes" if sponsorship is explicitly offered, "no" if it says no sponsorship or must be authorized to work in the US, "unknown" if not mentioned
- required_skills: up to 10 key technical skills, languages, frameworks, or tools from the JD
- matched_skills: which required_skills appear in the candidate's resume
- missing_skills: which required_skills are NOT in the candidate's resume`
}

function mockAnalysis(job: Job): JobAnalysis {
  const title = job.title.toLowerCase()
  const desc  = (job.description ?? '').toLowerCase()

  const employment_type =
    title.includes('intern') || desc.includes('internship') ? 'internship' :
    desc.includes('part-time') || desc.includes('part time')  ? 'part-time'  :
    desc.includes('contract')                                  ? 'contract'   : 'full-time'

  const sponsorship =
    desc.includes('no sponsorship') || desc.includes('must be authorized') ? 'no'      :
    desc.includes('sponsorship')                                            ? 'yes'     : 'unknown'

  return { employment_type, sponsorship, required_skills: [], matched_skills: [], missing_skills: [] }
}

export async function analyzeJob(job: Job, resume: Resume | null): Promise<JobAnalysis> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return mockAnalysis(job)

  try {
    const client = new Anthropic({ apiKey })
    const message = await client.messages.create({
      model:      'claude-opus-4-7',
      max_tokens: 512,
      system:     SYSTEM_PROMPT,
      messages:   [{ role: 'user', content: buildPrompt(job, resume) }],
    })

    const block = message.content[0]
    if (block.type !== 'text') return mockAnalysis(job)

    const text = block.text.trim().replace(/^```json\s*/i, '').replace(/```$/,'')
    return JSON.parse(text) as JobAnalysis
  } catch {
    return mockAnalysis(job)
  }
}
