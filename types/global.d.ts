// types/global.d.ts
/**
 * @file types/global.d.ts
 * @description Declaraciones de tipo globales para el entorno de pruebas.
 *              Extiende el objeto `globalThis` para incluir propiedades específicas
 *              requeridas por React Testing Library en un entorno de pruebas JSDOM.
 * @author L.I.A Legacy & RaZ Podestá
 * @co-author MetaShark
 * @version 1.0.0 (Global Test Environment Types)
 */
declare global {
  /**
   * @property IS_REACT_ACT_ENVIRONMENT
   * @description Una bandera interna utilizada por React Testing Library para indicar
   *              que el entorno de ejecución está configurado para `act()`.
   *              Establecer esta propiedad suprime los `warnings` de `act` en JSDOM.
   */
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

// Asegura que este archivo sea tratado como un módulo global en TypeScript.
export {};
// types/global.d.ts
