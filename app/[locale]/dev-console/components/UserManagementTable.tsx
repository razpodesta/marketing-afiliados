// Ruta: app/[locale]/dev-console/components/UserManagementTable.tsx
/**
 * @file UserManagementTable.tsx
 * @description Componente de cliente para mostrar, buscar, filtrar y gestionar usuarios y sus roles.
 *              Refactorizado para manejar de forma segura el contrato de tipo `ActionResult`.
 * @author RaZ Podestá & L.I.A Legacy
 * @version 5.4.0 (Type-Safe Action Result Handling)
 */
"use client";

import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { admin as adminActions } from "@/lib/actions";
import type { Database, Tables } from "@/lib/types/database";

type ProfileRow = Tables<"user_profiles_with_email">;

const ImpersonationDialog = ({ profile }: { profile: ProfileRow }) => {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const handleImpersonate = () => {
    if (!profile.id) return;
    startTransition(async () => {
      const result = await adminActions.impersonateUserAction(profile.id!);

      // REFACTORIZACIÓN: Usar type narrowing para manejar la unión discriminada de forma segura.
      if (result.success) {
        toast.success(
          "Enlace de inicio de sesión generado. Abriendo en una nueva pestaña..."
        );
        window.open(result.data.signInLink, "_blank");
        setIsOpen(false);
      } else {
        // En esta rama, TypeScript sabe que `result` tiene la propiedad `error`.
        toast.error(
          result.error || "No se pudo generar el enlace de suplantación."
        );
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Suplantar usuario">
          <UserCog className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Suplantar Usuario</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que quieres iniciar sesión como{" "}
            <strong className="text-foreground">{profile.email}</strong>? Serás
            redirigido en una nueva pestaña.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleImpersonate} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sí, suplantar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface PaginationControlsProps {
  page: number;
  totalCount: number;
  limit: number;
}

const PaginationControls = ({
  page,
  totalCount,
  limit,
}: PaginationControlsProps) => {
  const totalPages = Math.ceil(totalCount / limit);
  const hasPreviousPage = page > 1;
  const hasNextPage = page < totalPages;
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalCount);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4 px-4 pb-4">
      <p className="text-sm text-muted-foreground">
        Mostrando {startItem}-{endItem} de {totalCount} usuarios
      </p>
      <div className="flex items-center gap-2">
        <Button asChild variant="outline" disabled={!hasPreviousPage}>
          <Link href={`/dev-console/users?page=${page - 1}`}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" disabled={!hasNextPage}>
          <Link href={`/dev-console/users?page=${page + 1}`}>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

interface TableToolbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const TableToolbar = ({ searchQuery, setSearchQuery }: TableToolbarProps) => {
  return (
    <div className="flex items-center p-4 border-b">
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por email o nombre..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
};

export function UserManagementTable({
  profiles,
  totalCount,
  page,
  limit,
}: {
  profiles: ProfileRow[];
  totalCount: number;
  page: number;
  limit: number;
}) {
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProfiles = useMemo(() => {
    if (!searchQuery) {
      return profiles;
    }
    return profiles.filter(
      (profile) =>
        profile.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [profiles, searchQuery]);

  const handleRoleChange = (
    userId: string,
    newRole: Database["public"]["Enums"]["app_role"]
  ) => {
    startTransition(async () => {
      const result = await adminActions.updateUserRoleAction(userId, newRole);
      if (result.success) {
        toast.success(`Rol actualizado para el usuario.`);
      } else {
        toast.error(result.error || "No se pudo actualizar el rol.");
      }
    });
  };

  return (
    <Card>
      <TableToolbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email / User ID</TableHead>
            <TableHead>Full Name</TableHead>
            <TableHead className="w-[180px]">Role</TableHead>
            <TableHead className="text-right w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredProfiles.length > 0 ? (
            filteredProfiles.map((profile) => (
              <TableRow key={profile.id}>
                <TableCell>
                  <div className="font-medium">{profile.email || "N/A"}</div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {profile.id}
                  </div>
                </TableCell>
                <TableCell>{profile.full_name || "N/A"}</TableCell>
                <TableCell>
                  <Select
                    defaultValue={profile.app_role!}
                    onValueChange={(value) =>
                      handleRoleChange(
                        profile.id!,
                        value as Database["public"]["Enums"]["app_role"]
                      )
                    }
                    disabled={isPending}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="developer">Developer</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                  <ImpersonationDialog profile={profile} />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                No se encontraron usuarios que coincidan con la búsqueda.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {!searchQuery && (
        <PaginationControls page={page} totalCount={totalCount} limit={limit} />
      )}
    </Card>
  );
}

/*
 * =================================================================================================
 *                                   L.I.A. LOGIC ANALYSIS
 * =================================================================================================
 * @fileoverview El aparato `UserManagementTable.tsx` es una herramienta de administración crítica
 *               para los desarrolladores.
 *
 * @functionality
 * - Muestra una lista paginada de todos los usuarios de la plataforma.
 * - Permite la búsqueda y filtrado de usuarios en el lado del cliente.
 * - Permite a los desarrolladores cambiar el `app_role` de un usuario directamente desde la UI.
 * - Proporciona una funcionalidad de "suplantación" para que los desarrolladores puedan
 *   iniciar sesión como otro usuario para depurar problemas.
 * - **Manejo de Resultados de Acción (Refactorización Clave):** La lógica para manejar la
 *   respuesta de `impersonateUserAction` ha sido refactorizada para usar un patrón de
 *   "estrechamiento de tipos" (type narrowing). Al comprobar `if (result.success)`, se
 *   le indica al compilador de TypeScript la forma exacta del objeto `result` dentro
 *   de cada rama del condicional, resolviendo el error de tipo `TS2339` y garantizando
 *   un manejo de errores y éxitos seguro y robusto.
 *
 * @relationships
 * - Es el componente hijo principal de `app/[locale]/dev-console/users/page.tsx`.
 * - Invoca Server Actions del namespace `admin` (`admin.actions.ts`) para realizar
 *   operaciones con privilegios elevados.
 * - Depende de los tipos de la base de datos, específicamente de la vista `user_profiles_with_email`.
 *
 * @expectations
 * - Se espera que este componente sea una herramienta fiable y segura. Debe proporcionar un
 *   feedback claro al desarrollador sobre el resultado de sus acciones y manejar de forma
 *   segura las operaciones de alto privilegio. Con la refactorización, ahora cumple
 *   plenamente con el contrato de tipo `ActionResult`.
 * =================================================================================================
 */

/*
 * f. [Mejoras Futuras Detectadas]
 * 1.  **Búsqueda en Servidor:** Para escalar a miles de usuarios, el filtrado debe realizarse en la base de datos, pasando `searchQuery` como parámetro en la URL a `users/page.tsx`, que a su vez lo pasaría a la capa de datos.
 * 2.  **Abstracción de Componentes de UI:** Los subcomponentes `PaginationControls` y `TableToolbar` son patrones de UI altamente reutilizables. Podrían ser movidos a un directorio `components/shared` para ser utilizados en otras tablas de datos de la aplicación.
 * 3.  **Ordenamiento de Columnas:** Añadir la capacidad de hacer clic en las cabeceras de la tabla (`TableHead`) para ordenar la lista de usuarios por email, nombre o rol. Esto implicaría pasar parámetros de orden a la consulta de la base de datos en `users/page.tsx`.
 */
