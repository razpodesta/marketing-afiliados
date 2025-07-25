# Arquitectura del Proyecto - Metashark

## 1. Visión Holística

Metashark está diseñado como una plataforma **Multi-Tenant SaaS (Software as a Service)** robusta, escalable y de alto rendimiento. El objetivo es proporcionar a cada cliente (tenant) un espacio aislado y personalizado bajo su propio subdominio (`tenant.metashark.co`), mientras se mantiene una base de código única, mantenible y fácil de desplegar.

La arquitectura prioriza la **velocidad** (aprovechando el Edge de Vercel), la **seguridad** (con autenticación centralizada) y la **experiencia del desarrollador** (usando un stack moderno de Next.js y TypeScript).

## 2. Pila Tecnológica

- **Framework:** Next.js 15 (App Router)
- **Lenguaje:** TypeScript
- **UI:** React 19, Tailwind CSS 4, Shadcn/UI
- **Base de Datos (Tenants):** Upstash Redis (para almacenamiento clave-valor de alta velocidad)
- **Autenticación:** NextAuth.js (Auth.js v5)
- **Internacionalización (i18n):** next-intl
- **Despliegue:** Vercel

## 3. Flujo de una Petición (Arquitectura de Middleware)

El `middleware.ts` es el cerebro de la aplicación y el primer punto de contacto para cada petición. Opera con la siguiente lógica secuencial:

1.  **Detección de Subdominio:**

    - La petición es analizada para extraer un posible subdominio del `host`.
    - **Si se detecta un subdominio:** La petición es **reescrita internamente** a la ruta `/s/[subdomain]`. Toda la lógica de autenticación e i18n del dominio principal es omitida para esta petición, garantizando el aislamiento y rendimiento de las páginas de los tenants.
    - **Si NO se detecta un subdominio:** La petición continúa al siguiente paso.

2.  **Autenticación y Autorización (Dominio Principal):**

    - La petición es procesada por el middleware de `next-auth`.
    - Se verifica si existe una sesión de usuario válida.
    - Se comprueba si la ruta solicitada es protegida (ej. `/admin`).
    - Si el usuario no está autenticado e intenta acceder a una ruta protegida, es **redirigido automáticamente** a la página de `/login`.

3.  **Internacionalización (i18n) (Dominio Principal):**
    - Si la autenticación es exitosa (o la ruta es pública), la petición es manejada por el middleware de `next-intl`.
    - Este middleware se encarga de gestionar los prefijos de idioma en la URL (ej. `/en/admin`, `/es/login`), asegurando que todo el contenido del dominio principal sea multilingüe.

## 4. Estructura de Directorios Clave

- `app/`: Contiene todas las rutas de la aplicación.
  - `layout.tsx`: El **único layout raíz** que proporciona los contextos globales (i18n, providers de sesión, etc.) a todo el dominio principal.
  - `page.tsx`, `login/`, `admin/`: Rutas del dominio principal.
  - `s/[subdomain]/`: Ruta dinámica que renderiza las páginas de los tenants (subdominios). No es afectada por la lógica de i18n/auth del dominio principal.
- `lib/`: Lógica de negocio reutilizable y utilidades (ej. conexión a Redis, funciones de ayuda).
- `components/`: Componentes de React, estructurados con Shadcn/UI.
- `auth.ts`, `auth.config.ts`: Configuración centralizada de NextAuth.js.
- `middleware.ts`: El orquestador de peticiones descrito anteriormente.
- `messages/`: Archivos JSON con las traducciones (`en.json`, `es.json`).

## 5. Visión de Escalabilidad Futura

La arquitectura actual está diseñada para evolucionar. Los próximos pasos lógicos para escalar Metashark incluyen:

1.  **Base de Datos Relacional para Usuarios:** Reemplazar el `MOCK_USERS` por una base de datos robusta (ej. PostgreSQL con Prisma ORM) para gestionar usuarios, roles, permisos y la relación entre usuarios y tenants.
2.  **Autenticación OAuth:** Integrar proveedores de OAuth (Google, GitHub) en `auth.ts` para ofrecer métodos de inicio de sesión flexibles.
3.  **Gestión de Roles y Permisos:** Enriquecer el token de sesión de NextAuth con roles (`admin`, `editor`, `viewer`) y usar esta información en el middleware y en los componentes para un control de acceso granular.
4.  **Dashboard de Tenant Avanzado:** La página `/s/[subdomain]` evolucionará de una simple landing a un dashboard completo, posiblemente con su propio sistema de autenticación de tenant si fuera necesario.
5.  **Microservicios para Lógica Compleja:** A medida que la lógica de negocio crezca, se pueden extraer funcionalidades específicas (ej. facturación, notificaciones) a microservicios externos que se comunican con la aplicación Next.js a través de una API.
6.  **Caché Avanzada:** Implementar estrategias de caché a nivel de Redis y Vercel para datos de tenants que no cambian frecuentemente, reduciendo las lecturas a la base de datos y mejorando drásticamente el rendimiento.
