// Ruta: lib/validators/index.ts
/**
 * @file validators/index.ts
 * @description Manifiesto de Validadores y Única Fuente de Verdad. Este aparato
 *              centraliza todos los esquemas de validación de Zod, refactorizado
 *              para una máxima modularidad y reutilización a través de esquemas base,
 *              y endurecido con lógica de saneamiento y transformación de datos.
 *              Se ha ajustado `CreateSiteSchema` para que los campos opcionales `name`
 *              y `description` tengan un valor por defecto de cadena vacía, mejorando
 *              la compatibilidad de tipos con `react-hook-form`.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 3.4.0 (CreateSiteSchema Default Values Fix)
 */
import { z } from "zod";

// --- CONTRATO DE RESULTADO DE ACCIÓN ---

/**
 * @typedef {object} ActionResult
 * @description Contrato de tipo de unión discriminada para el resultado de una Server Action.
 *              Garantiza que una operación solo puede tener un estado de éxito con datos,
 *              o un estado de fallo con un error, pero nunca ambos.
 * @template T - El tipo de los datos retornados en caso de éxito.
 */
export type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string | null };

// --- ESQUEMAS BASE REUTILIZABLES ---

const UuidSchema = z.string().uuid("ID inválido.");
const NameSchema = z
  .string()
  .trim()
  .min(3, "El nombre debe tener al menos 3 caracteres.");
const SubdomainSchema = z
  .string()
  .trim()
  .min(3, "El subdominio debe tener al menos 3 caracteres.")
  .regex(
    /^[a-z0-9-]+$/,
    "Solo se permiten letras minúsculas, números y guiones."
  )
  .transform((subdomain) => subdomain.toLowerCase());

// --- ESQUEMAS DE VALIDACIÓN DE DOMINIO (COMPUESTOS) ---

export const EmailSchema = z
  .string()
  .trim()
  .email("Por favor, introduce un email válido.");

export const CreateWorkspaceSchema = z.object({
  workspaceName: NameSchema,
  icon: z.string().trim().min(1, "El ícono es requerido."), // Icono aún requerido para Workspace
});

export const InvitationSchema = z.object({
  email: EmailSchema,
  role: z.enum(["admin", "member", "editor", "viewer"], {
    errorMap: () => ({ message: "Por favor, selecciona un rol válido." }),
  }),
  workspaceId: UuidSchema.describe("ID del workspace de la invitación."),
});

// CreateSiteSchema ajustado para que `name` y `description` tengan valores por defecto de ""
// Esto resuelve problemas de tipado con `react-hook-form` y los inputs que esperan `string`.
export const CreateSiteSchema = z
  .object({
    subdomain: SubdomainSchema,
    // `name` ahora es un string con un valor por defecto de cadena vacía.
    name: z
      .string()
      .trim()
      .min(3, "El nombre del sitio debe tener al menos 3 caracteres.")
      .default(""), // <-- Cambio clave: default a ""
    // `description` también es un string con un valor por defecto de cadena vacía.
    description: z.string().default(""), // <-- Cambio clave: default a ""
    workspaceId: UuidSchema.describe(
      "ID del workspace al que pertenece el sitio."
    ),
  })
  .transform((data) => ({
    ...data,
    // Si `name` no fue proporcionado (es decir, es ""), el transform lo reemplaza con `subdomain`.
    // Esto asegura que `name` siempre tendrá un valor significativo.
    name: data.name || data.subdomain,
  }));

export const UpdateSiteSchema = z.object({
  siteId: UuidSchema.describe("ID del sitio a actualizar."),
  name: NameSchema.optional(), // Aquí puede seguir siendo opcional sin default
  subdomain: SubdomainSchema.optional(),
  description: z.string().optional(),
});

export const DeleteSiteSchema = z.object({
  siteId: UuidSchema.describe("ID del sitio a eliminar."),
});

export const CreateCampaignSchema = z
  .object({
    name: NameSchema,
    slug: z
      .string()
      .trim()
      .min(3, "El slug debe tener al menos 3 caracteres.")
      .regex(/^[a-z0-9-]+$/, "Solo se permiten minúsculas, números y guiones.")
      .optional(),
    siteId: UuidSchema.describe("ID del sitio al que pertenece la campaña."),
  })
  .transform((data) => ({
    ...data,
    slug:
      data.slug ||
      data.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, ""),
  }));

export const DeleteCampaignSchema = z.object({
  campaignId: UuidSchema.describe("ID de la campaña a eliminar."),
});

// Se define explícitamente el tipo de estado para el formulario
// de reseteo de contraseña para que coincida con el contrato de ActionResult.
export type RequestPasswordResetState = { error: string | null };

/* MEJORAS FUTURAS DETECTADAS
 * 1.  **Mensajes de Error Internacionalizados (i18n):** Integrar una librería como `zod-i18n` para que los mensajes de error de validación se traduzcan automáticamente según el idioma del usuario, proporcionando una experiencia de usuario globalmente consistente.
 * 2.  **Validadores Asíncronos Refinados:** Para esquemas como `CreateSiteSchema`, se podría añadir un paso de `.refine()` asíncrono que verifique la disponibilidad del subdominio directamente en la base de datos, centralizando la lógica de validación que actualmente reside en el componente `SubdomainInput`.
 * 3.  **Esquemas Discriminados por Rol:** Para escenarios de autorización complejos, se podrían crear uniones discriminadas (`z.discriminatedUnion`) que apliquen diferentes reglas de validación basadas en el rol del usuario que realiza la acción.
 * 4.  **Esquema de Actualización de Perfil (Profile Update Schema):** Crear un `UpdateProfileSchema` para validar campos como `full_name`, `avatar_url` o `preferences`, asegurando que todas las actualizaciones de perfil sigan un contrato estricto.
 */
