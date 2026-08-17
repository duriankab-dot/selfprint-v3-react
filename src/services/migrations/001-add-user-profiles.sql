-- Migration: Add user_profiles table with analysis completion flag
-- Date: 2026-08-16
-- Purpose: Track user full analysis completion before Twin awakening

-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_analysis_completed boolean DEFAULT false,
  full_analysis_completed_at timestamp,
  emotional_profile jsonb, -- Store emotional readiness data
  birth_data jsonb, -- Store birth data if provided
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own profile
CREATE POLICY "User profile access" ON user_profiles
  FOR ALL USING (auth.uid() = id);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_analysis_completed
  ON user_profiles(id)
  WHERE full_analysis_completed = true;

-- Create profile entry when user is created (via trigger)
-- Note: In Supabase, user creation is handled by auth.users table
-- This policy assumes profiles are created on-demand when first accessed
