// Ruta: lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const protocol =
  process.env.NODE_ENV === "production" ? "https" : "http";
export const rootDomain =
  process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * @description Crea una versión "debounced" de una función. La función debounced
 * solo se ejecutará después de que haya pasado un tiempo determinado sin ser llamada.
 * @template F - El tipo de la función a debouncing.
 * @param {F} func - La función a la que aplicar el debounce.
 * @param {number} waitFor - El tiempo de espera en milisegundos.
 * @returns Una nueva función debounced.
 */
export function debounce<F extends (...args: any[]) => any>(
  func: F,
  waitFor: number
) {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<F>): Promise<ReturnType<F>> =>
    new Promise((resolve) => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => resolve(func(...args)), waitFor);
    });
}
