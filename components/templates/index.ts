// components/templates/index.ts
/**
 * @file index.ts
 * @description Registro central de todos los bloques de construcción disponibles.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 2.0.0 (Path Alias Correction)
 */
import React from "react";

import type { PageBlock } from "@/lib/builder/types.d";
import { Header1 } from "@/templates/Headers/Header1";
import { Hero1 } from "@/templates/Heros/Hero1";

type BlockComponent = React.ComponentType<any>;

export const blockRegistry: Record<string, BlockComponent> = {
  Header1,
  Hero1,
  // A medida que añadamos más bloques, los registraremos aquí.
};

/* MEJORAS FUTURAS DETECTADAS
 * 1. Carga Dinámica de Bloques (Lazy Loading): A medida que el registro crezca, importarlos todos estáticamente puede aumentar el tamaño del bundle inicial. Se podría refactorizar para usar `React.lazy` y `dynamic` de Next.js, de modo que el código de un bloque solo se cargue cuando se arrastre al canvas por primera vez.
 */
