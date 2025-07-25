// app/actions.ts
/**
 * @file Server Actions
 * @description Contiene toda la lógica de backend que puede ser llamada directamente desde los
 * componentes de cliente. Incluye autenticación, registro de usuarios y la gestión
 * completa de tenants, con acciones específicas para suscriptores y administradores.
 *
 * @author Metashark
 * @version 4.0.0 (Production Ready)
 */
"use server";

import { signIn, signOut, auth } from "@/auth";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { supabase } from "@/lib/supabase/server";
import { getTenantDataBySubdomain } from "@/lib/platform/tenants";

// ============================================================================
// ESQUEMAS DE VALIDACIÓN (ZOD)
// ============================================================================

/**
 * @description Esquema de validación para el formulario de inicio de sesión.
 */
const LoginSchema = z.object({
  email: z.string().email("Por favor, introduce un email válido."),
  password: z.string().min(1, "La contraseña es requerida."),
});

/**
 * @description Esquema de validación para el formulario de registro de nuevos usuarios.
 * Incluye una validación para asegurar que las contraseñas coincidan.
 */
const SignupSchema = z
  .object({
    fullName: z.string().min(3, "El nombre completo es requerido."),
    email: z.string().email("Por favor, introduce un email válido."),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"], // Campo donde se debe mostrar el error.
  });

/**
 * @description Esquema de validación para la creación de un nuevo tenant.
 */
const TenantSchema = z.object({
  subdomain: z
    .string()
    .min(3, "El subdominio debe tener al menos 3 caracteres.")
    .regex(
      /^[a-z0-9-]+$/,
      "Solo se permiten letras minúsculas, números y guiones."
    ),
  icon: z.string().min(1, "El ícono es requerido."),
});

// ============================================================================
// ACCIONES DE AUTENTICACIÓN
// ============================================================================

/**
 * @description Maneja el inicio de sesión del usuario.
 * @param {any} previousState - El estado anterior de la acción (para `useActionState`).
 * @param {FormData} formData - Los datos del formulario de inicio de sesión.
 * @returns {Promise<{ error?: string; success?: boolean }>} El resultado de la operación.
 */
export async function login(
  previousState: any,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const validatedFields = LoginSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return { error: "Los campos proporcionados son inválidos." };
  }

  const { email, password } = validatedFields.data;

  try {
    await signIn("credentials", { email, password });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Las credenciales proporcionadas son incorrectas." };
        default:
          return { error: "Algo salió mal durante el inicio de sesión." };
      }
    }
    throw error;
  }
}

/**
 * @description Cierra la sesión del usuario actual.
 */
export async function logout() {
  await signOut();
}

/**
 * @description Registra un nuevo usuario en la plataforma utilizando Supabase Auth.
 * @param {any} previousState - El estado anterior de la acción (para `useActionState`).
 * @param {FormData} formData - Los datos del formulario de registro.
 * @returns {Promise<{ error?: string; success?: boolean }>} El resultado de la operación.
 */
export async function signupUser(
  previousState: any,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const validatedFields = SignupSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    const firstError = Object.values(
      validatedFields.error.flatten().fieldErrors
    )[0]?.[0];
    return { error: firstError || "Datos de registro inválidos." };
  }

  const { email, password, fullName } = validatedFields.data;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    console.error("[Action:signupUser] Error de Supabase:", error.message);
    if (error.message.includes("User already registered")) {
      return { error: "Ya existe una cuenta con este correo electrónico." };
    }
    return {
      error: "No se pudo crear la cuenta. Por favor, inténtalo de nuevo.",
    };
  }

  return { success: true };
}

// ============================================================================
// ACCIONES DE GESTIÓN DE TENANTS
// ============================================================================

/**
 * @description Crea un nuevo tenant para el usuario autenticado (suscriptor).
 * @param {any} previousState - El estado anterior de la acción.
 * @param {FormData} formData - Los datos del formulario de creación del tenant.
 * @returns {Promise<{ error?: string; success?: boolean }>} El resultado de la operación.
 */
export async function createTenantAction(
  previousState: any,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Acción no autorizada. Por favor, inicia sesión." };
  }

  const validatedFields = TenantSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    const firstError = Object.values(
      validatedFields.error.flatten().fieldErrors
    )[0]?.[0];
    return { error: firstError || "Los datos proporcionados son inválidos." };
  }

  const { subdomain, icon } = validatedFields.data;

  const existingTenant = await getTenantDataBySubdomain(subdomain);
  if (existingTenant) {
    return { error: "Este subdominio ya está en uso. Por favor, elige otro." };
  }

  const { error } = await supabase.from("tenants").insert({
    subdomain,
    icon,
    owner_id: session.user.id,
  });

  if (error) {
    console.error("[Action:createTenantAction] Error al crear tenant:", error);
    return { error: "Hubo un problema al crear tu sitio. Inténtalo de nuevo." };
  }

  revalidatePath("/[locale]/dashboard", "page");
  return { success: true };
}

/**
 * @description Elimina un tenant propiedad del usuario autenticado (suscriptor).
 * @param {any} previousState - El estado anterior de la acción.
 * @param {FormData} formData - Debe contener 'subdomain'.
 * @returns {Promise<{ error?: string; success?: string }>} El resultado con un mensaje de éxito.
 */
export async function deleteTenantAction(
  previousState: any,
  formData: FormData
): Promise<{ error?: string; success?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Acción no autorizada." };
  }

  const subdomain = formData.get("subdomain");
  if (typeof subdomain !== "string" || !subdomain) {
    return { error: "Subdominio inválido proporcionado." };
  }

  const { error } = await supabase
    .from("tenants")
    .delete()
    .eq("subdomain", subdomain)
    .eq("owner_id", session.user.id);

  if (error) {
    console.error(
      `[Action:deleteTenantAction] Error al eliminar '${subdomain}':`,
      error
    );
    return { error: "Error al eliminar el sitio." };
  }

  revalidatePath("/[locale]/dashboard", "page");
  return { success: "Sitio eliminado correctamente." };
}

/**
 * @description Elimina CUALQUIER tenant de la plataforma (acción solo para administradores).
 * @param {any} previousState - El estado anterior de la acción.
 * @param {FormData} formData - Debe contener 'subdomain'.
 * @returns {Promise<{ error?: string; success?: string }>} El resultado con un mensaje de éxito.
 */
export async function deleteTenantAsAdminAction(
  previousState: any,
  formData: FormData
): Promise<{ error?: string; success?: string }> {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "admin" && session.user.role !== "developer")
  ) {
    return { error: "Permiso denegado. Se requiere rol de administrador." };
  }

  const subdomain = formData.get("subdomain");
  if (typeof subdomain !== "string" || !subdomain) {
    return { error: "Subdominio inválido proporcionado." };
  }

  const { error } = await supabase
    .from("tenants")
    .delete()
    .eq("subdomain", subdomain);

  if (error) {
    console.error(
      `[Action:deleteTenantAsAdminAction] Error al eliminar '${subdomain}':`,
      error
    );
    return { error: "Error administrativo al eliminar el sitio." };
  }

  revalidatePath("/[locale]/admin", "page");
  return { success: "Sitio eliminado por el administrador." };
}

/* MEJORAS PROPUESTAS
 * 1. **Transacciones Atómicas:** Para acciones que involucren múltiples operaciones de base de datos (ej. crear un tenant y al mismo tiempo una campaña por defecto), envolverlas en una transacción de PostgreSQL (usando `supabase.rpc()`) para asegurar que o todo se completa con éxito, o todo falla, evitando estados inconsistentes de los datos.
 * 2. **Logging Estructurado:** Integrar un servicio de logging (como Sentry) para capturar los `console.error` de forma estructurada y poder monitorear los fallos de las acciones en producción.
 * 3. **Abstracción de Schemas:** A medida que la aplicación crezca, mover los schemas de Zod a su propio archivo (ej. `lib/schemas.ts`) para que puedan ser reutilizados en diferentes partes de la aplicación si es necesario.
 * 1. **Transacciones Atómicas:** Para acciones que involucren múltiples operaciones de base de datos (ej. crear un tenant y al mismo tiempo una campaña por defecto), envolverlas en una transacción de PostgreSQL (usando `supabase.rpc()`) para asegurar que o todo se completa con éxito, o todo falla, evitando estados inconsistentes de los datos.
 * 2. **Logging Estructurado:** Integrar un servicio de logging (como Sentry, que ya estaba en el otro proyecto) para capturar los `console.error` de forma estructurada y poder monitorear los fallos de las acciones en producción.
 * 3. **Abstracción de Schemas:** A medida que la aplicación crezca, mover los schemas de Zod a su propio archivo (ej. `lib/schemas.ts`) para que puedan ser reutilizados en diferentes partes de la aplicación si es necesario.
 */
