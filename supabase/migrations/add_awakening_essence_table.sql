-- ========================================
-- Phase 3: Core Awakening Essence Persistence
-- ========================================
-- สร้าง table สำหรับเก็บ essence ของ Twin ก่อนการสร้าง
-- ป้องกัน sessionStorage hack

CREATE TABLE IF NOT EXISTS public.awakening_essence (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User & Twin Reference
  user_id UUID NOT NULL,
  twin_id UUID,  -- NULL ระหว่าง awakening, SET เมื่อ Twin สร้าง

  -- Essence Data (JSON)
  personal_intelligence JSONB NOT NULL,  -- SICE synthesis result
  sice_results JSONB NOT NULL,  -- ผลลัพธ์จากทั้ง 12 engines
  synthesis JSONB NOT NULL,  -- Cross-engine synthesis
  execution_time INTEGER,  -- Milliseconds

  -- Status Tracking
  status TEXT DEFAULT 'pending',  -- 'pending' → 'used' → 'archived'
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  used_at TIMESTAMP WITH TIME ZONE,  -- When Twin was created
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '24 hours'),  -- Auto-cleanup after 24h

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Constraints
  CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_twin_id FOREIGN KEY (twin_id) REFERENCES twins(id) ON DELETE SET NULL,
  CONSTRAINT essence_status_check CHECK (status IN ('pending', 'used', 'archived'))
);

-- ========================================
-- Indexes for Performance
-- ========================================
CREATE INDEX idx_awakening_essence_user_id ON public.awakening_essence(user_id);
CREATE INDEX idx_awakening_essence_status ON public.awakening_essence(status);
CREATE INDEX idx_awakening_essence_twin_id ON public.awakening_essence(twin_id) WHERE twin_id IS NOT NULL;
CREATE INDEX idx_awakening_essence_expires ON public.awakening_essence(expires_at);  -- For cleanup jobs

-- ========================================
-- Row-Level Security (RLS)
-- ========================================
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

-- Policy 4: Service role can delete expired essence (for cleanup)
CREATE POLICY "service_delete_expired_essence"
  ON public.awakening_essence
  FOR DELETE
  USING (current_setting('role') = 'service_role' OR expires_at < now());

-- ========================================
-- Cleanup Function (optional, for later)
-- ========================================
-- สำหรับ Supabase cron job ให้ลบ expired essence automatically
CREATE OR REPLACE FUNCTION public.cleanup_expired_essence()
RETURNS void AS $$
BEGIN
  DELETE FROM public.awakening_essence
  WHERE status = 'pending' AND expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- Trigger: Update updated_at timestamp
-- ========================================
CREATE TRIGGER update_awakening_essence_timestamp
  BEFORE UPDATE ON public.awakening_essence
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();

COMMENT ON TABLE public.awakening_essence IS 'เก็บ Twin essence ระหว่าง Core Awakening ceremony — ต้อง persist ให้นาน 24 ชั่วโมง';
COMMENT ON COLUMN public.awakening_essence.status IS 'pending = อยู่รอการใช้, used = Twin สร้างแล้ว, archived = เก่า';
COMMENT ON COLUMN public.awakening_essence.expires_at IS 'Essence หมดอายุหลังจาก 24 ชั่วโมง — ป้องกันข้อมูลค้างค้น';
