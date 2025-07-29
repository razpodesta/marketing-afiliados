.docs/01-project-overview.md - Comprensión del Sistema
Mi análisis del snapshot revela que marketing-afiliados es una plataforma SaaS (Software as a Service) multi-tenant diseñada para especialistas en marketing. Su arquitectura se fundamenta en los siguientes conceptos clave:
Multi-tenencia por Workspace: El workspace es la unidad principal de organización. Un usuario puede poseer o ser miembro de múltiples workspaces. Cada workspace es un contenedor aislado para proyectos.
Entidades Jerárquicas: La estructura de datos sigue una jerarquía lógica clara: un Usuario pertenece a Workspaces, que contienen Sitios (subdominios), que a su vez contienen Campañas (landing pages, quizzes, etc.).
Control de Acceso Dual: La seguridad se maneja en dos niveles:
Rol de Aplicación (app_role): Define permisos globales (user, admin, developer).
Rol de Workspace (workspace_role): Define permisos granulares dentro de un workspace específico (owner, admin, member).
Núcleo Funcional - El Constructor: El corazón de la aplicación es un constructor visual (/builder) que permite a los usuarios componer Campañas a partir de bloques predefinidos, guardando el resultado como un objeto JSONB en la base de datos.
Punto de Entrada Unificado (Middleware): El middleware.ts actúa como el controlador de tráfico principal, gestionando la internacionalización (i18n), el enrutamiento de subdominios, la protección de rutas y el contexto de sesión.