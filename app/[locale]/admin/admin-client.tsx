// Ruta: app/[locale]/admin/admin-client.tsx
/**
 * @file admin-client.tsx
 * @description Componente de cliente para el Dashboard de Administración. Ha sido
 *              refactorizado para manejar de forma segura el contrato de tipo de
 *              unión discriminada de `ActionResult`.
 * @author RaZ Podestá & L.I.A Legacy
 * @version 9.1.0 (Type-Safe Action Result Handling)
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
import Link from "next/link";
import { useFormatter, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

const DeleteSiteDialog = ({
  site,
  onDelete,
  isPending,
}: {
  site: TransformedSite;
  onDelete: (formData: FormData) => void;
  isPending: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-destructive/10"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form action={onDelete}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-red-600" />
              ¿Estás seguro?
            </DialogTitle>
            <DialogDescription>
              Esta acción es irreversible. El sitio{" "}
              <strong className="font-medium text-foreground">
                {site.subdomain}
              </strong>{" "}
              y todos sus datos asociados serán eliminados permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <input type="hidden" name="subdomain" value={site.subdomain} />
            <Button variant="destructive" type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sí, eliminar sitio
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
  const [isPending, startTransition] = useTransition();
  const [deletingSiteId, setDeletingSiteId] = useState<string | null>(null);
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
          // CORRECCIÓN DE TIPO (TS2339): Se implementa el estrechamiento de tipo
          // (type narrowing) para manejar la unión discriminada de forma segura.
          if (result.success) {
            toast.success(result.data.message);
          } else {
            // Dentro de este bloque, TypeScript sabe que `result.error` existe.
            toast.error(result.error);
          }
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
                    <DeleteSiteDialog
                      site={site}
                      onDelete={handleDelete}
                      isPending={isPending && deletingSiteId === site.subdomain}
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
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras incrementales para evolucionar el dashboard de administración.
 *
 * 1.  **Búsqueda y Filtros en el Servidor:** La mejora de mayor impacto ahora es añadir un campo de búsqueda en el `DashboardHeader`. Este campo debería pasar un parámetro de búsqueda en la URL (ej. `/admin?q=mi-sitio`) para que la función `getAllSites` en `admin/page.tsx` pueda filtrar los resultados de manera eficiente directamente en la base de datos.
 * 2.  **Estado de Carga por Tarjeta Individual:** Para una UX más refinada, en lugar de un `isPending` global para la eliminación, se podría gestionar un estado de carga por cada sitio individualmente (ej. `useState<Record<string, boolean>>({})`). Esto permitiría mostrar el spinner solo en el botón de la tarjeta que se está eliminando.
 * 3.  **Acciones Administrativas Adicionales:** Expandir el `DeleteSiteDialog` o añadir nuevos controles para realizar otras acciones administrativas, como "Suspender Sitio" (que lo pondría en un estado inactivo sin eliminarlo) o "Ver Detalles del Propietario".
 */

/**
 * @fileoverview El aparato `admin-client.tsx` es el componente de cliente que gestiona la interfaz de usuario del Dashboard de Administración.
 * @functionality
 * - Muestra un encabezado personalizado para el administrador con opciones de sesión.
 * - Presenta una lista paginada de todos los sitios de la plataforma en formato de tarjetas.
 * - Proporciona un control de paginación avanzado y reutilizable para una navegación eficiente.
 * - Permite al administrador visitar cada subdominio público.
 * - Habilita la eliminación de sitios de forma irreversible a través de un diálogo de confirmación, utilizando una Server Action.
 * - Muestra un feedback visual de carga durante las operaciones de eliminación, utilizando `useTransition` para mantener la UI interactiva.
 * @relationships
 * - Es el componente hijo principal de `app/[locale]/admin/page.tsx`, del cual recibe los datos iniciales y el contexto de usuario.
 * - Invoca directamente las Server Actions del namespace `admin` (`admin.deleteSiteAsAdminAction`).
 * - Utiliza componentes de UI genéricos y reutilizables, incluyendo el `PaginationControls` canónico de `@/components/sites/PaginationControls`.
 * @expectations
 * - Se espera que este aparato sea robusto en el manejo de operaciones sensibles. Debe proporcionar una experiencia de usuario clara y segura, con feedback apropiado para las acciones críticas y una navegación consistente con el resto de la aplicación.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Acciones de Suplantación (Impersonation): Integrar la acción `admin.impersonateUserAction` en la UI del `dev-console` para permitir a los desarrolladores iniciar sesión como otros usuarios para depuración.
 * 2. Indicador de Página Numérico: Mejorar el componente de paginación para mostrar números de página (ej. "1, 2, 3 ... 10"), permitiendo al usuario saltar directamente a una página específica.
 * 3. Búsqueda y Filtros del Lado del Servidor: Añadir un campo de búsqueda en el `DashboardHeader` que pase un parámetro en la URL para que la función `getAllSites` en `admin/page.tsx` filtre los resultados en la base de datos.
 */
