// Ruta: app/actions/schemas/validators.ts
import { z } from "zod";

/**
 * @file validators.ts
 * @description Centraliza todos los esquemas de validación de Zod utilizados
 *              en la aplicación, tanto en el cliente como en el servidor.
 * REFACTORIZACIÓN DE ROLES:
 * 1.  Se ha expandido el `InvitationSchema` para incluir roles más granulares
 *     ("editor", "viewer"), sentando las bases para un sistema de permisos más avanzado.
 *
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 1.2.0 (Granular Role Schema)
 */

/**
 * @const SiteSchema
 * @description Esquema de validación para los datos del formulario de creación de sitios.
 */
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

/**
 * @const WorkspaceSchema
 * @description Esquema de validación para los datos del formulario de creación de workspaces.
 */
export const WorkspaceSchema = z.object({
  workspaceName: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres."),
  icon: z.string().min(1, "El ícono es requerido."),
});

/**
 * @const EmailSchema
 * @description Esquema de validación para direcciones de correo electrónico.
 */
export const EmailSchema = z
  .string()
  .email("Por favor, introduce un email válido.");

/**
 * @const InvitationSchema
 * @description Esquema de validación para el formulario de invitación de miembros.
 */
export const InvitationSchema = z.object({
  email: EmailSchema,
  // REFACTORIZACIÓN: Añadidos roles más granulares.
  role: z.enum(["admin", "member", "editor", "viewer"], {
    errorMap: () => ({ message: "Por favor, selecciona un rol válido." }),
  }),
  workspaceId: z.string().uuid("ID de workspace inválido."),
});

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
