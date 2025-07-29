// Ruta: components/layout/Breadcrumbs.tsx
/**
 * @file Breadcrumbs.tsx
 * @description Componente de cliente que renderiza "migas de pan" de navegación
 *              dinámicas, internacionalizadas y contextuales. Es un aparato clave
 *              para la orientación del usuario en la jerarquía de la aplicación.
 * @author RaZ Podestá & L.I.A Legacy
 * @version 2.1.0 (Syntax & Type Fix)
 */
"use client";

import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";

import { useBreadcrumbs } from "@/lib/context/BreadcrumbsContext";
import { Link, usePathname } from "@/lib/navigation";

/**
 * @description Renderiza las migas de pan para la navegación del dashboard.
 * @returns {JSX.Element | null} El componente de breadcrumbs o null si no es necesario.
 */
export function Breadcrumbs() {
  const pathname = usePathname();
  const t = useTranslations("Breadcrumbs");
  const { nameMap } = useBreadcrumbs();

  if (pathname === "/dashboard") {
    return null;
  }

  const pathSegments = pathname.split("/").filter((segment: string) => segment);

  const breadcrumbItems = pathSegments.map((segment: string, index: number) => {
    const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
    // CORRECCIÓN SINTAXIS (TS1002): Se corrige el uso de comillas dentro de la traducción.
    // El tipo `any` en `t` es una concesión necesaria por cómo `next-intl` maneja
    // las claves dinámicas, pero la lógica de fallback lo hace seguro.
    const label = nameMap[segment] || t(segment as any) || segment;
    return { href, label };
  });

  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-4 text-sm text-muted-foreground hidden md:block"
    >
      <ol className="flex items-center gap-2">
        <li>
          <Link href="/dashboard" className="hover:text-primary">
            {t("dashboard")}
          </Link>
        </li>
        {breadcrumbItems.map(
          (
            item: { href: string; label: string },
            index: number
          ): JSX.Element => {
            const isLast = index === breadcrumbItems.length - 1;
            return (
              <React.Fragment key={item.href}>
                <li>
                  <ChevronRight className="h-4 w-4" />
                </li>
                <li>
                  {isLast ? (
                    <span className="font-medium text-foreground">
                      {item.label}
                    </span>
                  ) : (
                    <Link
                      href={item.href as any}
                      className="hover:text-primary"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              </React.Fragment>
            );
          }
        )}
      </ol>
    </nav>
  );
}

/*
 * =================================================================================================
 *                                   L.I.A. LOGIC ANALYSIS
 * =================================================================================================
 * @fileoverview El aparato `Breadcrumbs.tsx` es un componente de UI que proporciona
 *               navegación contextual.
 *
 * @functionality
 * - **Análisis de Ruta:** Divide la URL actual en segmentos para construir la jerarquía.
 * - **Resolución de Nombres Contextual:** Utiliza una estrategia de fallback para mostrar
 *   nombres legibles: primero busca en el `BreadcrumbsContext` (para IDs dinámicos),
 *   luego intenta traducir el segmento (para rutas estáticas), y finalmente recurre al
 *   propio segmento si no encuentra coincidencias.
 * - **Corrección de Sintaxis:** El error `TS1002` ("Literal de cadena sin terminar")
 *   se ha resuelto. Era un simple error de tipeo que impedía la compilación.
 *
 * @relationships
 * - Depende de `lib/context/BreadcrumbsContext.tsx` y `lib/navigation.ts`.
 *
 * @expectations
 * - Se espera que este componente traduzca de forma inteligente la URL en una guía de
 *   navegación legible. Con la sintaxis corregida, el aparato vuelve a ser funcional y
 *   puede ser analizado correctamente por el compilador.
 * =================================================================================================
 */

/**
 * @section MEJORAS FUTURAS A IMPLEMENTAR
 * @description Mejoras para evolucionar la navegación contextual.
 *
 * 1.  **Iconos en Breadcrumbs:** Añadir un icono de `lucide-react` junto a cada segmento del breadcrumb para una mejor identificación visual.
 * 2.  **Menú Desplegable para Rutas Largas:** Si la ruta se vuelve muy larga, colapsar los segmentos intermedios en un menú desplegable.
 * 3.  **Soporte para Rutas con Múltiples Parámetros:** Mejorar la lógica del `nameMap` para resolver múltiples IDs en rutas anidadas.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Mapeo de Rutas Dinámicas: Para rutas con IDs (ej. `/dashboard/sites/[siteId]`), el breadcrumb mostrará el ID. Se podría implementar un sistema (usando un Contexto o un hook) que obtenga el nombre del recurso (ej. el nombre del sitio) y lo muestre en lugar del ID.
 * 2. Traducción de Segmentos: Los segmentos de la ruta (ej. "settings") están en inglés. Se podrían usar las traducciones de `next-intl` para mostrar "Ajustes" en su lugar, haciendo los breadcrumbs completamente internacionalizados.
 * 3. Iconos en Breadcrumbs: Añadir un icono de Lucide-React junto a cada segmento del breadcrumb para una mejor identificación visual de las secciones.
 */
