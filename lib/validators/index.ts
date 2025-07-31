// Ruta: lib/validators/index.ts
/**
 * @file validators/index.ts
 * @description Manifiesto de Validadores y Única Fuente de Verdad. Este aparato
 *              centraliza todos los esquemas de validación de Zod, refactorizado
 *              para una máxima modularidad y reutilización a través de esquemas base,
 *              y endurecido con lógica de saneamiento y transformación de datos.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 3.1.0 (Schema Cohesion & Type Inference Fix)
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
  | { success: false; error: string };

// --- ESQUEMAS BASE REUTILIZABLES ---

const UuidSchema = z.string().uuid("ID inválido.");
const NameSchema = z
  .string()
  .trim()
  .min(3, "El nombre debe tener al menos 3 caracteres.");
const IconSchema = z.string().trim().min(1, "El ícono es requerido.");
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
  icon: IconSchema,
});

export const InvitationSchema = z.object({
  email: EmailSchema,
  role: z.enum(["admin", "member", "editor", "viewer"], {
    errorMap: () => ({ message: "Por favor, selecciona un rol válido." }),
  }),
  workspaceId: UuidSchema.describe("ID del workspace de la invitación."),
});

// CORRECCIÓN ARQUITECTÓNICA: Se refina el esquema para que la lógica de transformación
// sea más clara y la inferencia de tipos para react-hook-form sea más fiable.
// Define la forma de los datos ANTES de la transformación.
export const CreateSiteSchema = z
  .object({
    subdomain: SubdomainSchema,
    name: z
      .string()
      .trim()
      .min(3, "El nombre del sitio debe tener al menos 3 caracteres.")
      .optional()
      .or(z.literal("")), // Permite un string vacío como entrada opcional
    description: z.string().optional(),
    icon: IconSchema,
    workspaceId: UuidSchema.describe(
      "ID del workspace al que pertenece el sitio."
    ),
  })
  .transform((data) => ({
    ...data,
    // La transformación asegura que el 'name' nunca sea una cadena vacía en la salida,
    // usando el subdominio como fallback. Esto crea un contrato de salida donde `name` es siempre `string`.
    name: data.name || data.subdomain,
  }));

export const UpdateSiteSchema = z.object({
  siteId: UuidSchema.describe("ID del sitio a actualizar."),
  name: NameSchema.optional(),
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

export type RequestPasswordResetState = ActionResult<void>;

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras para evolucionar la capa de validación.
 *
 * 1.  **Mensajes de Error Internacionalizados (i18n):** Integrar una librería como `zod-i18n` para que los mensajes de error de validación se traduzcan automáticamente según el idioma del usuario, proporcionando una experiencia de usuario globalmente consistente.
 * 2.  **Validadores Asíncronos Refinados:** Para esquemas como `CreateSiteSchema`, se podría añadir un paso de `.refine()` asíncrono que verifique la disponibilidad del subdominio directamente en la base de datos, centralizando la lógica de validación que actualmente reside en el componente `SubdomainInput`.
 * 3.  **Esquemas Discriminados por Rol:** Para escenarios de autorización complejos, se podrían crear uniones discriminadas (`z.discriminatedUnion`) que apliquen diferentes reglas de validación basadas en el rol del usuario que realiza la acción.
 */
