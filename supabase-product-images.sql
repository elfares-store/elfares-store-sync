-- EL FARES: تشغيل مرة واحدة من Supabase SQL Editor
-- يضيف مصفوفة روابط الصور وينشئ مخزن صور عام للعرض، مع قصر الرفع والتعديل والحذف على المديرين.

alter table public.products
add column if not exists image_urls text[] not null default '{}'::text[];

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can view EL FARES product images" on storage.objects;
drop policy if exists "EL FARES admins can upload product images" on storage.objects;
drop policy if exists "EL FARES admins can update product images" on storage.objects;
drop policy if exists "EL FARES admins can delete product images" on storage.objects;

create policy "Public can view EL FARES product images"
on storage.objects for select
to public
using (bucket_id = 'product-images');

create policy "EL FARES admins can upload product images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'product-images'
  and exists (select 1 from public.admins a where a.user_id = auth.uid())
);

create policy "EL FARES admins can update product images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'product-images'
  and exists (select 1 from public.admins a where a.user_id = auth.uid())
)
with check (
  bucket_id = 'product-images'
  and exists (select 1 from public.admins a where a.user_id = auth.uid())
);

create policy "EL FARES admins can delete product images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'product-images'
  and exists (select 1 from public.admins a where a.user_id = auth.uid())
);
