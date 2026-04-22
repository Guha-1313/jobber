/**
 * Storage helpers for Supabase Storage.
 *
 * Bucket setup (do this manually in Supabase Dashboard):
 *   Name: resume
 *   Public: NO (private bucket — files accessed via signed URLs only)
 *   Allowed MIME types: application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document
 *   Max file size: 10 MB
 *
 * File path convention: {user_id}/{timestamp}-{sanitized_filename}
 *
 * These helpers are stubs — fully implemented in Day 3.
 */

import { createClient } from './client'

const BUCKET = 'resume'

/** Generates the storage path for a user's resume file. */
export function buildResumePath(userId: string, fileName: string): string {
  const timestamp = Date.now()
  const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
  return `${userId}/${timestamp}-${sanitized}`
}

/**
 * Uploads a resume file to Supabase Storage and returns the storage path.
 * Implemented in Day 3.
 */
export async function uploadResume(
  userId: string,
  file: File
): Promise<{ path: string; error: string | null }> {
  const supabase = createClient()
  const path = buildResumePath(userId, file.name)

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type,
  })

  if (error) return { path: '', error: error.message }
  return { path, error: null }
}

/**
 * Returns a short-lived signed URL for downloading a resume.
 * Implemented in Day 3.
 */
export async function getResumeUrl(
  filePath: string,
  expiresInSeconds = 60
): Promise<{ url: string | null; error: string | null }> {
  const supabase = createClient()

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(filePath, expiresInSeconds)

  if (error) return { url: null, error: error.message }
  return { url: data.signedUrl, error: null }
}

/**
 * Deletes a resume file from storage.
 * Implemented in Day 3.
 */
export async function deleteResume(
  filePath: string
): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { error } = await supabase.storage.from(BUCKET).remove([filePath])
  return { error: error?.message ?? null }
}
