/**
 * FileUploadService.ts
 * Handles file uploads to Supabase Storage
 *
 * RESTORED 16 ก.ย. 2026: Restored from git history (deleted 15 ก.ย. 2026 in
 * the build-fix round with a broken import path). The wrong relative import
 * (`../services/supabase-service`) pointed outside src/lib, which is what
 * broke the build. Correct path from src/lib/storage is `../../services`.
 *
 * P3.2 (17 ก.ย. 2026): Added browser-side image optimization pipeline
 * using native Canvas API. Images are resized to 512×512 max, converted
 * to WebP/JPEG at 85% quality, and capped at ~200KB before upload.
 */

import { supabase } from '../../services/supabase-service';
import { processImageForUpload } from './imageProcessor';

export interface UploadedFile {
  path: string;
  url: string;
  size: number;
  mimeType: string;
  processedSize?: number;
}
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function validateFile(file: File): Promise<{ valid: true } | { valid: false; error: string }> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Please upload JPG, PNG, WebP, or GIF.' };
  }
  if (file.size > MAX_SIZE) {
    return { valid: false, error: `File too large. Maximum size is 5MB.` };
  }
  return { valid: true };
}

export async function uploadProfilePicture(
  userId: string,
  twinId: string,
  file: File
): Promise<UploadedFile> {
  if (!supabase) {
    throw new Error('Supabase client unavailable');
  }

  const validation = await validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const processed = await processImageForUpload(file);

  const ext = (processed.blob as File).name.split('.').pop() || 'webp';
  const timestamp = Date.now();
  const path = `profiles/${userId}/${twinId}/${timestamp}.${ext}`;

  const { error } = await supabase.storage
    .from('profiles')
    .upload(path, processed.blob, {
      upsert: true,
      contentType: processed.mimeType,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from('profiles')
    .getPublicUrl(path);

  return {
    path,
    url: urlData.publicUrl,
    size: processed.size,
    mimeType: processed.mimeType,
    processedSize: processed.size,
  };
}

export async function deleteProfilePicture(path: string): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase client unavailable');
  }

  const { error } = await supabase.storage
    .from('profiles')
    .remove([path]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}

export async function getLatestProfilePicture(userId: string, twinId?: string): Promise<string | null> {
  if (!supabase) {
    return null;
  }

  const folder = twinId ? `profiles/${userId}/${twinId}` : `profiles/${userId}`;
  const { data: files, error } = await supabase.storage.from('profiles').list(folder);

  if (error || !files || files.length === 0) {
    return null;
  }

  const latest = files.sort((a, b) => b.name.localeCompare(a.name))[0];
  const fullPath = `${folder}/${latest.name}`;
  const { data: urlData } = supabase.storage.from('profiles').getPublicUrl(fullPath);

  return urlData.publicUrl;
}