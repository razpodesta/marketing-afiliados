// lib/hooks/useCountdownRedirect.ts (NUEVO APARATO)
/**
 * @file useCountdownRedirect.ts
 * @description Hook de React atómico y reutilizable para gestionar una cuenta regresiva
 *              que ejecuta un callback al finalizar.
 *
 * @author L.I.A. Legacy
 * @version 1.0.0
 *
 * @param {number} initialCount - El número inicial desde el que empezar la cuenta regresiva.
 * @param {() => void} onCountdownEnd - La función de callback a ejecutar cuando el contador llega a cero.
 * @returns {{ countdown: number }} El valor actual del contador.
 */
"use client";

import { useEffect, useState } from "react";
import { verboseLogger } from "@/lib/dev/verbose-logger";

export function useCountdownRedirect(
  initialCount: number,
  onCountdownEnd: () => void
): { countdown: number } {
  const [countdown, setCountdown] = useState(initialCount);

  verboseLogger("useCountdownRedirect INIT", { initialCount });

  useEffect(() => {
    verboseLogger("useCountdownRedirect EFFECT", { countdown });
    if (countdown <= 0) {
      verboseLogger("useCountdownRedirect END", {
        message: "Ejecutando callback.",
      });
      onCountdownEnd();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => {
      verboseLogger("useCountdownRedirect CLEANUP", { timerId: timer });
      clearTimeout(timer);
    };
  }, [countdown, onCountdownEnd]);

  return { countdown };
}

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Mejoras Futuras
 * 1. **Pausa y Reanudación**: ((Vigente)) Añadir funciones devueltas por el hook (`pause`, `resume`) para controlar el temporizador.
 * 2. **Devolución de Estado**: ((Vigente)) El hook podría devolver un estado más rico, como `{ countdown, isRunning: boolean }`.
 */
// lib/hooks/useCountdownRedirect.ts
