-- SHANKER MEDICOS: store offer settings, Shanker Club members (phone/email
-- sign-ups with consent), and the store's WhatsApp + Maps link.

-- ---------------------------------------------------------------- offer settings
alter table public.business_settings add column if not exists offer_enabled      boolean not null default true;
alter table public.business_settings add column if not exists offer_percent      integer not null default 12 check (offer_percent between 1 and 50);
alter table public.business_settings add column if not exists offer_min_amount   integer not null default 1000 check (offer_min_amount between 0 and 100000);
alter table public.business_settings add column if not exists offer_code         text    not null default 'SHANKER12' check (offer_code ~ '^[A-Z0-9-]{3,20}$');
alter table public.business_settings add column if not exists club_enabled       boolean not null default true;
alter table public.business_settings add column if not exists club_extra_percent integer not null default 0 check (club_extra_percent between 0 and 50);

-- Details supplied by the store (only filled where still empty).
update public.business_settings set whatsapp = '+91 98155 52404' where id = 1 and whatsapp = '';
update public.business_settings set maps_url = 'https://maps.app.goo.gl/jgHwJrpiNSSzED4q9' where id = 1 and maps_url = '';

-- ---------------------------------------------------------------- members
create table if not exists public.members (
  id                uuid primary key default gen_random_uuid(),
  code              text not null unique check (code ~ '^SM-[A-Z0-9]{5}$'),
  name              text not null default '' check (length(name) <= 80),
  phone             text not null unique check (phone ~ '^[6-9][0-9]{9}$'),
  email             text not null default '' check (length(email) <= 120),
  locale            text not null default 'en' check (locale in ('en','hi','pa')),
  consent_marketing boolean not null check (consent_marketing),
  consent_text      text not null check (length(consent_text) between 1 and 600),
  source            text not null default '' check (length(source) <= 60),
  utm_source        text not null default '' check (length(utm_source) <= 80),
  utm_medium        text not null default '' check (length(utm_medium) <= 80),
  utm_campaign      text not null default '' check (length(utm_campaign) <= 120),
  created_at        timestamptz not null default now()
);
create index if not exists members_created_idx on public.members (created_at desc);
create index if not exists members_email_idx on public.members (lower(email)) where email <> '';

alter table public.members enable row level security;
-- Only admins can see, edit or delete members. The public adds itself through join_club().
drop policy if exists "members: admin read" on public.members;
create policy "members: admin read" on public.members for select to authenticated using (public.is_admin());
drop policy if exists "members: admin update" on public.members;
create policy "members: admin update" on public.members for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "members: admin delete" on public.members;
create policy "members: admin delete" on public.members for delete to authenticated using (public.is_admin());
grant select, update, delete on public.members to authenticated;

-- Sign-up: insert or return the existing member for that phone. Never returns other people's data.
create or replace function public.join_club(
  p_name text, p_phone text, p_email text, p_locale text, p_consent_text text,
  p_source text, p_utm_source text, p_utm_medium text, p_utm_campaign text
) returns table (code text, is_new boolean)
language plpgsql security definer
set search_path = public
as $$
declare
  v_code text;
  v_alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  i int;
begin
  if p_phone !~ '^[6-9][0-9]{9}$' then raise exception 'invalid phone'; end if;
  if coalesce(p_consent_text, '') = '' then raise exception 'consent required'; end if;

  select m.code into v_code from public.members m where m.phone = p_phone;
  if found then
    update public.members m set
      email = case when m.email = '' then left(coalesce(p_email, ''), 120) else m.email end,
      name  = case when m.name  = '' then left(coalesce(p_name, ''), 80)   else m.name  end,
      consent_marketing = true,
      consent_text = left(p_consent_text, 600)
    where m.phone = p_phone;
    return query select v_code, false;
    return;
  end if;

  loop
    v_code := 'SM-';
    for i in 1..5 loop
      v_code := v_code || substr(v_alphabet, 1 + floor(random() * 32)::int, 1);
    end loop;
    exit when not exists (select 1 from public.members m where m.code = v_code);
  end loop;

  insert into public.members (code, name, phone, email, locale, consent_marketing, consent_text, source, utm_source, utm_medium, utm_campaign)
  values (v_code, left(coalesce(p_name, ''), 80), p_phone, left(lower(coalesce(p_email, '')), 120),
          case when p_locale in ('en','hi','pa') then p_locale else 'en' end, true, left(p_consent_text, 600),
          left(coalesce(p_source, ''), 60), left(coalesce(p_utm_source, ''), 80), left(coalesce(p_utm_medium, ''), 80), left(coalesce(p_utm_campaign, ''), 120));
  return query select v_code, true;
end $$;
revoke all on function public.join_club(text,text,text,text,text,text,text,text,text) from public;
grant execute on function public.join_club(text,text,text,text,text,text,text,text,text) to anon, authenticated;
