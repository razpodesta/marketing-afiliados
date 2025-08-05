// lib/validators/index.ts
/**
 * @file validators/index.ts
 * @description Manifiesto de Validadores y Única Fuente de Verdad. Este aparato
 *              define todos los esquemas de validación de datos del sistema,
 *              garantizando la integridad de la información en todas las capas.
 *              REFACTORIZADO: Se ha ajustado el esquema `ClientVisitSchema` para
 *              permitir un `sessionId` opcional de tipo UUID.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 6.3.0 (ClientVisitSchema SessionId Optional)
 */
import { z } from "zod";

// --- CONTRATO DE RESULTADO DE ACCIÓN ---
/**
 * @typedef ActionResult
 * @description Tipo de unión discriminada para resultados de Server Actions,
 *              proporcionando un contrato de éxito o error seguro en cuanto a tipos.
 * @template T - El tipo de datos devuelto en caso de éxito.
 */
export type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string | null };

// --- ESQUEMAS BASE REUTILIZABLES ---
/**
 * @const UuidSchema
 * @description Esquema Zod para la validación de UUIDs.
 */
const UuidSchema = z.string().uuid("ID inválido.");
/**
 * @const NameSchema
 * @description Esquema Zod para la validación de nombres (mínimo 3 caracteres, sin espacios al inicio/final).
 */
const NameSchema = z
  .string()
  .trim()
  .min(3, "El nombre debe tener al menos 3 caracteres.");
/**
 * @const SubdomainSchema
 * @description Esquema Zod para la validación de subdominios (letras minúsculas, números, guiones).
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

// --- LÓGICA DE SLUGIFY (BLINDADA) ---
/**
 * @function slugify
 * @description Convierte una cadena de texto en un "slug" amigable para URLs.
 *              Realiza transliteración de caracteres especiales, reemplazo de espacios
 *              y eliminación de caracteres no permitidos.
 * @param {string} text - El texto a convertir en slug.
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

// --- ESQUEMAS DE TELEMETRÍA (EXPANDIDOS) ---
/**
 * @typedef ClientVisitSchema
 * @description Esquema Zod para los datos de visita recolectados en el lado del cliente.
 *              Incluye huella digital, dimensiones de pantalla y Client Hints del navegador.
 *              REFACTORIZADO: `sessionId` es ahora un UUID opcional y nullable.
 */
export const ClientVisitSchema = z.object({
  sessionId: UuidSchema.nullable().optional(), // <-- CORREGIDO: UUID opcional
  fingerprint: z.string().min(1, "Fingerprint es requerido."),
  screenWidth: z.number().int().positive().optional(),
  screenHeight: z.number().int().positive().optional(),
  userAgentClientHint: z
    .array(
      z.object({
        brand: z.string(),
        version: z.string(),
      })
    )
    .nullable()
    .optional(),
});

/**
 * @typedef VisitorLogSchema
 * @description Esquema Zod para los datos de registro de visitantes,
 *              que se insertan en la tabla `visitor_logs`. Incluye datos
 *              del servidor y enriquecidos de GeoIP.
 */
export const VisitorLogSchema = z.object({
  sessionId: UuidSchema, // <-- session_id es requerido como UUID en los logs de middleware
  fingerprint: z.string().min(1, "Fingerprint es requerido."),
  ipAddress: z.string().ip("Dirección IP inválida."),
  geoData: z.record(z.any()).nullable().optional(), // `optional` para permitir que Zod lo omita si no está presente
  userAgent: z.string().nullable().optional(),
  utmParams: z.record(z.any()).nullable().optional(),
  referrer: z.string().url().nullable().optional(),
  landingPage: z.string().nullable().optional(),
  browserContext: z.record(z.any()).nullable().optional(), // Ya no se omite
  isBot: z.boolean().optional(),
  isKnownAbuser: z.boolean().optional(),
});

// --- ESQUEMAS DE AUTENTICACIÓN ---
/**
 * @typedef RequestPasswordResetState
 * @description Tipo de estado para el formulario de solicitud de reseteo de contraseña.
 */
export type RequestPasswordResetState = { error: string | null };

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Ajuste en `ClientVisitSchema`**: ((Implementada)) Se modificó el esquema para que `sessionId` sea un UUID opcional y `nullable`, permitiendo que el cliente envíe el ID de la cookie del middleware.
 *
 * @subsection Melhorias Futuras
 * 1. **Validación de Unicidad de Slugs**: ((Vigente)) El esquema `CreateCampaignSchema` debería, en una fase posterior, integrarse con una validación asíncrona (`.refine`) que consulte la base de datos para asegurar que el slug generado no solo sea sintácticamente correcto, sino también único dentro del contexto de su sitio.
 * 2. **Validación Profunda del Objeto `geoData` y `browserContext`**: ((Vigente)) Refinar los esquemas `z.record(z.any())` para `geoData` y `browserContext` con esquemas más específicos para una validación de datos más granular y segura.
 */
// lib/validators/index.ts
