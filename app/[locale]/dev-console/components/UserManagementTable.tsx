/* Ruta: app/[locale]/dev-console/components/UserManagementTable.tsx */

"use client";

import { updateUserRoleAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import type { Database } from "@/lib/database.types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";
import { toast } from "react-hot-toast";

/**
 * @file UserManagementTable.tsx
 * @description Componente de cliente para mostrar y gestionar usuarios y sus roles.
 * REFACTORIZACIÓN DE ESCALABILIDAD: Se ha añadido la lógica de paginación en la UI.
 * El componente ahora acepta props de paginación y renderiza controles para
 * navegar entre las páginas de usuarios.
 *
 * @author Metashark
 * @version 2.0.0 (Pagination UI Implementation)
 */

type ProfileRow = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "id" | "full_name" | "app_role"
> & { email?: string };

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
    <div className="flex items-center justify-between mt-4 px-2">
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

  const handleRoleChange = (
    userId: string,
    newRole: Database["public"]["Enums"]["app_role"]
  ) => {
    startTransition(async () => {
      const result = await updateUserRoleAction(userId, newRole);
      if (result.success) {
        toast.success(`Rol actualizado para el usuario.`);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User ID</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Full Name</TableHead>
            <TableHead className="w-[180px]">Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profiles.map((profile) => (
            <TableRow key={profile.id}>
              <TableCell className="font-mono text-xs">{profile.id}</TableCell>
              <TableCell>{profile.email || "N/A"}</TableCell>
              <TableCell>{profile.full_name || "N/A"}</TableCell>
              <TableCell>
                <Select
                  defaultValue={profile.app_role}
                  onValueChange={(value) =>
                    handleRoleChange(
                      profile.id,
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <PaginationControls page={page} totalCount={totalCount} limit={limit} />
    </Card>
  );
}
/* MEJORAS FUTURAS DETECTADAS
 * 1. Acción de Suplantación (Impersonation): Añadir un botón de acción en cada fila que permita a un `developer` iniciar sesión temporalmente como ese usuario para depurar problemas, utilizando una Server Action y funciones avanzadas de Supabase Auth.
 * 2. Búsqueda de Usuarios: Implementar un campo de búsqueda para filtrar la lista de usuarios por email o nombre, lo cual es esencial para gestionar una gran cantidad de usuarios.
 * 3. Paginación: Al igual que la tabla de campañas, esta tabla necesita paginación para escalar eficientemente a medida que la base de usuarios crece.
 */
