// tests/mocks/api/server.ts
/**
 * @file server.ts
 * @description Servidor de simulación de API para el entorno de Node.js (pruebas).
 *              Utiliza MSW para interceptar peticiones de red.
 * @author L.I.A Legacy
 * @version 1.0.0
 */
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
