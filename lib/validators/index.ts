// lib/validators/index.ts
/**
 * @file validators/index.ts
 * @description Manifiesto de Validadores y Única Fuente de Verdad. Este aparato
 *              define todos los esquemas de validación de datos del sistema,
 *              garantizando la integridad de la información en todas las capas.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 4.3.0 (Visitor Logging Schema Integration & Regression Fix)
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

// --- LÓGICA DE SLUGIFY ---
const slugify = (text: string) => {
  const a =
    "àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;";
  const b =
    "aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrssssssttuuuuuuuuuwxyyzzz------";
  const p = new RegExp(a.split("").join("|"), "g");

  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(p, (c) => b.charAt(a.indexOf(c)))
    .replace(/&/g, "-and-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
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

// REINTRODUCIDO
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

// REINTRODUCIDO
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
  .transform((data) => ({
    ...data,
    slug: data.slug || slugify(data.name),
  }));

export const DeleteCampaignSchema = z.object({
  campaignId: UuidSchema.describe("ID de la campaña a eliminar."),
});

// --- ESQUEMA DE TELEMETRÍA (NUEVO) ---
export const VisitorLogSchema = z.object({
  sessionId: UuidSchema,
  fingerprint: z.string().min(1, "Fingerprint es requerido."),
  ipAddress: z.string().ip("Dirección IP inválida."),
  geoData: z.record(z.any()).nullable(),
  userAgent: z.string().nullable(),
  utmParams: z.record(z.any()).nullable(),
});

// --- ESQUEMAS DE AUTENTICACIÓN ---
// REINTRODUCIDO
export type RequestPasswordResetState = { error: string | null };

/**
 * @section MEJORA CONTINUA
 * @description Mejoras para evolucionar el manifiesto de validadores.
 *
 * @subsection Mejoras Futuras
 * 1. **Biblioteca de Transformación de Slugs:** (Vigente) Extraer la lógica de `slugify` a una utilidad dedicada en `lib/utils.ts`.
 * 2. **Esquemas de Actualización Granulares:** (Vigente) Crear esquemas más específicos para las actualizaciones.
 *
 * @subsection Mejoras Adicionadas
 * 1. **Tipado Fuerte para JSON:** (Vigente) Reemplazar `z.record(z.any())` por esquemas Zod más estrictos para los campos `geoData` y `utmParams` una vez que su estructura esté bien definida.
 */
// lib/validators/index.ts
