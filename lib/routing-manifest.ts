// Ruta: lib/routing-manifest.ts
/**
 * @file routing-manifest.ts
 * @description Manifiesto de Enrutamiento y Única Fuente de Verdad para la
 *              clasificación de rutas en la aplicación. Este aparato centraliza
 *              las definiciones para que el middleware y sus manejadores operen
 *              de forma consistente y segura.
 * @author L.I.A Legacy
 * @version 1.0.0
 */
export const ROUTE_DEFINITIONS = {
  public: ["/", "/choose-language"],
  auth: ["/login", "/forgot-password", "/reset-password"],
  protected: ["/dashboard", "/admin", "/dev-console", "/welcome", "/lia-chat"],
};
