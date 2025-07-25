# Metashark - Plataforma SaaS Multi-Tenant 🦈

Metashark es una plataforma como servicio (SaaS) robusta y escalable construida con Next.js 15 y el App Router. Permite a los usuarios crear sus propios subdominios personalizados, cada uno representado por un emoji único, demostrando una arquitectura multi-tenant moderna y eficiente.

---

### Tabla de Contenidos

1.  [**¿Qué es Metashark?**](#qué-es-metashark)
2.  [**Características Principales**](#características-principales)
3.  [**Tech Stack**](#tech-stack)
4.  [**Arquitectura y Funcionamiento**](#arquitectura-y-funcionamiento)
    - Flujo de una Petición
    - Middleware: El Cerebro del Enrutamiento
    - Autenticación con Auth.js (v5)
    - Internacionalización (i18n)
    - Gestión de Subdominios
5.  [**Potencial y Próximos Pasos**](#potencial-y-próximos-pasos)
6.  [**Guía de Inicio Rápido**](#guía-de-inicio-rápido)

---

### ¿Qué es Metashark?

Metashark es un proyecto base (boilerplate) que sirve como ejemplo de producción para una aplicación multi-tenant. La funcionalidad principal permite a los usuarios registrar un subdominio (ej. `mi-sitio.localhost:3000`) y asociarle un emoji. Este subdominio muestra una página de bienvenida personalizada.

El dominio principal sirve como la página de aterrizaje para crear nuevos subdominios y como el portal de administración para gestionarlos.

### Características Principales

- ✅ **Enrutamiento por Subdominio:** Cada tenant obtiene su propia URL personalizada.
- ✅ **Internacionalización (i18n):** Soporte para múltiples idiomas (`en`, `es`) en el dominio principal con enrutamiento localizado.
- ✅ **Autenticación Segura:** Panel de administración protegido con `next-auth` (Auth.js v5), compatible con el Edge Runtime.
- ✅ **Persistencia de Datos:** Uso de **Upstash Redis** como base de datos en memoria para una gestión de subdominios ultrarrápida.
- ✅ **Server Actions:** Lógica de backend moderna y segura para la creación y eliminación de subdominios.
- ✅ **Stack Tecnológico Moderno:** Construido con Next.js 15 (App Router), React 19 y TailwindCSS 4.

### Tech Stack

| Componente               | Tecnología                                                                                                     |
| ------------------------ | -------------------------------------------------------------------------------------------------------------- |
| **Framework**            | [Next.js 15](https://nextjs.org/) (App Router, Server Components)                                              |
| **UI**                   | [React 19](https://react.dev/), [TailwindCSS 4](https://tailwindcss.com/), [Shadcn/UI](https://ui.shadcn.com/) |
| **Autenticación**        | [Auth.js v5](https://authjs.dev/) (anteriormente NextAuth)                                                     |
| **Internacionalización** | [next-intl](https://next-intl.dev/)                                                                            |
| **Base de Datos**        | [Upstash Redis](https://upstash.com/redis)                                                                     |
| **Validación**           | [Zod](https://zod.dev/)                                                                                        |

---

### Arquitectura y Funcionamiento

La clave de Metashark reside en su `middleware.ts`, que actúa como un controlador de tráfico inteligente para cada petición entrante.

#### Flujo de una Petición

```mermaid
graph TD
    A[Petición Entrante] --> B{¿Es un Subdominio?};
    B -->|Sí| C[Middleware reescribe a /s/[subdomain]];
    B -->|No (Dominio Principal)| D{Middleware ejecuta Auth.js};
    D -->|Usuario NO Autorizado| E[Auth.js redirige a /login];
    D -->|Usuario AUTORIZADO| F[Auth.js pasa el control a next-intl];
    F --> G[next-intl gestiona el prefijo de idioma];
    C --> H[Renderiza app/s/[subdomain]/page.tsx];
    G --> I[Renderiza la página solicitada, ej: app/[locale]/admin/page.tsx];
```

#### 1. Middleware: El Cerebro del Enrutamiento

El archivo `middleware.ts` tiene una lógica secuencial clara:

1.  **Detección de Subdominio:** Es lo primero que se comprueba. Si el `host` de la petición corresponde a un subdominio, el middleware reescribe la URL internamente a la ruta `/s/[subdomain]` y detiene su ejecución. Esto aísla completamente la lógica de los tenants.
2.  **Autenticación (`auth`):** Si no es un subdominio, la petición es envuelta por el middleware de `auth`. Este ejecuta el callback `authorized` de `auth.config.ts` para proteger las rutas privadas (ej. `/admin`).
3.  **Internacionalización (`intlMiddleware`):** Si la autenticación es exitosa (o no requerida), el control pasa al middleware de `next-intl`, que se encarga de gestionar los prefijos de idioma (`/es`, `/en`) según la configuración en `navigation.ts`.

#### 2. Autenticación con Auth.js (v5)

- **`auth.ts`**: Contiene la configuración principal de Auth.js, incluyendo los "providers" (en este caso, `Credentials` para login con email/contraseña). Utiliza **`bcryptjs`** para la comparación de contraseñas, asegurando la compatibilidad con el Edge Runtime.
- **`auth.config.ts`**: Define las reglas de autorización en el callback `authorized`, especificando qué rutas son privadas.
- **`/api/auth/[...nextauth]/route.ts`**: Expone los endpoints de API (`/api/auth/session`, `/api/auth/signin`, etc.) que `SessionProvider` y otras utilidades de Auth.js necesitan para funcionar en el cliente.

#### 3. Internacionalización (i18n) con `next-intl`

- **`navigation.ts`**: Centraliza la configuración de rutas i18n. Define los `locales`, la estrategia `localePrefix`, y exporta componentes como `Link` y `redirect` que ya son conscientes de los idiomas.
- **`i18n.ts`**: Configura la carga de los archivos de mensajes (ej. `messages/es.json`) para el `locale` de la petición actual.
- **`app/[locale]/...`**: La estructura de carpetas que alberga todas las páginas internacionalizadas del dominio principal.

#### 4. Gestión de Subdominios (Multi-Tenancy)

- **Base de Datos (Redis):** Se utiliza Upstash Redis por su altísima velocidad. Cada subdominio se guarda como una clave-valor simple (ej. `subdomain:test` -> `{emoji: '🚀', ...}`).
- **Ruta Dinámica:** La ruta `app/s/[subdomain]/page.tsx` es un Server Component que recibe el nombre del subdominio, consulta Redis para obtener sus datos (el emoji) y renderiza la página personalizada. Si no encuentra el subdominio, muestra una página de error 404.

---

### Potencial y Próximos Pasos

Esta base de código está lista para ser extendida con funcionalidades más complejas:

- **Roles de Usuario:** Extender el callback `jwt` y `session` en `auth.config.ts` para añadir roles al objeto de sesión y proteger rutas de forma más granular (ej. rutas de super-admin).
- **Bases de Datos Relacionales:** Reemplazar `MOCK_USERS` y la lógica de subdominios con una base de datos como PostgreSQL o MySQL para una gestión de datos más robusta.
- **Planes de Suscripción:** Integrar un sistema de pagos como Stripe para ofrecer diferentes niveles de servicio a los tenants.
- **Personalización del Tenant:** Permitir a los usuarios no solo elegir un emoji, sino también personalizar colores, subir un logo o añadir contenido propio a su página de subdominio.
- **UX Mejorada:** Implementar las mejoras sugeridas en el código, como notificaciones "toast" para las acciones y modales de confirmación para operaciones destructivas.

---

### Guía de Inicio Rápido

Sigue estos pasos para ejecutar el proyecto localmente:

1.  **Clonar el repositorio:**

    ```bash
    git clone https://tu-repositorio.git
    cd metashark-website
    ```

2.  **Instalar dependencias:**

    ```bash
    pnpm install
    ```

3.  **Configurar Variables de Entorno:**
    Crea un archivo `.env.local` en la raíz del proyecto y añade las siguientes variables:

    ```env
    # Credenciales de Upstash Redis
    KV_REST_API_URL="TU_URL_DE_UPSTASH_REDIS"
    KV_REST_API_TOKEN="TU_TOKEN_DE_UPSTASH_REDIS"

    # Secreto para NextAuth/Auth.js (Genera uno nuevo para producción)
    AUTH_SECRET="un_secreto_de_prueba_muy_seguro_para_desarrollo_local"
    ```

4.  **Iniciar el servidor de desarrollo:**
    Se recomienda usar el script con Webpack para mayor estabilidad.

    ```bash
    pnpm run dev:webpack
    ```

    O si prefieres usar Turbopack:

    ```bash
    pnpm run dev
    ```

5.  **Acceder a la aplicación:**
    - **Página Principal:** `http://localhost:3000`
    - **Panel de Admin:** `http://localhost:3000/admin` (Credenciales: `admin@metashark.co` / `password123`)
    - **Subdominios:** Después de crear uno (ej. "test"), accede a `http://test.localhost:3000`.
