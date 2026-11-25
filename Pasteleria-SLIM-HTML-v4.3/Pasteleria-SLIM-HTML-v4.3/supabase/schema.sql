-- Pastelería SLIM | Esquema inicial para Supabase (PostgreSQL)
-- Ejecutar en Supabase > SQL Editor. Requiere Supabase Auth para pedidos y perfiles.

create table if not exists public.categories (
  id text primary key,
  name text not null
);

create table if not exists public.products (
  id bigint primary key,
  name text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  category_id text references public.categories(id),
  image text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.stores (
  id text primary key,
  name text not null,
  address text not null,
  hours text
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  document_type text,
  document_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  address text not null,
  district text not null,
  reference text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code text not null unique,
  customer_email text not null,
  delivery_type text not null check (delivery_type in ('domicilio','recojo')),
  store_id text references public.stores(id),
  delivery_address text,
  district text,
  reference text,
  recipient_name text not null,
  phone text not null,
  scheduled_date date not null,
  scheduled_slot text not null,
  payment_method text not null,
  subtotal numeric(10,2) not null check (subtotal >= 0),
  shipping numeric(10,2) not null default 0 check (shipping >= 0),
  discount numeric(10,2) not null default 0 check (discount >= 0),
  total numeric(10,2) not null check (total >= 0),
  status text not null default 'recibido'
    check (status in ('recibido','confirmado','en_preparacion','listo','en_camino','entregado','cancelado')),
  created_at timestamptz not null default now(),
  constraint order_delivery_data check (
    (delivery_type = 'domicilio' and delivery_address is not null and district is not null)
    or (delivery_type = 'recojo' and store_id is not null)
  )
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id bigint references public.products(id) on delete set null,
  product_name text not null,
  unit_price numeric(10,2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  line_total numeric(10,2) generated always as (unit_price * quantity) stored
);


-- Crear automáticamente el perfil al registrarse mediante Supabase Auth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
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

-- Catálogo y sucursales: lectura pública; escritura solo para administradores desde backend.
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.stores enable row level security;
alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "categories public read" on public.categories for select using (true);
create policy "products public read active" on public.products for select using (active = true);
create policy "stores public read" on public.stores for select using (true);

create policy "profile owner select" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "profile owner insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "profile owner update" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create policy "address owner all" on public.addresses for all to authenticated
using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "orders owner read" on public.orders for select to authenticated using (auth.uid() = user_id);
create policy "orders owner create" on public.orders for insert to authenticated with check (auth.uid() = user_id);
create policy "orders owner update" on public.orders for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "orders owner delete" on public.orders for delete to authenticated using (auth.uid() = user_id);

create policy "order items owner read" on public.order_items for select to authenticated
using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "order items owner create" on public.order_items for insert to authenticated
with check (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

create index if not exists orders_user_created_idx on public.orders(user_id, created_at desc);
create index if not exists order_items_order_idx on public.order_items(order_id);
create index if not exists addresses_user_idx on public.addresses(user_id);

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

insert into public.stores(id,name,address,hours) values
('centro','SLIM Centro','Jr. Puno 456, Cercado de Huancayo','Lun–Sáb 8am–9pm, Dom 9am–7pm'),
('el-tambo','SLIM El Tambo','Av. Mariscal Castilla 1250, El Tambo','Lun–Sáb 8am–10pm, Dom 9am–8pm'),
('chilca','SLIM Chilca','Av. Leoncio Prado 680, Chilca','Lun–Dom 9am–9pm')
on conflict (id) do nothing;

-- Importante: nunca usar la clave service_role en archivos HTML/JavaScript del navegador.
