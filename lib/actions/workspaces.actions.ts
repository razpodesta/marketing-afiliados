// lib/actions/workspaces.actions.ts
/**
 * @file workspaces.actions.ts
 * @description Aparato de ações atómico. Sua única responsabilidade é
 *              gerenciar a entidade `workspaces` e o contexto de sessão.
 *              A lógica de convites foi movida para seu próprio módulo
 *              `invitations.actions.ts` para uma máxima coesão.
 * @author Metashark (Refatorado por L.I.A Legacy)
 * @version 8.0.0 (Atomic Refactor)
 */
"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ZodError } from "zod";

import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";
import { type ActionResult, CreateWorkspaceSchema } from "@/lib/validators";

import { createAuditLog } from "./_helpers";

/**
 * @exports setActiveWorkspaceAction
 * @description Establece el workspace activo para el usuario en una cookie segura y
 *              de solo HTTP, desencadenando una revalidación del layout para
 *              actualizar el contexto de la aplicación y redirigiendo al dashboard.
 * @param {string} workspaceId - El identificador único universal del workspace a activar.
 * @returns {Promise<void>} Una promesa que resuelve cuando la redirección es iniciada.
 */
export async function setActiveWorkspaceAction(
  workspaceId: string
): Promise<void> {
  logger.trace("[WorkspacesAction] Setting active workspace.", { workspaceId });
  cookies().set("active_workspace_id", workspaceId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  });
  revalidatePath("/dashboard", "layout");
  redirect("/dashboard");
}

/**
 * @exports createWorkspaceAction
 * @description Crea un nuevo workspace y asigna al usuario como propietario de forma atómica
 *              mediante una función RPC segura. Valida los datos de entrada y
 *              registra un evento de auditoría en caso de éxito.
 * @param {FormData} formData - Los datos del formulario que deben cumplir con `CreateWorkspaceSchema`.
 * @returns {Promise<ActionResult<{ id: string }>>} El resultado de la operación,
 *          conteniendo el ID del nuevo workspace en caso de éxito.
 */
export async function createWorkspaceAction(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    logger.warn("[WorkspacesAction] Unauthorized attempt to create workspace.");
    return { success: false, error: "No autenticado. Inicia sesión de nuevo." };
  }

  try {
    const { workspaceName, icon } = CreateWorkspaceSchema.parse(
      Object.fromEntries(formData.entries())
    );

    const { error, data } = await supabase.rpc("create_workspace_with_owner", {
      owner_user_id: user.id,
      new_workspace_name: workspaceName,
      new_workspace_icon: icon,
    });

    if (error || !data) {
      logger.error("[WorkspacesAction] RPC failed to create workspace.", {
        userId: user.id,
        error,
      });
      return { success: false, error: "No se pudo crear el workspace." };
    }

    const newWorkspace = data[0];

    await createAuditLog("workspace_created", {
      userId: user.id,
      targetEntityId: newWorkspace.id,
      targetEntityType: "workspace",
      metadata: { workspaceName, icon },
    });

    revalidatePath("/dashboard", "layout");
    logger.info("[WorkspacesAction] Workspace created successfully.", {
      workspaceId: newWorkspace.id,
      userId: user.id,
    });
    return { success: true, data: { id: newWorkspace.id } };
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessage =
        error.flatten().fieldErrors.workspaceName?.[0] || "Datos inválidos.";
      logger.warn("[WorkspacesAction] Invalid data for workspace creation.", {
        userId: user.id,
        errors: error.flatten(),
      });
      return { success: false, error: errorMessage };
    }
    logger.error("[WorkspacesAction] Unexpected error creating workspace.", {
      userId: user.id,
      error,
    });
    return { success: false, error: "Un error inesperado ocurrió." };
  }
}

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1.  **Atomicidade Radical**: ((Implementada)) Se ha eliminado la función `sendWorkspaceInvitationAction`. Este módulo ahora cumple estrictamente el Princípio de Responsabilidade Única, focando-se apenas na entidade `workspaces`.
 *
 * @subsection Melhorias Futuras
 * 1.  **Ação de Atualização**: ((Vigente)) Criar uma `updateWorkspaceAction(formData)` para permitir que os usuários (com o papel de 'owner' ou 'admin') alterem o nome e o ícone de um workspace.
 * 2.  **Ação de Eliminação**: ((Vigente)) Implementar uma `deleteWorkspaceAction(workspaceId)` que seja uma operação de alto risco, exigindo confirmação adicional e validando que o usuário é o 'owner'.
 */
// lib/actions/workspaces.actions.ts
