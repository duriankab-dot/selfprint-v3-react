-- ============================================================
-- 20260810_push_subscriptions.sql
-- Push notification subscriptions (§26-27)
-- ============================================================

create table if not exists push_subscriptions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  endpoint     text not null,
  keys_p256dh  text not null,
  keys_auth    text not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  -- one subscription per endpoint per user
  unique (user_id, endpoint)
);

-- RLS: users can only read/write their own subscriptions
alter table push_subscriptions enable row level security;

create policy "Users manage own push subscriptions"
  on push_subscriptions
  for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- updated_at trigger
create or replace function update_push_subscriptions_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger push_subscriptions_updated_at
  before update on push_subscriptions
  for each row execute function update_push_subscriptions_updated_at();

-- Index for fast per-user lookup
create index if not exists push_subscriptions_user_id_idx
  on push_subscriptions (user_id);
