// lib/validators/index.ts
/**
 * @file validators/index.ts
 * @description Manifiesto de Validadores y Única Fuente de Verdad. Este aparato
 *              define todos los esquemas de validación de datos del sistema,
 *              garantizando la integridad de la información en todas las capas.
 *              La función `slugify` ha sido reemplazada por una implementación
 *              robusta para una correcta transliteración de caracteres.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 5.0.0 (Robust Slugify Implementation)
 */
import { z } from "zod";

// --- CONTRATO DE RESULTADO DE ACCIÓN ---
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
export const EmailSchema = z
  .string()
  .trim()
  .email("Por favor, introduce un email válido.");

// --- LÓGICA DE SLUGIFY (REPARADA Y BLINDADA) ---
const slugify = (text: string): string => {
  const a =
    "àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;";
  const b =
    "aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrssssssttuuuuuuuuuwxyyzzz------";
  const p = new RegExp(a.split("").join("|"), "g");

  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Reemplaza espacios con -
    .replace(p, (c) => b.charAt(a.indexOf(c))) // Reemplaza caracteres especiales
    .replace(/&/g, "-and-") // Reemplaza & con 'and'
    .replace(/[^\w\-]+/g, "") // Elimina todos los caracteres que no sean palabras o guiones
    .replace(/\-\-+/g, "-") // Reemplaza múltiples - con uno solo
    .replace(/^-+/, "") // Elimina - del principio
    .replace(/-+$/, ""); // Elimina - del final
};

// --- ESQUEMAS DE SITIOS ---
export const CreateSiteClientSchema = z.object({
  name: NameSchema.optional(),
  subdomain: SubdomainSchema,
  description: z.string().optional(),
  workspaceId: UuidSchema.describe(
    "ID del workspace al que pertenece el sitio."
  ),
});

export const CreateSiteServerSchema = CreateSiteClientSchema.transform(
  (data) => ({
    ...data,
    name: data.name || data.subdomain,
    description: data.description || null,
    icon: null,
  })
);

export const UpdateSiteSchema = z.object({
  siteId: UuidSchema.describe("ID del sitio a actualizar."),
  name: NameSchema.optional(),
  subdomain: SubdomainSchema.optional(),
  description: z.string().optional(),
});

export const DeleteSiteSchema = z.object({
  siteId: UuidSchema.describe("ID del sitio a eliminar."),
});

// --- ESQUEMAS DE WORKSPACES Y CAMPAÑAS ---
export const CreateWorkspaceSchema = z.object({
  workspaceName: NameSchema,
  icon: z.string().trim().min(1, "El ícono es requerido."),
});

export const InvitationSchema = z.object({
  email: EmailSchema,
  role: z.enum(["admin", "member", "editor", "viewer"], {
    errorMap: () => ({ message: "Por favor, selecciona un rol válido." }),
  }),
  workspaceId: UuidSchema.describe("ID del workspace de la invitación."),
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
  .transform((data) => ({ ...data, slug: data.slug || slugify(data.name) }));

export const DeleteCampaignSchema = z.object({
  campaignId: UuidSchema.describe("ID de la campaña a eliminar."),
});

// --- ESQUEMA DE TELEMETRÍA ---
export const VisitorLogSchema = z.object({
  sessionId: UuidSchema,
  fingerprint: z.string().min(1, "Fingerprint es requerido."),
  ipAddress: z.string().ip("Dirección IP inválida."),
  geoData: z.record(z.any()).nullable(),
  userAgent: z.string().nullable(),
  utmParams: z.record(z.any()).nullable(),
});

// --- ESQUEMAS DE AUTENTICACIÓN ---
export type RequestPasswordResetState = { error: string | null };

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Implementadas
 * 1. **Lógica de Transliteración Robusta**: ((Implementada)) Se ha reemplazado la implementación simple de `slugify` por una versión estándar de la industria que utiliza un mapa de caracteres para garantizar una transliteración correcta y predecible.
 *
 * @subsection Melhorias Futuras
 * 1. **Biblioteca Externa para Slugs**: ((Vigente)) Para una máxima robustez y mantenibilidad, la lógica de `slugify` podría ser abstraída a una biblioteca externa especializada y bien mantenida como `slugify` o `limax`. Esto delega la responsabilidad de esta lógica crítica a un paquete dedicado.
 * 2. **Validación de Unicidad de Slugs**: ((Vigente)) El esquema `CreateCampaignSchema` debería, en una fase posterior, integrarse con una validación asíncrona (`.refine`) que consulte la base de datos para asegurar que el slug generado no solo sea sintácticamente correcto, sino también único dentro del contexto de su sitio.
 */
// lib/validators/index.ts
