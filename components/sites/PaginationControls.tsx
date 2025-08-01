// components/sites/PaginationControls.tsx
/**
 * @file PaginationControls.tsx
 * @description Controles de navegación de UI para la paginación de listas. Este aparato ha sido
 *              refactorizado para ser completamente compatible con la arquitectura de búsqueda en
 *              servidor y el enrutamiento internacionalizado de `next-intl`. Ahora preserva los
 *              parámetros de búsqueda (`searchQuery`) y maneja rutas dinámicas (ej. `[siteId]`)
 *              de forma segura y tipada.
 * @author Metashark (Refactorizado por L.I.A Legacy & RaZ Podestá)
 * @version 4.0.0 (Server-Side Search & Dynamic Route Type Safety)
 *
 * @see {@link file://./PaginationControls.test.tsx} Para el arnés de pruebas correspondiente.
 *
 * @section MEJORAS FUTURAS
 * @description Mejoras incrementales para evolucionar el componente de paginación.
 *
 * 1.  **Selector de "Items por Página"**: (Vigente) Añadir un componente `<Select>` que permita al usuario elegir cuántos elementos ver por página (ej. 10, 25, 50), actualizando la URL con un parámetro `&limit=25`.
 * 2.  **Campo de Entrada "Saltar a Página"**: (Vigente) Para conjuntos de datos masivos, añadir un `<Input type="number">` donde el usuario pueda escribir directamente el número de página al que desea saltar.
 * 3.  **Soporte para Múltiples `searchParams`**: (Vigente) La función `createPageLink` podría ser refactorizada para aceptar un objeto de `searchParams` y preservarlos todos al construir los enlaces, haciéndola más robusta para futuros filtros (ej. `?sort=...`).
 */
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { AppPathname, Link } from "@/lib/navigation";

interface PaginationControlsProps {
  page: number;
  totalCount: number;
  limit: number;
  basePath: AppPathname;
  routeParams?: Record<string, string>;
  searchQuery?: string;
}

const DOTS = "...";

/**
 * @private
 * @function usePaginationRange
 * @description Hook de lógica para calcular el rango de números de página a mostrar,
 *              incluyendo puntos suspensivos para rangos largos.
 * @param {number} totalPages - El número total de páginas.
 * @param {number} currentPage - La página actual.
 * @param {number} [siblingCount=1] - Cuántos números de página mostrar a cada lado del actual.
 * @returns {(string | number)[]} Un array de números de página y/o puntos suspensivos.
 */
const usePaginationRange = (
  totalPages: number,
  currentPage: number,
  siblingCount: number = 1
): (string | number)[] => {
  return useMemo(() => {
    const totalPageNumbers = siblingCount + 5;
    if (totalPageNumbers >= totalPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);
    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;
    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, DOTS, totalPages];
    }
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - rightItemCount + i + 1
      );
      return [firstPageIndex, DOTS, ...rightRange];
    }
    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
    }
    return []; // Fallback, no debería alcanzarse
  }, [totalPages, currentPage, siblingCount]);
};

export function PaginationControls({
  page,
  totalCount,
  limit,
  basePath,
  routeParams,
  searchQuery,
}: PaginationControlsProps) {
  const totalPages = Math.ceil(totalCount / limit);
  const paginationRange = usePaginationRange(totalPages, page);

  if (totalPages <= 1) {
    return null;
  }

  const hasPreviousPage = page > 1;
  const hasNextPage = page < totalPages;

  /**
   * @private
   * @function createPageLink
   * @description Construye el objeto `href` para el componente `Link` de `next-intl`,
   *              incluyendo `pathname`, `params` para rutas dinámicas, y `query`
   *              para los parámetros de búsqueda.
   * @param {number} pageNumber - El número de página para el enlace.
   * @returns {object} El objeto `href` compatible con el `Link` de `next-intl`.
   */
  const createPageLink = (pageNumber: number) => {
    const query: { page: string; q?: string } = {
      page: String(pageNumber),
    };
    if (searchQuery) {
      query.q = searchQuery;
    }
    return {
      pathname: basePath,
      params: routeParams,
      query,
    };
  };

  return (
    <div className="flex items-center justify-end gap-2 mt-8 relative">
      <Button asChild variant="outline" size="icon" disabled={!hasPreviousPage}>
        <Link
          href={createPageLink(page - 1) as any}
          aria-label="Ir a la página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      </Button>

      {paginationRange.map((pageNumber, index) => {
        if (pageNumber === DOTS) {
          return (
            <span key={`${pageNumber}-${index}`} className="px-2 py-1">
              …
            </span>
          );
        }
        return (
          <Button
            key={pageNumber}
            asChild
            variant={pageNumber === page ? "default" : "outline"}
            size="icon"
          >
            <Link
              href={createPageLink(Number(pageNumber)) as any}
              aria-label={`Ir a la página ${pageNumber}`}
              aria-current={pageNumber === page ? "page" : undefined}
            >
              {pageNumber}
            </Link>
          </Button>
        );
      })}

      <Button asChild variant="outline" size="icon" disabled={!hasNextPage}>
        <Link
          href={createPageLink(page + 1) as any}
          aria-label="Ir a la página siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
// components/sites/PaginationControls.tsx
