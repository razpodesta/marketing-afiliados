// middleware/handlers/redirects/index.ts
/**
 * @file middleware/handlers/redirects/index.ts
 * @description Manejador de middleware para redirecciones canónicas y de SEO.
 *              Ha sido refactorizado para recibir el logger vía inyección de
 *              dependencias, desacoplándolo completamente del módulo de logging.
 * @author L.I.A Legacy
 * @version 4.0.0 (Dependency Injection)
 */
import { type NextRequest, NextResponse } from "next/server";

/**
 * @typedef Logger
 * @description Define el contrato mínimo que un logger debe cumplir para ser
 *              utilizado por este manejador.
 */
type Logger = {
  trace: (message: string, context?: object) => void;
  info: (message: string, context?: object) => void;
};

/**
 * @function handleRedirects
 * @description Comprueba si el host de la petición comienza con 'www.' y, si es así,
 *              devuelve una respuesta de redirección permanente (301) al dominio
 *              canónico sin 'www.', preservando la ruta y los parámetros de búsqueda.
 * @param {NextRequest} request - El objeto de la petición entrante.
 * @param {Logger} logger - La instancia del logger inyectada.
 * @returns {NextResponse | null} Una respuesta de redirección si es necesario, o null para continuar.
 */
export function handleRedirects(
  request: NextRequest,
  logger: Logger
): NextResponse | null {
  logger.trace("[REDIRECTS_HANDLER] Auditing for canonical redirects.");
  const { host, pathname, search } = request.nextUrl;

  if (host.startsWith("www.")) {
    const newHost = host.replace("www.", "");
    const newUrl = new URL(`${pathname}${search}`, `https://${newHost}`);

    logger.info(
      "[REDIRECTS_HANDLER] DECISION: Redirecting from 'www.' to canonical host.",
      { from: host, to: newHost }
    );
    return NextResponse.redirect(newUrl, 301);
  }

  logger.trace(
    "[REDIRECTS_HANDLER] DECISION: No redirect needed. Passing to next handler."
  );
  return null;
}

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Inyección de Dependencias**: ((Implementada)) El manejador ahora recibe el logger como un parámetro, eliminando la importación directa y mejorando el desacoplamiento y la testabilidad.
 *
 * @subsection Melhorias Futuras
 * 1. **Redirecciones desde Base de Datos**: ((Vigente)) Crear una tabla `redirects` en Supabase para gestionar redirecciones de marketing sin necesidad de un redespliegue.
 * 2. **Normalización de Slashes**: ((Vigente)) Añadir lógica para asegurar que las URLs siempre tengan (o no tengan) un slash al final, según la política de SEO.
 */
// middleware/handlers/redirects/index.ts
