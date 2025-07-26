// NUEVO APARATO: app/[locale]/dashboard/sites/page.tsx

import { getSitesByWorkspaceId } from "@/lib/data/sites";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SitesClient } from "./sites-client"; // Crearemos este componente a continuación

/**
 * @file page.tsx
 * @description Página de servidor para gestionar los sitios de un workspace.
 * Carga los sitios del workspace activo y los pasa al componente de cliente.
 *
 * @author Metashark
 * @version 1.0.0 (Initial Creation)
 */
export default async function SitesPage() {
  const cookieStore = cookies();
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const workspaceId = cookieStore.get("active_workspace_id")?.value;

  if (!workspaceId) {
    // Si no hay workspace, quizás redirigir a una página para crear uno.
    // Por ahora, redirigimos al dashboard principal.
    return redirect("/dashboard");
  }

  // Usamos la función de datos paginada, aunque aquí carguemos la primera página.
  const { sites } = await getSitesByWorkspaceId(workspaceId, {
    page: 1,
    limit: 50,
  });

  return <SitesClient initialSites={sites} />;
}
