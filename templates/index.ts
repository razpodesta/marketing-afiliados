/* Ruta: templates/index.ts */

import React from "react";
import { Header1, type Header1Props } from "./Header/Header1";
import { Hero1, type Hero1Props } from "./Hero/Hero1";
import { PageBlock } from "@/lib/builder/types.d";

/**
 * @file index.ts
 * @description Registro central de todos los bloques de construcción disponibles.
 * Este objeto actúa como un mapa que asocia el `type` de un bloque (un string)
 * con su componente React real. Es el núcleo del motor de renderizado dinámico.
 * Añadir un nuevo bloque a la plataforma solo requiere importarlo y añadirlo a este mapa.
 *
 * @author Metashark
 * @version 1.0.0
 */

type BlockComponent = React.ComponentType<any>;

export const blockRegistry: Record<string, BlockComponent> = {
  Header1,
  Hero1,
  // A medida que añadamos más bloques, los registraremos aquí.
  // Footer1: Footer1,
};
/* Ruta: templates/index.ts */
