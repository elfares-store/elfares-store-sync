-- EL FARES: شغّل هذا الملف مرة واحدة في Supabase > SQL Editor > New query
create extension if not exists pgcrypto;

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('phone','used','accessory')),
  price numeric(12,2) not null check (price >= 0),
  description text not null default '',
  tag text not null default '',
  art text not null default '📱',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  address text not null,
  notes text not null default '',
  items jsonb not null,
  total numeric(12,2) not null check (total >= 0),
  status text not null default 'جديد',
  created_at timestamptz not null default now(),
  constraint orders_delivery_area check (address ilike '%العبور%')
);

alter table public.admins enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;

create policy "admins can read own admin row" on public.admins
for select to authenticated using (user_id = auth.uid());

create policy "anyone can read active products" on public.products
for select to anon, authenticated using (active = true);

create policy "admins can read all products" on public.products
for select to authenticated using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

create policy "admins can insert products" on public.products
for insert to authenticated with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));

create policy "admins can update products" on public.products
for update to authenticated using (exists (select 1 from public.admins a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));

create policy "admins can delete products" on public.products
for delete to authenticated using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

create policy "customers can create orders for El Obour" on public.orders
for insert to anon, authenticated with check (address ilike '%العبور%' and total >= 0);

create policy "admins can read orders" on public.orders
for select to authenticated using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- صلاحيات الوصول الأساسية، وتظل سياسات RLS هي التي تحدد الصفوف المسموح بها
 grant usage on schema public to anon, authenticated;
 grant select on public.products to anon, authenticated;
 grant insert, update, delete on public.products to authenticated;
 grant select on public.admins to authenticated;
 grant insert on public.orders to anon, authenticated;
 grant select on public.orders to authenticated;
