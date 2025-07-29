// app/[locale]/dev-console/components/UserManagementTable.tsx
"use client";

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

/**
 * @file UserManagementTable.tsx
 * @description Componente de cliente para mostrar, buscar, filtrar y gestionar usuarios y sus roles.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 5.1.0 (Architectural Alignment)
 */

/**
 * @typedef {object} ProfileRow
 * @description El tipo de datos para un usuario en la tabla. Utiliza la vista `user_profiles_with_email`.
 */
type ProfileRow = Tables<"user_profiles_with_email">;

/**
 * @description Modal para confirmar y ejecutar la suplantación de usuario.
 */
const ImpersonationDialog = ({ profile }: { profile: ProfileRow }) => {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const handleImpersonate = () => {
    if (!profile.id) return;
    startTransition(async () => {
      const result = await adminActions.impersonateUserAction(profile.id!);
      if (result.success && result.data) {
        toast.success(
          "Enlace de inicio de sesión generado. Abriendo en una nueva pestaña..."
        );
        window.open(result.data.signInLink, "_blank");
        setIsOpen(false);
      } else {
        toast.error(result.error);
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

/**
 * @description Controles de paginación para la tabla de usuarios.
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

/**
 * @description Barra de herramientas para la tabla, incluyendo el campo de búsqueda.
 */
const TableToolbar = ({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}) => {
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
        toast.error(result.error);
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

/* MEJORAS FUTURAS DETECTADAS
 * 1. Búsqueda del Lado del Servidor: Para escalar a miles de usuarios, el filtrado debe realizarse en la base de datos. Esto implicaría pasar el `searchQuery` como un parámetro en la URL y modificar la consulta en `users/page.tsx` para usar `.ilike()` en la vista.
 * 2. Edición en Línea (Inline Editing): Permitir editar el `full_name` directamente en la tabla, mostrando un campo de texto al hacer clic y una Server Action para guardar el cambio.
 * 3. Logging de Auditoría para Acciones de Admin: Cada cambio de rol o suplantación debería registrarse en una tabla `audit_logs` con información sobre qué administrador realizó la acción, sobre qué usuario y cuándo.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Búsqueda del Lado del Servidor: Para escalar a miles de usuarios, el filtrado debe realizarse en la base de datos. Esto implicaría pasar el `searchQuery` como un parámetro en la URL y modificar la consulta en `users/page.tsx` para usar `.ilike()` en la vista.
 * 2. Edición en Línea (Inline Editing): Permitir editar el `full_name` directamente en la tabla, mostrando un campo de texto al hacer clic y una Server Action para guardar el cambio.
 * 3. Logging de Auditoría para Acciones de Admin: Cada cambio de rol o suplantación debería registrarse en una tabla `audit_logs` con información sobre qué administrador realizó la acción, sobre qué usuario y cuándo.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Búsqueda del Lado del Servidor: Para escalar a miles de usuarios, el filtrado debe realizarse en la base de datos. Esto implicaría pasar el `searchQuery` como un parámetro en la URL y modificar la consulta en `users/page.tsx` para usar `.ilike()` en la vista.
 * 2. Edición en Línea (Inline Editing): Permitir editar el `full_name` directamente en la tabla, mostrando un campo de texto al hacer clic y una Server Action para guardar el cambio.
 * 3. Logging de Auditoría para Acciones de Admin: Cada cambio de rol o suplantación debería registrarse en una tabla `audit_logs` con información sobre qué administrador realizó la acción, sobre qué usuario y cuándo.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Búsqueda del Lado del Servidor: Para escalar a miles de usuarios, el filtrado debe realizarse en la base de datos. Esto implicaría pasar el `searchQuery` como un parámetro en la URL y modificar la consulta en `users/page.tsx` para usar `.ilike()` en la vista.
 * 2. Edición en Línea (Inline Editing): Permitir editar el `full_name` directamente en la tabla, mostrando un campo de texto al hacer clic y una Server Action para guardar el cambio.
 * 3. Logging de Auditoría para Acciones de Admin: Cada cambio de rol o suplantación debería registrarse en una tabla `audit_logs` con información sobre qué administrador realizó la acción, sobre qué usuario y cuándo.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Acción de Suplantación (Impersonation): Añadir un botón de acción en cada fila que permita a un `developer` iniciar sesión temporalmente como ese usuario para depurar problemas, utilizando una Server Action y funciones avanzadas de Supabase Auth.
 * 2. Búsqueda del Lado del Servidor (Server-Side Search): Para escalar a miles de usuarios, el filtrado debe realizarse en la base de datos. Esto implicaría pasar el `searchQuery` como un parámetro de búsqueda en la URL y modificar la consulta de Supabase en `users/page.tsx` para usar `.ilike()`.
 * 3. Edición en Línea (Inline Editing): Para cambios rápidos, se podría permitir editar el `full_name` directamente en la tabla, mostrando un campo de texto al hacer clic y una Server Action para guardar el cambio.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Acción de Suplantación (Impersonation): Añadir un botón de acción en cada fila que permita a un `developer` iniciar sesión temporalmente como ese usuario para depurar problemas, utilizando una Server Action y funciones avanzadas de Supabase Auth.
 * 2. Búsqueda de Usuarios: Implementar un campo de búsqueda para filtrar la lista de usuarios por email o nombre, lo cual es esencial para gestionar una gran cantidad de usuarios.
 * 3. Paginación: Al igual que la tabla de campañas, esta tabla necesita paginación para escalar eficientemente a medida que la base de usuarios crece.
 */
