// Ruta: app/[locale]/builder/[campaignId]/loading.tsx
/**
 * @file loading.tsx
 * @description Esqueleto de carga sofisticado para el constructor de campañas.
 *              Este archivo es utilizado automáticamente por Next.js y React Suspense
 *              para mostrar una UI de carga mientras se obtienen los datos de la
 *              campaña en `page.tsx`.
 *
 * @author Metashark
 * @version 1.0.0 (Initial Creation)
 */
import { LayoutTemplate, Settings } from "lucide-react";

export default function BuilderLoading() {
  return (
    <div className="flex h-screen w-screen flex-col bg-muted animate-pulse">
      {/* Header Esqueleto */}
      <header className="flex h-16 items-center justify-between border-b bg-card px-6">
        <div className="h-9 w-40 rounded-md bg-muted"></div>
        <div className="flex flex-col items-center">
          <div className="h-6 w-32 rounded-md bg-muted"></div>
          <div className="h-4 w-24 rounded-md bg-muted mt-1"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-24 rounded-md bg-muted"></div>
          <div className="h-9 w-32 rounded-md bg-muted"></div>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Esqueleto */}
        <aside className="w-96 h-full bg-card border-r flex flex-col p-2">
          <div className="grid w-full grid-cols-2 m-2 h-9 rounded-md bg-muted"></div>
          <div className="p-4 space-y-4">
            <div className="h-8 w-1/3 rounded-md bg-muted"></div>
            <div className="grid grid-cols-2 gap-2">
              <div className="h-10 rounded-md bg-muted"></div>
              <div className="h-10 rounded-md bg-muted"></div>
              <div className="h-10 rounded-md bg-muted"></div>
              <div className="h-10 rounded-md bg-muted"></div>
            </div>
          </div>
        </aside>
        {/* Canvas Esqueleto */}
        <main className="flex-1 h-full overflow-auto p-4">
          <div className="h-full w-full overflow-hidden rounded-lg border bg-muted shadow-inner"></div>
        </main>
      </div>
    </div>
  );
}
