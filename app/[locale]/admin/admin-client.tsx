// Ruta: app/[locale]/admin/admin-client.tsx
/**
 * @file admin-client.tsx
 * @description Componente de cliente para el Dashboard de Administración. Proporciona
 *              la interfaz interactiva para supervisar y gestionar todos los sitios
 *              de la plataforma.
 * @author RaZ Podestá & L.I.A Legacy
 * @version 8.2.0 (React Transition Fix)
 */
"use client";

import type { User } from "@supabase/supabase-js";
import {
  ChevronLeft,
  ChevronRight,
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

const PaginationControls = ({
  page,
  totalCount,
  limit,
}: {
  page: number;
  totalCount: number;
  limit: number;
}) => {
  const totalPages = Math.ceil(totalCount / limit);
  const hasPreviousPage = page > 1;
  const hasNextPage = page < totalPages;
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalCount);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-8">
      <p className="text-sm text-muted-foreground">
        Mostrando {startItem}-{endItem} de {totalCount} sitios
      </p>
      <div className="flex items-center gap-2">
        <Button asChild variant="outline" disabled={!hasPreviousPage}>
          <Link href={`/admin?page=${page - 1}`}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Anterior
          </Link>
        </Button>
        <Button asChild variant="outline" disabled={!hasNextPage}>
          <Link href={`/admin?page=${page + 1}`}>
            Siguiente
            <ChevronRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
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
  const [isPending, startTransition] = useTransition();
  const [deletingSiteId, setDeletingSiteId] = useState<string | null>(null);
  const format = useFormatter();
  const t = useTranslations("AdminDashboard");

  const handleDelete = (formData: FormData) => {
    const subdomain = formData.get("subdomain") as string;
    if (!subdomain) return;

    setDeletingSiteId(subdomain);

    // CORRECCIÓN CRÍTICA: `startTransition` debe envolver una función síncrona.
    // La lógica asíncrona se ejecuta dentro de la función que se pasa.
    startTransition(() => {
      admin
        .deleteSiteAsAdminAction(formData)
        .then((result: ActionResult<{ message: string }>) => {
          if (result.success && result.data) {
            toast.success(result.data.message);
          } else if (result.error) {
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
 * @description Mejoras incrementales para el dashboard de administración.
 *
 * 1.  **Estado de Carga por Tarjeta Individual:** (Revalidado) En lugar de un `isPending` global, se podría gestionar un estado de carga por cada sitio individualmente (ej. `useState<Record<string, boolean>>({})`). Esto permitiría mostrar el spinner solo en el botón de la tarjeta que se está eliminando.
 * 2.  **Indicador de Página Numérico Avanzado:** (Revalidado) Mejorar el componente `PaginationControls` para que utilice la lógica avanzada de `usePaginationRange` (como en `components/sites/PaginationControls.tsx`) para mostrar números de página y elipsis.
 * 3.  **Búsqueda y Filtros del Lado del Servidor:** (Revalidado) Añadir un campo de búsqueda en el `DashboardHeader` que pase un parámetro en la URL para que la función `getAllSites` en `admin/page.tsx` filtre los resultados en la base de datos.
 */

/**
 * @fileoverview El aparato `admin-client.tsx` es el componente de cliente que gestiona la interfaz de usuario del Dashboard de Administración.
 * @functionality
 * - Muestra un encabezado personalizado para el administrador con opciones de sesión.
 * - Presenta una lista paginada de todos los sitios de la plataforma en formato de tarjetas.
 * - Permite al administrador visitar cada subdominio público.
 * - Habilita la eliminación de sitios de forma irreversible a través de un diálogo de confirmación, utilizando una Server Action.
 * - Muestra un feedback visual de carga durante las operaciones de eliminación, utilizando `useTransition` para mantener la UI interactiva.
 * @relationships
 * - Es el componente hijo principal de `app/[locale]/admin/page.tsx`, del cual recibe los datos iniciales y el contexto de usuario.
 * - Invoca directamente las Server Actions del namespace `admin` (`admin.deleteSiteAsAdminAction`).
 * - Utiliza componentes de UI genéricos (`Card`, `Button`, `Dialog`, `PaginationControls`).
 * @expectations
 * - Se espera que este aparato sea robusto en el manejo de operaciones sensibles. Debe proporcionar una experiencia de usuario clara y segura, con feedback apropiado para las acciones críticas.
 */
// Ruta: app/[locale]/admin/admin-client.tsx
/* MEJORAS FUTURAS DETECTADAS
 * 1. Acciones de Suplantación (Impersonation): Integrar la acción `admin.impersonateUserAction` en la UI del `dev-console` para permitir a los desarrolladores iniciar sesión como otros usuarios para depuración.
 * 2. Indicador de Página Numérico: Mejorar el componente de paginación para mostrar números de página (ej. "1, 2, 3 ... 10"), permitiendo al usuario saltar directamente a una página específica.
 * 3. Búsqueda y Filtros del Lado del Servidor: Añadir un campo de búsqueda en el `DashboardHeader` que pase un parámetro en la URL para que la función `getAllSites` en `admin/page.tsx` filtre los resultados en la base de datos.
 */
