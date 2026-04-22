import { NextRequest, NextResponse } from 'next/server'

type ExtractedJob = {
  title:        string
  company:      string
  location:     string
  work_mode:    string
  salary_range: string
  description:  string
  apply_url:    string
  source:       string
}

// ── Strip HTML → plain text ──────────────────────────────────────────────────

function stripTags(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// ── JSON-LD structured data ──────────────────────────────────────────────────
// Most reliable — LinkedIn, Greenhouse, Lever, Workday, Ashby all use this

function fromJsonLd(html: string): Partial<ExtractedJob> {
  const result: Partial<ExtractedJob> = {}
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let m: RegExpExecArray | null

  while ((m = re.exec(html)) !== null) {
    try {
      const raw = JSON.parse(m[1])
      const items: unknown[] = Array.isArray(raw) ? raw : [raw]

      for (const item of items) {
        if (typeof item !== 'object' || item === null) continue
        const obj = item as Record<string, unknown>
        if (obj['@type'] !== 'JobPosting') continue

        if (typeof obj.title === 'string' && !result.title) result.title = obj.title.trim()

        const org = obj.hiringOrganization as Record<string, unknown> | undefined
        if (typeof org?.name === 'string' && !result.company) result.company = org.name.trim()

        const locRaw = obj.jobLocation
        const loc = Array.isArray(locRaw) ? locRaw[0] : locRaw
        if (typeof loc === 'object' && loc !== null && !result.location) {
          const addr = (loc as Record<string, unknown>).address as Record<string, string> | undefined
          if (addr) {
            const parts = [addr.addressLocality, addr.addressRegion, addr.addressCountry].filter(Boolean)
            if (parts.length) result.location = parts.join(', ')
          }
        }

        if (obj.jobLocationType === 'TELECOMMUTE' && !result.work_mode) result.work_mode = 'remote'

        const sal = obj.baseSalary as Record<string, unknown> | undefined
        if (sal && !result.salary_range) {
          const val = sal.value as Record<string, unknown> | undefined
          const min = val?.minValue ?? sal.minValue
          const max = val?.maxValue ?? sal.maxValue
          const currency = (val?.currency ?? sal.currency ?? '$') as string
          const sym = currency === 'USD' ? '$' : currency
          if (min && max) result.salary_range = `${sym}${min}–${sym}${max}`
        }

        if (typeof obj.description === 'string' && !result.description) {
          result.description = stripTags(obj.description)
        }
      }
    } catch {
      // malformed JSON-LD — skip
    }
  }

  return result
}

// ── Next.js __NEXT_DATA__ payload ─────────────────────────────────────────────
// Many modern job boards (Ashby, Rippling, some Greenhouse deployments) are
// Next.js apps and embed the full page data as JSON in a script tag

function fromNextData(html: string): Partial<ExtractedJob> {
  const result: Partial<ExtractedJob> = {}
  const m = /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i.exec(html)
  if (!m) return result

  try {
    const raw = JSON.parse(m[1]) as Record<string, unknown>
    const text = JSON.stringify(raw)

    // Heuristic: look for common job field names inside the JSON blob
    const titleMatch = /"(?:jobTitle|title|job_title|position)":\s*"([^"]{5,120})"/i.exec(text)
    if (titleMatch && !result.title) result.title = titleMatch[1]

    const companyMatch = /"(?:company|companyName|organization|employer)":\s*"([^"]{2,100})"/i.exec(text)
    if (companyMatch && !result.company) result.company = companyMatch[1]

    const locationMatch = /"(?:location|jobLocation|city)":\s*"([^"]{2,100})"/i.exec(text)
    if (locationMatch && !result.location) result.location = locationMatch[1]

    const descMatch = /"(?:description|jobDescription|body|content)":\s*"((?:[^"\\]|\\.)*)"/i.exec(text)
    if (descMatch && !result.description) {
      const raw = descMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\t/g, ' ')
      result.description = stripTags(raw)
    }
  } catch {
    // ignore
  }

  return result
}

// ── Open Graph / meta tags ───────────────────────────────────────────────────

function fromMeta(html: string): Partial<ExtractedJob> {
  const result: Partial<ExtractedJob> = {}

  const ogTitle =
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i.exec(html) ??
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i.exec(html)
  if (ogTitle) result.title = ogTitle[1].trim()

  // og:description is often a clean 1-2 sentence summary, but not the full JD
  const ogDesc =
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i.exec(html) ??
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i.exec(html)
  if (ogDesc && !result.description) result.description = ogDesc[1].trim()

  // Try meta description as fallback
  if (!result.description) {
    const metaDesc =
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i.exec(html) ??
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i.exec(html)
    if (metaDesc) result.description = metaDesc[1].trim()
  }

  // <title> tag fallback for job title — clean up "Job Title | Company" patterns
  if (!result.title) {
    const htmlTitle = /<title[^>]*>([^<]+)<\/title>/i.exec(html)
    if (htmlTitle) {
      const raw = htmlTitle[1].trim()
      // Try to extract just the job title from "Job Title | Company | Site" format
      const parts = raw.split(/\s*[|·–—]\s*/)
      result.title = parts[0].trim() || raw
    }
  }

  return result
}

// ── Targeted job description extraction ──────────────────────────────────────
// Extract the job description div by looking for common CSS selectors / IDs
// used by Greenhouse, Lever, Ashby, Workday, and generic job boards

function extractJobDescriptionDiv(html: string): string {
  const selectors = [
    // Greenhouse
    /<div[^>]+id=["']content["'][^>]*>([\s\S]*?)<\/div>\s*(?:<\/section>|<\/div>|<footer)/i,
    /<section[^>]+class=["'][^"']*content[^"']*["'][^>]*>([\s\S]*?)<\/section>/i,
    // Lever
    /<div[^>]+class=["'][^"']*posting-description[^"']*["'][^>]*>([\s\S]*?)<\/div>\s*(?:<\/div>|<section|<footer)/i,
    // Ashby
    /<div[^>]+class=["'][^"']*job-post-description[^"']*["'][^>]*>([\s\S]*?)<\/div>\s*(?:<\/div>|<section)/i,
    // Generic: "job-description" class
    /<(?:div|section|article)[^>]+class=["'][^"']*job-description[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|section|article)>/i,
    // Generic: "job-detail" class
    /<(?:div|section)[^>]+class=["'][^"']*job-detail[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|section)>/i,
    // Generic: description role
    /<(?:div|section|article)[^>]+(?:id|class)=["'][^"']*description[^"']*["'][^>]*>([\s\S]*?)<\/(?:div|section|article)>/i,
    // Workday
    /<div[^>]+data-automation-id=["']jobPostingDescription["'][^>]*>([\s\S]*?)<\/div>/i,
    // Indeed
    /<div[^>]+id=["']jobDescriptionText["'][^>]*>([\s\S]*?)<\/div>/i,
  ]

  for (const re of selectors) {
    const m = re.exec(html)
    if (m?.[1]) {
      const text = stripTags(m[1])
      if (text.length >= 200) return text  // require at least 200 chars to be meaningful
    }
  }
  return ''
}

// ── Heuristics on plain text ─────────────────────────────────────────────────

function inferWorkMode(text: string): string {
  const t = text.toLowerCase()
  if (/\bhybrid\b/.test(t)) return 'hybrid'
  if (/\bremote\b/.test(t)) return 'remote'
  if (/\bon.?site\b|\bin.?person\b|\bin.?office\b/.test(t)) return 'onsite'
  return ''
}

function inferSalary(text: string): string {
  const range = text.match(/\$[\d,]+[kK]?\s*[-–—]\s*\$[\d,]+[kK]?/)
  if (range) return range[0]
  const single = text.match(/\$[\d,]+[kK](?:\s*\/\s*(?:yr|year|hour|hr))?/)
  if (single) return single[0]
  return ''
}

function inferLocation(text: string): string {
  // Try "Location: City, ST" or "📍 City, ST" patterns common in job postings
  const explicit = text.match(/(?:location|located|based)[\s:]+([A-Z][a-zA-Z\s]+,\s*[A-Z]{2})/i)
  if (explicit) return explicit[1].trim()
  return ''
}

function sourceFromUrl(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '')
    const map: Record<string, string> = {
      'linkedin.com':        'LinkedIn',
      'greenhouse.io':       'Greenhouse',
      'lever.co':            'Lever',
      'workday.com':         'Workday',
      'indeed.com':          'Indeed',
      'glassdoor.com':       'Glassdoor',
      'jobs.ashbyhq.com':    'Ashby',
      'ashbyhq.com':         'Ashby',
      'wellfound.com':       'Wellfound',
      'angel.co':            'Wellfound',
      'smartrecruiters.com': 'SmartRecruiters',
      'jobvite.com':         'Jobvite',
      'icims.com':           'iCIMS',
      'taleo.net':           'Taleo',
      'myworkdayjobs.com':   'Workday',
      'rippling.com':        'Rippling',
      'bamboohr.com':        'BambooHR',
    }
    for (const [domain, name] of Object.entries(map)) {
      if (host.includes(domain)) return name
    }
    return host
  } catch {
    return 'manual'
  }
}

// ── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let url: string
  try {
    const body = await req.json() as { url?: unknown }
    url = typeof body.url === 'string' ? body.url.trim() : ''
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!url) return NextResponse.json({ error: 'url is required' }, { status: 400 })

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return NextResponse.json({ error: 'Invalid URL — include https://' }, { status: 400 })
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return NextResponse.json({ error: 'Only http/https URLs are supported' }, { status: 400 })
  }

  // Fetch the page with a real browser User-Agent to avoid basic bot blocks
  let html: string
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
      },
      signal: AbortSignal.timeout(15000),
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Page returned ${response.status} — the URL may require login or be behind a wall.` },
        { status: 422 },
      )
    }
    html = await response.text()
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: `Could not fetch the URL: ${msg}` }, { status: 422 })
  }

  // Layer 1: JSON-LD structured data (most reliable, most sites have it)
  const structured = fromJsonLd(html)

  // Layer 2: Next.js __NEXT_DATA__ payload (SPA job boards)
  const nextData = fromNextData(html)

  // Layer 3: Open Graph / meta tags
  const meta = fromMeta(html)

  // Layer 4: Targeted job description div extraction
  const descFromDiv = extractJobDescriptionDiv(html)

  // Layer 5: Full page plain text (last resort)
  const fullText = stripTags(html)

  // Merge layers — earlier layers win for title/company/location/work_mode/salary
  const extracted: Partial<ExtractedJob> = {
    ...meta,
    ...nextData,
    ...structured,
  }

  // Description: prefer JSON-LD (most complete), then targeted div, then full page
  if (!extracted.description || extracted.description.length < 200) {
    if (descFromDiv.length > (extracted.description?.length ?? 0)) {
      extracted.description = descFromDiv
    }
  }
  if (!extracted.description || extracted.description.length < 100) {
    // Fall back to full page text, but try to trim boilerplate from start/end
    extracted.description = fullText.slice(0, 8000)
  }

  // Heuristic fill-ins for fields still missing after structured extraction
  const plainTextSample = fullText.slice(0, 20000)
  if (!extracted.work_mode)    extracted.work_mode    = inferWorkMode(plainTextSample)
  if (!extracted.salary_range) extracted.salary_range = inferSalary(plainTextSample)
  if (!extracted.location)     extracted.location     = inferLocation(plainTextSample)

  // Always set these from the URL
  extracted.source    = sourceFromUrl(url)
  extracted.apply_url = url

  return NextResponse.json({ data: extracted })
}
