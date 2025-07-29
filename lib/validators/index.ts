// Ruta: lib/validators/index.ts
/**
 * @file validators.ts
 * @description Centraliza todos los esquemas de validación de Zod y tipos de estado de formulario.
 *              Este aparato es la única fuente de verdad para la forma de los datos
 *              de entrada y salida de las Server Actions y formularios.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 1.4.0 (Action Result Type Refinement)
 */
import { z } from "zod";

// --- TIPOS DE ESTADO DE FORMULARIO ---
/**
 * @typedef {object} ActionResult
 * @description Tipo genérico para el resultado de una operación (especialmente Server Actions).
 * @template T - El tipo de los datos retornados en caso de éxito. Por defecto, `void` si no se esperan datos.
 * @property {boolean} success - Indica si la operación fue exitosa.
 * @property {T} [data] - Datos opcionales retornados en caso de éxito.
 * @property {string} [error] - Mensaje de error en caso de fallo.
 * @property {string} [message] - Mensaje informativo de la operación (éxito o fallo).
 */
export type ActionResult<T = void> = {
  // CORRECCIÓN CRÍTICA: Se cambia el tipo por defecto de `T` de `null` a `void`.
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type RequestPasswordResetState = {
  error?: string;
};

export type CreateSiteFormState = {
  error?: string;
  success?: boolean;
};

export type CreateWorkspaceFormState = {
  error: string | null;
  success: boolean;
};

export type InviteMemberFormState = {
  error?: string;
  success?: boolean;
  message?: string;
};

// --- ESQUEMAS DE VALIDACIÓN ---

export const SiteSchema = z.object({
  subdomain: z
    .string()
    .min(3, "El subdominio debe tener al menos 3 caracteres.")
    .regex(
      /^[a-z0-9-]+$/,
      "Solo se permiten letras minúsculas, números y guiones."
    ),
  icon: z.string().min(1, "El ícono es requerido."),
});

export const WorkspaceSchema = z.object({
  workspaceName: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres."),
  icon: z.string().min(1, "El ícono es requerido."),
});

export const EmailSchema = z
  .string()
  .email("Por favor, introduce un email válido.");

export const InvitationSchema = z.object({
  email: EmailSchema,
  role: z.enum(["admin", "member", "editor", "viewer"], {
    errorMap: () => ({ message: "Por favor, selecciona un rol válido." }),
  }),
  workspaceId: z.string().uuid("ID de workspace inválido."),
});

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras incrementales para robustecer la validación y los contratos de datos.
 *
 * 1.  **Internacionalización de Errores de Zod:** (Revalidado) Integrar una librería como `zod-i18n` para que los mensajes de error de validación se puedan traducir automáticamente según el `locale` del usuario.
 * 2.  **Esquemas Completos para el Constructor:** (Revalidado) Crear esquemas de Zod detallados para la estructura `CampaignConfig` y sus bloques (`PageBlock`) para validar el contenido completo de una campaña antes de guardarla.
 * 3.  **Validación de Variables de Entorno:** (Revalidado) Utilizar Zod para validar las variables de entorno al iniciar la aplicación, asegurando que todas las claves de API y configuraciones necesarias estén presentes y tengan el formato correcto.
 */

/**
 * @fileoverview El aparato `validators/index.ts` es la "carta de ley" del proyecto.
 * @functionality
 * - Define todos los esquemas de validación para los datos de entrada de los formularios (`SiteSchema`, `WorkspaceSchema`, `InvitationSchema`).
 * - Define los tipos de datos que se utilizan para representar el estado de los formularios y los resultados de las operaciones (`ActionResult`, `CreateSiteFormState`, etc.).
 * - Centraliza las reglas de negocio básicas para la validación de datos, asegurando que tanto el cliente como el servidor operen bajo el mismo conjunto de reglas.
 * @relationships
 * - Es consumido por los componentes de formulario de cliente (ej. `CreateSiteForm.tsx`, `InviteMemberForm.tsx`) a través de `zodResolver` para la validación en tiempo real.
 * - Es importado por todas las Server Actions en `lib/actions/` para validar los datos recibidos de las peticiones HTTP.
 * @expectations
 * - Se espera que este aparato sea la única fuente de verdad para la validación de datos. Cualquier cambio en la estructura de un formulario o en los requisitos de datos debe reflejarse primero aquí para mantener la consistencia y la seguridad de tipos en todo el sistema.
 */
// Ruta: lib/validators/index.ts
/*  L.I.A. LOGIC ANALYSIS
 *  ---------------------
 *  Este aparato es la única fuente de verdad para la validación de la forma de
 *  los datos de entrada en la aplicación. Utiliza la librería Zod para definir
 *  esquemas declarativos que pueden ser utilizados tanto en el servidor (dentro de
 *  las Server Actions) como en el cliente (a través de `zodResolver` con `react-hook-form`).
 *  1.  **Centralización:** Agrupar todos los esquemas aquí previene la duplicación de
 *      la lógica de validación y asegura que el cliente y el servidor siempre
 *      operen bajo las mismas reglas de datos.
 *  2.  **Tipado Inferido:** Zod permite inferir tipos de TypeScript directamente
 *      desde los esquemas (ej. `type FormData = z.infer<typeof InvitationSchema>`).
 *      Esto garantiza que los tipos de los datos de los formularios estén siempre
 *      sincronizados con sus reglas de validación.
 *  3.  **Mensajes de Error:** Los esquemas definen los mensajes de error que se
 *      mostrarán al usuario, permitiendo la personalización y futura internacionalización.
 */

/* MEJORAS FUTURAS DETECTADAS
 * 1. Internacionalización de Errores de Zod: Integrar una librería como `zod-i18n` para que los mensajes de error de validación (ej. "El nombre debe tener al menos 3 caracteres") se puedan traducir automáticamente según el idioma (`locale`) del usuario, creando una experiencia de validación completamente localizada.
 * 2. Esquemas Complejos para el Constructor: Crear esquemas de Zod detallados para la estructura de `CampaignConfig` y sus bloques (`PageBlock`). Esto permitiría validar el contenido completo de una campaña antes de guardarla en la base de datos, previniendo la corrupción de datos si la estructura del JSON es incorrecta.
 * 3. Validación de Variables de Entorno: Utilizar Zod para validar las variables de entorno (`process.env`) al iniciar la aplicación. Esto asegura que todas las claves de API y configuraciones necesarias estén presentes y tengan el formato correcto, previniendo fallos en tiempo de ejecución debido a una mala configuración.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Internacionalización de Errores: Integrar `zod-i18n` para que los mensajes de error de validación se puedan traducir automáticamente según el locale del usuario.
 * 2. Esquemas Complejos para el Builder: Crear esquemas de Zod detallados para la estructura `CampaignConfig` (`lib/builder/types.d.ts`) para validar el contenido de las campañas antes de guardarlas.
 * 3. Variables de Entorno: Usar Zod para validar las variables de entorno al iniciar la aplicación, asegurando que todas las claves necesarias estén presentes y tengan el formato correcto.
 */
