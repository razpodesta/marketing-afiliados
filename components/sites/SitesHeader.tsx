// Ruta: components/sites/SitesHeader.tsx
/**
 * @file SitesHeader.tsx
 * @description Encabezado para la página "Mis Sitios", que contiene el título, la
 *              barra de búsqueda y el disparador del modal de creación. Ha sido
 *              refactorizado para adherirse a un contrato de tipos estricto.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 4.0.0 (Strict Type Contract Alignment)
 */
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { PlusCircle, Search, X } from "lucide-react";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { type CreateSiteSchema } from "@/lib/validators";

import { CreateSiteForm } from "./CreateSiteForm";

// CORRECCIÓN CRÍTICA: Se importa el tipo de datos que el formulario va a producir
// y que el hook `useSitesManagement` espera recibir.
type FormOutput = z.output<typeof CreateSiteSchema>;

/**
 * @interface SitesHeaderProps
 * @description Define el contrato de props para el encabezado. Actúa como un
 *              componente "controlado", recibiendo estado y callbacks de su padre.
 */
interface SitesHeaderProps {
  isCreateDialogOpen: boolean;
  setCreateDialogOpen: (isOpen: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  // La firma de esta prop ahora coincide con la de `handleCreate` en el hook.
  onSubmitCreate: (data: FormOutput) => Promise<void>;
  isCreating: boolean;
  workspaceId: string;
}

export function SitesHeader({
  isCreateDialogOpen,
  setCreateDialogOpen,
  searchQuery,
  setSearchQuery,
  onSubmitCreate,
  isCreating,
  workspaceId,
}: SitesHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative">
      <div>
        <h1 className="text-2xl font-bold">Mis Sitios</h1>
        <p className="text-muted-foreground">
          Gestiona y busca en tus sitios. Cada sitio puede tener múltiples
          campañas.
        </p>
      </div>

      <div className="flex w-full md:w-auto items-center gap-2">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por subdominio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setSearchQuery("")}
                  aria-label="Limpiar búsqueda"
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shrink-0">
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear Sitio
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear un nuevo sitio</DialogTitle>
            </DialogHeader>
            <CreateSiteForm
              onSubmit={onSubmitCreate}
              isSubmitting={isCreating}
              workspaceId={workspaceId}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras para evolucionar este componente.
 *
 * 1.  **Abstracción a `<CollectionHeader />`:** Este patrón de "Título + Búsqueda + Botón de Acción" se repetirá en otras partes de la aplicación (ej. Campañas, Miembros). Se podría abstraer este aparato a un componente genérico `<CollectionHeader />` para promover la consistencia de la UI y el principio DRY.
 * 2.  **Controles de Ordenamiento y Filtrado Avanzado:** Para escalar a cientos de sitios, la búsqueda por sí sola es insuficiente. Se podría integrar un `<DropdownMenu>` junto a la barra de búsqueda que permita al usuario ordenar la lista (ej. por "Fecha de Creación", "Nombre A-Z").
 * 3.  **Atajo de Teclado para Búsqueda:** Mejorar la productividad de los usuarios avanzados implementando un atajo de teclado global (ej. `/` o `Ctrl+F`) que enfoque automáticamente el campo de búsqueda.
 */

/*
 * =================================================================================================
 *                                   L.I.A. LOGIC ANALYSIS
 * =================================================================================================
 * @fileoverview El aparato `SitesHeader.tsx` es un componente de UI "controlado".
 *
 * @functionality
 * - No gestiona su propio estado, sino que lo recibe como props (`searchQuery`, `isCreateDialogOpen`)
 *   y notifica al componente padre de los cambios a través de callbacks (`setSearchQuery`, etc.).
 * - Orquesta la presentación de la barra de búsqueda y el `Dialog` que contiene el `CreateSiteForm`.
 * - **Corrección de Contrato:** La interfaz `SitesHeaderProps` ha sido actualizada. Su prop
 *   `onSubmitCreate` ahora espera una función que coincide exactamente con la firma de la
 *   función `handleCreate` del hook `useSitesManagement`, reparando este eslabón de la cadena de tipos.
 *
 * @relationships
 * - Es un componente hijo de `SitesClient.tsx`, que es el orquestador de la página.
 * - Es el padre de `CreateSiteForm.tsx`, al cual le pasa la función de envío y el estado de carga.
 *
 * @expectations
 * - Se espera que este componente actúe como una capa de presentación pura, delegando toda la
 *   lógica de estado y las acciones a sus componentes padres. Su contrato de props ahora es
 *   robusto y seguro en tipos.
 * =================================================================================================
 */
