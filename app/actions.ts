// Ruta: app/actions.ts

"use server";

import { logger } from "@/lib/logging";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

/**
 * @file app/actions.ts
 * @description Contiene todas las Server Actions de la aplicación. Este archivo centraliza
 * la lógica de negocio del lado del servidor. Se ha unificado el tipado de estado
 * para una integración perfecta con los hooks de React en el cliente.
 *
 * @author Metashark
 * @version 5.2.0 (State Type Unification & Final Polish)
 */

// --- TIPOS Y ESQUEMAS DE VALIDACIÓN ---

/**
 * @description Tipo de estado para el formulario de creación de sitios.
 * Es utilizado tanto por el hook `useActionState` en el cliente como por el
 * tipo de retorno de la Server Action, garantizando la coherencia.
 */
export type CreateSiteFormState = {
  error?: string;
  success?: boolean;
  subdomain?: string;
  icon?: string;
};

const SiteSchema = z.object({
  subdomain: z
    .string({ required_error: "El subdominio es requerido." })
    .min(3, { message: "El subdominio debe tener al menos 3 caracteres." })
    .regex(/^[a-z0-9-]+$/, {
      message: "Solo se permiten letras minúsculas, números y guiones.",
    }),
  icon: z
    .string({ required_error: "El ícono es requerido." })
    .min(1, { message: "El ícono no puede estar vacío." }),
});

const EmailSchema = z
  .string()
  .email({ message: "Por favor, introduce un email válido." });

// --- ACCIONES DE AUTENTICACIÓN Y CONTEXTO ---

/**
 * @description Cierra la sesión del usuario actual en Supabase y lo redirige a la página de inicio.
 */
export async function signOutAction(): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    logger.error("Error al cerrar sesión:", error);
  }
  return redirect("/");
}

/**
 * @description Inicia el flujo de recuperación de contraseña para un email.
 * @param formData - FormData que debe contener un campo 'email'.
 * @returns {Promise<{ error?: string }>} El resultado de la operación.
 */
export async function requestPasswordResetAction(
  formData: FormData
): Promise<{ error?: string }> {
  const emailValidation = EmailSchema.safeParse(formData.get("email"));
  if (!emailValidation.success) {
    return { error: emailValidation.error.errors[0].message };
  }

  const email = emailValidation.data;
  const supabase = createClient();
  const redirectTo = `${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/reset-password`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    logger.error("Error al solicitar reseteo de contraseña:", error);
    return {
      error: "No se pudo iniciar el proceso de reseteo. Inténtalo de nuevo.",
    };
  }

  redirect("/auth-notice?message=check-email-for-reset");
}

/**
 * @description Establece el workspace activo para la sesión del usuario.
 * @param workspaceId - El ID del workspace a activar.
 */
export async function setActiveWorkspaceAction(workspaceId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    logger.error("Intento no autorizado de cambiar de workspace (sin sesión).");
    return;
  }

  const { data: membership, error } = await supabase
    .from("workspace_members")
    .select("id")
    .eq("user_id", user.id)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (error) {
    logger.error(
      `Error al verificar la membresía del workspace para el usuario ${user.id}:`,
      error
    );
    return;
  }

  if (!membership) {
    logger.warn(
      `VIOLACIÓN DE SEGURIDAD: El usuario ${user.id} intentó activar el workspace ${workspaceId} sin ser miembro.`
    );
    return;
  }

  const cookieStore = cookies();
  cookieStore.set("active_workspace_id", workspaceId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  logger.success(
    `Usuario ${user.id} cambió exitosamente al workspace ${workspaceId}.`
  );
  redirect("/dashboard");
}

// --- ACCIONES DE GESTIÓN DE SITIOS ---

/**
 * @description Crea un nuevo sitio para el usuario autenticado. Compatible con `useActionState`.
 * @param prevState - El estado anterior del formulario, inyectado por el hook.
 * @param formData - Los datos del formulario de creación del sitio.
 * @returns {Promise<CreateSiteFormState>} El nuevo estado del formulario.
 */
export async function createSiteAction(
  prevState: CreateSiteFormState,
  formData: FormData
): Promise<CreateSiteFormState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Acción no autorizada. Debes iniciar sesión." };
  }

  const validatedFields = SiteSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    const firstError = validatedFields.error.errors[0].message;
    return {
      error: firstError,
      subdomain: formData.get("subdomain") as string,
      icon: formData.get("icon") as string,
    };
  }

  const { subdomain, icon } = validatedFields.data;
  const activeWorkspaceId = cookies().get("active_workspace_id")?.value;

  if (!activeWorkspaceId) {
    return { error: "No se ha seleccionado un workspace activo." };
  }

  const { error: insertError } = await supabase.from("sites").insert({
    subdomain,
    icon,
    workspace_id: activeWorkspaceId,
  });

  if (insertError) {
    const errorMessage =
      insertError.code === "23505"
        ? "Este subdominio ya está en uso. Por favor, elige otro."
        : "No se pudo crear el sitio. Inténtalo de nuevo más tarde.";
    logger.error("Error al crear el sitio:", insertError);
    return { error: errorMessage, subdomain, icon };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

/**
 * @description Elimina un sitio propiedad del usuario autenticado.
 * @param formData - Debe contener el `subdomain` del sitio a eliminar.
 * @returns {Promise<{ success?: string; error?: string }>} El resultado.
 */
export async function deleteSiteAction(
  formData: FormData
): Promise<{ success?: string; error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Acción no autorizada." };
  }

  const subdomain = formData.get("subdomain") as string;
  if (!subdomain) {
    return { error: "Subdominio no proporcionado." };
  }

  const { error } = await supabase
    .from("sites")
    .delete()
    .eq("subdomain", subdomain);

  if (error) {
    logger.error(`Error al eliminar el sitio ${subdomain}:`, error);
    return {
      error:
        "No se pudo eliminar el sitio. Es posible que no seas el propietario.",
    };
  }

  revalidatePath("/dashboard");
  return { success: "Sitio eliminado correctamente." };
}

/**
 * @description Elimina cualquier sitio (acción de administrador).
 * @param formData - Debe contener el `subdomain` del sitio a eliminar.
 * @returns {Promise<{ success?: string; error?: string }>} El resultado.
 */
export async function deleteSiteAsAdminAction(
  formData: FormData
): Promise<{ success?: string; error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Acción no autorizada." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("app_role")
    .eq("id", user.id)
    .single();
  if (profile?.app_role !== "developer") {
    return { error: "Permiso denegado. Se requiere rol de administrador." };
  }

  const subdomain = formData.get("subdomain") as string;
  if (!subdomain) return { error: "Subdominio no proporcionado." };

  const adminSupabase = createAdminClient();
  const { error } = await adminSupabase
    .from("sites")
    .delete()
    .eq("subdomain", subdomain);

  if (error) {
    logger.error(`Error de admin al eliminar el sitio ${subdomain}:`, error);
    return { error: "No se pudo eliminar el sitio." };
  }

  revalidatePath("/admin");
  return { success: "Sitio eliminado por el administrador." };
}

/*
=== SECCIÓN DE MEJORAS IDENTIFICADAS (ACUMULATIVO) ===
1.  **Abstracción de Tipos:** Mover tipos compartidos como `CreateSiteFormState` a un archivo
 *    dedicado (ej. `lib/types.ts`) para que puedan ser importados tanto en el cliente como
 *    en el servidor sin crear dependencias circulares.
2.  **Trigger de Membresía Automática:** Crear un Trigger en Supabase para añadir automáticamente al
 *    propietario como miembro 'admin' de su nuevo workspace.
3.  **Transacciones Atómicas:** Usar funciones de base de datos (`supabase.rpc()`) para operaciones complejas
 *    y garantizar la consistencia de los datos.
1.  **Trigger de Membresía Automática:** Crear un Trigger de base de datos en Supabase que, cuando se crea un
 *    nuevo workspace, inserte automáticamente una fila en `workspace_members` asignando al `owner_id`
 *    el rol de 'admin' para ese workspace. Esto automatiza la configuración inicial de permisos.
2.  **Transacciones Atómicas:** Usar funciones de base de datos (`supabase.rpc()`) para operaciones complejas.
3.  **Tipado de Retorno Estandarizado:** Implementar un tipo genérico como `ActionResult<T>` para estandarizar los retornos de las acciones.
4.  **Abstracción de Schemas:** Mover los schemas de Zod a su propio archivo (`lib/schemas.ts`).
1.  **Validación de Pertenencia a Workspace:** La acción `setActiveWorkspaceAction` debe incluir una verificación
 *    para asegurar que el usuario que la invoca es realmente miembro del `workspaceId` que intenta activar.
 *    Esto previene que un usuario pueda establecer como activa una organización a la que no pertenece.
2.  **Transacciones Atómicas:** Para acciones futuras más complejas (ej. "crear sitio y añadir una campaña
 *    por defecto"), usar funciones de base de datos de PostgreSQL (`supabase.rpc()`) para envolver múltiples
 *    operaciones en una única transacción atómica, garantizando la consistencia de los datos.
3.  **Tipado de Retorno Estandarizado:** Implementar un tipo genérico como
 *    `type ActionResult<T> = { success: true, data: T } | { success: false, error: string }` para estandarizar
 *    los retornos de todas las acciones, haciendo que el manejo de estado en el cliente sea más predecible y
 *    seguro en tipos.
4.  **Abstracción de Schemas:** A medida que la aplicación crezca, mover los schemas de Zod a su propio
 *    archivo (ej. `lib/schemas.ts`) para que puedan ser reutilizados en diferentes partes de la aplicación.
1.  **Gestión de Workspaces:** Implementar un selector de workspace activo en la sesión.
2.  **Transacciones Atómicas:** Usar funciones de base de datos (`supabase.rpc()`) para operaciones complejas.
3.  **Tipado de Retorno:** Estandarizar los retornos de acción con un tipo genérico `ActionResult<T>`.
1.  **Gestión de Workspaces:** Implementar un selector de workspace activo en la sesión.
2.  **Transacciones Atómicas:** Usar funciones de base de datos (`supabase.rpc()`) para operaciones complejas.
3.  **Tipado de Retorno:** Estandarizar los retornos de acción con un tipo genérico `ActionResult<T>`.
1.  **Gestión de Workspaces:** Implementar un selector de workspace activo en la sesión para que `createSiteAction` sepa dónde crear el nuevo sitio.
2.  **Transacciones Atómicas:** Usar funciones de base de datos (`supabase.rpc()`) para operaciones complejas.
3.  **Tipado de Retorno:** Estandarizar los retornos de acción con un tipo genérico `ActionResult<T>`.
1.  **Asociar Subdominios a Usuarios:** Descomentar y activar la lógica para obtener el `userId` de la sesión y guardarlo junto con los datos del subdominio en Redis. Esto es fundamental para la lógica multi-tenant.
2.  **Verificación de Permisos:** En `deleteSubdomainAction`, implementar la comprobación de que el usuario que realiza la acción es el propietario del subdominio o tiene un rol de administrador.
3.  **Flujo de Reseteo de Contraseña:** Añadir una nueva Server Action para manejar la solicitud de reseteo de contraseña, que llamará a `supabase.auth.resetPasswordForEmail()`.
 * 1. **Trigger de Creación de Workspace:** Implementar un trigger de base de datos en Supabase que, después de que un nuevo usuario se inserte en `auth.users`, cree automáticamente una entrada en la tabla `profiles` y un `workspace` inicial del cual el nuevo usuario sea el propietario. Esto automatiza el onboarding.
 * 2. **Gestión de Múltiples Workspaces:** Desarrollar la lógica para que un usuario pueda pertenecer a múltiples workspaces y seleccionar uno activo. Esto implicaría una página de selección, una acción para actualizar una columna `active_workspace_id` en el perfil del usuario, y modificar `getAuthenticatedUser` para que también devuelva el workspace activo.
 * 3. **Tipado de Retorno Estandarizado:** Crear un tipo genérico `type ActionResult<T> = { success: true, data: T } | { success: false, error: string }` para estandarizar los retornos de todas las acciones, haciendo que el manejo de estado en el cliente sea más predecible.
 * 4. **Abstracción de Schemas:** Mover los schemas de Zod a su propio archivo (ej. `lib/schemas.ts`) para que puedan ser reutilizados en diferentes partes de la aplicación si es necesario.
 * 1. **Transacciones Atómicas:** Para acciones futuras más complejas (ej. "crear sitio y añadir una campaña por defecto"), se deberían usar funciones de base de datos de PostgreSQL (llamadas con `supabase.rpc()`) para envolver múltiples operaciones en una única transacción atómica, garantizando la consistencia de los datos.
 * 2. **Contexto en Logs:** Enriquecer los logs con más contexto, como un ID de petición único, para poder trazar una acción completa a través de múltiples logs, especialmente en un entorno de producción con muchas peticiones concurrentes.
 * 3. **Abstracción de Schemas:** A medida que la aplicación crezca, mover los schemas de Zod a su propio archivo (ej. `lib/schemas.ts`) para que puedan ser reutilizados en diferentes partes de la aplicación si es necesario.
 * 4. **Tipado de Retorno Estandarizado:** Crear un tipo genérico `type ActionResult<T> = { success: true, data: T } | { success: false, error: string }` para estandarizar los retornos de todas las acciones, haciendo que el manejo de estado en el cliente sea más predecible.
 * 1. **Actualización de Sesión en Vivo:** La acción `selectActiveWorkspaceAction` actualmente redirige. Una mejora avanzada sería usar una futura función `auth.update({ ... })` para actualizar el token de sesión en vivo sin necesidad de una redirección completa, proporcionando una UX instantánea.
 * 2. **Transacciones Atómicas:** Para acciones futuras más complejas (ej. "crear sitio y añadir una campaña por defecto"), se deberían usar funciones de base de datos de PostgreSQL (llamadas con `supabase.rpc()`) para envolver múltiples operaciones en una única transacción atómica, garantizando la consistencia de los datos.
 * 3. **Logging Estructurado:** Integrar un servicio de logging profesional (como Sentry o Logtail) para capturar los `console.error` de forma estructurada. Esto es crucial para monitorear la salud de la aplicación en producción y depurar errores de forma proactiva.
 * 1. **Actualización de Sesión en Vivo:** La acción `selectActiveWorkspaceAction` actualmente redirige. Una mejora avanzada sería usar la (aún experimental en Auth.js v5) función `auth.update({ ... })` para actualizar el token de sesión en vivo sin necesidad de una redirección completa, proporcionando una UX instantánea.
 * 2. **Transacciones Atómicas:** Para acciones que involucren múltiples operaciones de base de datos (ej. "crear sitio y añadir una campaña por defecto"), se deberían usar funciones de base de datos de PostgreSQL (llamadas con `supabase.rpc()`) para envolver múltiples operaciones en una única transacción atómica.
 * 3. **Logging Estructurado:** Integrar un servicio de logging profesional (como Sentry o Logtail) para capturar los `console.error` de forma estructurada. Esto es crucial para monitorear la salud de la aplicación en producción y depurar errores de forma proactiva.
 * 1. **Selector de Workspace Activo:** La acción `createSiteAction` asume que `active_workspace_id` está en la sesión. El siguiente paso es implementar la lógica (en el login o en el UI del dashboard) para establecer qué workspace está activo para el usuario.
 * 2. **Transacciones Atómicas:** Para acciones futuras más complejas (ej. "crear sitio y añadir una campaña por defecto"), se deberían usar funciones de base de datos de PostgreSQL (llamadas con `supabase.rpc()`) para envolver múltiples operaciones en una única transacción atómica.
 * 3. **Logging Estructurado:** Integrar un servicio de logging profesional (como Sentry o Logtail) para capturar los `console.error` de forma estructurada. Esto es crucial para monitorear la salud de la aplicación en producción y depurar errores de forma proactiva.
 * 1. **Selector de Workspace Activo:** La acción `createSiteAction` asume que `active_workspace_id` está en la sesión. El siguiente paso es implementar la lógica (en el login o en el UI del dashboard) para establecer qué workspace está activo para el usuario.
 * 2. **Transacciones Atómicas:** Para acciones futuras más complejas (ej. "crear sitio y añadir una campaña por defecto"), se deberían usar funciones de base de datos de PostgreSQL (llamadas con `supabase.rpc()`) para envolver múltiples operaciones en una única transacción atómica.
 * 3. **Logging Estructurado:** Integrar un servicio de logging profesional (como Sentry o Logtail) para capturar los `console.error` de forma estructurada. Esto es crucial para monitorear la salud de la aplicación en producción y depurar errores de forma proactiva.
 * 1. **Transacciones Atómicas:** Para acciones que involucren múltiples operaciones de base de datos (ej. crear un tenant y al mismo tiempo una campaña por defecto), envolverlas en una transacción de PostgreSQL (usando `supabase.rpc()`) para asegurar que o todo se completa con éxito, o todo falla, evitando estados inconsistentes de los datos.
 * 2. **Logging Estructurado:** Integrar un servicio de logging (como Sentry) para capturar los `console.error` de forma estructurada y poder monitorear los fallos de las acciones en producción.
 * 3. **Abstracción de Schemas:** A medida que la aplicación crezca, mover los schemas de Zod a su propio archivo (ej. `lib/schemas.ts`) para que puedan ser reutilizados en diferentes partes de la aplicación si es necesario.
 * 1. **Transacciones Atómicas:** Para acciones que involucren múltiples operaciones de base de datos (ej. crear un tenant y al mismo tiempo una campaña por defecto), envolverlas en una transacción de PostgreSQL (usando `supabase.rpc()`) para asegurar que o todo se completa con éxito, o todo falla, evitando estados inconsistentes de los datos.
 * 2. **Logging Estructurado:** Integrar un servicio de logging (como Sentry, que ya estaba en el otro proyecto) para capturar los `console.error` de forma estructurada y poder monitorear los fallos de las acciones en producción.
 * 3. **Abstracción de Schemas:** A medida que la aplicación crezca, mover los schemas de Zod a su propio archivo (ej. `lib/schemas.ts`) para que puedan ser reutilizados en diferentes partes de la aplicación si es necesario.
 */
