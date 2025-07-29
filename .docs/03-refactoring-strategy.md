.docs/03-refactoring-strategy.md - La Nueva Arquitectura de Acceso a Datos
La estrategia actual de acceso a datos está dispersa. Para cumplir con la directiva, la refactorizaremos bajo una filosofía de Especialización y Composición:
Un Archivo por Entidad: Toda la lógica de consulta para una entidad de la base de datos (workspaces, sites, permissions, etc.) residirá en su propio archivo dentro de lib/data/.
Aparatos Atómicos: Cada función dentro de estos archivos será un "aparato" especializado. Realizará una única consulta lógica, será explícita en los datos que selecciona y devolverá un tipo de dato fuertemente tipado y exportado.
Abstracción Completa: Ningún otro módulo del sistema (Server Actions, Server Components) consultará la base de datos directamente. En su lugar, importarán y utilizarán estos aparatos atómicos.
Composición con Barrel Files: Un archivo lib/data/index.ts exportará todos los módulos de datos como namespaces, permitiendo un consumo limpio y organizado. Ejemplo: import { sites, permissions } from "@/lib/data";
Esta arquitectura transforma la capa de datos en un conjunto de "Lego" predecible, testeable y fácil de mantener.
