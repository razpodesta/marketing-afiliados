// app/[locale]/dashboard/dashboard-client.tsx
/**
 * @file Subscriber Dashboard Client Component
 * @description Renderiza la UI interactiva del dashboard, incluyendo la lista de los tenants
 * del propio usuario y el formulario para crear nuevos. Refactorizado para
 * `useState` + `useTransition` y con modal de confirmación.
 *
 * @author Metashark
 * @version 2.0.0 (React 18 Compatibility & Confirmation Dialog)
 */
"use client";

import type { Session } from "next-auth";
import { useState, useTransition, type FormEvent } from "react";
import { useFormatter } from "next-intl";
import toast from "react-hot-toast";
import {
  Trash2,
  Loader2,
  PlusCircle,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";

import { type Tenant } from "@/lib/platform/tenants";
import { deleteTenantAction } from "@/app/actions";
import { protocol, rootDomain } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SubdomainForm } from "@/app/subdomain-form";

type ActionState = {
  error?: string;
  success?: string;
};

/**
 * @description Componente reutilizado del admin dashboard para la lógica de eliminación.
 */
function DeleteTenantDialog({
  tenant,
  onDelete,
  isPending,
}: {
  tenant: Tenant;
  onDelete: (formData: FormData) => void;
  isPending: boolean;
}) {
  return (
    <Dialog>
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
            y todas sus campañas asociadas serán eliminados permanentemente.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <form
            action={() =>
              onDelete(
                new FormData(
                  document.getElementById(
                    `delete-form-${tenant.subdomain}`
                  ) as HTMLFormElement
                )
              )
            }
            id={`delete-form-${tenant.subdomain}`}
          >
            <input type="hidden" name="subdomain" value={tenant.subdomain} />
            <Button variant="destructive" type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sí, eliminar mi sitio
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * @description Muestra una cuadrícula con los tenants (sitios) del usuario.
 */
function UserTenantGrid({ tenants }: { tenants: Tenant[] }) {
  const [state, setState] = useState<ActionState>({});
  const [isPending, startTransition] = useTransition();
  const format = useFormatter();

  const handleDelete = (formData: FormData) => {
    startTransition(async () => {
      const result = await deleteTenantAction(state, formData);
      if (result.success) {
        toast.success(result.success);
      } else if (result.error) {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {tenants.map((tenant) => (
        <Card key={tenant.subdomain}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle>{tenant.subdomain}</CardTitle>
                <CardDescription>
                  Creado:{" "}
                  {format.dateTime(new Date(tenant.created_at), "short")}
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
                Visitar Sitio
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
  );
}

/**
 * @description Componente principal del dashboard del suscriptor.
 */
export function DashboardClient({
  session,
  initialTenants,
}: {
  session: Session;
  initialTenants: Tenant[];
}) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Mis Sitios</h1>
        <p className="text-gray-500">
          Gestiona tus sitios y las campañas de marketing asociadas a cada uno.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {initialTenants.length > 0 ? (
            <UserTenantGrid tenants={initialTenants} />
          ) : (
            <Card className="flex h-full flex-col items-center justify-center p-8 text-center">
              <h3 className="text-xl font-semibold">Aún no tienes sitios</h3>
              <p className="mt-2 text-gray-500">
                Usa el formulario de la derecha para crear tu primer sitio y
                empezar a construir campañas.
              </p>
            </Card>
          )}
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5" />
                Crear Nuevo Sitio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SubdomainForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* MEJORAS PROPUESTAS
 * 1. **Botón "Gestionar Campañas":** Cada `Card` de tenant debería tener un botón principal que lleve a una nueva página, como `/dashboard/sites/[subdomain]`, donde el usuario pueda ver y gestionar la lista de campañas específicas de ese sitio.
 * 2. **Actualización Optimista de la UI:** Al crear o eliminar un tenant, se podría actualizar la UI localmente de inmediato (antes de que el servidor responda) para una experiencia de usuario más rápida, y luego revertir el cambio si la acción del servidor falla. Esto requiere un manejo de estado más avanzado pero mejora mucho la UX.
 * 3. **Estado de Carga por Tarjeta:** Actualmente, al eliminar un tenant, todos los botones de "Eliminar" se desactivan. La lógica se podría refinar para que solo el botón del tenant que se está eliminando muestre el estado de carga, pasando el `subdomain` específico a la transición.
 * 1. **Lista de Campañas Real:** Reemplazar el `placeholder` de `campaigns` con una llamada de datos real. El `page.tsx` debería cargar las campañas y pasarlas como prop.
 * 2. **Componente `CampaignCard`:** Crear un componente dedicado para mostrar la información de cada campaña en la cuadrícula, incluyendo un resumen de estadísticas y botones de acción (Editar, Ver, Analíticas).
 * 1. **Modal de Confirmación para Eliminar:** En lugar de una eliminación directa, el botón "Eliminar" debería abrir un componente `<Dialog>` pidiendo al usuario que confirme la acción para prevenir borrados accidentales.
 * 2. **Actualización Optimista de la UI:** Al crear o eliminar un tenant, se podría actualizar la UI localmente de inmediato (antes de que el servidor responda) para una experiencia de usuario más rápida, y luego revertir el cambio si la acción del servidor falla.
 * 3. **Componente de Layout:** Extraer la estructura de la página (el `div` contenedor principal) a un `app/[locale]/dashboard/layout.tsx` para añadir una barra de navegación lateral y un encabezado consistentes.
 */
