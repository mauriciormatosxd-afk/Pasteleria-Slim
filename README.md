# Pastelería SLIM — Versión 3 mejorada

Proyecto web académico de una pastelería. Incluye catálogo, búsqueda, carrito, cuentas de demostración, checkout con recojo/envío, animaciones CSS, demostraciones de frameworks y estructura de datos para Supabase.

## 1. Ejecutar el proyecto

- Abrir `index.html` o servir la carpeta mediante Live Server / un servidor estático.
- Para evitar restricciones de módulos/CDN, se recomienda usar un servidor local.
- No requiere compilación para ejecutar el CSS ya incluido.

## 2. Flujo de compra mejorado

En `checkout.html` el cliente selecciona visualmente:

- **Recojo en tienda:** selecciona una de las tres sucursales SLIM y consulta dirección y horario.
- **Envío a domicilio:** registra dirección, distrito y referencia.
- En ambas modalidades selecciona persona de contacto, teléfono, fecha y horario.
- El resumen calcula modalidad, envío, descuento y total.
- Se registra el pedido y se muestra una pantalla de confirmación.
- No se solicitan ni almacenan números de tarjeta o CVV. Los métodos de pago son demostrativos.

El carrito conserva el costo de envío definido por la lógica actual del proyecto (S/ 80 cuando corresponde; gratuito en recojo o cuando se alcanza el mínimo configurado).

## 3. Conexión con Supabase

### Archivos principales
- `js/config.js`: credenciales públicas de Supabase.
- `js/supabase.js`: inicialización del cliente, autenticación y persistencia de pedidos.
- `supabase/schema.sql`: tablas, relaciones, índices, datos iniciales y políticas RLS.
- `js/auth.js`: utiliza Supabase Auth cuando está configurado; conserva modo local de demostración si no hay credenciales.
- `js/main.js`: registra pedidos y conserva una copia local para la demostración.

### Pasos de configuración
1. Crear un proyecto en https://supabase.com.
2. Abrir `supabase/schema.sql` en SQL Editor y ejecutar el script.
3. En Supabase, abrir Project Settings > API y copiar Project URL y la clave `anon`/publishable.
4. Pegar esos valores en `SUPABASE_CONFIG` dentro de `js/config.js`:
   - `url`: Project URL.
   - `anonKey`: clave pública anon/publishable.
5. En Authentication > URL Configuration, configurar la URL local o dominio del proyecto.
6. En Authentication > Providers, habilitar Email.
7. Crear una cuenta desde `login.html` y verificar el correo si la confirmación está habilitada.
8. Realizar una compra de prueba. Los pedidos y sus detalles se guardan en `orders` y `order_items`.

**Seguridad:** nunca incluir `service_role` en JavaScript, HTML o repositorios públicos. La clave anon/publishable puede estar en el cliente porque el acceso se controla mediante Row Level Security (RLS). Para producción, validar precios y totales en una función backend/Edge Function, integrar una pasarela de pago real y revisar las políticas RLS. No usar el almacenamiento local como autenticación de producción.

### Tablas
- `categories`, `products`: catálogo.
- `stores`: sucursales.
- `profiles`: datos del perfil vinculados a `auth.users`.
- `addresses`: direcciones de cada usuario.
- `orders`: cabecera del pedido, entrega, pago, importes y estado.
- `order_items`: productos, cantidades y precios del pedido.

## 4. Unidad 3 — Animaciones web

- `css/integracion-unidades.css`: animaciones, transiciones, transformaciones, accesibilidad y fallbacks.
- `js/integracion-unidades.js`: animaciones de entrada, mejoras progresivas y compatibilidad.
- Se respeta `prefers-reduced-motion` y se ofrece fallback cuando `IntersectionObserver` no está disponible.

## 5. Unidad 4 — Frameworks CSS

Los contenidos de las Unidades 3 y 4 están integrados directamente en las páginas funcionales de la tienda y en `admin.html`; no se necesita abrir una página de laboratorio.

Bootstrap 5, Tailwind CSS y Materialize se aplican de forma selectiva en las pantallas reales; Material Design se refleja en los tokens visuales y componentes compartidos. Las hojas propias se cargan después para conservar la identidad SLIM.

## 6. Estructura del proyecto

```text
Pasteleria-SLIM-HTML/
├── assets/images/
├── css/
│   ├── styles.css
│   └── animations-lab.css
├── js/
│   ├── config.js
│   ├── supabase.js
│   ├── auth.js
│   ├── cart.js
│   └── main.js
├── supabase/
│   └── schema.sql
├── index.html
├── productos.html
├── carrito.html
├── checkout.html
├── login.html
├── usuario.html
```

## 7. Consideraciones para la entrega universitaria

La conexión a Supabase queda preparada, pero requiere que el estudiante cree su propio proyecto y coloque sus credenciales. Los frameworks se cargan desde CDN, por lo que sus demostraciones necesitan conexión a internet. Los pagos son simulados y no se realiza ningún cobro real.

## 8. Panel de administración conectado a la tienda

- Abrir `admin.html` desde el mismo sitio. Requiere iniciar sesión con Supabase y tener `profiles.role = 'admin'`.
- Ejecutar primero `supabase/schema.sql` y después `supabase/admin-setup.sql` en Supabase SQL Editor.
- Crear una cuenta normal desde `login.html`. Luego, desde SQL Editor, asignarle el rol con la sentencia comentada al final de `admin-setup.sql`, reemplazando el correo.
- El panel permite consultar indicadores y pedidos, cambiar estados, consultar perfiles y crear/editar/ocultar productos.
- Cuando la web usa Supabase, el catálogo público obtiene los productos activos de `public.products`; los cambios del administrador se reflejan en `productos.html` y en la portada al recargar.
- El acceso al panel se valida con Supabase Auth y el rol de `profiles`. Las políticas RLS de `admin-setup.sql` controlan las operaciones en la base de datos; ocultar un enlace o proteger solo la página HTML no sustituye estas políticas.
- No se incluye ninguna contraseña administrativa ni clave `service_role`. La cuenta administradora se crea desde el flujo normal de registro y luego se promueve manualmente en SQL.

**Importante:** el panel necesita credenciales reales de Supabase para operar con datos persistentes. En modo sin credenciales, no permite administrar datos y muestra el aviso de configuración.


## Integración directa de las Unidades 3 y 4

Los contenidos de las sesiones 9 a 17 se aplican sobre las pantallas reales de la tienda (inicio, catálogo, carrito, checkout, cuenta y administración), sin crear una página de demostración adicional.

- **Sesión 9 – Animaciones web:** entradas progresivas de tarjetas y microanimaciones en controles.
- **Sesión 10 – Transiciones y transformaciones:** elevación de tarjetas, estados hover/active y feedback de interacción.
- **Sesión 11 – Compatibilidad:** diseño responsive, `@supports`, fallbacks para `IntersectionObserver`, `MutationObserver` y `prefers-reduced-motion`. Probar adicionalmente en Chrome, Firefox, Edge y Safari.
- **Sesión 12 – Práctica calificada 3:** verificar carrito, checkout, formularios, navegación móvil, estados de foco y animaciones reducidas.
- **Sesión 13 – Frameworks CSS:** uso combinado y controlado de frameworks manteniendo `css/styles.css` como identidad visual principal.
- **Sesión 14 – Bootstrap 5.3:** utilidades y componentes compatibles en botones y comportamiento responsive.
- **Sesión 15 – Tailwind CSS:** utilidades aplicadas selectivamente a agrupaciones y tarjetas existentes.
- **Sesión 16 – Material Design 3:** tokens de color, elevación, superficies, esquinas y estados de foco implementados en `css/integracion-unidades.css`.
- **Sesión 17 – Materialize 1.0:** efecto Waves en controles existentes, evitando reemplazar los formularios propios.

Los frameworks se cargan desde CDN; se requiere conexión a internet para descargarlos. Las hojas de estilo propias se cargan después para conservar el diseño SLIM. El dashboard administrativo mantiene su acceso protegido por autenticación y rol de administrador.
