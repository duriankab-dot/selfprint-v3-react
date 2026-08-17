-- § 37 Offline Journal Queue — Chat Messages Storage
-- Store synced journal messages (from journal_queue)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role              TEXT        NOT NULL CHECK (role IN ('user', 'assistant')),
  content           TEXT        NOT NULL,
  hub               TEXT,
  mood              TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata          JSONB       DEFAULT '{}'
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_created
  ON public.chat_messages (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_role
  ON public.chat_messages (user_id, role, created_at DESC);

-- RLS: users can read/write their own messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own messages"
  ON public.chat_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service role (api/journal-sync.ts) can insert via supabaseAdmin
-- No explicit policy needed — service role bypasses RLS
