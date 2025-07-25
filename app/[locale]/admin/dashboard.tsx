// app/[locale]/admin/dashboard.tsx
/**
 * @file Admin Dashboard Client Component
 * @description Interfaz principal para la administración de todos los tenants de la plataforma.
 * Utiliza el patrón `useState` + `useTransition` y un modal de confirmación para borrados.
 *
 * @author Metashark
 * @version 2.2.0 (Final React 18 Pattern)
 */
"use client";

import {
  ExternalLink,
  Loader2,
  LogOut,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import type { Session } from "next-auth";
import { useFormatter, useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";

import { deleteTenantAsAdminAction, logout } from "@/app/actions";
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

// Este tipo se ajusta a los datos transformados que le pasará el Server Component
type TransformedTenant = {
  subdomain: string;
  icon: string;
  createdAt: number; // Esperamos un timestamp numérico
};

type ActionState = {
  error?: string;
  success?: string;
};

/**
 * @description Cabecera del dashboard que muestra información del usuario y acciones.
 */
function DashboardHeader({ session }: { session: Session }) {
  const t = useTranslations("AdminDashboard");
  const username = session.user?.name || "User";

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
        <form action={logout}>
          <Button variant="outline" size="sm" type="submit">
            <LogOut className="mr-2 h-4 w-4" />
            {t("signOutButton")}
          </Button>
        </form>
      </div>
    </div>
  );
}

/**
 * @description Componente que maneja la lógica de eliminación con un modal de confirmación.
 */
function DeleteTenantDialog({
  tenant,
  onDelete,
  isPending,
}: {
  tenant: TransformedTenant;
  onDelete: (formData: FormData) => void;
  isPending: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const formAction = () => {
    const formData = new FormData();
    formData.append("subdomain", tenant.subdomain);
    onDelete(formData);
    setIsOpen(false); // Cierra el modal al confirmar
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
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-red-600" />
            ¿Estás seguro?
          </DialogTitle>
          <DialogDescription>
            Esta acción es irreversible. El sitio{" "}
            <strong className="font-medium text-gray-900">
              {tenant.subdomain}
            </strong>{" "}
            y todos sus datos asociados serán eliminados permanentemente.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <form action={formAction}>
            <Button variant="destructive" type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sí, eliminar sitio
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * @description Componente principal del dashboard de administración.
 */
export function AdminDashboard({
  tenants,
  session,
}: {
  tenants: TransformedTenant[];
  session: Session;
}) {
  const [state, setState] = useState<ActionState>({});
  const [isPending, startTransition] = useTransition();
  const format = useFormatter();
  const t = useTranslations("AdminDashboard");

  const handleDelete = (formData: FormData) => {
    startTransition(async () => {
      const result = await deleteTenantAsAdminAction(state, formData);
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
        <DashboardHeader session={session} />
        {tenants.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tenants.map((tenant) => (
              <Card key={tenant.subdomain}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle>{tenant.subdomain}</CardTitle>
                      <CardDescription>
                        {t("created")}:{" "}
                        {format.dateTime(new Date(tenant.createdAt), "short")}
                      </CardDescription>
                    </div>
                    <div className="text-4xl">{tenant.icon}</div>
                  </div>
                </CardHeader>
                <CardFooter className="justify-between">
                  <a
                    href={`${protocol}://${tenant.subdomain}.${rootDomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      {t("visitSubdomain")}
                    </Button>
                  </a>
                  <DeleteTenantDialog
                    tenant={tenant}
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
