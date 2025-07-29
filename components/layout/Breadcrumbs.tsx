// Ruta: components/dashboard/Breadcrumbs.tsx
/**
 * @file Breadcrumbs.tsx
 * @description Componente de cliente que renderiza "migas de pan" de navegación
 *              dinámicas, internacionalizadas y contextuales.
 *
 * @author Metashark
 * @version 1.0.0
 */

"use client";

import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";

import { useBreadcrumbs } from "@/lib/context/BreadcrumbsContext";
import { Link, usePathname } from "@/navigation";

/**
 * @description Renderiza las migas de pan para la navegación del dashboard.
 * @returns {JSX.Element | null}
 */
export function Breadcrumbs() {
  const pathname = usePathname();
  const t = useTranslations("Breadcrumbs");
  const { nameMap } = useBreadcrumbs();

  if (pathname === "/dashboard") {
    return null;
  }

  const pathSegments = pathname.split("/").filter((segment) => segment);

  const breadcrumbItems = pathSegments.map((segment, index) => {
    const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
    // Intenta traducir el segmento. Si no hay traducción, capitaliza el original.
    // Intenta resolver el ID a un nombre del mapa de contexto.
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
        {breadcrumbItems.map((item, index) => {
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
                  <Link href={item.href as any} className="hover:text-primary">
                    {item.label}
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

/* MEJORAS FUTURAS DETECTADAS
 * 1. Soporte para Rutas Anidadas Más Profundas: El contexto actual es simple. Para rutas como `/sites/[siteId]/campaigns/[campaignId]`, el `nameMap` necesitaría ser más estructurado para resolver ambos IDs.
 * 2. Iconos en Breadcrumbs: Añadir un icono de Lucide-React junto a cada segmento del breadcrumb para una mejor identificación visual de las secciones, mapeando nombres de ruta a componentes de icono.
 * 3. Menú Desplegable para Rutas Largas: Si la ruta se vuelve muy larga, los breadcrumbs podrían colapsar los segmentos intermedios en un menú desplegable "..." para ahorrar espacio.
 */
/* MEJORAS FUTURAS DETECTADAS
 * 1. Mapeo de Rutas Dinámicas: Para rutas con IDs (ej. `/dashboard/sites/[siteId]`), el breadcrumb mostrará el ID. Se podría implementar un sistema (usando un Contexto o un hook) que obtenga el nombre del recurso (ej. el nombre del sitio) y lo muestre en lugar del ID.
 * 2. Traducción de Segmentos: Los segmentos de la ruta (ej. "settings") están en inglés. Se podrían usar las traducciones de `next-intl` para mostrar "Ajustes" en su lugar, haciendo los breadcrumbs completamente internacionalizados.
 * 3. Iconos en Breadcrumbs: Añadir un icono de Lucide-React junto a cada segmento del breadcrumb para una mejor identificación visual de las secciones.
 */
