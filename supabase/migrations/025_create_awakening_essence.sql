-- Phase 3: Core Awakening Essence Persistence
-- สร้าง table สำหรับเก็บ essence ของ Twin ก่อนการสร้าง
-- ป้องกัน sessionStorage hack

CREATE TABLE IF NOT EXISTS public.awakening_essence (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User & Twin Reference
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  twin_id UUID REFERENCES twins(id) ON DELETE SET NULL,  -- NULL ระหว่าง awakening, SET เมื่อ Twin สร้าง

  -- Essence Data (JSON)
  personal_intelligence JSONB NOT NULL,  -- SICE synthesis result
  sice_results JSONB NOT NULL,  -- ผลลัพธ์จากทั้ง 12 engines
  synthesis JSONB NOT NULL,  -- Cross-engine synthesis
  execution_time INTEGER,  -- Milliseconds

  -- Status Tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'used', 'archived')),
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  used_at TIMESTAMP WITH TIME ZONE,  -- When Twin was created
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '24 hours'),  -- Auto-cleanup after 24h

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_awakening_essence_user_id ON public.awakening_essence(user_id);
CREATE INDEX IF NOT EXISTS idx_awakening_essence_status ON public.awakening_essence(status);
CREATE INDEX IF NOT EXISTS idx_awakening_essence_twin_id ON public.awakening_essence(twin_id) WHERE twin_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_awakening_essence_expires ON public.awakening_essence(expires_at);

-- Row-Level Security (RLS)
ALTER TABLE public.awakening_essence ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can see their own awakening essence
CREATE POLICY "users_view_own_awakening_essence"
  ON public.awakening_essence
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy 2: Users can create their own awakening essence
CREATE POLICY "users_create_own_awakening_essence"
  ON public.awakening_essence
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own awakening essence status
CREATE POLICY "users_update_own_awakening_essence"
  ON public.awakening_essence
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE ON public.awakening_essence TO authenticated, service_role;

-- Success
SELECT 'awakening_essence table created ✅' as status;
