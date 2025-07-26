Has delineado la visión para el corazón de la plataforma Metashark: el Constructor de Campañas Interactivo. Comprendo a la perfección la magnitud y la sofisticación de lo que estamos a punto de construir. Esto no es solo añadir una característica; es crear un producto dentro de nuestro producto.
Como tu arquitecta de software, mi primer deber es tomar esta visión compleja y traducirla en un blueprint arquitectónico claro, robusto y escalable. Este blueprint será nuestra hoja de ruta. No escribiremos una sola línea de código de la característica hasta que estemos de acuerdo en que la fundación es perfecta.
Este aparato de trabajo será puramente arquitectónico, el más importante hasta ahora.
Recordatorio de Nuestra Metodología "Metashark" para la Entrega de Aparatos de Código
Esta entrega, aunque no contenga código de la aplicación, se adhiere a nuestro estándar "FULL":
Visión Completa y Autocontenida: Te proporcionaré un plan arquitectónico completo que no requerirá consultas externas.
Documentación Profesional: Cada decisión arquitectónica estará justificada, explicando el porqué de la tecnología y la estructura elegida.
Proactividad y Visión 360: El plan no solo cubrirá lo solicitado, sino que anticipará problemas de rendimiento, escalabilidad y experiencia de desarrollador (DX).
Mejoras Futuras Implícitas: El propio blueprint está diseñado para ser modular, permitiendo futuras expansiones de manera natural.
Comunicación Estructurada: Te presentaré el plan en fases lógicas y digeribles, culminando en una llamada a la acción clara.
Aparato de Trabajo N.º 19: Blueprint Arquitectónico del Constructor de Campañas Interactivo
Visión General
El objetivo es construir un editor visual (WYSIWYG - What You See Is What You Get) de landing pages, altamente performante y modular, integrado en nuestra aplicación. La arquitectura debe priorizar:
Modularidad: Los "webcomponents" (Bloques) deben ser componentes React independientes y reutilizables.
Gestión de Estado Centralizada: La estructura completa de la página que el usuario está construyendo debe vivir en un único y fiable almacén de estado (store).
Renderizado Desacoplado: El motor de renderizado en el "canvas" debe ser una representación pura del estado, permitiendo un "hot replace" instantáneo.
Escalabilidad: La arquitectura debe soportar fácilmente la adición de nuevos bloques (headers, footers, etc.), nuevas opciones de personalización y nuevos tipos de exportación en el futuro.
A continuación, el plan detallado.
Fase 1: Estructura de Archivos y Directorios
Para mantener una clara Separación de Intereses (Separation of Concerns), toda la lógica del constructor vivirá en una nueva sección de la aplicación.
Propongo la siguiente estructura de directorios:
Generated code
app/
└── [locale]/
    └── builder/
        ├── [campaignId]/         // Ruta dinámica para editar una campaña específica
        │   ├── layout.tsx        // Layout del constructor (pantalla dividida)
        │   └── page.tsx          // Lógica principal de carga de la campaña
        ├── components/           // Componentes UI *exclusivos* del constructor
        │   ├── Canvas.tsx        // El lienzo de previsualización de la derecha
        │   ├── SettingsPanel.tsx // El panel de personalización de la izquierda
        │   ├── BlocksPalette.tsx // Paleta de bloques predefinidos (headers, etc.)
        │   └── PublishDialog.tsx // Modal para las opciones de publicación/exportación
        ├── core/                 // El "cerebro" del constructor
        │   ├── store.ts          // Almacén de estado global (Zustand)
        │   └── renderer.tsx      // Lógica para renderizar los bloques desde el JSON
        └── templates/            // Biblioteca de bloques de construcción (los "webcomponents")
            ├── index.ts          // Exporta un mapa de todos los bloques
            ├── Header/
            │   ├── Header1.tsx
            │   └── Header2.tsx
            ├── Hero/
            │   ├── Hero1.tsx
            │   └── Hero2.tsx
            └── ... (Footer, CTA, etc.)
Use code with caution.
Justificación:
/builder/[campaignId]: Aisla completamente el constructor del resto del dashboard. Permite un layout específico (pantalla completa, sin sidebar del dashboard) y una carga de datos dedicada.
/components: Mantiene la UI del constructor separada de la UI general de la aplicación.
/core: El corazón de la lógica. Separar el store y el renderer nos permite pensar en ellos como sistemas independientes.
/templates: La biblioteca de bloques. Es la parte más importante para la escalabilidad. Añadir un nuevo "Header 3" es tan simple como crear un nuevo archivo aquí y registrarlo en index.ts.
Fase 2: Selección de Tecnologías Clave
Para construir esta experiencia, necesitamos las herramientas adecuadas. Mis recomendaciones son:
Gestión de Estado: Zustand
Porqué: El estado de una página entera (un árbol de componentes con sus props) es demasiado complejo para useState o Context. Zustand es un gestor de estado global minimalista, potente y sin boilerplate. Nos permitirá modificar el estado de un bloque desde el panel de ajustes y ver el cambio reflejado instantáneamente en el canvas sin re-renderizar toda la UI del constructor.
Drag and Drop: dnd-kit
Porqué: Es la biblioteca de arrastrar y soltar más moderna y performante para React. Es altamente personalizable, accesible y nos dará el control granular que necesitamos para crear una experiencia de "arrastrar desde la paleta al canvas" y "reordenar bloques en el canvas".
Renderizado en el Canvas: Un Motor de Renderizado Personalizado
Porqué: El canvas de la derecha no será un simple div. Será un componente Canvas que leerá el estado (el árbol de componentes en formato JSON) desde nuestro store de Zustand. Luego, mapeará cada objeto del JSON a su componente React correspondiente de la carpeta /templates. Este desacoplamiento es lo que permite el "hot replace" instantáneo.
Exportación a ZIP: jszip y file-saver
Porqué: Para la exportación a un proyecto de React, necesitaremos una Server Action que:
Tome el JSON de la página.
Genere las cadenas de texto para los archivos (index.html, App.jsx, package.json, etc.) usando plantillas.
Use jszip (una librería de Node.js) para crear un archivo .zip en memoria.
Devuelva el zip como un buffer al cliente, que usará file-saver para iniciar la descarga en el navegador.
Fase 3: Modelo de Datos en Supabase
Necesitamos una forma de persistir el trabajo del usuario. Propongo modificar o crear la tabla pages:
Tabla: pages
id (uuid, primary key)
campaign_id (uuid, foreign key a campaigns)
name (text, ej. "Página de Ventas Principal")
content (jsonb): Esta es la columna clave. Almacenará el objeto JSON completo que representa la estructura y el contenido de la landing page construida.
status (enum: 'draft', 'published')
created_at, updated_at
Justificación:
Usar jsonb es extremadamente flexible y performante en PostgreSQL. Nos permite guardar estructuras anidadas complejas sin tener que definir un esquema de base de datos rígido para cada posible prop de cada bloque. Podemos evolucionar nuestros bloques en el frontend sin necesitar migraciones de base de datos constantes.
Fase 4: Plan de Implementación por Etapas
Este es un proyecto masivo. Debemos abordarlo de forma incremental.
Etapa 1: El Núcleo del Constructor (MVP)
Crear la estructura de archivos y rutas.
Definir el layout.tsx de la pantalla dividida.
Implementar el store de Zustand con una estructura de datos inicial para una página (ej. [{ type: 'Header1', props: {...} }]).
Crear 2-3 bloques básicos en /templates (ej. Header1, Hero1).
Construir el Canvas.tsx que renderiza los bloques desde el store.
Construir el SettingsPanel.tsx que, al seleccionar un bloque, muestra sus props y permite modificarlas (actualizando el store).
Etapa 2: Interactividad y Biblioteca de Bloques
Implementar la BlocksPalette.tsx.
Integrar dnd-kit para arrastrar nuevos bloques desde la paleta al canvas.
Ampliar la biblioteca en /templates con más variedad de bloques.
Etapa 3: Persistencia y Publicación
Crear la Server Action "Guardar" que envíe el estado del store de Zustand a la columna content en Supabase.
Crear la ruta pública final (ej. app/c/[campaignSlug]/page.tsx) que:
Obtenga el campaignSlug de la URL.
Consulte la base de datos para obtener el content JSON de la página publicada.
Use el mismo motor de renderizado (renderer.tsx) para construir la página estáticamente (SSG).
Etapa 4: Funcionalidades de Exportación
Implementar la Server Action para la exportación a ZIP.
Conclusión del Aparato Arquitectónico
Este blueprint establece una fundación sólida y moderna para el Constructor de Campañas Interactivo. Separa las preocupaciones, elige las tecnologías adecuadas para cada tarea y traza un camino de desarrollo incremental que nos permitirá entregar valor en cada etapa. Hemos depurado la visión, jerarquizado los pasos y definido la tecnología.
Esta es la arquitectura que nos permitirá construir una herramienta de clase mundial.
Ahora que tenemos el plan maestro, estamos listos para poner la primera piedra.