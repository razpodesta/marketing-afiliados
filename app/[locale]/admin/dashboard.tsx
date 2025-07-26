// app/[locale]/admin/dashboard.tsx
/**
 * @file Componente Cliente del Dashboard de Administración
 * @description Interfaz para la administración de todos los sitios de la plataforma.
 * Ha sido refactorizado para ser totalmente compatible con Supabase Auth,
 * utilizando el objeto `User` de Supabase y la `signOutAction` nativa.
 *
 * @author Metashark
 * @version 3.0.0 (Supabase Auth Integration)
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
import { useState, useTransition } from "react";
import toast from "react-hot-toast";

import { deleteSiteAsAdminAction, signOutAction } from "@/app/actions";
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

/**
 * @description Tipo para los datos de sitios transformados para la visualización en el cliente.
 */
type TransformedSite = {
  subdomain: string;
  icon: string | null;
  createdAt: number;
};

/**
 * @description Renderiza el encabezado del dashboard, mostrando el título,
 * mensaje de bienvenida y botón de cierre de sesión.
 * @param {object} props - Propiedades del componente.
 * @param {User} props.user - El objeto de usuario autenticado de Supabase.
 */
const DashboardHeader = ({ user }: { user: User }) => {
  const t = useTranslations("AdminDashboard");
  // Obtenemos el nombre de los metadatos del usuario de Supabase, con un fallback a su email.
  const username = user.user_metadata?.full_name || user.email || "Admin";

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold">{t("headerTitle")}</h1>
        <p className="text-gray-500">
          Vista global de todos los sitios en la plataforma.
        </p>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
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
 * @description Renderiza un diálogo de confirmación para eliminar un sitio.
 * @param {object} props - Propiedades del componente.
 * @param {TransformedSite} props.site - El sitio a eliminar.
 * @param {(formData: FormData) => void} props.onDelete - La función a llamar al confirmar.
 * @param {boolean} props.isPending - Estado de la transición para mostrar el loader.
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

  const formAction = (formData: FormData) => {
    onDelete(formData);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-600 hover:bg-red-50 hover:text-red-700"
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
              <strong className="font-medium text-gray-900">
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
 * @description Componente principal del dashboard de administración.
 * @param {object} props - Propiedades del componente.
 * @param {TransformedSite[]} props.sites - Lista de sitios a mostrar.
 * @param {User} props.user - El objeto de usuario autenticado de Supabase.
 */
export function AdminDashboard({
  sites,
  user,
}: {
  sites: TransformedSite[];
  user: User;
}) {
  const [isPending, startTransition] = useTransition();
  const format = useFormatter();
  const t = useTranslations("AdminDashboard");

  const handleDelete = (formData: FormData) => {
    startTransition(async () => {
      const result = await deleteSiteAsAdminAction(formData);
      if (result.success) {
        toast.success(result.success);
      } else if (result.error) {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mx-auto w-full max-w-7xl">
        <DashboardHeader user={user} />
        {sites.length > 0 ? (
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
                  <a
                    href={`${protocol}://${site.subdomain}.${rootDomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      {t("visitSubdomain")}
                    </Button>
                  </a>
                  <DeleteSiteDialog
                    site={site}
                    onDelete={handleDelete}
                    isPending={isPending}
                  />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="flex h-64 flex-col items-center justify-center p-8 text-center">
            <h3 className="text-xl font-semibold">{t("noSubdomains")}</h3>
            <p className="mt-2 text-gray-500">
              Cuando los usuarios creen sitios, aparecerán aquí para su gestión.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

/* MEJORAS PROPUESTAS
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
