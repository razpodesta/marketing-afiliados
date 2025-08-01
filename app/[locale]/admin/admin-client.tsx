// app/[locale]/admin/admin-client.tsx
/**
 * @file admin-client.tsx
 * @description Componente de cliente para el Dashboard de Administración. Ha sido
 *              refactorizado para utilizar el componente canónico `ConfirmationDialog`,
 *              aumentando la reutilización de código y la consistencia de la UI.
 * @author L.I.A. Legacy & Raz Podestá
 * @co-author MetaShark
 * @version 11.0.0 (Canonical Dialog Integration)
 */
"use client";

import type { User } from "@supabase/supabase-js";
import {
  ExternalLink,
  Loader2,
  LogOut,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import * as React from "react";
import toast from "react-hot-toast";

import { PaginationControls } from "@/components/sites/PaginationControls";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/ui/ConfirmationDialog";
import { admin, session } from "@/lib/actions";
import { protocol, rootDomain } from "@/lib/utils";
import { type ActionResult } from "@/lib/validators";

type TransformedSite = {
  subdomain: string;
  icon: string | null;
  createdAt: number;
};

const DashboardHeader = ({ user }: { user: User }) => {
  const t = useTranslations("AdminDashboard");
  const username = user.user_metadata?.full_name || user.email || "Admin";
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold">{t("headerTitle")}</h1>
        <p className="text-muted-foreground">
          Vista global de todos los sitios en la plataforma.
        </p>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          {t("welcomeMessage", { username })}
        </span>
        <form action={session.signOutAction}>
          <Button variant="outline" size="sm" type="submit">
            <LogOut className="mr-2 h-4 w-4" />
            {t("signOutButton")}
          </Button>
        </form>
      </div>
    </div>
  );
};

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
}) {
  const [isPending, startTransition] = React.useTransition();
  const [deletingSiteId, setDeletingSiteId] = React.useState<string | null>(
    null
  );
  const format = useFormatter();
  const t = useTranslations("AdminDashboard");

  const handleDelete = (formData: FormData) => {
    const subdomain = formData.get("subdomain") as string;
    if (!subdomain) return;

    setDeletingSiteId(subdomain);

    startTransition(() => {
      admin
        .deleteSiteAsAdminAction(formData)
        .then((result: ActionResult<{ message: string }>) => {
          if (result.success) {
            toast.success(result.data.message);
          } else {
            toast.error(result.error);
          }
        })
        .finally(() => {
          // El estado de `isPending` se resetea automáticamente al final de la transición,
          // por lo que solo necesitamos resetear nuestro ID de seguimiento.
          setDeletingSiteId(null);
        });
    });
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mx-auto w-full max-w-7xl">
        <DashboardHeader user={user} />
        {sites.length > 0 ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sites.map((site) => (
                <Card key={site.subdomain}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle>{site.subdomain}</CardTitle>
                        <CardDescription>
                          {t("created")}:{" "}
                          {format.dateTime(new Date(site.createdAt), "short")}
                        </CardDescription>
                      </div>
                      <div className="text-4xl">{site.icon}</div>
                    </div>
                  </CardHeader>
                  <CardFooter className="justify-between">
                    <Button asChild variant="outline" size="sm">
                      <a
                        href={`${protocol}://${site.subdomain}.${rootDomain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        {t("visitSubdomain")}
                      </a>
                    </Button>
                    {/* --- INICIO DE REFACTORIZACIÓN --- */}
                    {/* Se reemplaza el diálogo local por el componente canónico. */}
                    <ConfirmationDialog
                      triggerButton={
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-destructive/10"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </Button>
                      }
                      icon={ShieldAlert}
                      title="¿Estás seguro?"
                      description={
                        <>
                          Esta acción es irreversible. El sitio{" "}
                          <strong className="font-medium text-foreground">
                            {site.subdomain}
                          </strong>{" "}
                          y todos sus datos asociados serán eliminados
                          permanentemente.
                        </>
                      }
                      confirmButtonText="Sí, eliminar sitio"
                      confirmButtonVariant="destructive"
                      onConfirm={handleDelete}
                      isPending={isPending && deletingSiteId === site.subdomain}
                      hiddenInputs={{ subdomain: site.subdomain }}
                    />
                    {/* --- FIN DE REFACTORIZACIÓN --- */}
                  </CardFooter>
                </Card>
              ))}
            </div>
            <PaginationControls
              page={page}
              totalCount={totalCount}
              limit={limit}
              basePath="/admin"
            />
          </>
        ) : (
          <Card className="flex h-64 flex-col items-center justify-center p-8 text-center">
            <h3 className="text-xl font-semibold">{t("noSubdomains")}</h3>
            <p className="text-muted-foreground">
              Cuando los usuarios creen sitios, aparecerán aquí para su gestión.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

/**
 * @section MEJORAS FUTURAS
 * @description Mejoras incrementales para evolucionar el dashboard de administración.
 *
 * 1.  **Búsqueda y Filtros en el Servidor**: (Vigente) La mejora de mayor impacto ahora es añadir un campo de búsqueda en el `DashboardHeader` para que la función `getAllSites` en `admin/page.tsx` pueda filtrar los resultados directamente en la base de datos.
 * 2.  **Acciones Administrativas Adicionales**: (Vigente) Añadir nuevos controles para realizar otras acciones administrativas, como "Suspender Sitio" (que lo pondría en un estado inactivo sin eliminarlo) o "Ver Detalles del Propietario".
 * 3.  **Acciones en Lote (Bulk Actions)**: (Nueva) Implementar una UI que permita seleccionar múltiples sitios (con checkboxes en cada `Card`) y ejecutar acciones en lote, como "Eliminar Seleccionados" o "Suspender Seleccionados", mejorando drásticamente la eficiencia para los administradores.
 */
// app/[locale]/admin/admin-client.tsx
