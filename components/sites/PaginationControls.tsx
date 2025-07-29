// Ruta: components/sites/PaginationControls.tsx
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";

/**
 * @file PaginationControls.tsx
 * @description Controles de navegación para la paginación de listas.
 * REFACTORIZACIÓN DE UX:
 * 1.  Se ha implementado una lógica de paginación avanzada que muestra números
 *     de página y elipsis ("..."), permitiendo al usuario saltar directamente
 *     a páginas específicas. Esto mejora drásticamente la usabilidad en
 *     conjuntos de datos grandes.
 *
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 2.0.0 (Advanced UX Pagination)
 */

interface PaginationControlsProps {
  page: number;
  totalCount: number;
  limit: number;
  basePath: string;
}

const DOTS = "...";

/**
 * @description Hook auxiliar para generar el rango de números de página a mostrar.
 * @param {number} totalPages - Número total de páginas.
 * @param {number} currentPage - La página actual.
 * @param {number} siblingCount - Cuántos números de página mostrar a cada lado del actual.
 * @returns {(string | number)[]} Un array de números de página y elipsis.
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
      return [...leftRange, DOTS, lastPageIndex];
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

    return []; // Debería ser inalcanzable
  }, [totalPages, currentPage, siblingCount]);
};

export function PaginationControls({
  page,
  totalCount,
  limit,
  basePath,
}: PaginationControlsProps) {
  const totalPages = Math.ceil(totalCount / limit);
  const paginationRange = usePaginationRange(totalPages, page);

  if (totalPages <= 1) return null;

  const hasPreviousPage = page > 1;
  const hasNextPage = page < totalPages;

  return (
    <div className="flex items-center justify-end gap-2 mt-8 relative">
      {/* DIRECTIVA: Marcador visual temporal para desarrollo */}
      <div
        data-lia-marker="true"
        className="absolute -top-4 right-0 bg-primary/20 text-primary text-[10px] font-mono px-1.5 py-0.5 rounded-full z-10"
      >
        PaginationControls.tsx
      </div>

      <Button asChild variant="outline" size="icon" disabled={!hasPreviousPage}>
        <Link
          href={{ pathname: basePath, query: { page: page - 1 } }}
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
              href={{ pathname: basePath, query: { page: pageNumber } }}
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
          href={{ pathname: basePath, query: { page: page + 1 } }}
          aria-label="Ir a la página siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}

/*  L.I.A. LOGIC ANALYSIS
 *  ---------------------
 *  Este aparato ha evolucionado para proporcionar una paginación completa. Su lógica
 *  se ha abstraído en un hook `usePaginationRange` para mayor claridad.
 *  1.  **Cálculo del Rango:** El hook `usePaginationRange` es el cerebro del componente. Basado en el número total de páginas, la página actual y un "conteo de hermanos" (cuántos números mostrar alrededor de la página actual), calcula un array que representa los controles de paginación.
 *  2.  **Manejo de Casos Límite:** La lógica del hook considera múltiples escenarios:
 *      - Si el número total de páginas es pequeño, muestra todos los números.
 *      - Si la página actual está cerca del inicio o del final, muestra los números correspondientes y un solo conjunto de elipsis (`...`).
 *      - Si la página actual está en el medio, muestra el primer número, elipsis, los números centrales, más elipsis y el último número.
 *  3.  **Renderizado Dinámico:** El componente principal mapea el array devuelto por el hook. Si el elemento es un número, renderiza un botón `Link`. Si es la cadena "...", renderiza un elemento de texto estático. El botón de la página actual recibe un estilo visual distinto para indicar el estado activo.
 *  4.  **Navegación Accesible:** Los botones "Anterior" y "Siguiente" permanecen, y se añaden `aria-label` a todos los enlaces para mejorar la accesibilidad para los lectores de pantalla.
 *  El resultado es un componente de paginación robusto, reutilizable y que proporciona una experiencia de usuario superior para la navegación de grandes conjuntos de datos.
 */

/* MEJORAS FUTURAS DETECTADAS
 * 1. Selector de "Items por Página": Añadir un componente `<Select>` junto a los controles de paginación que permita al usuario elegir cuántos elementos quiere ver por página (ej. 10, 25, 50). La opción seleccionada se pasaría como un parámetro en la URL (`&limit=25`), lo que requeriría una actualización en la lógica de obtención de datos del servidor para que respete este límite.
 * 2. Campo de Entrada "Saltar a Página": Para conjuntos de datos masivos (miles de páginas), incluso la paginación con elipsis puede ser limitante. Se podría añadir un pequeño campo de entrada `<Input type="number">` donde el usuario pueda escribir directamente el número de página al que desea saltar, proporcionando la máxima eficiencia de navegación.
 * 3. Sincronización con el Estado de la URL sin Recarga Completa: Actualmente, la navegación se basa en `<Link>`, que utiliza el router de Next.js. Para una experiencia aún más fluida, se podría usar `router.push` con la opción `scroll: false` para cambiar la URL y desencadenar la obtención de datos sin que la página se desplace a la parte superior, manteniendo la posición del usuario.
 */
