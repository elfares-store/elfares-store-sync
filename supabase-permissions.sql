-- EL FARES: شغّل هذا الاستعلام مرة واحدة لإعطاء أذونات API الأساسية.
-- سياسات RLS التي أنشأتها سابقاً تظل مسؤولة عن تحديد الصفوف المسموح بها.
grant usage on schema public to anon, authenticated;
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant select on public.admins to authenticated;
grant insert on public.orders to anon, authenticated;
grant select on public.orders to authenticated;
