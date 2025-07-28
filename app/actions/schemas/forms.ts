// Ruta: app/actions/schemas/forms.ts
/**
 * @file forms.ts
 * @description Define las formas de estado para los formularios que interactúan
 *              con Server Actions, compatibles con el hook `useFormState`.
 * @author Metashark
 * @version 1.1.0 (Invite Member Form State)
 */

/**
 * @typedef {object} CreateSiteFormState
 * @description Define la forma del estado para el formulario de creación de sitios.
 */
export type CreateSiteFormState = {
  subdomain?: string;
  icon?: string;
  error?: string;
  success?: boolean;
};

/**
 * @typedef {object} CreateWorkspaceFormState
 * @description Define la forma del estado para el formulario de creación de workspaces.
 */
export type CreateWorkspaceFormState = {
  error: string | null;
  success: boolean;
};

/**
 * @typedef {object} RequestPasswordResetState
 * @description Define la forma del estado para el formulario de reseteo de contraseña.
 */
export type RequestPasswordResetState = {
  error?: string;
};

/**
 * @typedef {object} InviteMemberFormState
 * @description Define la forma del estado para el formulario de invitación de miembros.
 */
export type InviteMemberFormState = {
  error?: string;
  success?: boolean;
  message?: string;
};

/* MEJORAS FUTURAS DETECTADAS
 * 1. Tipos Genéricos para Formularios: Crear un tipo genérico `FormState<T>` para estandarizar los estados de éxito/error/mensaje en todos los formularios, reduciendo la repetición.
 * 2. Estados de Campo Específicos: Para formularios complejos, el estado podría evolucionar para incluir errores por campo (`fieldErrors: Record<string, string>`) en lugar de un único `error` global.
 */
