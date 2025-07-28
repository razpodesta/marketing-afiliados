# Bitácora Maestra y Estado del Proyecto: Metashark Affiliate Suite

**Última Actualización:** 2025-07-25
**Estado Actual:** Fase 1 (Infraestructura) - **COMPLETADA**. Base estable y lista para producción.

## 1. Visión y Lógica de Negocio

### El "Qué": La Visión del Producto

Metashark Affiliate Suite es una **plataforma SaaS (Software as a Service) de alto rendimiento diseñada para empoderar a marketers de afiliados y emprendedores digitales**. El objetivo es proporcionar una herramienta visual e intuitiva, similar a "Canva", que permita a usuarios sin conocimientos técnicos crear, publicar y gestionar landing pages (Bridge Pages, Review Pages, etc.) de alta conversión en cuestión de minutos.

El producto final ofrecerá:

- Un editor visual para construir páginas a partir de secciones pre-diseñadas y optimizadas.
- Publicación instantánea en subdominios gestionados por Metashark (ej. `mi-sitio.metashark.tech`).
- La capacidad de conectar dominios personalizados (una característica premium).
- La opción de exportar el código estático (`.zip`) para un control total del hosting.
- Un modelo de negocio `Freemium`, permitiendo a los usuarios empezar gratis y escalar a planes de pago para desbloquear funcionalidades avanzadas.

### El "Cómo": El Flujo de Usuario

El viaje del usuario está diseñado para ser fluido y lógico:

1.  **Atracción:** Una landing page profesional en el dominio principal (`home.metashark.tech`) comunica la propuesta de valor.
2.  **Onboarding:** Un flujo de registro seguro que utiliza la confirmación por email de Supabase.
3.  **Primer Login y Contexto:** Al confirmar su cuenta, el usuario es guiado a su Dashboard, donde se crea automáticamente su primer "Workspace".
4.  **Selección de Rol (para usuarios avanzados):** Los usuarios que pertenecen a múltiples workspaces (como los `developers`) son dirigidos a una página de selección para elegir su contexto de trabajo.
5.  **El Núcleo del Producto:** Dentro del dashboard, los usuarios gestionan "Sitios" (subdominios) y, dentro de cada sitio, crean y editan "Campañas" a través de una suite de diseño visual.

---

## 2. Estado Arquitectónico y Logros de la Fase 1

Hemos completado la construcción de una infraestructura robusta, segura y escalable.

### Arquitectura Tecnológica:

- **Framework:** Next.js 14.2.5 (App Router)
- **Lenguaje:** TypeScript (con `strict mode`)
- **Base de Datos:** Supabase (PostgreSQL)
- **Autenticación:** Auth.js (NextAuth) v5
- **UI:** React 18, TailwindCSS, Shadcn/UI
- **Internacionalización:** `next-intl`

### Hitos Alcanzados:

- **[✓] Base de Datos Relacional:** Se ha implementado un esquema `v2` en Supabase con tablas para `profiles`, `workspaces`, `sites`, `campaigns` y `pages`, todo protegido con políticas de Row Level Security (RLS).
- **[✓] Flujo de Autenticación de Producción:** El registro y login son 100% funcionales y se basan en el proveedor de autenticación de Supabase, eliminando toda la lógica "mock".
- **[✓] Sistema de Roles (RBAC):** Se ha implementado un sistema de roles dual: `app_role` (`developer`, `user`) para permisos globales y `workspace_role` (`admin`, `member`) para permisos dentro de un equipo.
- **[✓] Enrutamiento Multi-Tenant:** El `middleware` gestiona de forma inteligente las peticiones a subdominios, reescribiendo las URLs a la ruta de renderizado correcta (`/s/[subdomain]`).
- **[✓] Flujo de Selección de Rol:** La lógica y la interfaz para que los usuarios con múltiples workspaces seleccionen su contexto de sesión están implementadas.
- **[✓] Base de Código Estable:** El proyecto compila sin errores (`pnpm build`) y ha superado una "Prueba de Fuego" completa en un entorno de producción local.
- **[✓] Landing Page Profesional:** La página de inicio ha sido transformada en una landing page de marketing, separando el producto de su "escaparate".

---

## 3. Post-Mortem de Desafíos: La Batalla por un `auth.ts` Estable

Durante la Fase 1, el mayor desafío técnico fue estabilizar el archivo `auth.ts` para que funcionara en armonía con Supabase, TypeScript y el `middleware` de Next.js. Este proceso fue iterativo y reveló varias lecciones clave:

### Intentos Fallidos y Lecciones Aprendidas:

1.  **Intento 1 (Dependencia Circular):** El enfoque inicial de separar `auth.config.ts` (para el middleware) y `auth.ts` (para los providers) creó una dependencia circular. El `middleware` importaba de `auth.config.ts`, pero `auth.ts` (que a su vez es necesario para las Server Actions que usa el frontend) también necesitaba indirectamente información del `middleware`. **Lección:** La separación de la configuración de Auth.js debe ser absoluta; el `middleware` no debe depender de nada que dependa de la base de datos.

2.  **Intento 2 (Mutación de Sesión):** Al intentar corregir los errores de tipo, el primer enfoque fue mutar directamente el objeto `session` en el `callback`, asignando nuevas propiedades (`session.user.app_role = ...`). **Lección:** Esto falló porque TypeScript, en su modo estricto, no permite añadir propiedades a un objeto que no las tiene en su tipo base. La inmutabilidad (crear un nuevo objeto `session` con las propiedades añadidas) es la solución correcta y más segura.

3.  **Intento 3 (Joins Prohibidos a `auth.users`):** Se intentó consultar la tabla `public.profiles` y hacer un `join` a `auth.users` para obtener el email. **Lección:** Supabase protege su esquema `auth` y no permite este tipo de `joins` desde el esquema `public` por razones de seguridad. El flujo de datos siempre debe originarse desde una función de autenticación (`signInWithPassword`) que devuelve un usuario autenticado del esquema `auth`.

4.  **Intento 4 (Enriquecimiento en `authorize`):** Se intentó cargar todos los datos (perfil, workspaces, etc.) dentro de la función `authorize`. **Lección:** Esto creó el error final de `Type '{}' is not assignable to...`. El objeto `user` devuelto por `authorize` tiene que cumplir con la interfaz base de `next-auth`, y enriquecerlo demasiado pronto creaba un conflicto de tipos.

### La Solución Definitiva (El Patrón de Enriquecimiento de JWT):

La arquitectura final y exitosa se basa en la **separación de responsabilidades** a lo largo de los `callbacks`:

- **`authorize`:** Su única misión es validar credenciales. Devuelve un objeto `User` mínimo (`{id, email}`).
- **`jwt`:** Es el corazón de la lógica. Se ejecuta una sola vez al iniciar sesión. Recibe el `user` mínimo y lo usa para hacer la consulta a nuestra tabla `profiles` y enriquecer el **token** con todos nuestros datos personalizados (`app_role`, `active_workspace_id`, etc.).
- **`session`:** Es un simple "pasamanos". Lee la información del token ya enriquecido y la pasa a la sesión del cliente de forma segura y tipada.

Este patrón es eficiente, seguro, mantenible y, lo más importante, satisface completamente al compilador de TypeScript.

---

## 4. Roadmap para la Fase 2: Construcción del Producto

Con la infraestructura completa y estable, el camino a seguir está claro. Nos enfocaremos en construir la funcionalidad que aporta valor directo al usuario.

1.  **Aparato #68: Gestión de Sitios en el Dashboard:**
    - Hacer que el botón "Crear Nuevo Sitio" en el dashboard sea completamente funcional.
    - Mostrar la lista de sitios existentes del usuario, cargada desde la base de datos.
    - Implementar la funcionalidad de eliminación de sitios.

2.  **Aparato #69: Vista Detallada del Sitio y Gestión de Campañas:**
    - Crear una nueva ruta dinámica: `/dashboard/sites/[siteId]`.
    - En esta página, mostrar los detalles del sitio (subdominio, dominio personalizado) y una lista de sus "Campañas".
    - Implementar la funcionalidad para crear y eliminar campañas asociadas a ese sitio.

3.  **Aparato #70: Integración de la Suite de Diseño (El "Canva"):**
    - Crear la ruta de edición: `/dashboard/sites/[siteId]/campaigns/[campaignId]/edit`.
    - Migrar los componentes visuales de `GlobalFitWell` (Hero, Features, etc.) y crear una interfaz que permita al usuario seleccionarlos y añadirlos a su página.
    - El estado del diseño de la página se guardará como un objeto JSON en la columna `content` de la tabla `pages`.

4.  **Aparato #71: El Renderizador de Páginas Públicas:**
    - Refactorizar `app/s/[subdomain]/page.tsx` para que se convierta en `app/s/[subdomain]/[campaignSlug]/page.tsx`.
    - Esta página leerá el `subdomain` y el `slug`, buscará la campaña correspondiente en la base de datos, obtendrá su JSON de `content`, y lo renderizará dinámicamente usando los componentes de `GlobalFitWell`.

A partir de este punto, el proyecto se centrará en añadir más componentes a la suite de diseño, implementar analíticas y desarrollar los planes de suscripción. La base está lista.
