# Estrategia de Auditoría y Re-Arquitectura: Capa de Datos y Diagnóstico

**ID de Documento:** LIA-DOC-04
**Versión:** 1.0
**Autor:** L.I.A. Legacy
**Contexto:** Este documento detalla la estrategia para la auditoría, refactorización y eventual reconstrucción del núcleo de datos del proyecto Metashark.

---

### 1. Resumen de la Fase Anterior: Re-Arquitectura de la Capa de Datos (`lib/data`)

En la fase anterior, se identificó que el acceso a los datos estaba disperso y carecía de una estructura cohesiva, lo que provocaba inestabilidad de tipos (errores `never`) y dificultades de mantenimiento.

**Acciones Realizadas:**

-   Se estableció una **Capa de Acceso a Datos (DAL)** centralizada en el directorio `lib/data/`.
-   Se adoptó una arquitectura granular, creando "aparatos" (módulos de TypeScript) especializados por cada entidad de la base de datos:
    -   `permissions.ts`: Única fuente de verdad para la lógica de autorización.
    -   `workspaces.ts`: Gestiona consultas de contexto de trabajo del usuario.
    -   `sites.ts`: Gestiona consultas de sitios, con tipado robusto para resolver inestabilidad en la UI.
    -   `campaigns.ts`: Separa la consulta de metadatos de la consulta de contenido pesado (`JSONB`) para optimizar el rendimiento.
    -   `modules.ts`: Gestiona la configuración de la UI del dashboard desde la base de datos.
-   Se estableció el uso de un **barrel file (`lib/data/index.ts`)** para un consumo limpio y organizado de estos aparatos en el resto de la aplicación.

**Resultado:** La lógica de negocio (`Server Actions`) y la de presentación (`Server Components`) ahora están desacopladas de la lógica de consulta, creando un sistema más robusto y mantenible.

### 2. Misión Actual: Radiografía del Sistema de Datos Existente

Antes de proceder con la reconstrucción del esquema de la base de datos, la directiva actual es realizar una **auditoría exhaustiva del estado "as-is"**.

**Objetivo Principal:**

Extraer toda la información y la lógica implícita de la base de datos actual a través de los scripts de diagnóstico existentes. El objetivo no es solo ejecutar los scripts, sino refactorizarlos para que sirvan como herramientas de diagnóstico de alta precisión.

**Filosofía:** "No demoler un edificio sin antes estudiar sus planos y su estructura. Podríamos encontrar cimientos valiosos que vale la pena preservar".

### 3. La Nueva Arquitectura de Diagnóstico (`scripts/`)

La carpeta `scripts/` se transformará de una colección de herramientas ad-hoc a una **Suite de Diagnóstico y Auditoría de Nivel de Ingeniería**.

**Principios de Refactorización:**

1.  **Especialización Atómica:** Cada script tendrá una y solo una responsabilidad. Un script que prueba la conexión no validará el esquema. Un script que audita RLS no medirá la latencia.
2.  **Doble Propósito:** Los scripts se refactorizarán para servir a dos propósitos:
    *   **Inmediato:** Realizar la radiografía completa de la base de datos actual.
    *   **A Largo Plazo:** Servir como herramientas de salud del sistema, integrables en flujos de CI/CD o para diagnósticos manuales rápidos en el futuro.
3.  **Autocontenidos y Verbosos:** Cada script será completamente autocontenido (listo para copiar, pegar y ejecutar) y su salida en la consola será extremadamente clara y detallada, explicando qué está haciendo y qué encontró.

**Inventario de Aparatos a Refactorizar:**

-   `check-db-connection.ts`: Se convertirá en un **Medidor de Latencia y Conectividad Puro**. Su única misión será confirmar que las claves de `anon` y `service_role` son válidas y reportar el tiempo de respuesta.
-   `diagnose-db-schema.mjs`: Se convertirá en el **Radiógrafo de Esquema**. Utilizará introspección de PostgreSQL para mapear cada tabla, columna, tipo de dato, nulabilidad y relación de clave foránea.
-   `diagnose-rls-policies.mjs`: Se convertirá en el **Auditor de Políticas de Seguridad**. Su única misión será listar todas las políticas de RLS activas y sus definiciones.
-   `diagnose-data-layer.ts`: Se renombrará a `diagnose-query-integrity.ts`. Se convertirá en un **Validador de Contratos de Datos**. Su misión será ejecutar las consultas clave de la capa de datos (`lib/data`) y validar que la forma de los datos devueltos coincide con los tipos de TypeScript definidos, actuando como una prueba de integración.
-   `diagnose-supabase-config.mjs`: Se mantendrá como el **Auditor de Configuración de Plataforma**, verificando la configuración a nivel de la Management API de Supabase.

Esta suite de herramientas nos proporcionará una comprensión total y profunda del sistema actual antes de tomar la decisión final de reconstruirlo.