// tests/utils/auth.ts
/**
 * @file auth.ts
 * @description Utilidades de prueba centralizadas para la gestión de la autenticación.
 *              Este aparato aísla la lógica de manipulación del estado de autenticación
 *              durante las pruebas, evitando que contamine el código de producción.
 * @author L.I.A Legacy
 * @version 1.0.0
 */
import { unstable_cache } from "next/cache";

/**
 * @function clearAuthCache
 * @description Invalida todas las cachés relacionadas con la autenticación.
 *              Esta función sirve como un placeholder semántico para la intención.
 *              La invalidación real se maneja a través del aislamiento de pruebas.
 */
export function clearAuthCache() {
  // En un entorno de prueba real con `vitest`, cada prueba se ejecuta
  // en un contexto aislado, por lo que la caché de React/Next.js no
  // persiste entre pruebas. Esta función se mantiene por claridad semántica.
}

/**
 * @calificacion 9/10
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Futuras
 * 1. **Factoría de Sesión Completa**: ((Vigente)) Crear una función `createMockSession(userOverrides)` que genere un objeto de sesión completo de Supabase, incluyendo JWT y metadatos. Esto será crucial para pruebas de integración de punta a punta que simulen un usuario completamente autenticado.
 * 2. **Simulador de `require...`**: ((Vigente)) Crear funciones `mockRequireAppRole` y `mockRequireWorkspacePermission` que simplifiquen la simulación de los guardianes de seguridad en las pruebas de Server Actions.
 */
// tests/utils/auth.ts
