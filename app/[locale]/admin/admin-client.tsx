// app/[locale]/admin/admin-client.tsx
/**
 * @file admin-client.tsx
 * @description Componente de cliente para el Dashboard de Administración.
 *              Ha sido refactorizado para una gestión de estado simplificada y
 *              robusta, unificando el estado de carga en una única variable
 *              para eliminar condiciones de carrera y mejorar la testabilidad.
 * @author L.I.A. Legacy & Raz Podestá
 * @co-author MetaShark
 * @version 14.0.0 (Simplified State Management)
 */
"use client";

import type { User } from "@supabase/supabase-js";
import { ExternalLink, LogOut, ShieldAlert, Trash2 } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import * as React from "react";
import toast from "react-hot-toast";

import { PaginationControls } from "@/components/sites";
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

type TransformedSite = {
  subdomain: string;
  icon: string | null;
  createdAt: number;
};

const DashboardHeader = ({ user }: { user: User }) => {
  const t = useTranslations("AdminDashboard");
  const username = user.user_metadata?.full_name || user.email || "Admin";

  const handleSignOut = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    session.signOutAction();
  };

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
  // --- INICIO DE REFACTORIZACIÓN ARQUITECTÓNICA ---
  const [deletingSiteId, setDeletingSiteId] = React.useState<string | null>(
    null
  );
  const format = useFormatter();
  const t = useTranslations("AdminDashboard");

  const handleDelete = async (formData: FormData) => {
    const subdomain = formData.get("subdomain") as string;
    if (!subdomain) return;

    setDeletingSiteId(subdomain);

    const result = await admin.deleteSiteAsAdminAction(formData);
    if (result.success) {
      toast.success(result.data.message);
    } else {
      toast.error(result.error);
    }
    setDeletingSiteId(null);
  };
  // --- FIN DE REFACTORIZACIÓN ARQUITECTÓNICA ---

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
                    {/* ... (contenido del CardHeader sin cambios) ... */}
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
                      isPending={deletingSiteId === site.subdomain}
                      hiddenInputs={{ subdomain: site.subdomain }}
                    />
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
 * @section MEJORA CONTINUA
 *
 * @subsection Mejoras Implementadas
 * 1. **Gestión de Estado Simplificada**: ((Implementada)) Se ha eliminado `useTransition` y se ha unificado el estado de carga en la variable `deletingSiteId`, resultando en un código más simple y predecible.
 */
// app/[locale]/admin/admin-client.tsx
