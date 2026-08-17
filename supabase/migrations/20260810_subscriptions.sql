-- § 31 Monetization — Subscriptions table
-- Stores Stripe subscription state per user
-- ============================================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
  user_id                UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tier                   TEXT        NOT NULL DEFAULT 'free'
                                     CHECK (tier IN ('free', 'plus', 'pro', 'lifetime')),
  status                 TEXT        NOT NULL DEFAULT 'active'
                                     CHECK (status IN ('active', 'expired', 'cancelled', 'pending')),
  stripe_customer_id     TEXT,
  stripe_subscription_id TEXT,
  expires_at             TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index: look up by Stripe customer ID (used in webhook payment_failed)
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer
  ON public.subscriptions (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- RLS: users can only read their own subscription
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Service-role key bypasses RLS (used in api/stripe.ts via supabaseAdmin)
-- No INSERT/UPDATE policy for anon/authenticated — only service role writes

-- Trigger: auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
