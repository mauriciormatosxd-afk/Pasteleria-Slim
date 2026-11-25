-- Ejecutar DESPUÉS de schema.sql en Supabase > SQL Editor.
-- 1) Añade un rol de autorización al perfil. Los registros nuevos son clientes por defecto.
alter table public.profiles add column if not exists role text not null default 'customer'
  check (role in ('customer','admin'));

-- 2) Función segura para verificar el rol sin provocar recursión en las políticas RLS.
create or replace function public.is_slim_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;
revoke all on function public.is_slim_admin() from public;
grant execute on function public.is_slim_admin() to authenticated;

-- 3) Políticas administrativas. Las políticas RLS son acumulativas (OR).
drop policy if exists "admin read all profiles" on public.profiles;
create policy "admin read all profiles" on public.profiles
for select to authenticated using (public.is_slim_admin());

drop policy if exists "admin read all orders" on public.orders;
create policy "admin read all orders" on public.orders
for select to authenticated using (public.is_slim_admin());
drop policy if exists "admin update all orders" on public.orders;
create policy "admin update all orders" on public.orders
for update to authenticated using (public.is_slim_admin()) with check (public.is_slim_admin());

drop policy if exists "admin read all order items" on public.order_items;
create policy "admin read all order items" on public.order_items
for select to authenticated using (public.is_slim_admin());

drop policy if exists "admin insert products" on public.products;
create policy "admin insert products" on public.products
for insert to authenticated with check (public.is_slim_admin());
drop policy if exists "admin update products" on public.products;
create policy "admin update products" on public.products
for update to authenticated using (public.is_slim_admin()) with check (public.is_slim_admin());
drop policy if exists "admin delete products" on public.products;
create policy "admin delete products" on public.products
for delete to authenticated using (public.is_slim_admin());

-- 4) Promover manualmente una cuenta existente a administradora.
-- Reemplaza el correo por el correo REAL con el que esa persona se registró.
-- Ejecuta esta sentencia por separado después de crear la cuenta:
-- update public.profiles p set role = 'admin'
-- from auth.users u where p.id = u.id and u.email = 'admin@tudominio.com';

-- IMPORTANTE: no asignes role desde el formulario público ni expongas service_role.

-- 5) Lectura administrativa de TODO el catálogo, incluidos productos ocultos.
drop policy if exists "admin read all products" on public.products;
create policy "admin read all products" on public.products
for select to authenticated using (public.is_slim_admin());

-- 6) Evita que un usuario se autoconceda el rol admin editando su propio perfil.
-- Se reemplazan las políticas de escritura del propietario creadas en schema.sql.
drop policy if exists "profile owner insert" on public.profiles;
create policy "profile owner insert" on public.profiles
for insert to authenticated with check (auth.uid() = id and role = 'customer');
drop policy if exists "profile owner update" on public.profiles;
create policy "profile owner update" on public.profiles
for update to authenticated using (auth.uid() = id)
with check (auth.uid() = id and (role = 'customer' or public.is_slim_admin()));
