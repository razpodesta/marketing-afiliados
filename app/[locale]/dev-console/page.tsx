/* Ruta: app/[locale]/dev-console/page.tsx */

/**
 * @file page.tsx
 * @description Página de inicio (Overview) del Dashboard de Desarrollador.
 * Sirve como punto de entrada y bienvenida. En el futuro, mostrará métricas
 * clave de la plataforma.
 *
 * @author Metashark
 * @version 1.0.0
 */
export default function DevConsoleHomePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">
        Bienvenido a la Consola de Desarrollador
      </h1>
      <p className="mt-2 text-muted-foreground">
        Este es el centro de comando para la supervisión y gestión de la
        plataforma Metashark.
      </p>
      <div className="mt-8 p-6 border rounded-lg bg-card">
        <h2 className="font-semibold">Estado del Sistema</h2>
        <p className="text-sm text-green-500 mt-2">
          Todos los sistemas operativos.
        </p>
        {/* Aquí se integrarán métricas en tiempo real */}
      </div>
    </div>
  );
}
/* Ruta: app/[locale]/dev-console/page.tsx */
