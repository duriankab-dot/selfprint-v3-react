/**
 * FileUploadService.ts
 * Handles file uploads to Supabase Storage
 */

import { supabase } from '../services/supabase-service';

export interface UploadedFile {
  path: string;
  url: string;
  size: number;
  mimeType: string;
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
  const validation = await validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const timestamp = Date.now();
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `profiles/${userId}/${twinId}/${timestamp}.${ext}`;

  const { data, error } = await supabase.storage
    .from('profiles')
    .upload(path, file, {
      upsert: true,
      contentType: file.type,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('profiles')
    .getPublicUrl(path);

  return {
    path: data.path,
    url: urlData.publicUrl,
    size: file.size,
    mimeType: file.type,
  };
}

export async function deleteProfilePicture(path: string): Promise<void> {
  const { error } = await supabase.storage
    .from('profiles')
    .remove([path]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}

export async function getLatestProfilePicture(userId: string, twinId: string): Promise<string | null> {
  const { data: files, error } = await supabase.storage
    .from('profiles')
    .list(`profiles/${userId}/${twinId}`);

  if (error || !files || files.length === 0) {
    return null;
  }

  // Get the most recent file (sorted by name which includes timestamp)
  const latest = files.sort((a, b) => b.name.localeCompare(a.name))[0];
  const { data: urlData } = supabase.storage
    .from('profiles')
    .getPublicUrl(`profiles/${userId}/${twinId}/${latest.name}`);

  return urlData.publicUrl;
}
