# Manifiesto de Rutas de la Aplicación - Metashark

Este documento describe la estructura de enrutamiento y los niveles de acceso para todas las páginas clave de la plataforma Metashark. Sirve como una referencia rápida para el equipo de desarrollo.

---

## 1. Rutas Públicas (Acceso: Todos)

Estas rutas son accesibles para cualquier visitante, autenticado o no.

| Ruta               | Propósito                                                                    | Componente Principal                    |
| ------------------ | ---------------------------------------------------------------------------- | --------------------------------------- |
| `/`                | Landing Page principal.                                                      | `app/[locale]/page.tsx`                 |
| `/login`           | Portal de autenticación para iniciar sesión o registrarse.                     | `app/[locale]/login/page.tsx`           |
| `/forgot-password` | Formulario para solicitar el reseteo de contraseña.                            | `app/[locale]/forgot-password/page.tsx` |
| `/reset-password`  | Formulario para establecer una nueva contraseña (requiere token de la URL).    | `app/[locale]/reset-password/page.tsx`  |
| `/auth-notice`     | Página genérica para notificaciones de autenticación (ej. "Revisa tu email"). | `app/[locale]/auth-notice/page.tsx`     |
| `/s/[subdomain]`   | **Renderizado de Sitio Público.** Muestra la página de un sitio creado.        | `app/s/[subdomain]/page.tsx`            |

---

## 2. Rutas de Usuario Autenticado (Acceso: Rol `user`, `admin`, `developer`)

Estas rutas requieren una sesión de usuario válida. El middleware redirige a `/login` si no hay sesión.

| Ruta                           | Propósito                                                                      | Componente Principal                             |
| ------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------ |
| `/dashboard`                   | **Centro de Comando del Usuario.** Vista principal de módulos y herramientas.    | `app/[locale]/dashboard/page.tsx`                |
| `/dashboard/sites`             | (Futuro) Listado y gestión de los sitios del usuario.                          | `app/[locale]/dashboard/sites/page.tsx`          |
| `/dashboard/settings`          | (Futuro) Panel para ajustes de perfil y workspace.                             | `app/[locale]/dashboard/settings/page.tsx`       |
| `/builder/[campaignId]`        | **Constructor de Campañas.** La interfaz de edición visual (WYSIWYG).          | `app/[locale]/builder/[campaignId]/page.tsx`     |

---

## 3. Rutas de Administración (Acceso: Rol `admin`, `developer`)

Consola de soporte para la gestión de la plataforma.

| Ruta       | Propósito                                              | Componente Principal             |
| ---------- | ------------------------------------------------------ | -------------------------------- |
| `/admin`   | Dashboard principal para administradores. Vista de sitios. | `app/[locale]/admin/page.tsx`      |

---

## 4. Rutas de Desarrollador (Acceso: Rol `developer`)

Consola de alto nivel con herramientas de supervisión y gestión avanzada. Protegida por una doble capa de seguridad (middleware y layout de servidor).

| Ruta                      | Propósito                                                   | Componente Principal                      |
| ------------------------- | ----------------------------------------------------------- | ----------------------------------------- |
| `/dev-console`            | Vista general (Overview) del estado de la plataforma.       | `app/[locale]/dev-console/page.tsx`       |
| `/dev-console/users`      | **Gestión de Usuarios y Roles.** Permite modificar permisos.  | `app/[locale]/dev-console/users/page.tsx` |
| `/dev-console/campaigns`  | **Visor de Campañas.** Supervisión de contenido generado.   | `app/[locale]/dev-console/campaigns/page.tsx`|
| `/dev-console/logs`       | (Futuro) Visor de logs de auditoría.                        | `app/[locale]/dev-console/logs/page.tsx`  |

---

## 5. Rutas de API (No accesibles directamente por el usuario)

| Ruta                           | Propósito                                                                      |
| ------------------------------ | ------------------------------------------------------------------------------ |
| `/api/auth/callback`           | Maneja el callback de los proveedores OAuth (ej. Google).                      |
| `/api/auth/callback/confirm`   | Maneja el callback de la confirmación de email.                                |