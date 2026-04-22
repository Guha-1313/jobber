import { NextRequest, NextResponse } from 'next/server'
import { PDFParse } from 'pdf-parse'
import mammoth from 'mammoth'

export async function POST(req: NextRequest) {
  let file: File | null = null
  try {
    const form = await req.formData()
    file = form.get('file') as File | null
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  let text = ''

  if (file.type === 'application/pdf') {
    const parser = new PDFParse({ data: buffer })
    try {
      const result = await parser.getText()
      text = result.text
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      return NextResponse.json({ error: `PDF parse failed: ${msg}` }, { status: 422 })
    } finally {
      await parser.destroy()
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

  // Clean up excessive whitespace while preserving meaningful line breaks
  const cleaned = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  return NextResponse.json({ text: cleaned })
}
