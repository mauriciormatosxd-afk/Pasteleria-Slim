-- =====================================================================
-- Pastelería SLIM | Script ÚNICO y COMPLETO para Supabase (PostgreSQL)
-- Pégalo en Supabase > SQL Editor > New query > Run.
-- Es idempotente: puedes ejecutarlo varias veces sin romper nada.
-- Reemplaza a schema.sql + admin-setup.sql (incluye además el Libro de
-- Reclamaciones y correcciones de seguridad).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) TABLAS
-- ---------------------------------------------------------------------
create table if not exists public.categories (
  id   text primary key,
  name text not null
);

create table if not exists public.products (
  id          bigint primary key,
  name        text not null,
  description text,
  price       numeric(10,2) not null check (price >= 0),
  category_id text references public.categories(id),
  image       text,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.stores (
  id      text primary key,
  code    text,
  name    text not null,
  address text not null,
  hours   text
);
alter table public.stores add column if not exists code text;

create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  full_name       text,
  phone           text,
  document_type   text,
  document_number text,
  role            text not null default 'customer' check (role in ('customer','admin')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
alter table public.profiles add column if not exists role text not null default 'customer';

create table if not exists public.addresses (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  address    text not null,
  district   text not null,
  reference  text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- El código del pedido (SL-2848, SL-2849…) lo genera la base de datos,
-- así dos navegadores distintos nunca repiten código.
create sequence if not exists public.order_code_seq start 2848;

create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  code             text not null unique default ('SL-' || nextval('public.order_code_seq')),
  customer_email   text not null,
  delivery_type    text not null check (delivery_type in ('domicilio','recojo')),
  store_id         text references public.stores(id),
  delivery_address text,
  district         text,
  reference        text,
  recipient_name   text not null,
  phone            text not null,
  scheduled_date   date not null,
  scheduled_slot   text not null,
  payment_method   text not null,
  subtotal         numeric(10,2) not null check (subtotal >= 0),
  shipping         numeric(10,2) not null default 0 check (shipping >= 0),
  discount         numeric(10,2) not null default 0 check (discount >= 0),
  total            numeric(10,2) not null check (total >= 0),
  status           text not null default 'recibido'
    check (status in ('recibido','confirmado','en_preparacion','listo','en_camino','entregado','cancelado')),
  created_at       timestamptz not null default now(),
  constraint order_delivery_data check (
    (delivery_type = 'domicilio' and delivery_address is not null and district is not null)
    or (delivery_type = 'recojo' and store_id is not null)
  )
);

create table if not exists public.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders(id) on delete cascade,
  product_id   bigint references public.products(id) on delete set null,
  product_name text not null,
  unit_price   numeric(10,2) not null check (unit_price >= 0),
  quantity     integer not null check (quantity > 0),
  line_total   numeric(10,2) generated always as (unit_price * quantity) stored
);

-- Libro de Reclamaciones virtual
create table if not exists public.claim_counters (
  store_id text not null references public.stores(id),
  year     int  not null,
  last_seq int  not null default 0,
  primary key (store_id, year)
);

create table if not exists public.claims (
  id                uuid primary key default gen_random_uuid(),
  code              text not null unique,
  store_id          text not null references public.stores(id),
  user_id           uuid references auth.users(id) on delete set null,
  nombres           text not null,
  apellidos         text not null,
  tipo_doc          text,
  numero_doc        text,
  domicilio         text,
  distrito          text,
  telefono          text,
  email             text not null,
  es_menor          boolean not null default false,
  rep_nombre        text,
  rep_doc           text,
  tipo_bien         text,
  order_code        text,
  monto             numeric(10,2),
  descripcion       text,
  tipo              text,            -- Reclamo / Queja
  detalle           text,
  pedido_consumidor text,
  status            text not null default 'pendiente'
    check (status in ('pendiente','en_proceso','atendido')),
  provider_response text,
  created_at        timestamptz not null default now()
);

create index if not exists orders_user_created_idx on public.orders(user_id, created_at desc);
create index if not exists order_items_order_idx   on public.order_items(order_id);
create index if not exists addresses_user_idx      on public.addresses(user_id);
create index if not exists claims_created_idx      on public.claims(created_at desc);

-- ---------------------------------------------------------------------
-- 2) FUNCIONES Y TRIGGERS
-- ---------------------------------------------------------------------

-- ¿El usuario actual es administrador? (security definer evita recursión en RLS)
create or replace function public.is_slim_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;
revoke all on function public.is_slim_admin() from public;
grant execute on function public.is_slim_admin() to authenticated;

-- Crear el perfil automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, document_type, document_number)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name',
      trim(coalesce(new.raw_user_meta_data->>'nombres','') || ' ' || coalesce(new.raw_user_meta_data->>'apellidos',''))),
    new.raw_user_meta_data->>'telefono',
    new.raw_user_meta_data->>'tipoDoc',
    new.raw_user_meta_data->>'numeroDoc'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Mantener el perfil sincronizado cuando el usuario edita sus datos
-- (la web los guarda con auth.updateUser en user_metadata).
create or replace function public.handle_user_updated()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  update public.profiles set
    full_name       = coalesce(
                        new.raw_user_meta_data->>'name',
                        nullif(trim(coalesce(new.raw_user_meta_data->>'nombres','') || ' ' || coalesce(new.raw_user_meta_data->>'apellidos','')), ''),
                        full_name),
    phone           = coalesce(new.raw_user_meta_data->>'telefono', phone),
    document_type   = coalesce(new.raw_user_meta_data->>'tipoDoc', document_type),
    document_number = coalesce(new.raw_user_meta_data->>'numeroDoc', document_number),
    updated_at      = now()
  where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
after update of raw_user_meta_data on auth.users
for each row execute procedure public.handle_user_updated();

-- Enviar un reclamo (lo pueden usar visitantes sin cuenta). Devuelve el
-- número correlativo por local y año, p. ej. CEN-000001-2026.
create or replace function public.submit_claim(payload jsonb)
returns text
language plpgsql security definer
set search_path = public
as $$
declare
  v_store  text := payload->>'local';
  v_code   text;
  v_year   int  := extract(year from now())::int;
  v_seq    int;
  v_prefix text;
begin
  select coalesce(code, upper(left(id, 3))) into v_prefix from public.stores where id = v_store;
  if v_prefix is null then
    raise exception 'Local no válido';
  end if;
  if coalesce(trim(payload->>'nombres'), '') = '' or coalesce(trim(payload->>'email'), '') = '' then
    raise exception 'Faltan datos obligatorios';
  end if;

  insert into public.claim_counters(store_id, year, last_seq)
  values (v_store, v_year, 1)
  on conflict (store_id, year) do update set last_seq = public.claim_counters.last_seq + 1
  returning last_seq into v_seq;

  v_code := v_prefix || '-' || lpad(v_seq::text, 6, '0') || '-' || v_year;

  insert into public.claims(
    code, store_id, user_id, nombres, apellidos, tipo_doc, numero_doc, domicilio, distrito,
    telefono, email, es_menor, rep_nombre, rep_doc, tipo_bien, order_code, monto,
    descripcion, tipo, detalle, pedido_consumidor
  ) values (
    v_code, v_store, auth.uid(),
    payload->>'nombres', payload->>'apellidos', payload->>'tipoDoc', payload->>'numeroDoc',
    payload->>'domicilio', payload->>'distrito', payload->>'telefono', payload->>'email',
    coalesce((payload->>'menor')::boolean, false),
    payload->>'repNombre', payload->>'repDoc', payload->>'tipoBien', payload->>'pedido',
    nullif(payload->>'monto', '')::numeric,
    payload->>'descripcion', payload->>'tipo', payload->>'detalle', payload->>'pedidoConsumidor'
  );
  return v_code;
end;
$$;
revoke all on function public.submit_claim(jsonb) from public;
grant execute on function public.submit_claim(jsonb) to anon, authenticated;

-- ---------------------------------------------------------------------
-- 3) ROW LEVEL SECURITY
-- ---------------------------------------------------------------------
alter table public.categories      enable row level security;
alter table public.products        enable row level security;
alter table public.stores          enable row level security;
alter table public.profiles        enable row level security;
alter table public.addresses       enable row level security;
alter table public.orders          enable row level security;
alter table public.order_items     enable row level security;
alter table public.claims          enable row level security;
alter table public.claim_counters  enable row level security;  -- sin políticas: solo la función security definer la toca

-- Catálogo y sucursales: lectura pública
drop policy if exists "categories public read" on public.categories;
create policy "categories public read" on public.categories for select using (true);
drop policy if exists "products public read active" on public.products;
create policy "products public read active" on public.products for select using (active = true);
drop policy if exists "stores public read" on public.stores;
create policy "stores public read" on public.stores for select using (true);

-- Perfiles
drop policy if exists "profile owner select" on public.profiles;
create policy "profile owner select" on public.profiles for select to authenticated
using (auth.uid() = id);
drop policy if exists "profile owner insert" on public.profiles;
create policy "profile owner insert" on public.profiles for insert to authenticated
with check (auth.uid() = id and role = 'customer');
drop policy if exists "profile owner update" on public.profiles;
create policy "profile owner update" on public.profiles for update to authenticated
using (auth.uid() = id)
with check (auth.uid() = id and (role = 'customer' or public.is_slim_admin()));
drop policy if exists "admin read all profiles" on public.profiles;
create policy "admin read all profiles" on public.profiles for select to authenticated
using (public.is_slim_admin());

-- Direcciones
drop policy if exists "address owner all" on public.addresses;
create policy "address owner all" on public.addresses for all to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Pedidos: el cliente crea y ve los suyos. YA NO puede editar su estado ni sus
-- importes (antes podía ponerse "entregado" o cambiar el total). Solo puede
-- borrar un pedido que siga en "recibido" (la web lo usa para revertir si falla
-- el guardado de los productos).
drop policy if exists "orders owner read" on public.orders;
create policy "orders owner read" on public.orders for select to authenticated
using (auth.uid() = user_id);
drop policy if exists "orders owner create" on public.orders;
create policy "orders owner create" on public.orders for insert to authenticated
with check (auth.uid() = user_id and status = 'recibido');
drop policy if exists "orders owner update" on public.orders;
drop policy if exists "orders owner delete" on public.orders;
create policy "orders owner delete" on public.orders for delete to authenticated
using (auth.uid() = user_id and status = 'recibido');
drop policy if exists "admin read all orders" on public.orders;
create policy "admin read all orders" on public.orders for select to authenticated
using (public.is_slim_admin());
drop policy if exists "admin update all orders" on public.orders;
create policy "admin update all orders" on public.orders for update to authenticated
using (public.is_slim_admin()) with check (public.is_slim_admin());

-- Detalle del pedido
drop policy if exists "order items owner read" on public.order_items;
create policy "order items owner read" on public.order_items for select to authenticated
using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
drop policy if exists "order items owner create" on public.order_items;
create policy "order items owner create" on public.order_items for insert to authenticated
with check (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
drop policy if exists "admin read all order items" on public.order_items;
create policy "admin read all order items" on public.order_items for select to authenticated
using (public.is_slim_admin());

-- Productos: el admin gestiona todo el catálogo
drop policy if exists "admin read all products" on public.products;
create policy "admin read all products" on public.products for select to authenticated
using (public.is_slim_admin());
drop policy if exists "admin insert products" on public.products;
create policy "admin insert products" on public.products for insert to authenticated
with check (public.is_slim_admin());
drop policy if exists "admin update products" on public.products;
create policy "admin update products" on public.products for update to authenticated
using (public.is_slim_admin()) with check (public.is_slim_admin());
drop policy if exists "admin delete products" on public.products;
create policy "admin delete products" on public.products for delete to authenticated
using (public.is_slim_admin());

-- Reclamos: cada cliente ve los suyos; el admin ve y responde todos.
-- (Los visitantes envían solo mediante submit_claim(), nunca con insert directo.)
drop policy if exists "claims owner read" on public.claims;
create policy "claims owner read" on public.claims for select to authenticated
using (auth.uid() = user_id);
drop policy if exists "admin read claims" on public.claims;
create policy "admin read claims" on public.claims for select to authenticated
using (public.is_slim_admin());
drop policy if exists "admin update claims" on public.claims;
create policy "admin update claims" on public.claims for update to authenticated
using (public.is_slim_admin()) with check (public.is_slim_admin());

-- ---------------------------------------------------------------------
-- 4) PERMISOS (GRANT) para la API de Supabase
-- ---------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on public.categories, public.products, public.stores to anon, authenticated;
grant select, insert, update, delete on public.products to authenticated;           -- limitado por RLS (solo admin)
grant select, insert, update          on public.profiles    to authenticated;
grant select, insert, update, delete  on public.addresses   to authenticated;
grant select, insert, update, delete  on public.orders      to authenticated;
grant select, insert                  on public.order_items to authenticated;
grant select, update                  on public.claims      to authenticated;
grant usage on sequence public.order_code_seq to authenticated;

-- ---------------------------------------------------------------------
-- 5) DATOS INICIALES
-- ---------------------------------------------------------------------
insert into public.categories(id,name) values
('tortas','Tortas'),('pasteles','Pasteles'),('cupcakes','Cupcakes'),
('tartas','Tartas'),('macarons','Macarons'),('galletas','Galletas'),('especiales','Especiales')
on conflict (id) do nothing;

insert into public.products(id,name,price,category_id,image) values
(1,'Torta de Chocolate Belga',420,'tortas','cake-chocolate.webp'),
(2,'Pastel de Fresas con Crema',380,'pasteles','cake-strawberry.webp'),
(3,'Cupcakes Red Velvet (x6)',210,'cupcakes','cupcakes.webp'),
(4,'Tarta de Limón Merengue',360,'tartas','lemon-tart.webp'),
(5,'Macarons Surtidos (x12)',280,'macarons','macarons.webp'),
(6,'Galletas Decoradas (x10)',150,'galletas','cookies.webp'),
(7,'Torta Selva Negra',480,'tortas','black-forest.webp'),
(8,'Pastel de Zanahoria',320,'pasteles','carrot-cake.webp'),
(9,'Cheesecake de Frutos Rojos',350,'especiales','cheesecake.webp'),
(10,'Brownie con Nuez (x8)',180,'galletas','brownies.webp'),
(11,'Pastel de Tres Leches',340,'pasteles','tres-leches.webp'),
(12,'Caja de Cupcakes Mixtos (x12)',380,'cupcakes','cupcakes-mix.webp')
on conflict (id) do nothing;

insert into public.stores(id,code,name,address,hours) values
('centro','CEN','SLIM Centro','Jr. Puno 456, Cercado de Huancayo','Lun–Sáb 8am–9pm, Dom 9am–7pm'),
('el-tambo','TAM','SLIM El Tambo','Av. Mariscal Castilla 1250, El Tambo','Lun–Sáb 8am–10pm, Dom 9am–8pm'),
('chilca','CHI','SLIM Chilca','Av. Leoncio Prado 680, Chilca','Lun–Dom 9am–9pm')
on conflict (id) do update set code = excluded.code;

-- ---------------------------------------------------------------------
-- 6) HACER ADMINISTRADOR A TU CUENTA (ejecútalo por separado, DESPUÉS de
--    registrarte desde login.html; cambia el correo por el tuyo)
-- ---------------------------------------------------------------------
-- update public.profiles p set role = 'admin'
-- from auth.users u where p.id = u.id and u.email = 'tu-correo@ejemplo.com';
