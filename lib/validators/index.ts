// lib/validators/index.ts
/**
 * @file validators/index.ts
 * @description Manifiesto de Validadores y Única Fuente de Verdad. Este aparato
 *              define todos los esquemas de validación de datos del sistema utilizando
 *              Zod, garantizando la integridad de la información en todas las capas.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 8.0.0 (Canonical Restoration & Full Schema Synchronization)
 */
import { z } from "zod";

/**
 * @typedef ActionResult
 * @description Contrato de tipo genérico para los valores de retorno de todas las Server Actions.
 * @template T - El tipo de los datos devueltos en caso de una operación exitosa.
 */
export type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string | null };

/**
 * @const UuidSchema
 * @description Esquema Zod para la validación de un Identificador Único Universal (UUID).
 */
const UuidSchema = z.string().uuid("ID inválido.");

/**
 * @const NameSchema
 * @description Esquema Zod para la validación de nombres genéricos (ej. workspaces, sitios).
 */
const NameSchema = z
  .string()
  .trim()
  .min(3, "El nombre debe tener al menos 3 caracteres.");

/**
 * @const SubdomainSchema
 * @description Esquema Zod para la validación de subdominios.
 */
const SubdomainSchema = z
  .string()
  .trim()
  .min(3, "El subdominio debe tener al menos 3 caracteres.")
  .regex(
    /^[a-z0-9-]+$/,
    "Solo se permiten letras minúsculas, números y guiones."
  )
  .transform((subdomain) => subdomain.toLowerCase());

/**
 * @const EmailSchema
 * @description Esquema Zod para la validación de direcciones de correo electrónico.
 */
export const EmailSchema = z
  .string()
  .trim()
  .email("Por favor, introduce un email válido.");

/**
 * @function slugify
 * @description Convierte una cadena de texto en un "slug" amigable para URLs.
 * @param {string} text - El texto a convertir.
 * @returns {string} El slug generado.
 */
const slugify = (text: string): string => {
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

/**
 * @const CreateSiteClientSchema
 * @description Esquema de validación para la creación de un sitio desde el cliente.
 */
export const CreateSiteClientSchema = z.object({
  name: NameSchema.optional(),
  subdomain: SubdomainSchema,
  description: z.string().optional(),
  workspaceId: UuidSchema.describe(
    "ID del workspace al que pertenece el sitio."
  ),
});

/**
 * @const CreateSiteServerSchema
 * @description Esquema para el servidor que transforma los datos del cliente.
 */
export const CreateSiteServerSchema = CreateSiteClientSchema.transform(
  (data) => ({
    ...data,
    name: data.name || data.subdomain,
    description: data.description || null,
    icon: null,
  })
);

/**
 * @const UpdateSiteSchema
 * @description Esquema para la actualización de un sitio.
 */
export const UpdateSiteSchema = z.object({
  siteId: UuidSchema.describe("ID del sitio a actualizar."),
  name: NameSchema.optional(),
  subdomain: SubdomainSchema.optional(),
  description: z.string().optional(),
});

/**
 * @const DeleteSiteSchema
 * @description Esquema para la eliminación de un sitio.
 */
export const DeleteSiteSchema = z.object({
  siteId: UuidSchema.describe("ID del sitio a eliminar."),
});

/**
 * @const CreateWorkspaceSchema
 * @description Esquema para la creación de un nuevo workspace.
 */
export const CreateWorkspaceSchema = z.object({
  workspaceName: NameSchema,
  icon: z.string().trim().min(1, "El ícono es requerido."),
});

/**
 * @const InvitationSchema
 * @description Esquema para invitar a un miembro a un workspace.
 */
export const InvitationSchema = z.object({
  email: EmailSchema,
  role: z.enum(["admin", "member", "editor", "viewer"], {
    errorMap: () => ({ message: "Por favor, selecciona un rol válido." }),
  }),
  workspaceId: UuidSchema.describe("ID del workspace de la invitación."),
});

/**
 * @const CreateCampaignSchema
 * @description Esquema para la creación de una nueva campaña.
 */
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

/**
 * @const DeleteCampaignSchema
 * @description Esquema para la eliminación de una campaña.
 */
export const DeleteCampaignSchema = z.object({
  campaignId: UuidSchema.describe("ID de la campaña a eliminar."),
});

/**
 * @const ClientVisitSchema
 * @description Esquema para los datos de visita recolectados en el lado del cliente.
 */
export const ClientVisitSchema = z.object({
  sessionId: UuidSchema.nullable().optional(),
  fingerprint: z.string().min(1, "Fingerprint es requerido."),
  screenWidth: z.number().int().positive().optional(),
  screenHeight: z.number().int().positive().optional(),
  userAgentClientHint: z
    .array(z.object({ brand: z.string(), version: z.string() }))
    .nullable()
    .optional(),
});

/**
 * @const VisitorLogSchema
 * @description Esquema para los datos de registro de visitantes que se insertan en la base de datos.
 */
export const VisitorLogSchema = z.object({
  sessionId: UuidSchema,
  fingerprint: z.string().min(1, "Fingerprint es requerido."),
  ipAddress: z.string().ip("Dirección IP inválida."),
  geo_data: z.record(z.any()).nullable().optional(),
  userAgent: z.string().nullable().optional(),
  utmParams: z.record(z.any()).nullable().optional(),
  referrer: z.string().url().nullable().optional(),
  landingPage: z.string().nullable().optional(),
  browser_context: z.record(z.any()).nullable().optional(),
  isBot: z.boolean().optional(),
  isKnownAbuser: z.boolean().optional(),
});

/**
 * @typedef RequestPasswordResetState
 * @description Tipo de estado para el formulario de solicitud de reseteo de contraseña.
 */
export type RequestPasswordResetState = { error: string | null };

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Restauración de Integridad**: ((Implementada)) Se han restaurado todos los esquemas de validación desde el snapshot, eliminando la regresión.
 * 2. **Sincronización Completa de Esquema**: ((Implementada)) Se ha renombrado `geoData` y `browserContext` a sus equivalentes `snake_case` para coincidir 1:1 con la base de datos, resolviendo todos los errores de telemetría.
 * 3. **Documentación TSDoc Exhaustiva**: ((Implementada)) Todos los esquemas y tipos exportados ahora tienen documentación verbosa.
 *
 * @subsection Melhorias Futuras
 * 1. **Validación de Unicidad Asíncrona**: ((Vigente)) El `CreateCampaignSchema` y `CreateSiteSchema` podrían usar el método `.refine` de Zod para realizar una llamada a una Server Action que verifique la unicidad del slug/subdominio.
 */
// lib/validators/index.ts
