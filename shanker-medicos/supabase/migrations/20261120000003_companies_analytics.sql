-- SHANKER MEDICOS: pharma companies (with uploadable logos) and first-party,
-- anonymous analytics events.

-- ---------------------------------------------------------------- companies
create table if not exists public.companies (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name        text not null unique check (length(name) between 1 and 120),
  search_q    text not null default '' check (length(search_q) <= 80),
  known       text not null default '' check (length(known) <= 200),
  kind        text not null default 'indian' check (kind in ('indian','multinational')),
  logo_url    text check (logo_url is null or length(logo_url) <= 600),
  featured    boolean not null default false,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists companies_featured_idx on public.companies (featured) where featured;
drop trigger if exists companies_updated_at on public.companies;
create trigger companies_updated_at before update on public.companies
  for each row execute function public.set_updated_at();

alter table public.companies enable row level security;
drop policy if exists "companies: public read" on public.companies;
create policy "companies: public read" on public.companies for select to anon, authenticated using (true);
drop policy if exists "companies: admin insert" on public.companies;
create policy "companies: admin insert" on public.companies for insert to authenticated with check (public.is_admin());
drop policy if exists "companies: admin update" on public.companies;
create policy "companies: admin update" on public.companies for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "companies: admin delete" on public.companies;
create policy "companies: admin delete" on public.companies for delete to authenticated using (public.is_admin());
grant select on public.companies to anon, authenticated;
grant insert, update, delete on public.companies to authenticated;

-- ---------------------------------------------------------------- analytics events
-- Anonymous: no names, phone numbers, emails or IP addresses. `visitor` is a
-- hash that changes every day, so it cannot follow a person over time.
create table if not exists public.events (
  id            bigint generated always as identity primary key,
  ts            timestamptz not null default now(),
  type          text not null check (type in ('pageview','whatsapp_click','call_click','directions_click','offer_reveal','sign_up','generate_lead','search','view_item')),
  path          text not null default '' check (length(path) <= 200),
  locale        text not null default '' check (length(locale) <= 5),
  referrer      text not null default '' check (length(referrer) <= 120),
  utm_source    text not null default '' check (length(utm_source) <= 80),
  utm_medium    text not null default '' check (length(utm_medium) <= 80),
  utm_campaign  text not null default '' check (length(utm_campaign) <= 120),
  device        text not null default 'desktop' check (device in ('mobile','tablet','desktop')),
  visitor       text not null default '' check (length(visitor) <= 32),
  props         jsonb not null default '{}'::jsonb check (pg_column_size(props) <= 2048)
);
create index if not exists events_ts_idx on public.events (ts);
create index if not exists events_type_ts_idx on public.events (type, ts);

alter table public.events enable row level security;
drop policy if exists "events: admin read" on public.events;
create policy "events: admin read" on public.events for select to authenticated using (public.is_admin());
drop policy if exists "events: admin delete" on public.events;
create policy "events: admin delete" on public.events for delete to authenticated using (public.is_admin());
grant select, delete on public.events to authenticated;

create or replace function public.log_event(
  p_type text, p_path text, p_locale text, p_referrer text, p_utm_source text, p_utm_medium text,
  p_utm_campaign text, p_device text, p_visitor text, p_props jsonb
) returns void
language sql security definer
set search_path = public
as $$
  insert into public.events (type, path, locale, referrer, utm_source, utm_medium, utm_campaign, device, visitor, props)
  values (p_type, left(coalesce(p_path,''),200), left(coalesce(p_locale,''),5), left(coalesce(p_referrer,''),120),
          left(coalesce(p_utm_source,''),80), left(coalesce(p_utm_medium,''),80), left(coalesce(p_utm_campaign,''),120),
          coalesce(p_device,'desktop'), left(coalesce(p_visitor,''),32), coalesce(p_props,'{}'::jsonb));
$$;
revoke all on function public.log_event(text,text,text,text,text,text,text,text,text,jsonb) from public;
grant execute on function public.log_event(text,text,text,text,text,text,text,text,text,jsonb) to anon, authenticated;

-- Keep 13 months of events (run monthly, e.g. with pg_cron):
--   delete from public.events where ts < now() - interval '13 months';
