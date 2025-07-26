/* Ruta: components/ui/CursorTrail.tsx */

"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  type MotionValue,
} from "framer-motion";
import { useEffect } from "react";

/**
 * @file CursorTrail.tsx
 * @description Componente que renderiza una estela visual brillante que sigue
 * el cursor del ratón del usuario. Utiliza `framer-motion` para una animación
 * fluida y de alto rendimiento. Se ha corregido un error de tipado moviendo
 * los estilos de la prop no estándar `css` a la prop `style`.
 *
 * @author Metashark
 * @version 1.1.0 (TypeScript Prop Fix)
 */
export function CursorTrail() {
  /**
   * @description Motion values para almacenar las coordenadas del ratón.
   * `useMotionValue` es una optimización clave: permite a Framer Motion leer los
   * valores de posición sin causar re-renders en el árbol de componentes de React,
   * garantizando un rendimiento máximo para animaciones frecuentes como esta.
   */
  const mouse: { x: MotionValue<number>; y: MotionValue<number> } = {
    x: useMotionValue(0),
    y: useMotionValue(0),
  };

  /**
   * @description Opciones para la animación de resorte (`spring`), que crea un
   * efecto de seguimiento suave y orgánico en lugar de un movimiento 1:1 rígido.
   * `damping` controla la resistencia (evita oscilaciones).
   * `stiffness` controla la "dureza" del resorte (velocidad de respuesta).
   * `mass` afecta al impulso del movimiento.
   */
  const springOptions = {
    damping: 25,
    stiffness: 200,
    mass: 0.5,
  };

  /**
   * @description Aplica la física de resorte a los motion values del ratón.
   * `smoothMouse` seguirá al cursor real con un retardo y suavidad agradables.
   */
  const smoothMouse = {
    x: useSpring(mouse.x, springOptions),
    y: useSpring(mouse.y, springOptions),
  };

  /**
   * @description Hook de efecto para registrar y limpiar el listener de eventos del ratón,
   * asegurando que la lógica se ejecute solo en el cliente.
   */
  useEffect(() => {
    /**
     * @description Actualiza los `motion values` con las nuevas coordenadas del ratón.
     * @param {MouseEvent} e - El evento del ratón proporcionado por el navegador.
     */
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      mouse.x.set(clientX);
      mouse.y.set(clientY);
    };

    // Se añade el listener de eventos cuando el componente se monta en el DOM.
    window.addEventListener("mousemove", handleMouseMove);

    // Se retorna una función de limpieza que se ejecuta cuando el componente se desmonta.
    // Esto es CRUCIAL para prevenir fugas de memoria en aplicaciones de una sola página (SPA).
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [mouse.x, mouse.y]);

  return (
    <motion.div
      // CORRECCIÓN: Se han movido las propiedades de estilo desde la prop `css` (inválida)
      // a la prop `style`. `motion.div` acepta un objeto de estilo en línea, igual que
      // un `div` normal de React, pero puede manejar `MotionValue`s directamente.
      style={{
        left: smoothMouse.x,
        top: smoothMouse.y,
        translateX: "-50%",
        translateY: "-50%",
        background:
          "radial-gradient(circle, hsl(var(--primary)/0.5), transparent 60%)",
        filter: "blur(8px)",
      }}
      className="pointer-events-none fixed z-50 h-8 w-8 rounded-full"
    />
  );
}
/* Ruta: components/ui/CursorTrail.tsx */

/* MEJORAS PROPUESTAS
 * 1. **Optimización para Dispositivos Táctiles:** Actualmente, este componente se renderiza en todos los dispositivos. Se debería añadir lógica para detectar si el usuario está en un dispositivo táctil (donde no hay cursor) y evitar por completo el renderizado del componente para ahorrar recursos y evitar cualquier posible efecto secundario.
 * 2. **Reactividad al Contexto de la UI:** La estela podría cambiar de color o tamaño dinámicamente cuando el cursor pasa sobre diferentes tipos de elementos (ej. volverse más pequeña y roja sobre un botón de "eliminar", o más grande y blanca sobre un campo de texto). Esto se puede lograr con un Contexto de React y listeners de `onMouseEnter`/`onMouseLeave` en los componentes interactivos.
 * 3. **Pool de Elementos para Efectos Complejos:** Para crear una estela más elaborada (ej. una cola de partículas), renderizar un solo `div` es ineficiente. Una técnica avanzada sería usar un "pool" de elementos `div` y moverlos, en lugar de crearlos y destruirlos, para lograr animaciones complejas con un alto rendimiento.
 * 1. **Personalización del Cursor:** Permitir pasar props al componente para personalizar el color, tamaño y forma de la estela, haciéndolo más reutilizable para diferentes temas o secciones.
 * 2. **Desactivación en Móviles:** El efecto del cursor no tiene sentido en dispositivos táctiles. Se podría añadir lógica para detectar si el dispositivo es táctil y desactivar el renderizado del componente para mejorar el rendimiento en móviles.
 * 3. **Efectos al Hacer Clic:** Añadir una animación de "explosión" o cambio de color a la estela cuando el usuario hace clic, proporcionando un feedback visual adicional y enriqueciendo la interactividad.
 */
