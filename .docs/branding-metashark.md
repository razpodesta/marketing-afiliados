# Blueprint del Proyecto: MetaShark - AI Affiliate Marketing Suite

# version: 1.0

# status: Phase 0 (Stabilization) Complete

# primary_contact: "RaZ WriTe"

# ai_architect: "L.I.A. Legacy"

# ==============================================================================

# 1.0 RESUMEN EJECUTIVO

# ==============================================================================

# MetaShark es una Plataforma de Inteligencia de Marketing de Afiliados (SaaS)

# diseñada para empoderar a los marketers, desde principiantes hasta expertos,

# con un ecosistema de herramientas impulsadas por IA. La plataforma se centra

# en el ciclo completo de una campaña: estrategia, creación de activos, análisis

# y optimización. El producto principal es una suite para la creación de landing

# pages de alta conversión, asistida por una IA (L.I.A. Affiliate Manager)

# para la generación de copys, análisis de rendimiento y estrategia de nicho.

#

# El modelo de negocio es un SaaS híbrido, combinando una suscripción mensual

# con un sistema de "Créditos de IA" consumibles para las operaciones de IA más

# intensivas. La arquitectura está construida sobre un stack moderno y escalable

# (Next.js, Supabase, Tailwind CSS) con un enfoque en el rendimiento, la seguridad

# y una experiencia de usuario (UI/UX) de élite.

# ==============================================================================

# 2.0 VISIÓN Y MISIÓN DEL PRODUCTO

# ==============================================================================

# 2.1 Misión (El "Porqué"):

# Democratizar el acceso a estrategias y herramientas de marketing de afiliados

# de alto nivel, permitiendo a creadores individuales y equipos pequeños competir

# y prosperar en un mercado digital competitivo.

#

# 2.2 Visión (El "Qué"):

# Convertirse en el sistema operativo indispensable para el marketing de afiliados,

# una plataforma inteligente que no solo proporciona herramientas, sino que actúa

# como un socio estratégico proactivo para maximizar la rentabilidad de sus usuarios.

#

# 2.3 Usuario Objetivo (El "Quién"):

# - Marketers de Afiliados Principiantes: Necesitan guía y herramientas intuitivas.

# - Marketers de Afiliados Intermedios/Avanzados: Buscan optimizar flujos,

# escalar campañas y obtener una ventaja competitiva a través de datos e IA.

# - Agencias Pequeñas: Gestionan múltiples campañas para diferentes clientes.

# ==============================================================================

# 3.0 ARQUITECTURA DEL SISTEMA

# ==============================================================================

# 3.1 Stack Tecnológico Principal:

# - Framework: Next.js 14 (App Router)

# - Base de Datos y Backend: Supabase (PostgreSQL, Auth, Storage)

# - Estilos: Tailwind CSS v3 con shadcn/ui

# - Internacionalización (i18n): next-intl

# - Gestión de Paquetes: pnpm

#

# 3.2 Principios Arquitectónicos Clave:

# - Supabase como Única Fuente de Verdad: Toda la autenticación, datos de

# usuario y contenido son gestionados a través de Supabase para mantener la

# consistencia. Se ha eliminado `next-auth`.

# - Server Components First: La carga de datos se realiza principalmente en

# Componentes de Servidor para optimizar el rendimiento.

# - Server Actions para Mutaciones: Todas las operaciones de escritura (crear,

# actualizar, eliminar) se manejan a través de Server Actions seguras.

# - Layouts Ligeros, Páginas Pesadas: Los componentes de Layout (`layout.tsx`)

# se mantienen estructurales y ligeros. La lógica de carga de datos pesada

# se delega a los componentes de Página (`page.tsx`).

# - UI Componible: La interfaz se construye con componentes reutilizables de

# `shadcn/ui`, asegurando consistencia y mantenibilidad.

# ==============================================================================

# 4.0 MODELO DE DATOS (SIMPLIFICADO)

# ==============================================================================

# La estructura de datos en Supabase sigue un modelo relacional multi-tenant.

#

# - auth.users: Tabla nativa de Supabase. Almacena la identidad principal.

# -> Relación 1:1 con `profiles`

#

# - profiles: Almacena metadatos de la aplicación, como `app_role` ('user' | 'developer').

# -> Relación 1:N con `workspaces` (un usuario puede ser `owner_id` de muchos workspaces).

#

# - workspaces: Representa una organización o un tenant. Es el contenedor principal.

# -> Relación 1:N con `sites`.

# -> Relación M:N con `profiles` a través de `workspace_members`.

#

# - workspace_members: Tabla de unión que define la membresía de un usuario

# en un workspace y su rol contextual (`admin` | `member`).

#

# - sites: Representa un sitio web con un subdominio único. Pertenece a un `workspace_id`.

# -> Relación 1:N con `campaigns`.

#

# - campaigns & pages: Estructuras para el contenido de cada sitio.

# ==============================================================================

# 5.0 FLUJOS DE USUARIO CRÍTICOS (DECISIONES TOMADAS)

# ==============================================================================

# 5.1 Onboarding de Nuevo Usuario:

# 1. El usuario se registra a través de la UI de Supabase Auth (OAuth o Email).

# 2. Un Trigger de PostgreSQL en `auth.users` se dispara automáticamente.

# 3. La función `handle_new_user` crea una entrada en `profiles` con `app_role='user'`

# y crea un `workspace` por defecto para ese usuario, asignándolo como propietario.

#

# 5.2 Autenticación y Autorización:

# 1. El usuario inicia sesión; Supabase establece una cookie de sesión segura (`HttpOnly`).

# 2. En cada petición a una ruta protegida, el `middleware.ts` valida la sesión.

# 3. Las páginas del servidor (`/admin`, `/dashboard`) consultan la tabla `profiles`

# para verificar el `app_role` y autorizar o redirigir según corresponda.

#

# 5.3 Gestión de Contexto (Workspace Activo):

# 1. El `DashboardLayout` carga todos los workspaces a los que el usuario pertenece.

# 2. Lee una cookie llamada `active_workspace_id` para determinar el contexto actual.

# 3. Si la cookie no existe, se establece el primer workspace de la lista como activo por defecto.

# 4. El `WorkspaceSwitcher` (UI) invoca la `setActiveWorkspaceAction`.

# 5. La `Server Action` valida la membresía del usuario al workspace solicitado, establece

# la cookie `active_workspace_id` y redirige a `/dashboard` para recargar la UI

# con el nuevo contexto.

# ==============================================================================

# 6.0 SUITE DE MÓDULOS DE IA (VISIÓN DEL PRODUCTO)

# ==============================================================================

# El dashboard presentará 9 módulos, agrupados por fase del workflow.

#

# Fase 1: ESTRATEGIA E IDEACIÓN

# - 1. Analista de Nichos IA

# - 2. Generador de Customer Avatars

# - 3. Brainstorming de Campañas

#

# Fase 2: CREACIÓN DE ACTIVOS (Enfoque inicial)

# - 4. Suite de Landing Pages [ACTIVO]

# - 5. Creador de Bridge Pages [ACTIVO]

# - 6. Generador de Quizzes [ACTIVO]

#

# Fase 3: OPTIMIZACIÓN Y ANÁLISIS

# - 7. AI Copywriter Pro [BETA]

# - 8. Auditor de Conversión [PRÓXIMAMENTE]

# - 9. Analista de Ads IA [PRÓXIMAMENTE]

# ==============================================================================

# 7.0 MODELO DE MONETIZACIÓN

# ==============================================================================

# Se implementará un sistema híbrido de Suscripción + Consumo.

#

# 7.1 "Créditos de IA":

# - Moneda interna para operaciones de IA intensivas (análisis, generación compleja).

# - La creación de landings y el uso básico de la plataforma no consumen créditos.

#

# 7.2 Planes de Suscripción:

# - Cada plan (ej. Starter, Pro, Agency) incluirá una asignación mensual de Créditos de IA.

# - Los usuarios podrán comprar paquetes de créditos adicionales.

# ==============================================================================

# 8.0 HOJA DE RUTA DE DESARROLLO (ROADMAP)

# ==============================================================================

#

# [FASE 0: ESTABILIZACIÓN Y FUNDAMENTOS] - (COMPLETADA)

# - [✓] Unificación de la autenticación a Supabase Auth nativo.

# - [✓] Reparación de políticas RLS y lógica de carga de datos.

# - [✓] Estabilización del sistema de estilos y temas (claro/oscuro).

# - [✓] Implementación de la UI del dashboard principal y navegación.

#

# [FASE 1: MVP - SUITE DE CREACIÓN DE LANDINGS] - (PRÓXIMO ENFOQUE)

# - [ ] **Backend/DB:** Diseñar y crear las tablas para almacenar la estructura de las páginas (ej. `pages`, `components`, `page_components`).

# - [ ] **Flujo de Creación (UI):** Desarrollar la ruta `/dashboard/sites/new` con el constructor guiado por pasos (selección de plantillas de componentes).

# - [ ] **Editor Visual (UI):** Implementar la interfaz tipo "Canva" para la personalización de estilos (colores, tipografía, imágenes) de los componentes seleccionados.

# - [ ] **Renderizado Público:** Asegurar que la página `/s/[subdomain]` pueda leer la estructura de la base de datos y renderizar la landing page construida.

#

# [FASE 2: INTEGRACIÓN DE L.I.A. (COPYWRITER)]

# - [ ] Integrar el Vercel AI SDK o una librería similar.

# - [ ] Implementar la funcionalidad "✨ Generar con IA" en los campos de texto del editor de landings.

# - [ ] Conectar la interfaz de chat de L.I.A. a un modelo de lenguaje (ChatGPT, Gemini, etc.).

#

# [FASE 3: EXPANSIÓN DE LA SUITE DE IA Y MONETIZACIÓN]

# - [ ] Implementar el sistema de "Créditos de IA" en el backend (tabla en Supabase).

# - [ ] Construir la UI para la gestión de planes y facturación (integración con Stripe).

# - [ ] Desarrollar los módulos de análisis (Auditor de Conversión, Analista de Ads).

#

# [FASE 4: CRECIMIENTO Y ESCALABILIDAD]

# - [ ] Implementar la gestión de equipos (invitar miembros a un workspace).

# - [ ] Desarrollar la funcionalidad de "Agentes de IA" personalizables.

# - [ ] Optimización de performance a gran escala y caching avanzado.

# ==============================================================================

# 9.0 PRINCIPIOS DE DISEÑO Y TÉCNICOS (LA "METODOLOGÍA METASHARK")

# ==============================================================================

# - **Entrega "FULL":** Todo el código se entrega completo, documentado (TSDoc),

# con su ruta y una sección de mejoras. Cero abreviaciones o referencias.

# - **Seguridad Primero:** La validación de datos (Zod), las políticas RLS y la

# verificación de permisos en Server Actions son innegociables.

# - **Performance por Defecto:** Priorizar Server Components, optimizar imágenes

# (`next/image`), utilizar `Suspense` y minimizar el JavaScript del lado del cliente.

# - **UI/UX Sofisticada y Proactiva:** La interfaz debe ser intuitiva, estéticamente

# agradable y debe anticiparse a las necesidades del usuario.

# - **Mobile-First:** Todo nuevo componente o layout debe ser diseñado y probado

# primero para la experiencia móvil.
