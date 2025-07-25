# Manual del Proyecto Metashark 🦈

## Visión General

**Metashark** es una plataforma SaaS (Software as a Service) multi-tenant construida sobre las tecnologías más modernas del ecosistema de Next.js y React. Sirve como una base de código de producción (boilerplate) que demuestra cómo implementar de manera robusta y escalable funcionalidades complejas como subdominios dinámicos, autenticación segura e internacionalización.

El proyecto permite a los usuarios registrar subdominios únicos, personalizarlos con un emoji y acceder a ellos a través de una URL propia, mientras que el dominio principal sirve como portal de registro y panel de administración.

---

## 1. Funcionalidades Clave

- ✅ **Multi-Tenancy por Subdominio:** Cada usuario (tenant) obtiene su propio espacio aislado accesible a través de una URL única (e.g., `mi-tienda.metashark.com`).
- ✅ **Internacionalización (i18n) Completa:** El sitio principal soporta múltiples idiomas (`inglés` y `español`) con enrutamiento basado en prefijo de URL (`/es/...`), optimizado para SEO y experiencia de usuario.
- ✅ **Autenticación Segura:** Un panel de administración protegido por un sistema de login con credenciales, implementado con **Auth.js v5**, compatible con el Edge Runtime de Next.js.
- ✅ **Gestión de Datos de Alta Velocidad:** Utiliza **Upstash Redis** como base de datos en memoria para una gestión instantánea de los datos de los subdominios.
- ✅ **Arquitectura Moderna con Next.js 15:** Aprovecha al máximo el App Router, Server Components, Server Actions y las últimas convenciones de React 19.

---

## 2. Arquitectura y Lógica Detallada (Archivo por Archivo)

La arquitectura de Metashark está diseñada para ser modular y escalable. Cada parte del sistema tiene una responsabilidad bien definida.

### 2.1. El Middleware: El Corazón del Enrutamiento (`middleware.ts`)

Este archivo es el punto de entrada para casi todas las peticiones a la aplicación y actúa como un controlador de tráfico inteligente.

**Lógica de Ejecución:**

1.  **Envoltura de `auth`**: La exportación `default` está envuelta en la función `auth` de Auth.js. Esto significa que **la autenticación se verifica primero**. Si un usuario no autenticado intenta acceder a una ruta protegida (definida en `auth.config.ts`), `auth` lo redirigirá automáticamente a la página de login sin ejecutar el resto del código del middleware.
2.  **Detección de Subdominio**: Si la autenticación es exitosa (o la ruta es pública), el código dentro del callback se ejecuta. La primera tarea es analizar el `host` de la petición. Si se detecta un subdominio, la petición se **reescribe internamente** a la ruta `/s/[subdomain]`. La ejecución del middleware termina aquí para esa petición, y Next.js renderiza la página del tenant.
3.  **Internacionalización (i18n)**: Si no es un subdominio, la petición se pasa al `intlMiddleware`. Este se encarga de gestionar los prefijos de idioma (ej. `/`, `/es`), detectar el idioma del usuario y establecer las cookies necesarias.

### 2.2. Autenticación (`auth.ts`, `auth.config.ts`, `api/`)

El sistema de autenticación es robusto y está desacoplado del resto de la aplicación.

- **`auth.ts`**:

  - **Función**: Define la configuración principal de `NextAuth`. Aquí se inicializan los "providers" (actualmente, solo `Credentials` para login con email/password).
  - **Lógica**: Contiene la función `authorize`, que se ejecuta cuando un usuario intenta iniciar sesión. Compara el hash de la contraseña proporcionada con el almacenado usando **`bcryptjs`**, que es una librería de JavaScript puro compatible con el Edge Runtime.
  - **Exportaciones**: Exporta `handlers`, `auth`, `signIn`, y `signOut`, que son las funciones y objetos que se utilizan en toda la aplicación para interactuar con el sistema de autenticación.

- **`auth.config.ts`**:

  - **Función**: Contiene la configuración de Auth.js que puede ejecutarse de forma segura en el Edge Runtime (sin dependencias de Node.js).
  - **Lógica**: Su parte más importante es el callback `authorized`. Aquí se define la lógica de seguridad de las rutas. Actualmente, estipula que cualquier ruta que comience con `/admin` requiere que el usuario esté autenticado.

- **`app/api/auth/[...nextauth]/route.ts`**:
  - **Función**: Es un "catch-all route handler" que expone los endpoints de la API interna de Auth.js (e.g., `/api/auth/session`, `/api/auth/signin`, `/api/auth/signout`).
  - **Lógica**: Simplemente re-exporta los `handlers` (GET y POST) desde `auth.ts`. Esto es crucial para que el `SessionProvider` en el cliente pueda obtener los datos de la sesión.

### 2.3. Internacionalización (`i18n.ts`, `navigation.ts`, `messages/`)

La i18n sigue las prácticas más modernas y recomendadas por `next-intl`.

- **`navigation.ts`**:

  - **Función**: Centraliza toda la configuración del **enrutamiento** de i18n.
  - **Lógica**: Define los `locales` (idiomas soportados), el `localePrefix` (estrategia para prefijos de URL) y los `pathnames` (rutas traducidas). Exporta versiones "envueltas" de `Link`, `redirect`, `useRouter` y `usePathname` que son automáticamente conscientes de los idiomas, simplificando enormemente la navegación en el resto de la aplicación.

- **`i18n.ts`**:

  - **Función**: Configura la **carga de datos** (mensajes) para la i18n.
  - **Lógica**: Utiliza `getRequestConfig` para cargar dinámicamente el archivo JSON de mensajes correcto (`messages/en.json` o `messages/es.json`) basándose en el `locale` de la petición actual.

- **`messages/`**:
  - **Función**: Almacena los archivos de traducción.
  - **Lógica**: Cada archivo (`en.json`, `es.json`) contiene un objeto JSON con pares `clave-valor` que representan los textos de la aplicación en ese idioma.

### 2.4. Lógica de Negocio y Datos (`app/actions.ts`, `lib/`)

- **`app/actions.ts`**:

  - **Función**: Contiene las **Server Actions**, que son funciones de backend que se pueden llamar directamente desde los componentes del cliente de forma segura.
  - **Lógica**:
    - `login`: Valida los datos del formulario, llama a `signIn` de Auth.js y devuelve un estado de error si falla. Su firma está adaptada para funcionar con el hook `useActionState`.
    - `createSubdomainAction`: Valida los datos, comprueba si el subdominio ya existe en Redis, lo crea si está disponible y redirige al nuevo subdominio.
    - `deleteSubdomainAction`: Elimina un subdominio de Redis.
    - `logout`: Llama a `signOut` de Auth.js.

- **`lib/redis.ts`**:

  - **Función**: Actúa como un "singleton" para la conexión a la base de datos.
  - **Lógica**: Crea y exporta una única instancia del cliente de Upstash Redis, leyendo las credenciales de forma segura desde las variables de entorno.

- **`lib/subdomains.ts`**:
  - **Función**: Centraliza todas las operaciones de base de datos relacionadas con los subdominios.
  - **Lógica**: Contiene funciones como `getSubdomainData` y `getAllSubdomains` que interactúan con la instancia de `redis` para leer y escribir datos.

### 2.5. Estructura de Páginas y Componentes (`app/`, `components/`)

- **`app/layout.tsx` (RootLayout)**: El layout raíz absoluto. Es el único que renderiza `<html>` y `<body>`. Pasa el `locale` a la etiqueta `<html>`.
- **`app/[locale]/layout.tsx` (LocaleLayout)**: Envuelve todas las páginas internacionalizadas. Su única responsabilidad es configurar los proveedores de contexto (`SessionProvider`, `NextIntlClientProvider`, `Toaster`).
- **`app/[locale]/page.tsx`**: La página de inicio del dominio principal.
- **`app/[locale]/login/page.tsx`**: La página de inicio de sesión, que ahora es un Client Component para usar `useActionState` y dar feedback al usuario.
- **`app/[locale]/admin/page.tsx`**: La página del panel de administración, protegida por el middleware.
- **`app/s/[subdomain]/page.tsx`**: La página dinámica que se renderiza para cada tenant, obteniendo los datos del subdominio desde la URL.
- **`components/`**: Contiene los componentes de UI reutilizables, en este caso, los que provee Shadcn/UI.

---

## 3. Refactorización y Mejoras de Lógica

Aunque el código es muy sólido, aquí hay algunas refactorizaciones y mejoras siguiendo las convenciones más altas para llevarlo al siguiente nivel.

1.  **Centralizar Tipos (`types/` o `lib/definitions.ts`)**

    - **Problema:** Tipos como `Tenant` y `LoginState` están definidos localmente en los archivos donde se usan.
    - **Mejora:** Crea una carpeta `lib/definitions.ts` (o `types/definitions.ts`) y define ahí todas las interfaces y tipos compartidos. Esto mejora la reutilización y mantiene un único punto de verdad para la estructura de tus datos.

      ```typescript
      // lib/definitions.ts
      export type Tenant = {
        subdomain: string;
        emoji: string;
        createdAt: number;
      };

      export type ActionState = {
        error?: string;
        success?: string;
      };
      ```

2.  **Mejorar la Experiencia de Usuario en el Dashboard**

    - **Problema:** El dashboard `AdminDashboard` actualmente muestra errores y éxitos en `divs` fijos.
    - **Mejora:** Ya hemos preparado el terreno con `react-hot-toast`. Ahora, en `AdminDashboard.tsx`, importa `toast` y usa un `useEffect` para mostrar notificaciones cuando el `state` de la acción cambie.

      ```tsx
      // app/[locale]/admin/dashboard.tsx
      import { useEffect } from "react";
      import toast from "react-hot-toast";

      // Dentro del componente AdminDashboard
      useEffect(() => {
        if (state.error) {
          toast.error(state.error);
        }
        if (state.success) {
          toast.success(state.success);
        }
      }, [state]);

      // ... y elimina los divs fijos del JSX.
      ```

3.  **Implementar Confirmación de Borrado (Modal)**
    - **Problema:** Un clic en el botón de basura elimina un subdominio instantáneamente, lo cual es peligroso.
    - **Mejora:** Envuelve el botón de eliminar en un componente `<Dialog>` de Shadcn/UI para pedir confirmación al usuario. Esto previene borrados accidentales y es una práctica estándar de UX.

---

## 4. Mejoras y Optimizaciones Futuras

El proyecto actual es una base excelente. Aquí hay una hoja de ruta de posibles siguientes pasos:

### Funcionalidades

- **Roles de Usuario:** Extender el modelo de usuario para incluir roles (e.g., `admin`, `user`). Usar los callbacks `jwt` y `session` de Auth.js para añadir el rol al token y a la sesión. Luego, actualizar el middleware para proteger rutas basándose en roles.
- **Planes de Suscripción:** Integrar Stripe para permitir que los tenants se suscriban a diferentes planes con distintas funcionalidades.
- **Personalización del Tenant:** Permitir a los usuarios subir un logo, elegir un tema de color o añadir contenido a su página de subdominio, guardando esta información en la base de datos.

### Base de Datos y Backend

- **Migrar a una Base de Datos Relacional:** Para una aplicación de producción real, migra la gestión de usuarios y tenants de `MOCK_USERS` y Redis a una base de datos como **PostgreSQL** con un ORM como **Prisma** o **Drizzle**. Redis puede seguir usándose como una caché de alto rendimiento.
- **Testing:** Implementar una estrategia de testing con **Vitest** para tests unitarios (e.g., en las Server Actions) y **Playwright** o **Cypress** para tests de extremo a extremo (E2E) que simulen flujos de usuario completos.

### Optimización y DevOps

- **Streaming con Suspense:** Envolver los componentes que cargan datos (como `AdminDashboard`) en un `<Suspense>` de React para mostrar un esqueleto de carga (loading skeleton) y mejorar la percepción de velocidad.
- **CI/CD (Integración Continua / Despliegue Continuo):** Configurar GitHub Actions para ejecutar automáticamente los tests y el linter en cada `push`, y para desplegar automáticamente a Vercel cuando se fusionen cambios a la rama `main`.
---
# Manual del Proyecto Metashark 🦈

## Visión General

**Metashark** es una plataforma SaaS (Software as a Service) multi-tenant construida sobre las tecnologías más modernas del ecosistema de Next.js y React. Sirve como una base de código de producción (boilerplate) que demuestra cómo implementar de manera robusta y escalable funcionalidades complejas como subdominios dinámicos, autenticación segura e internacionalización.

El proyecto permite a los usuarios registrar subdominios únicos, personalizarlos con un emoji y acceder a ellos a través de una URL propia, mientras que el dominio principal sirve como portal de registro y panel de administración.

---

## 1. Funcionalidades Clave

*   ✅ **Multi-Tenancy por Subdominio:** Cada usuario (tenant) obtiene su propio espacio aislado accesible a través de una URL única (e.g., `mi-tienda.metashark.com`).
*   ✅ **Internacionalización (i18n) Completa:** El sitio principal soporta múltiples idiomas (`inglés` y `español`) con enrutamiento basado en prefijo de URL (`/es/...`), optimizado para SEO y experiencia de usuario.
*   ✅ **Autenticación Segura:** Un panel de administración protegido por un sistema de login con credenciales, implementado con **Auth.js v5**, compatible con el Edge Runtime de Next.js.
*   ✅ **Gestión de Datos de Alta Velocidad:** Utiliza **Upstash Redis** como base de datos en memoria para una gestión instantánea de los datos de los subdominios.
*   ✅ **Arquitectura Moderna con Next.js 15:** Aprovecha al máximo el App Router, Server Components, Server Actions y las últimas convenciones de React 19.

---

## 2. Arquitectura y Lógica Detallada (Archivo por Archivo)

La arquitectura de Metashark está diseñada para ser modular y escalable. Cada parte del sistema tiene una responsabilidad bien definida.

### 2.1. El Middleware: El Corazón del Enrutamiento (`middleware.ts`)

Este archivo es el punto de entrada para casi todas las peticiones a la aplicación y actúa como un controlador de tráfico inteligente.

**Lógica de Ejecución:**

1.  **Envoltura de `auth`**: La exportación `default` está envuelta en la función `auth` de Auth.js. Esto significa que **la autenticación se verifica primero**. Si un usuario no autenticado intenta acceder a una ruta protegida (definida en `auth.config.ts`), `auth` lo redirigirá automáticamente a la página de login sin ejecutar el resto del código del middleware.
2.  **Detección de Subdominio**: Si la autenticación es exitosa (o la ruta es pública), el código dentro del callback se ejecuta. La primera tarea es analizar el `host` de la petición. Si se detecta un subdominio, la petición se **reescribe internamente** a la ruta `/s/[subdomain]`. La ejecución del middleware termina aquí para esa petición, y Next.js renderiza la página del tenant.
3.  **Internacionalización (i18n)**: Si no es un subdominio, la petición se pasa al `intlMiddleware`. Este se encarga de gestionar los prefijos de idioma (ej. `/`, `/es`), detectar el idioma del usuario y establecer las cookies necesarias.

### 2.2. Autenticación (`auth.ts`, `auth.config.ts`, `api/`)

El sistema de autenticación es robusto y está desacoplado del resto de la aplicación.

*   **`auth.ts`**:
    *   **Función**: Define la configuración principal de `NextAuth`. Aquí se inicializan los "providers" (actualmente, solo `Credentials` para login con email/password).
    *   **Lógica**: Contiene la función `authorize`, que se ejecuta cuando un usuario intenta iniciar sesión. Compara el hash de la contraseña proporcionada con el almacenado usando **`bcryptjs`**, que es una librería de JavaScript puro compatible con el Edge Runtime.
    *   **Exportaciones**: Exporta `handlers`, `auth`, `signIn`, y `signOut`, que son las funciones y objetos que se utilizan en toda la aplicación para interactuar con el sistema de autenticación.

*   **`auth.config.ts`**:
    *   **Función**: Contiene la configuración de Auth.js que puede ejecutarse de forma segura en el Edge Runtime (sin dependencias de Node.js).
    *   **Lógica**: Su parte más importante es el callback `authorized`. Aquí se define la lógica de seguridad de las rutas. Actualmente, estipula que cualquier ruta que comience con `/admin` requiere que el usuario esté autenticado.

*   **`app/api/auth/[...nextauth]/route.ts`**:
    *   **Función**: Es un "catch-all route handler" que expone los endpoints de la API interna de Auth.js (e.g., `/api/auth/session`, `/api/auth/signin`, `/api/auth/signout`).
    *   **Lógica**: Simplemente re-exporta los `handlers` (GET y POST) desde `auth.ts`. Esto es crucial para que el `SessionProvider` en el cliente pueda obtener los datos de la sesión.

### 2.3. Internacionalización (`i18n.ts`, `navigation.ts`, `messages/`)

La i18n sigue las prácticas más modernas y recomendadas por `next-intl`.

*   **`navigation.ts`**:
    *   **Función**: Centraliza toda la configuración del **enrutamiento** de i18n.
    *   **Lógica**: Define los `locales` (idiomas soportados), el `localePrefix` (estrategia para prefijos de URL) y los `pathnames` (rutas traducidas). Exporta versiones "envueltas" de `Link`, `redirect`, `useRouter` y `usePathname` que son automáticamente conscientes de los idiomas, simplificando enormemente la navegación en el resto de la aplicación.

*   **`i18n.ts`**:
    *   **Función**: Configura la **carga de datos** (mensajes) para la i18n.
    *   **Lógica**: Utiliza `getRequestConfig` para cargar dinámicamente el archivo JSON de mensajes correcto (`messages/en.json` o `messages/es.json`) basándose en el `locale` de la petición actual.

*   **`messages/`**:
    *   **Función**: Almacena los archivos de traducción.
    *   **Lógica**: Cada archivo (`en.json`, `es.json`) contiene un objeto JSON con pares `clave-valor` que representan los textos de la aplicación en ese idioma.

### 2.4. Lógica de Negocio y Datos (`app/actions.ts`, `lib/`)

*   **`app/actions.ts`**:
    *   **Función**: Contiene las **Server Actions**, que son funciones de backend que se pueden llamar directamente desde los componentes del cliente de forma segura.
    *   **Lógica**:
        *   `login`: Valida los datos del formulario, llama a `signIn` de Auth.js y devuelve un estado de error si falla. Su firma está adaptada para funcionar con el hook `useActionState`.
        *   `createSubdomainAction`: Valida los datos, comprueba si el subdominio ya existe en Redis, lo crea si está disponible y redirige al nuevo subdominio.
        *   `deleteSubdomainAction`: Elimina un subdominio de Redis.
        *   `logout`: Llama a `signOut` de Auth.js.

*   **`lib/redis.ts`**:
    *   **Función**: Actúa como un "singleton" para la conexión a la base de datos.
    *   **Lógica**: Crea y exporta una única instancia del cliente de Upstash Redis, leyendo las credenciales de forma segura desde las variables de entorno.

*   **`lib/subdomains.ts`**:
    *   **Función**: Centraliza todas las operaciones de base de datos relacionadas con los subdominios.
    *   **Lógica**: Contiene funciones como `getSubdomainData` y `getAllSubdomains` que interactúan con la instancia de `redis` para leer y escribir datos.

### 2.5. Estructura de Páginas y Componentes (`app/`, `components/`)

*   **`app/layout.tsx` (RootLayout)**: El layout raíz absoluto. Es el único que renderiza `<html>` y `<body>`. Pasa el `locale` a la etiqueta `<html>`.
*   **`app/[locale]/layout.tsx` (LocaleLayout)**: Envuelve todas las páginas internacionalizadas. Su única responsabilidad es configurar los proveedores de contexto (`SessionProvider`, `NextIntlClientProvider`, `Toaster`).
*   **`app/[locale]/page.tsx`**: La página de inicio del dominio principal.
*   **`app/[locale]/login/page.tsx`**: La página de inicio de sesión, que ahora es un Client Component para usar `useActionState` y dar feedback al usuario.
*   **`app/[locale]/admin/page.tsx`**: La página del panel de administración, protegida por el middleware.
*   **`app/s/[subdomain]/page.tsx`**: La página dinámica que se renderiza para cada tenant, obteniendo los datos del subdominio desde la URL.
*   **`components/`**: Contiene los componentes de UI reutilizables, en este caso, los que provee Shadcn/UI.

---

## 3. Refactorización y Mejoras de Lógica

Aunque el código es muy sólido, aquí hay algunas refactorizaciones y mejoras siguiendo las convenciones más altas para llevarlo al siguiente nivel.

1.  **Centralizar Tipos (`types/` o `lib/definitions.ts`)**
    *   **Problema:** Tipos como `Tenant` y `LoginState` están definidos localmente en los archivos donde se usan.
    *   **Mejora:** Crea una carpeta `lib/definitions.ts` (o `types/definitions.ts`) y define ahí todas las interfaces y tipos compartidos. Esto mejora la reutilización y mantiene un único punto de verdad para la estructura de tus datos.
        ```typescript
        // lib/definitions.ts
        export type Tenant = {
          subdomain: string;
          emoji: string;
          createdAt: number;
        };

        export type ActionState = {
          error?: string;
          success?: string;
        };
        ```
2.  **Mejorar la Experiencia de Usuario en el Dashboard**
    *   **Problema:** El dashboard `AdminDashboard` actualmente muestra errores y éxitos en `divs` fijos.
    *   **Mejora:** Ya hemos preparado el terreno con `react-hot-toast`. Ahora, en `AdminDashboard.tsx`, importa `toast` y usa un `useEffect` para mostrar notificaciones cuando el `state` de la acción cambie.
        ```tsx
        // app/[locale]/admin/dashboard.tsx
        import { useEffect } from 'react';
        import toast from 'react-hot-toast';

        // Dentro del componente AdminDashboard
        useEffect(() => {
          if (state.error) {
            toast.error(state.error);
          }
          if (state.success) {
            toast.success(state.success);
          }
        }, [state]);

        // ... y elimina los divs fijos del JSX.
        ```
3.  **Implementar Confirmación de Borrado (Modal)**
    *   **Problema:** Un clic en el botón de basura elimina un subdominio instantáneamente, lo cual es peligroso.
    *   **Mejora:** Envuelve el botón de eliminar en un componente `<Dialog>` de Shadcn/UI para pedir confirmación al usuario. Esto previene borrados accidentales y es una práctica estándar de UX.

---

## 4. Mejoras y Optimizaciones Futuras

El proyecto actual es una base excelente. Aquí hay una hoja de ruta de posibles siguientes pasos:

### Funcionalidades

*   **Roles de Usuario:** Extender el modelo de usuario para incluir roles (e.g., `admin`, `user`). Usar los callbacks `jwt` y `session` de Auth.js para añadir el rol al token y a la sesión. Luego, actualizar el middleware para proteger rutas basándose en roles.
*   **Planes de Suscripción:** Integrar Stripe para permitir que los tenants se suscriban a diferentes planes con distintas funcionalidades.
*   **Personalización del Tenant:** Permitir a los usuarios subir un logo, elegir un tema de color o añadir contenido a su página de subdominio, guardando esta información en la base de datos.

### Base de Datos y Backend

*   **Migrar a una Base de Datos Relacional:** Para una aplicación de producción real, migra la gestión de usuarios y tenants de `MOCK_USERS` y Redis a una base de datos como **PostgreSQL** con un ORM como **Prisma** o **Drizzle**. Redis puede seguir usándose como una caché de alto rendimiento.
*   **Testing:** Implementar una estrategia de testing con **Vitest** para tests unitarios (e.g., en las Server Actions) y **Playwright** o **Cypress** para tests de extremo a extremo (E2E) que simulen flujos de usuario completos.

### Optimización y DevOps

*   **Streaming con Suspense:** Envolver los componentes que cargan datos (como `AdminDashboard`) en un `<Suspense>` de React para mostrar un esqueleto de carga (loading skeleton) y mejorar la percepción de velocidad.
*   **CI/CD (Integración Continua / Despliegue Continuo):** Configurar GitHub Actions para ejecutar automáticamente los tests y el linter en cada `push`, y para desplegar automáticamente a Vercel cuando se fusionen cambios a la rama `main`.
---

