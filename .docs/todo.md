# Lista de Tareas Pendientes - Proyecto Metashark SaaS

## Prioridad Alta (Próxima Fase)

- [ ] **Flujo de Registro de Usuario:**
  - [ ] Crear página de registro (`/signup`).
  - [ ] Implementar la Server Action `signupUser` que cree una entrada en `auth.users` y `public.profiles`.
  - [ ] Asegurar el hasheo de contraseñas durante el registro.
- [ ] **Dashboard del Suscriptor (`/dashboard`):**
  - [ ] Crear la estructura de la página y protegerla para el rol `user`.
  - [ ] Implementar la lógica para que los usuarios `user` puedan crear/ver/eliminar sus propios tenants (`subdomains`).
- [ ] **Tipos de Sesión Seguros:**
  - [ ] Crear `types/next-auth.d.ts` para extender la sesión y el usuario con el campo `role`.

## Prioridad Media (Mejoras UX/DX)

- [ ] **Migrar de `Credentials` a `OAuth`/`Magic Link`:** Investigar y reemplazar el proveedor de `Credentials` por una opción más segura y amigable como Google o un enlace de inicio de sesión por email.
- [ ] **Notificaciones Toast:** Reemplazar los mensajes de error/éxito fijos por un sistema de notificaciones como `react-hot-toast`.
- [ ] **Modal de Confirmación:** Añadir un modal de diálogo antes de ejecutar acciones destructivas (ej. eliminar un tenant).

## Prioridad Baja (Optimización)

- [ ] **Capa de Caché para Tenants:** Implementar una caché para la función `getTenantDataBySubdomain` para reducir las llamadas a la base de datos desde el middleware.
- [ ] **Paginación en `getAllTenants`:** Añadir paginación al panel de administración para manejar un gran número de tenants.

---

# Lista de Tareas Pendientes - Proyecto Metashark SaaS

## Prioridad Alta (Próxima Fase)

- [ ] **Flujo de Registro de Usuario:**
  - [ ] Crear página de registro (`/signup`).
  - [ ] Implementar la Server Action `signupUser` que cree una entrada en `auth.users` y `public.profiles`.
  - [ ] Asegurar el hasheo de contraseñas durante el registro.
- [ ] **Dashboard del Suscriptor (`/dashboard`):**
  - [ ] Crear la estructura de la página y protegerla para el rol `user`.
  - [ ] Implementar la lógica para que los usuarios `user` puedan crear/ver/eliminar sus propios tenants.

## Prioridad Media (Mejoras UX/DX)

- [ ] **Migrar de `Credentials` a `OAuth`/`Magic Link`:** Investigar y reemplazar el proveedor de `Credentials` por una opción más segura y amigable como Google o un enlace de inicio de sesión por email.
- [ ] **Notificaciones Toast:** Reemplazar los mensajes de error/éxito fijos por un sistema de notificaciones como `react-hot-toast`.
- [ ] **Modal de Confirmación:** Añadir un modal de diálogo antes de ejecutar acciones destructivas (ej. eliminar un tenant).

## Completado

- [x] **Migración a Supabase y RBAC Inicial.**
- [x] **Estabilización de Dependencias y Tipado Fuerte de Sesión.**
