// app/[locale]/admin/admin-client.tsx
"use client";

import type { User } from "@supabase/supabase-js";
import { LogOut } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import * as React from "react";
import toast from "react-hot-toast";

import { AdminSiteCard } from "@/app/[locale]/admin/components/AdminSiteCard";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { deleteSiteAsAdminAction } from "@/lib/actions/admin.actions";
import { signOutAction } from "@/lib/actions/session.actions";
import { logger } from "@/lib/logging";

interface TransformedSite {
  id: string;
  subdomain: string;
  icon: string | null;
  createdAt: number;
}

/**
 * @exports DashboardHeader
 * @description Componente de presentación puro para el encabezado del dashboard de administración.
 * @param {{ user: User }} props - Propiedades del componente.
 * @returns {React.ReactElement} El encabezado renderizado.
 */
const DashboardHeader = ({ user }: { user: User }): React.ReactElement => {
  const t = useTranslations("AdminDashboard");
  const username = user.user_metadata?.full_name || user.email || "Admin";

  const handleSignOut = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    logger.trace("[AdminDashboard] User initiated sign out.");
    signOutAction();
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold">{t("headerTitle")}</h1>
        <p className="text-muted-foreground">{t("headerDescription")}</p>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          {t("welcomeMessage", { username })}
        </span>
        <form onSubmit={handleSignOut}>
          <Button variant="outline" size="sm" type="submit">
            <LogOut className="mr-2 h-4 w-4" />
            {t("signOutButton")}
          </Button>
        </form>
      </div>
    </div>
  );
};

/**
 * @exports AdminClient
 * @description Orquestador de cliente para la página de administración. Gestiona el estado
 *              de la UI, las interacciones del usuario y la comunicación con las Server Actions.
 *              Importa acciones de forma atómica para respetar el límite Servidor-Cliente.
 * @param {object} props - Propiedades del componente.
 * @returns {React.ReactElement} El componente de cliente de administración renderizado.
 */
export function AdminClient({
  sites,
  user,
  totalCount,
  page,
  limit,
}: {
  sites: TransformedSite[];
  user: User;
  totalCount: number;
  page: number;
  limit: number;
}): React.ReactElement {
  const [deletingSiteId, setDeletingSiteId] = React.useState<string | null>(
    null
  );
  const format = useFormatter();
  const tAdmin = useTranslations("AdminDashboard");
  const tDialogs = useTranslations("Dialogs");
  const tPagination = useTranslations("SitesPage.pagination");

  const handleDelete = async (formData: FormData) => {
    const subdomain = formData.get("subdomain") as string;
    if (!subdomain) return;

    logger.trace(
      `[AdminClient] Deletion initiated for subdomain: ${subdomain}`
    );
    setDeletingSiteId(subdomain);
    const result = await deleteSiteAsAdminAction(formData);
    if (result.success) {
      toast.success(result.data.message);
      logger.info(`[AdminClient] Subdomain ${subdomain} deleted successfully.`);
    } else {
      toast.error(result.error);
      logger.error(`[AdminClient] Failed to delete subdomain ${subdomain}.`, {
        error: result.error,
      });
    }
    setDeletingSiteId(null);
  };

  const cardTexts = {
    created: tAdmin("created"),
    visitSubdomain: tAdmin("visitSubdomain"),
    deleteButton: tAdmin("deleteButton"),
    deleteDialog: {
      title: tAdmin("deleteDialog.title"),
      description: tAdmin.rich("deleteDialog.description", {
        subdomain: "placeholder",
        strong: (chunks) => <strong>{chunks}</strong>,
      }),
      confirmButton: tAdmin("deleteDialog.confirmButton"),
      cancelButton: tDialogs("generic_cancelButton"),
    },
  };

  const paginationTexts = {
    previousPageLabel: tPagination("previous"),
    nextPageLabel: tPagination("next"),
    pageLabelTemplate: tPagination("page"),
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mx-auto w-full max-w-7xl">
        <DashboardHeader user={user} />
        {sites.length > 0 ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sites.map((site) => (
                <AdminSiteCard
                  key={site.id}
                  site={site}
                  texts={{
                    ...cardTexts,
                    deleteDialog: {
                      ...cardTexts.deleteDialog,
                      description: tAdmin.rich("deleteDialog.description", {
                        subdomain: site.subdomain,
                        strong: (chunks) => <strong>{chunks}</strong>,
                      }),
                    },
                  }}
                  onConfirmDelete={handleDelete}
                  isPending={deletingSiteId === site.subdomain}
                  deletingSiteId={deletingSiteId}
                  format={format}
                />
              ))}
            </div>
            <PaginationControls
              page={page}
              totalCount={totalCount}
              limit={limit}
              basePath="/admin"
              texts={paginationTexts}
            />
          </>
        ) : (
          <Card className="flex h-64 flex-col items-center justify-center p-8 text-center">
            <h3 className="text-xl font-semibold">
              {tAdmin("noSubdomains.title")}
            </h3>
            <p className="text-muted-foreground">
              {tAdmin("noSubdomains.description")}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1.  **Desacoplamiento de Importaciones**: ((Implementada)) Se ha refactorizado la importación de Server Actions para que apunte directamente a los archivos de origen (`admin.actions.ts`, `session.actions.ts`) en lugar del archivo barril. Esto resuelve la violación del límite Servidor-Cliente y corrige el error de compilación.
 * 2.  **Full Observabilidad**: ((Implementada)) Se han añadido logs de `trace` y `error` en los manejadores de eventos para proporcionar una visibilidad completa de las acciones del usuario y los resultados de las operaciones del servidor.
 *
 * @subsection Melhorias Futuras
 * 1.  **Factoría de Textos**: ((Vigente)) La construcción de los objetos `cardTexts` y `paginationTexts` podría abstraerse a un hook `useAdminClientTexts()` para mantener el cuerpo del componente más limpio y enfocado en la lógica.
 */
// app/[locale]/admin/admin-client.tsx
