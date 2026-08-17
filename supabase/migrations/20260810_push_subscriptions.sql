/**
 * 20260810_push_subscriptions.sql
 *
 * Create push_subscriptions table for Web Push notifications
 * Master Direction §26-27: Push Infrastructure
 *
 * Supabase cloud-compatible version (no FK constraint needed)
 * RLS policies handle auth isolation
 */

-- Create push_subscriptions table (no FK, RLS instead)
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  endpoint text not null,
  keys_p256dh text not null,
  keys_auth text not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  is_active boolean not null default true,
  unique(user_id, endpoint)
);

-- Create indexes
create index if not exists idx_push_subscriptions_user_id
  on public.push_subscriptions(user_id);

create index if not exists idx_push_subscriptions_is_active
  on public.push_subscriptions(is_active);

create index if not exists idx_push_subscriptions_user_active
  on public.push_subscriptions(user_id, is_active);

-- Enable RLS
alter table public.push_subscriptions enable row level security;

-- RLS Policies
create policy "Users can view their own subscriptions"
  on public.push_subscriptions
  for select
  using (auth.uid() = user_id);

create policy "Users can insert their own subscriptions"
  on public.push_subscriptions
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own subscriptions"
  on public.push_subscriptions
  for update
  using (auth.uid() = user_id);

create policy "Users can delete their own subscriptions"
  on public.push_subscriptions
  for delete
  using (auth.uid() = user_id);

-- Auto-update timestamp
create or replace function public.update_push_subscriptions_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists push_subscriptions_updated_at_trigger on public.push_subscriptions;
create trigger push_subscriptions_updated_at_trigger
  before update on public.push_subscriptions
  for each row
  execute function public.update_push_subscriptions_updated_at();
