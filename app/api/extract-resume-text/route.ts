import { NextRequest, NextResponse } from 'next/server'
import mammoth from 'mammoth'
import { createClient } from '@/lib/supabase/server'

// pdfjs-dist uses DOMMatrix for text transforms — polyfill for Node.js / Vercel serverless
if (typeof globalThis.DOMMatrix === 'undefined') {
  class DOMMatrixPolyfill {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0
    constructor(init?: number[] | string) {
      if (Array.isArray(init) && init.length >= 6) {
        [this.a, this.b, this.c, this.d, this.e, this.f] = init
      }
    }
    transformPoint(p: { x?: number; y?: number }) {
      const x = p.x ?? 0, y = p.y ?? 0
      return { x: this.a * x + this.c * y + this.e, y: this.b * x + this.d * y + this.f, z: 0, w: 1 }
    }
    multiply(m: { a:number; b:number; c:number; d:number; e:number; f:number }) {
      return new DOMMatrixPolyfill([
        this.a * m.a + this.c * m.b, this.b * m.a + this.d * m.b,
        this.a * m.c + this.c * m.d, this.b * m.c + this.d * m.d,
        this.a * m.e + this.c * m.f + this.e, this.b * m.e + this.d * m.f + this.f,
      ])
    }
    scale(sx: number, sy: number) {
      return new DOMMatrixPolyfill([this.a * sx, this.b * sx, this.c * sy, this.d * sy, this.e, this.f])
    }
    translate(tx: number, ty: number) {
      return new DOMMatrixPolyfill([this.a, this.b, this.c, this.d, this.a * tx + this.c * ty + this.e, this.b * tx + this.d * ty + this.f])
    }
  }
  // @ts-expect-error — polyfill for serverless
  globalThis.DOMMatrix = DOMMatrixPolyfill
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  // Use pdfjs-dist legacy build — no worker needed, works in serverless
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
  // @ts-expect-error — workerSrc must be disabled for Node.js/serverless
  pdfjs.GlobalWorkerOptions.workerSrc = false

  const data  = new Uint8Array(buffer)
  const doc   = await pdfjs.getDocument({ data, disableRange: true, disableStream: true }).promise
  const pages: string[] = []

  for (let i = 1; i <= doc.numPages; i++) {
    const page    = await doc.getPage(i)
    const content = await page.getTextContent()
    const lines   = content.items
      .filter(item => 'str' in item)
      .map(item => (item as { str: string }).str)
      .join(' ')
    pages.push(lines)
  }

  return pages.join('\n\n')
}

export async function POST(req: NextRequest) {
  try {
    return await handleExtract(req)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unexpected error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

async function handleExtract(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let file: File | null = null
  try {
    const form = await req.formData()
    file = form.get('file') as File | null
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  let text = ''

  if (file.type === 'application/pdf') {
    try {
      text = await extractPdfText(buffer)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      return NextResponse.json({ error: `PDF parse failed: ${msg}` }, { status: 422 })
    }
  } else if (
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    try {
      const result = await mammoth.extractRawText({ buffer })
      text = result.value
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      return NextResponse.json({ error: `DOCX parse failed: ${msg}` }, { status: 422 })
    }
  } else {
    return NextResponse.json({ error: 'Unsupported file type — upload PDF or DOCX' }, { status: 400 })
  }

  const cleaned = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return NextResponse.json({ text: cleaned })
}
