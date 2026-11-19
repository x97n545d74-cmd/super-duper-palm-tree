-- SHANKER MEDICOS: catalogue schema, indexes, Row Level Security and storage.
-- Public visitors (anon) can read categories, business settings and PUBLISHED
-- products only. Only users listed in public.admin_users can write anything.

create extension if not exists pg_trgm;

-- ---------------------------------------------------------------- helpers
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------- admins
create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- security definer so policies can call it without recursive RLS checks.
create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------- categories
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  parent_id   uuid references public.categories (id) on delete restrict,
  name_en     text not null check (length(name_en) between 1 and 80),
  name_hi     text not null default '' check (length(name_hi) <= 80),
  name_pa     text not null default '' check (length(name_pa) <= 80),
  image_url   text check (image_url is null or length(image_url) <= 600),
  sort_order  integer not null default 0,
  featured    boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint categories_not_own_parent check (parent_id is null or parent_id <> id)
);
create index if not exists categories_parent_idx on public.categories (parent_id);
create index if not exists categories_sort_idx on public.categories (sort_order);
drop trigger if exists categories_updated_at on public.categories;
create trigger categories_updated_at before update on public.categories
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- products
create table if not exists public.products (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name          text not null check (length(name) between 1 and 140),
  brand         text not null check (length(brand) between 1 and 80),
  manufacturer  text not null default '' check (length(manufacturer) <= 140),
  generic_name  text not null default '' check (length(generic_name) <= 240),
  pack_size     text not null check (length(pack_size) between 1 and 80),
  category_id   uuid references public.categories (id) on delete restrict,
  description   text not null default '' check (length(description) <= 1200),
  information   text not null default '' check (length(information) <= 2400),
  image_url     text check (image_url is null or length(image_url) <= 600),
  pack_style    text not null default 'box'
                check (pack_style in ('bottle','box','tube','strip','jar','device','pump','sachet','pack')),
  availability  text not null default 'unconfirmed'
                check (availability in ('unconfirmed','in_stock','limited','on_order','out_of_stock')),
  rx_class      text not null default 'unverified' check (rx_class in ('unverified','otc','rx')),
  published     boolean not null default true,
  featured      boolean not null default false,
  needs_review  boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
-- Duplicate guard used by the admin form and CSV import (same name + brand + pack).
create unique index if not exists products_identity_uidx
  on public.products (lower(name), lower(brand), lower(pack_size));
create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_published_name_idx on public.products (published, name);
create index if not exists products_updated_idx on public.products (updated_at desc);
create index if not exists products_needs_review_idx on public.products (needs_review) where needs_review;
-- Fast case-insensitive "contains" search (ILIKE '%term%').
create index if not exists products_name_trgm on public.products using gin (name gin_trgm_ops);
create index if not exists products_brand_trgm on public.products using gin (brand gin_trgm_ops);
create index if not exists products_generic_trgm on public.products using gin (generic_name gin_trgm_ops);
drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- settings (single row)
create table if not exists public.business_settings (
  id             smallint primary key default 1 check (id = 1),
  business_name  text not null default 'Shanker Medicos',
  tagline        text not null default '',
  address        text not null default '',
  city           text not null default 'Batala',
  state          text not null default 'Punjab',
  postal_code    text not null default '' check (postal_code = '' or postal_code ~ '^[1-9][0-9]{5}$'),
  phone          text not null default '',
  whatsapp       text not null default '',
  email          text not null default '',
  opening_hours  text not null default '',
  maps_url       text not null default '' check (maps_url = '' or maps_url ~* '^https://'),
  instagram_url  text not null default '' check (instagram_url = '' or instagram_url ~* '^https://'),
  facebook_url   text not null default '' check (facebook_url = '' or facebook_url ~* '^https://'),
  updated_at     timestamptz not null default now()
);
insert into public.business_settings (id) values (1) on conflict (id) do nothing;
drop trigger if exists business_settings_updated_at on public.business_settings;
create trigger business_settings_updated_at before update on public.business_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------- RLS
alter table public.categories        enable row level security;
alter table public.products          enable row level security;
alter table public.business_settings enable row level security;
alter table public.admin_users       enable row level security;

-- categories
drop policy if exists "categories: public read" on public.categories;
create policy "categories: public read" on public.categories for select to anon, authenticated using (true);
drop policy if exists "categories: admin insert" on public.categories;
create policy "categories: admin insert" on public.categories for insert to authenticated with check (public.is_admin());
drop policy if exists "categories: admin update" on public.categories;
create policy "categories: admin update" on public.categories for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "categories: admin delete" on public.categories;
create policy "categories: admin delete" on public.categories for delete to authenticated using (public.is_admin());

-- products: the public sees published rows only
drop policy if exists "products: public read published" on public.products;
create policy "products: public read published" on public.products for select to anon, authenticated using (published or public.is_admin());
drop policy if exists "products: admin insert" on public.products;
create policy "products: admin insert" on public.products for insert to authenticated with check (public.is_admin());
drop policy if exists "products: admin update" on public.products;
create policy "products: admin update" on public.products for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "products: admin delete" on public.products;
create policy "products: admin delete" on public.products for delete to authenticated using (public.is_admin());

-- business settings
drop policy if exists "settings: public read" on public.business_settings;
create policy "settings: public read" on public.business_settings for select to anon, authenticated using (true);
drop policy if exists "settings: admin insert" on public.business_settings;
create policy "settings: admin insert" on public.business_settings for insert to authenticated with check (public.is_admin());
drop policy if exists "settings: admin update" on public.business_settings;
create policy "settings: admin update" on public.business_settings for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- admin_users: a signed-in user may only see whether they themselves are an admin.
-- Admins are added by the project owner in the SQL editor (see docs/DEPLOYMENT.md).
drop policy if exists "admin_users: self read" on public.admin_users;
create policy "admin_users: self read" on public.admin_users for select to authenticated using (user_id = auth.uid());

-- Table privileges (RLS still applies on top of these).
grant select on public.categories, public.products, public.business_settings to anon, authenticated;
grant insert, update, delete on public.categories, public.products to authenticated;
grant insert, update on public.business_settings to authenticated;
grant select on public.admin_users to authenticated;

-- ---------------------------------------------------------------- storage
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "product-images: admin upload" on storage.objects;
create policy "product-images: admin upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "product-images: admin update" on storage.objects;
create policy "product-images: admin update" on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "product-images: admin delete" on storage.objects;
create policy "product-images: admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
