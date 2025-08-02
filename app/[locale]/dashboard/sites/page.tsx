// app/[locale]/dashboard/sites/page.tsx
/**
 * @file page.tsx
 * @description Punto de entrada para la ruta "Mis Sitios". Su única responsabilidad
 *              es renderizar el componente de carga de datos (`SitesPageLoader`)
 *              dentro de un Suspense boundary, cumpliendo con el contrato de
 *              exportación de página de Next.js.
 * @author L.I.A Legacy & RaZ Podestá
 * @co-author MetaShark
 * @version 6.0.0 (Structural Refactoring for Testability & Next.js Compliance)
 * @see {@link file://./sites-page-loader.tsx} Para la lógica de carga de datos.
 * @see {@link file://./page.test.tsx} Para el arnés de pruebas correspondiente.
 *
 * @section MEJORAS FUTURAS
 * @description Mejoras incrementales para la página de gestión de sitios.
 *
 * 1.  **Esqueleto de Carga Específico**: (Implementado) El componente `SitesPageSkeleton` mejora la experiencia de usuario percibida (LCP y CLS). Podría ser aún más detallado para coincidir exactamente con la estructura final.
 */
import { Suspense } from "react";
import { Card } from "@/components/ui/card";
import { SitesPageLoader } from "./sites-page-loader";

const SitesPageSkeleton = () => (
  <div className="space-y-6 relative animate-pulse">
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <div className="h-8 w-32 bg-muted rounded-md" />
        <div className="h-5 w-72 bg-muted rounded-md mt-2" />
      </div>
      <div className="flex w-full md:w-auto items-center gap-2">
        <div className="h-10 w-full md:w-64 bg-muted rounded-md" />
        <div className="h-10 w-32 bg-muted rounded-md" />
      </div>
    </div>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="h-40 bg-muted" />
      ))}
    </div>
  </div>
);

export default function SitesPage({
  searchParams,
}: {
  searchParams: { page?: string; q?: string };
}) {
  return (
    <Suspense fallback={<SitesPageSkeleton />}>
      <SitesPageLoader searchParams={searchParams} />
    </Suspense>
  );
}
// app/[locale]/dashboard/sites/page.tsx
