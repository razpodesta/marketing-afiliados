// lib/utils.ts
/**
 * @file lib/utils.ts
 * @description Colección de funciones de utilidad de propósito general.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 2.1.0 (IP Address Helpers)
 */
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const protocol =
  process.env.NODE_ENV === "production" ? "https" : "http";
export const rootDomain =
  process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";

/**
 * @function cn
 * @description Combina clases de Tailwind CSS de forma condicional, resolviendo conflictos.
 * @param {...ClassValue[]} inputs - Clases a combinar.
 * @returns {string} La cadena de clases combinada.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * @description Crea una versión "debounced" de una función. La función debounced
 * solo se ejecutará después de que haya pasado un tiempo determinado sin ser llamada.
 * @template F - El tipo de la función a debouncing.
 * @param {F} func - La función a la que aplicar el debounce.
 * @param {number} waitFor - El tiempo de espera en milisegundos.
 * @returns {F} Una nueva función debounced.
 */
export function debounce<F extends (...args: Parameters<F>) => ReturnType<F>>(
  func: F,
  waitFor: number
): F {
  let timeout: NodeJS.Timeout;
  return ((...args: Parameters<F>): Promise<ReturnType<F>> =>
    new Promise((resolve) => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => resolve(func(...args)), waitFor);
    })) as F;
}

/**
 * @function isPrivateIpAddress
 * @description Verifica si una dirección IP dada es una dirección IP privada (LAN).
 *              Esto es útil para evitar realizar lookups de GeoIP en IPs internas
 *              que no son accesibles públicamente y no deben ser enviadas a APIs externas.
 * @param {string} ip - La dirección IP a verificar.
 * @returns {boolean} `true` si la IP es privada (ej. 10.x.x.x, 172.16-31.x.x, 192.168.x.x, 127.0.0.1), `false` en caso contrario.
 */
export function isPrivateIpAddress(ip: string): boolean {
  // Regex para rangos de IP privadas IPv4 y localhost:
  // 10.0.0.0/8 (10.0.0.0 - 10.255.255.255)
  // 172.16.0.0/12 (172.16.0.0 - 172.31.255.255)
  // 192.168.0.0/16 (192.168.0.0 - 192.168.255.255)
  // 127.0.0.1 (localhost)
  // IPv6 localhost (::1) y rangos privados (ej. fc00::/7) no se consideran para esta función,
  // ya que la mayoría de las APIs de GeoIP se centran en IPv4 públicas.
  const privateIpRegex =
    /^(10\.\d{1,3}\.\d{1,3}\.\d{1,3})|(172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})|(192\.168\.\d{1,3}\.\d{1,3})|(127\.0\.0\.1)$/;
  return privateIpRegex.test(ip);
}
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Función `isPrivateIpAddress`**: ((Implementada)) Se añadió un helper para detectar IPs privadas, optimizando el uso de servicios GeoIP externos al evitar llamadas inútiles.
 *
 * @subsection Melhorias Futuras
 * 1. **Validación de URL Canónica**: ((Vigente)) Añadir una función para validar y limpiar URLs, asegurando que siempre sean canónicas y seguras (ej. eliminando parámetros de seguimiento).
 * 2. **Formateo de Números/Fechas Localizadas**: ((Vigente)) Implementar helpers para formatear números, monedas o fechas de forma localizada, utilizando la API `Intl` del navegador para una máxima compatibilidad y rendimiento.
 */
