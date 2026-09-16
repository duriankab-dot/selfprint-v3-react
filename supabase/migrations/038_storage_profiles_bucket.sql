-- Migration 038: Create profiles storage bucket for Upload UI
-- Enables FileUploadUI.tsx + FileUploadService.ts to persist profile pictures
-- Run in Supabase SQL Editor or via `supabase db push`
--
-- RESTORED 16 ก.ย. 2026 (deleted 15 ก.ย. 2026 in the build-fix round).
-- Idempotent — safe to run at any time and against a DB that already has the
-- bucket. NOTE: migrating the sequence is blocked (external), so until the
-- bucket exists the Upload UI self-guards (upload returns a readable error).

-- Step 1: Create the storage bucket 'profiles'
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'profiles',
  'profiles',
  true,
  false,
  5242880, -- 5MB max file size
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Step 3: Policy — Users can view all public objects in profiles bucket
CREATE POLICY IF NOT EXISTS "Public read access to profiles"
ON storage.objects FOR SELECT
USING (bucket_id = 'profiles');

-- Step 4: Policy — Authenticated users can upload to their own folder
CREATE POLICY IF NOT EXISTS "Users can upload profile pictures"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profiles'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Step 5: Policy — Users can update their own files
CREATE POLICY IF NOT EXISTS "Users can update own profile pictures"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profiles'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Step 6: Policy — Users can delete their own files
CREATE POLICY IF NOT EXISTS "Users can delete own profile pictures"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profiles'
  AND auth.uid()::text = (storage.foldername(name))[1]
);