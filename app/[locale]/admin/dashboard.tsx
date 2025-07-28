// Ruta: app/[locale]/admin/dashboard.tsx
/**
 * @file Componente Cliente del Dashboard de Administración
 * @description Interfaz para la administración de sitios, con paginación y
 *              estado de carga individual para una mejor experiencia de usuario.
 * REFACTORIZACIÓN DE TIPOS: Se ha corregido la ruta de importación del tipo
 * `ActionResult` para que apunte al módulo de esquemas centralizado.
 *
 * @author Metashark
 * @version 6.1.0 (Shared Type Import Fix)
 */

"use client";

import { deleteSiteAsAdminAction } from "@/app/actions/admin.actions";
import { signOutAction } from "@/app/actions/auth.actions";
import { type ActionResult } from "@/app/actions/schemas"; // <-- CORRECCIÓN
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
import { protocol, rootDomain } from "@/lib/utils";
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
import { useFormatter, useTranslations } from "next-intl";
import Link from "next/link";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";

/**
 * @typedef {object} TransformedSite
 * @description Define la estructura de datos simplificada para un sitio en la UI.
 */
type TransformedSite = {
  subdomain: string;
  icon: string | null;
  createdAt: number;
};

// --- SUB-COMPONENTES ---

/**
 * @description Encabezado del dashboard de administración.
 * @param {{ user: User }} props - Propiedades del componente.
 * @returns {JSX.Element}
 */
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
        <form action={signOutAction}>
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
 * @description Modal de confirmación para eliminar un sitio.
 * @param {{ site: TransformedSite, onDelete: (formData: FormData) => void, isPending: boolean }} props
 * @returns {JSX.Element}
 */
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
  const t = useTranslations("AdminDashboard");

  const formAction = (formData: FormData) => {
    onDelete(formData);
  };

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
        <form action={formAction}>
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

/**
 * @description Controles de paginación para la lista de sitios.
 * @param {{ page: number, totalCount: number, limit: number }} props
 * @returns {JSX.Element | null}
 */
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

// --- COMPONENTE PRINCIPAL ---

/**
 * @description Componente principal que renderiza el dashboard de administración.
 * @param {{ sites: TransformedSite[], user: User, totalCount: number, page: number, limit: number }} props
 * @returns {JSX.Element}
 */
export function AdminDashboard({
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

    startTransition(async () => {
      const result: ActionResult<{ message: string }> =
        await deleteSiteAsAdminAction(formData);
      if (result.success && result.data?.message) {
        toast.success(result.data.message);
      } else if (!result.success && result.error) {
        toast.error(result.error);
      }
      setDeletingSiteId(null);
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
            <p className="mt-2 text-muted-foreground">
              Cuando los usuarios creen sitios, aparecerán aquí para su gestión.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

/* MEJORAS FUTURAS DETECTADAS
 * 1. Acciones de Suplantación (Impersonation): Para soporte avanzado, un administrador (`developer`) podría tener un botón para "Iniciar sesión como propietario", lo cual requeriría una Server Action y una función avanzada de Supabase Auth para generar un token de sesión para otro usuario.
 * 2. Indicador de Página Numérico: El componente de paginación podría mejorarse para mostrar números de página (ej. "1, 2, 3 ... 10"), permitiendo al usuario saltar directamente a una página específica.
 * 3. Búsqueda y Filtros: Añadir un campo de búsqueda en el `DashboardHeader` para filtrar sitios por subdominio. Esto requeriría modificar la capa de acceso a datos para aceptar un parámetro de búsqueda.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Acciones de Suplantación (Impersonation): Integrar la acción `admin.impersonateUserAction` en la UI del `dev-console` para permitir a los desarrolladores iniciar sesión como otros usuarios para depuración.
 * 2. Indicador de Página Numérico: Mejorar el componente de paginación para mostrar números de página (ej. "1, 2, 3 ... 10"), permitiendo al usuario saltar directamente a una página específica.
 * 3. Búsqueda y Filtros del Lado del Servidor: Añadir un campo de búsqueda en el `DashboardHeader` que pase un parámetro en la URL para que la función `getAllSites` en `admin/page.tsx` filtre los resultados en la base de datos.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Acciones de Suplantación (Impersonation): Para soporte avanzado, un administrador (`developer`) podría tener un botón para "Iniciar sesión como propietario", lo cual requeriría una Server Action y una función avanzada de Supabase Auth para generar un token de sesión para otro usuario. Esta acción ya existe (`admin.impersonateUserAction`) pero necesita ser integrada en la UI.
 * 2. Indicador de Página Numérico: El componente de paginación podría mejorarse para mostrar números de página (ej. "1, 2, 3 ... 10"), permitiendo al usuario saltar directamente a una página específica, lo cual es crucial para la usabilidad con grandes volúmenes de datos.
 * 3. Búsqueda y Filtros del Lado del Servidor: Añadir un campo de búsqueda en el `DashboardHeader` para filtrar sitios por subdominio. Para que sea escalable, la búsqueda debería pasar un parámetro en la URL (ej. `?q=search-term`) que sea utilizado por la función `getAllSites` en `admin/page.tsx` para filtrar los resultados directamente en la consulta de la base de datos.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Acciones de Suplantación (Impersonation): Para soporte avanzado, un administrador (`developer`) podría tener un botón para "Iniciar sesión como propietario", lo cual requeriría una Server Action y una función avanzada de Supabase Auth para generar un token de sesión para otro usuario.
 * 2. Indicador de Página Numérico: El componente de paginación podría mejorarse para mostrar números de página (ej. "1, 2, 3 ... 10"), permitiendo al usuario saltar directamente a una página específica.
 * 3. Búsqueda y Filtros: Añadir un campo de búsqueda en el `DashboardHeader` para filtrar sitios por subdominio. Esto requeriría modificar la capa de acceso a datos para aceptar un parámetro de búsqueda.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Acciones de Suplantación (Impersonation): Para soporte avanzado, un administrador (`developer`) podría tener un botón para "Iniciar sesión como propietario", lo cual requeriría una Server Action y una función avanzada de Supabase Auth para generar un token de sesión para otro usuario.
 * 2. Indicador de Página Numérico: El componente de paginación podría mejorarse para mostrar números de página (ej. "1, 2, 3 ... 10"), permitiendo al usuario saltar directamente a una página específica.
 * 3. Búsqueda y Filtros: Añadir un campo de búsqueda en el `DashboardHeader` para filtrar sitios por subdominio. Esto requeriría modificar la capa de acceso a datos para aceptar un parámetro de búsqueda.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Estado de Carga por Tarjeta: En lugar de un estado `isPending` global, se podría gestionar un estado de carga por cada sitio individualmente (ej. `useState<Record<string, boolean>>({})`). Esto permitiría mostrar el spinner solo en el botón de la tarjeta que se está eliminando.
 * 2. Acciones de Suplantación (Impersonation): Para soporte avanzado, un administrador (`developer`) podría tener un botón para "Iniciar sesión como propietario", lo cual requeriría una Server Action y una función avanzada de Supabase Auth para generar un token de sesión para otro usuario.
 * 3. Indicador de Página Numérico: El componente de paginación podría mejorarse para mostrar números de página (ej. "1, 2, 3 ... 10"), permitiendo al usuario saltar directamente a una página específica.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Paginación: Si la lista de sitios crece, esta página se volverá lenta. Implementar paginación (pasando `page` y `limit` a una función `getAllSites` actualizada) es crucial para la escalabilidad.
 * 2. Búsqueda y Filtros: Añadir un campo de búsqueda en el `DashboardHeader` para filtrar sitios por subdominio. Esto requeriría modificar la capa de acceso a datos para aceptar un parámetro de búsqueda.
 * 3. Estado de Carga por Tarjeta: En lugar de un estado `isPending` global, se podría gestionar un estado de carga por cada sitio individualmente (ej. `useState<Record<string, boolean>>({})`). Esto permitiría mostrar el spinner solo en el botón de la tarjeta que se está eliminando.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Estado de Carga por Tarjeta: En lugar de un estado `isPending` global, se podría gestionar un estado de carga por cada sitio individualmente (ej. `useState<Record<string, boolean>>({})`). Esto permitiría mostrar el spinner solo en el botón de la tarjeta que se está eliminando.
 * 2. Acciones de Suplantación (Impersonation): Para soporte avanzado, un administrador (`developer`) podría tener un botón para "Iniciar sesión como propietario", lo cual requeriría una Server Action y una función avanzada de Supabase Auth para generar un token de sesión para otro usuario.
 * 3. Indicador de Página Numérico: El componente de paginación podría mejorarse para mostrar números de página (ej. "1, 2, 3 ... 10"), permitiendo al usuario saltar directamente a una página específica.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Estado de Carga por Tarjeta: En lugar de un estado `isPending` global, se podría gestionar un estado de carga por cada sitio (ej. `useState<Record<string, boolean>>({})`). Esto permitiría mostrar el spinner solo en el botón de la tarjeta que se está eliminando.
 * 2. Acciones de Suplantación (Impersonation): Para soporte avanzado, un administrador (`developer`) podría tener un botón para "Iniciar sesión como propietario", lo cual requeriría una Server Action y una función avanzada de Supabase Auth para generar un token de sesión para otro usuario.
 * 3. Indicador de Página Numérico: El componente de paginación podría mejorarse para mostrar números de página (ej. "1, 2, 3 ... 10"), permitiendo al usuario saltar directamente a una página específica.
 * 1. **Paginación:** Si la lista de sitios crece, esta página se volverá lenta. Implementar paginación en la función `getAllSites` del backend y añadir controles de paginación en la UI del `AdminDashboard` es crucial para la escalabilidad.
 * 2. **Búsqueda y Filtros:** Añadir un campo de búsqueda en el `DashboardHeader` para filtrar sitios por subdominio. Esto requeriría modificar `getAllSites` para aceptar un parámetro de búsqueda y pasarlo a la consulta de Supabase.
 * 3. **Estado de Carga por Tarjeta:** En lugar de un estado `isPending` global, se podría gestionar un estado de carga por cada sitio individualmente (ej. `useState<Record<string, boolean>>({})`). Esto permitiría mostrar el spinner solo en el botón de la tarjeta que se está eliminando.
 * 4. **Acciones de Suplantación (Impersonation):** Para soporte avanzado, un administrador (`developer`) podría tener un botón para "Iniciar sesión como propietario", lo cual requeriría una Server Action y una función avanzada de Supabase Auth para generar un token de sesión para otro usuario.
 */
/* MEJORAS PROPUESTAS
 * 1. **Paginación:** Si la lista de sitios crece, esta página se volverá lenta. Implementar paginación en `getAllSites` es crucial para la escalabilidad.
 * 2. **Búsqueda y Filtros:** Añadir un campo de búsqueda en el `DashboardHeader` para filtrar sitios por subdominio o email del propietario.
 * 3. **Acciones de Suplantación (Impersonation):** Para soporte avanzado, un `developer` podría tener un botón para "Iniciar sesión como propietario" para depurar problemas.
 * 1. **Paginación:** Si la lista de sitios crece, esta página se volverá lenta. Implementar paginación en `getAllSites` es crucial para la escalabilidad.
 * 2. **Búsqueda y Filtros:** Añadir un campo de búsqueda en el `DashboardHeader` para filtrar sitios por subdominio o email del propietario.
 * 3. **Acciones de Suplantación (Impersonation):** Para soporte avanzado, un `developer` podría tener un botón para "Iniciar sesión como propietario" para depurar problemas.

 * 1. **Paginación:** Implementar paginación en `getAllSites` para escalar a miles de sitios.
 * 2. **Búsqueda y Filtros:** Añadir un campo de búsqueda en el `DashboardHeader` para filtrar sitios por subdominio o email del propietario.
 * 3. **Acciones de Suplantación (Impersonation):** Para soporte avanzado, un `developer` podría tener un botón para "Iniciar sesión como propietario" para depurar problemas.
 * 1. **Paginación:** Implementar paginación en `getAllSites` para escalar a miles de sitios.
 * 2. **Búsqueda y Filtros:** Añadir un campo de búsqueda en el `DashboardHeader` para filtrar sitios por subdominio o email del propietario.
 * 3. **Acciones de Suplantación (Impersonation):** Para soporte avanzado, un `developer` podría tener un botón para "Iniciar sesión como propietario" para depurar problemas.

 * 1. **Paginación:** Si la lista de sitios crece, esta página se volverá lenta. Implementar paginación (pasando `page` y `limit` a `getAllSites`) es crucial para la escalabilidad.
 * 2. **Búsqueda y Filtros:** Añadir un campo de búsqueda en el `DashboardHeader` para filtrar sitios por subdominio o email del propietario.
 * 3. **Acciones de Suplantación (Impersonation):** Para soporte avanzado, un `developer` podría tener un botón para "Iniciar sesión como propietario", generando una sesión temporal con los permisos del usuario para depurar problemas.
 * 1. **Paginación:** Si la lista de tenants crece, esta página se volverá lenta. Implementar paginación (pasando `page` y `limit` a `getAllTenants`) es crucial para la escalabilidad.
 * 2. **Búsqueda y Filtros:** Añadir un campo de búsqueda en el `DashboardHeader` para filtrar tenants por subdominio o email del propietario (requeriría un `join` en la consulta de la base de datos).
 * 3. **Acciones de Suplantación (Impersonation):** Para un soporte de alto nivel, un rol `developer` podría tener un botón para "Iniciar sesión como este usuario", que genere una sesión temporal con los permisos del propietario del tenant. Esto es una funcionalidad avanzada pero muy potente.
 * 1. **Paginación:** Si la lista de tenants crece, esta página se volverá lenta. Implementar paginación (pasando `page` y `limit` a `getAllTenants`) es crucial para la escalabilidad.
 * 2. **Búsqueda y Filtros:** Añadir un campo de búsqueda en el `DashboardHeader` para filtrar tenants por subdominio o email del propietario (requeriría un `join` en la consulta de la base de datos).
 * 3. **Acciones de Suplantación (Impersonation):** Para un soporte de alto nivel, un rol `developer` podría tener un botón para "Iniciar sesión como este usuario", que genere una sesión temporal con los permisos del propietario del tenant. Esto es una funcionalidad avanzada pero muy potente.
 * 1. **Componente de Notificaciones (Toast):** Reemplazar los `div` fijos de éxito/error por un sistema de notificaciones "toast" más robusto y estético, como `react-hot-toast` o el componente Toast de Shadcn/UI.
 * 2. **Búsqueda y Filtros:** Añadir un campo de búsqueda y filtros (ej. por fecha de creación) en el `DashboardHeader` para gestionar la `TenantGrid`.
 * 3. **Confirmación de Borrado:** Al hacer clic en el botón de eliminar, mostrar un modal de confirmación (`Dialog` de Shadcn/UI) para prevenir borrados accidentales.
 */
