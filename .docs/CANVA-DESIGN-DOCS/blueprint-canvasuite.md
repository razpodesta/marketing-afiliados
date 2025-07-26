Aparato de Trabajo N.º 33: Blueprint Arquitectónico del Constructor de Campañas (Versión 3.0 - Estado Actual y Próximos Pasos)
Visión General (Actualizada)
Hemos pasado de la planificación a la implementación exitosa de las etapas fundamentales del Constructor de Campañas. La visión de un editor visual (WYSIWYG) modular, con estado centralizado y renderizado desacoplado, no solo se mantiene, sino que ha sido validada y construida. Este documento actualiza el blueprint original para reflejar el progreso realizado, las decisiones arquitectónicas tomadas y el camino claro hacia la finalización.
Fase 1: Estructura de Archivos y Directorios (Implementada y Refinada)
Nuestra estructura de archivos ha evolucionado y se ha solidificado. La decisión de co-ubicar los bloques de plantilla dentro de /components ha sido una mejora clave que hemos implementado.
Estructura Actual (Implementada):
Generated code
app/
└── [locale]/
    └── builder/
        ├── [campaignId]/
        │   ├── layout.tsx         // ✅ HECHO: Orquesta DndContext y la UI de edición.
        │   └── page.tsx           // ✅ HECHO: Carga datos de Supabase e inicializa el store.
        └── components/
            ├── BlocksPalette.tsx      // ✅ HECHO: Muestra bloques arrastrables.
            ├── BuilderHeader.tsx      // ✅ HECHO: Contiene acciones principales (Guardar).
            ├── Canvas.tsx           // ✅ HECHO: Renderiza los bloques desde el store.
            ├── DraggableBlockWrapper.tsx // ✅ HECHO: HOC para interactividad de bloques.
            └── SettingsPanel.tsx      // ✅ HECHO: Panel de edición dinámico.
components/
└── templates/                     // ✅ HECHO (Reubicado): Biblioteca central de bloques.
    ├── Header/
    │   └── Header1.tsx
    ├── Hero/
    │   └── Hero1.tsx
    └── index.ts                 // ✅ HECHO: Registro de bloques.
lib/
└── builder/
    └── types.d.ts                 // ✅ HECHO: Nuestro "contrato de datos" oficial.
    
Lógica y Justificación (Validada):
Aislamiento Exitoso: La ruta /builder está completamente aislada, con su propio layout, permitiendo una experiencia de edición inmersiva.
Modularidad Comprobada: La co-ubicación de /templates dentro de /components ha simplificado las importaciones y ha hecho que la estructura del proyecto sea más intuitiva. Añadir nuevos bloques es un proceso claro y escalable.
Componentes de Responsabilidad Única: La separación de Canvas, SettingsPanel, BlocksPalette, etc., ha demostrado ser una arquitectura limpia que nos ha permitido construir e iterar rápidamente.
Fase 2: Selección de Tecnologías Clave (Implementadas)
Todas nuestras elecciones tecnológicas iniciales han sido implementadas y han demostrado ser las correctas para el trabajo.
Gestión de Estado (Zustand): Implementado y Funcional.
Estado Actual: Nuestro store.ts (app/[locale]/builder/core/store.ts) es ahora el cerebro del constructor. Gestiona no solo el campaignConfig, sino también el selectedBlockId y el estado isSaving. Proporciona acciones granulares para añadir, mover, eliminar y actualizar bloques, todo de forma centralizada.
Ventaja Realizada: Hemos visto cómo el Canvas y el SettingsPanel reaccionan a los cambios en el store sin necesidad de comunicación directa, validando la arquitectura desacoplada.
Drag and Drop (@dnd-kit): Implementado y Funcional.
Estado Actual: El DndContext en el layout.tsx orquesta la lógica de arrastrar y soltar. La BlocksPalette implementa useDraggable para hacer que los bloques sean arrastrables, y el Canvas junto con DraggableBlockWrapper usan SortableContext y useSortable para permitir el reordenamiento.
Ventaja Realizada: La experiencia de usuario de añadir y reordenar bloques es fluida y cumple con los estándares de una aplicación moderna.
Renderizado en el Canvas: Implementado y Funcional.
Estado Actual: El Canvas.tsx lee el array blocks del store, y utilizando el blockRegistry de components/templates/index.ts, renderiza dinámicamente el componente React correspondiente para cada bloque.
Ventaja Realizada: El "hot replace" es instantáneo. Cualquier cambio en el SettingsPanel que actualice el store se refleja inmediatamente en el Canvas.
Fase 3: Modelo de Datos en Supabase (Implementado y Refinado)
Hemos refinado y expandido nuestro modelo de datos.
Tabla campaigns (Actualizada):
content (jsonb): Implementada. Esta columna ahora existe en nuestra base de datos y es la que persistirá el trabajo del usuario.
updated_at (timestamptz): Implementada. Con su trigger automático, garantiza la integridad de los datos.
Tabla invitations (Diseñada e Implementada):
Hemos añadido esta tabla a nuestro esquema para soportar la funcionalidad colaborativa de los workspaces.
ENUM app_role (Actualizado):
Se ha expandido para incluir el rol 'admin', formalizando nuestra arquitectura de permisos de tres niveles.
Fase 4: Plan de Implementación por Etapas (Progreso y Próximos Pasos)
Hemos completado una parte significativa del plan.
Etapa 1: El Núcleo del Constructor: ✅ COMPLETADO.
Hemos creado la estructura, definido el layout, implementado el store, creado los primeros bloques y construido el Canvas y el SettingsPanel funcionales.
Etapa 2: Interactividad y Biblioteca de Bloques: ✅ COMPLETADO.
Hemos implementado la BlocksPalette y la funcionalidad completa de drag-and-drop con @dnd-kit.
Etapa 3: Persistencia y Publicación: PARCIALMENTE COMPLETADO.
updateCampaignContentAction: ✅ HECHO. Hemos creado la Server Action que permite guardar el estado del constructor en la base de datos. El botón "Guardar" en el BuilderHeader ya la utiliza.
Página de Publicación (/c/[slug]): ⏳ PRÓXIMO PASO CRÍTICO. Esta es la siguiente gran pieza a construir. Necesitamos crear la ruta que leerá el content JSON y lo renderizará como una página pública estática y de alta velocidad.
Etapa 4: Funcionalidades de Exportación: 📋 PENDIENTE.
La implementación de la exportación a ZIP con jszip sigue siendo un objetivo futuro.
Conclusión del Blueprint Actualizado
El blueprint del Constructor de Campañas ha pasado de ser un plan teórico a una realidad funcional y arquitectónicamente sólida. Hemos implementado con éxito el núcleo de la experiencia de edición, desde la carga de datos hasta la edición interactiva y la persistencia.
Nuestras decisiones tecnológicas han sido validadas, y la estructura modular que diseñamos nos ha permitido avanzar rápidamente sin sacrificar la calidad. El proyecto está en un estado saludable y el camino a seguir es claro.