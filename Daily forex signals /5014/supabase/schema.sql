-- Run in Supabase SQL Editor.
create type direction as enum ('BUY','SELL');
create type sig_status as enum ('ACTIVE','PENDING','TP_HIT','SL_HIT','CLOSED','CANCELLED');
create type sig_result as enum ('WIN','LOSS','BREAKEVEN','OPEN');

create table admin_roles (user_id uuid primary key references auth.users on delete cascade, role text not null default 'admin');
alter table admin_roles enable row level security;
create or replace function is_admin() returns boolean language sql security definer stable set search_path=public
as $$ select exists(select 1 from admin_roles where user_id = auth.uid() and role='admin') $$;
create policy "read own role" on admin_roles for select to authenticated using (user_id = auth.uid());

create table signals (
  id uuid primary key default gen_random_uuid(),
  pair text not null, direction direction not null,
  entry numeric not null, stop_loss numeric not null, tp1 numeric not null, tp2 numeric, tp3 numeric,
  risk_reward text, signal_at timestamptz not null default now(), timezone text default 'UTC', session text,
  status sig_status not null default 'PENDING', result sig_result not null default 'OPEN', pips numeric default 0,
  quality text, analysis text, notes text, image_path text,
  published boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create index on signals (published, signal_at desc);
create index on signals (pair);
create index on signals (result);
alter table signals enable row level security;
create policy "public read published" on signals for select using (published or is_admin());
create policy "admin insert" on signals for insert to authenticated with check (is_admin());
create policy "admin update" on signals for update to authenticated using (is_admin()) with check (is_admin());
create policy "admin delete" on signals for delete to authenticated using (is_admin());

-- Public stats (view respects RLS, so only published signals count)
create view signal_stats with (security_invoker = on) as
select count(*) filter (where result <> 'OPEN' and status <> 'CANCELLED') as total,
  count(*) filter (where result='WIN') as wins, count(*) filter (where result='LOSS') as losses,
  count(*) filter (where result='BREAKEVEN') as breakeven,
  coalesce(sum(pips) filter (where result <> 'OPEN'),0) as total_pips
from signals;
grant select on signal_stats to anon, authenticated;

-- Privacy-conscious analytics: no IPs, no personal data, random per-browser id only.
create table page_events (
  id bigint generated always as identity primary key,
  path text not null check (length(path) < 200), event text not null default 'pageview' check (event in ('pageview','telegram_click')),
  referrer text check (length(referrer) < 200), device text, browser text, os text,
  visitor_id text check (length(visitor_id) < 64), created_at timestamptz not null default now());
create index on page_events (created_at desc);
alter table page_events enable row level security;
create policy "anyone can log" on page_events for insert to anon, authenticated with check (true);
create policy "admin reads" on page_events for select to authenticated using (is_admin());

-- Storage
insert into storage.buckets (id, name, public) values ('signal-images','signal-images',true) on conflict do nothing;
create policy "admin upload" on storage.objects for insert to authenticated with check (bucket_id='signal-images' and is_admin());
create policy "admin update" on storage.objects for update to authenticated using (bucket_id='signal-images' and is_admin());
create policy "admin delete" on storage.objects for delete to authenticated using (bucket_id='signal-images' and is_admin());

-- GRANT ADMIN: Supabase > Authentication > Users > copy your user's UID, then run:
-- insert into admin_roles (user_id) values ('PASTE-YOUR-UUID-HERE');
