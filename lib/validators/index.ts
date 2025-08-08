// lib/validators/index.ts
/**
 * @file validators/index.ts
 * @description Manifiesto de Validadores y Única Fuente de Verdad. Este aparato
 *              define todos los esquemas de validación de datos del sistema utilizando
 *              Zod. Ha sido sincronizado con los ENUMs de la base de datos para
 *              garantizar la integridad de los tipos de extremo a extremo y
 *              automatiza la conversión de nomenclatura a `snake_case`.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 9.0.0 (System-Wide Case Transformation)
 */
import { z } from "zod";

import { keysToSnakeCase } from "@/lib/helpers/object-case-converter";

/**
 * @typedef ActionResult
 * @description Contrato de tipo genérico para los valores de retorno de todas las Server Actions.
 *              Define una unión discriminada para manejar explícitamente los casos de
 *              éxito y error, mejorando la seguridad de tipos en el cliente.
 * @template T - El tipo de los datos (`data`) devueltos en caso de una operación exitosa.
 */
export type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * @const UuidSchema
 * @description Esquema Zod canónico para la validación de un Identificador Único Universal (UUID).
 *              Se utiliza para todas las claves primarias y foráneas de tipo UUID.
 */
const UuidSchema = z.string().uuid("ID inválido.");

/**
 * @const NameSchema
 * @description Esquema Zod para la validación de nombres genéricos (ej. workspaces, sitios, campañas).
 *              Asegura una longitud mínima y elimina espacios en blanco.
 */
const NameSchema = z
  .string()
  .trim()
  .min(3, "El nombre debe tener al menos 3 caracteres.");

/**
 * @const SubdomainSchema
 * @description Esquema Zod para la validación de subdominios.
 *              Asegura que el formato sea compatible con DNS, permitiendo solo
 *              letras minúsculas, números y guiones.
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
 * @private
 * @function slugify
 * @description Convierte una cadena de texto en un "slug" amigable para URLs,
 *              realizando transliteración de caracteres especiales.
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
 * @description Esquema de validación para los datos del formulario de creación de un
 *              sitio, tal como se reciben desde el cliente.
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
 * @description Esquema para el servidor que transforma y enriquece los datos del
 *              cliente, y convierte sus claves a `snake_case` antes de la inserción.
 */
export const CreateSiteServerSchema = CreateSiteClientSchema.transform(
  (data) => ({
    ...data,
    name: data.name || data.subdomain,
    description: data.description || null,
    icon: null,
  })
).transform(keysToSnakeCase);

/**
 * @const UpdateSiteSchema
 * @description Esquema para la actualización de un sitio. Todos los campos son opcionales.
 *              Convierte las claves a `snake_case` para la base de datos.
 */
export const UpdateSiteSchema = z
  .object({
    siteId: UuidSchema.describe("ID del sitio a actualizar."),
    name: NameSchema.optional(),
    subdomain: SubdomainSchema.optional(),
    description: z.string().optional(),
  })
  .transform(keysToSnakeCase);

/**
 * @const DeleteSiteSchema
 * @description Esquema para la eliminación de un sitio, validando solo el ID.
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
 * @description Esquema para invitar a un miembro a un workspace. El ENUM de `role`
 *              está sincronizado con la base de datos y convierte las claves a `snake_case`.
 */
export const InvitationSchema = z
  .object({
    email: EmailSchema,
    role: z.enum(["admin", "member", "owner"], {
      errorMap: () => ({ message: "Por favor, selecciona un rol válido." }),
    }),
    workspaceId: UuidSchema.describe("ID del workspace de la invitación."),
  })
  .transform(keysToSnakeCase);

/**
 * @const CreateCampaignSchema
 * @description Esquema para la creación de una nueva campaña. Transforma el `name`
 *              en un `slug` y convierte las claves a `snake_case`.
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
  .transform((data) => ({ ...data, slug: data.slug || slugify(data.name) }))
  .transform(keysToSnakeCase);

/**
 * @const DeleteCampaignSchema
 * @description Esquema para la eliminación de una campaña, validando solo el ID.
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
 * @description Esquema para los datos de registro de visitantes que se insertan en
 *              la base de datos, con nomenclatura `snake_case`.
 */
export const VisitorLogSchema = z.object({
  session_id: UuidSchema,
  fingerprint: z.string().min(1, "Fingerprint es requerido."),
  ip_address: z.string().ip("Dirección IP inválida."),
  geo_data: z.record(z.any()).nullable().optional(),
  user_agent: z.string().nullable().optional(),
  utm_params: z.record(z.any()).nullable().optional(),
  referrer: z.string().url().nullable().optional(),
  landing_page: z.string().nullable().optional(),
  browser_context: z.record(z.any()).nullable().optional(),
  is_bot: z.boolean().optional(),
  is_known_abuser: z.boolean().optional(),
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
 * 1. **Transformação Automática de Nomenclatura**: ((Implementada)) Os esquemas `CreateSiteServerSchema`, `UpdateSiteSchema`, `CreateCampaignSchema`, e `InvitationSchema` utilizam `.transform(keysToSnakeCase)` para converter automaticamente os dados validados para o formato `snake_case`, estabelecendo um ponto único e robusto de conversão.
 *
 * @subsection Melhorias Futuras
 * 1. **Aplicação Sistêmica**: ((Vigente)) O padrão de transformação `.transform(keysToSnakeCase)` deve ser aplicado a todos os outros esquemas Zod que definem dados destinados à base de dados para garantir a consistência em toda a aplicação.
 * 2. **Esquemas a Nível de Arquivo**: ((Vigente)) Para projetos maiores, cada esquema de domínio (ej. `SiteSchemas`, `WorkspaceSchemas`) poderia ser movido a seu próprio arquivo dentro de `lib/validators/` e exportado desde aqui para uma maior granularidade.
 */
// lib/validators/index.ts
