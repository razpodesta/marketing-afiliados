// lib/validators/index.ts
/**
 * @file validators/index.ts
 * @description Manifiesto de Validadores y Única Fuente de Verdad. Este aparato
 *              ha sido refactorizado para implementar una separación estricta entre
 *              esquemas de validación de cliente y de servidor, y para corregir
 *              la lógica de generación de slugs para un soporte de internacionalización robusto.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 4.2.0 (Definitive I18n Slug Generation Fix)
 *
 * @section MEJORAS FUTURAS
 * @description Mejoras para evolucionar el manifiesto de validadores.
 *
 * 1.  **Biblioteca de Transformación de Slugs:** (Vigente) Extraer la lógica de slug a una utilidad `slugify(text)` dedicada.
 * 2.  **Esquemas de Actualización Granulares:** (Vigente) Crear esquemas más específicos para las actualizaciones.
 *
 * @section MEJORAS ADICIONADAS
 * 1.  **Soporte de Caracteres Internacionales:** Expandir la lógica de `slugify` para manejar un rango más amplio de caracteres acentuados y diacríticos comunes.
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
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(p, (c) => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, "-and-") // Replace & with 'and'
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
};

// --- ESQUEMAS DE SITIOS (SEPARACIÓN CLIENTE/SERVIDOR) ---
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

// --- OTROS ESQUEMAS DE DOMINIO ---
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
  .transform((data) => ({
    ...data,
    slug: data.slug || slugify(data.name),
  }));

export const DeleteCampaignSchema = z.object({
  campaignId: UuidSchema.describe("ID de la campaña a eliminar."),
});

export type RequestPasswordResetState = { error: string | null };
// lib/validators/index.ts
