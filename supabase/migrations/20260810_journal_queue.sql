-- § 37 Offline Journal Queue
-- Local message queue สำหรับ sync เมื่อ online
-- ============================================================

CREATE TABLE IF NOT EXISTS public.journal_queue (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content           TEXT        NOT NULL,
  hub               TEXT,      -- Hub context when saved
  mood              TEXT,      -- Mood context when saved
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  synced_at         TIMESTAMPTZ,
  sync_error        TEXT,
  sync_attempts     INT         DEFAULT 0,
  metadata          JSONB       DEFAULT '{}' -- Extra context (e.g., thread_id)
);

-- Index: fast lookup for unsynced messages
CREATE INDEX IF NOT EXISTS idx_journal_queue_unsync
  ON public.journal_queue (user_id, synced_at)
  WHERE synced_at IS NULL;

-- Index: lookup by user
CREATE INDEX IF NOT EXISTS idx_journal_queue_user
  ON public.journal_queue (user_id, created_at DESC);

-- RLS: users can only access their own queue
ALTER TABLE public.journal_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own journal_queue"
  ON public.journal_queue FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journal_queue"
  ON public.journal_queue FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal_queue"
  ON public.journal_queue FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role (via supabaseAdmin in api/journal-sync.ts) can write
-- No explicit policy needed — service role bypasses RLS
