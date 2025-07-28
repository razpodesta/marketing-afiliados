// Ruta: components/sites/SitesHeader.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "framer-motion";
import { PlusCircle, Search, X } from "lucide-react";
import { CreateSiteForm } from "./CreateSiteForm";

// CORRECCIÓN: La interfaz de props ahora espera una función `onSubmit` y un estado `isSubmitting`.
interface SitesHeaderProps {
  isCreateDialogOpen: boolean;
  setCreateDialogOpen: (isOpen: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSubmitCreate: (data: { subdomain: string; icon: string }) => Promise<void>;
  isCreating: boolean;
}

export function SitesHeader({
  isCreateDialogOpen,
  setCreateDialogOpen,
  searchQuery,
  setSearchQuery,
  onSubmitCreate,
  isCreating,
}: SitesHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative">
      <div
        data-lia-marker="true"
        className="absolute -top-2 left-0 bg-primary/20 text-primary text-[10px] font-mono px-1.5 py-0.5 rounded-full"
      >
        SitesHeader.tsx
      </div>

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
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

/*  L.I.A. LOGIC ANALYSIS
 *  ---------------------
 *  Este aparato es un componente de UI "controlado". No gestiona su propio estado,
 *  sino que lo recibe como props (`searchQuery`, `isCreateDialogOpen`) y notifica
 *  al componente padre de los cambios a través de callbacks (`setSearchQuery`, `setCreateDialogOpen`).
 *  1.  **Entrada de Búsqueda:** El `Input` muestra el valor de `searchQuery`. En cada cambio (`onChange`), invoca la función `setSearchQuery` del padre para actualizar el estado de la búsqueda a nivel de la página.
 *  2.  **Limpieza de Búsqueda (Mejora UX):** Se ha añadido un botón 'X' que aparece condicionalmente solo si `searchQuery` no está vacío. Al hacer clic, invoca `setSearchQuery('')` para limpiar la búsqueda de forma instantánea. `AnimatePresence` de Framer Motion proporciona una transición suave de aparición/desaparición.
 *  3.  **Modal de Creación:** El componente `Dialog` encapsula el `CreateSiteForm`. Su estado de apertura/cierre está controlado por `isCreateDialogOpen` y `setCreateDialogOpen`, manteniendo la lógica de estado en el componente orquestador (`SitesClient`).
 *  Este patrón de diseño es ideal para la mantenibilidad, ya que mantiene el componente del encabezado enfocado únicamente en la presentación y la delegación de eventos.
 */

/* MEJORAS FUTURAS DETECTADAS
 * 1. Abstracción a `<CollectionHeader />`: Este patrón de "Título + Búsqueda + Botón de Acción" se repetirá en otras partes de la aplicación (ej. Campañas, Miembros). Se podría abstraer este aparato a un componente genérico `<CollectionHeader />` que acepte props como `title`, `description`, `searchPlaceholder`, y `createActionLabel` para promover la consistencia de la UI y el principio DRY en todo el proyecto.
 * 2. Controles de Ordenamiento y Filtrado Avanzado: Para escalar a cientos de sitios, la búsqueda por sí sola es insuficiente. Se podría integrar un `<DropdownMenu>` junto a la barra de búsqueda que permita al usuario ordenar la lista (ej. por "Fecha de Creación", "Nombre A-Z") o aplicar filtros predefinidos (ej. "Solo sitios sin campañas").
 * 3. Atajo de Teclado para Búsqueda: Mejorar la productividad de los usuarios avanzados implementando un atajo de teclado global (ej. `/` o `Ctrl+F`) que enfoque automáticamente el campo de búsqueda cuando el usuario se encuentre en la página de "Mis Sitios".
 */
