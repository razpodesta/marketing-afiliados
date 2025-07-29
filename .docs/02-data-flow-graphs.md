.docs/02-data-flow-graphs.md - Diagramas de Flujo de Datos
Para visualizar la lógica del sistema, he generado los siguientes diagramas de flujo.
Flujo 1: Onboarding de Nuevo Usuario (Crítico para la Estabilidad)
Este flujo es automático y se dispara por un trigger de base de datos para garantizar que ningún usuario quede en un estado "huérfano" sin un workspace.
Generated mermaid
graph TD
subgraph "Navegador del Usuario"
A[Registro con Email/OAuth] --> B{Formulario de Login};
end

    subgraph "Supabase Auth"
        B --> C[auth.users];
    end

    subgraph "Supabase Base de Datos (Trigger)"
        C -- ON INSERT --> D[Función: handle_new_user()];
        D --> E[1. INSERT en public.profiles];
        D --> F[2. Llama a RPC: create_workspace_with_owner];
    end

    subgraph "RPC: create_workspace_with_owner"
        F --> G[BEGIN TRANSACTION];
        G --> H[1. INSERT en public.workspaces];
        H --> I[2. INSERT en public.workspace_members (rol: owner)];
        I --> J[COMMIT TRANSACTION];
    end

    J --> K[Usuario redirigido a /dashboard];

Mermaid
Flujo 2: Carga y Renderizado del Dashboard de Sitios (Bucle Principal de la UI)
Este es el flujo más común para un usuario que regresa a la aplicación.
Generated mermaid
graph TD
A[Usuario accede a /dashboard/sites] --> B{Middleware};
B -- Valida sesión --> C[Server Component: sites/page.tsx];
C -- Lee cookie 'active_workspace_id' --> D[Capa de Datos: lib/data/sites.ts];
D -- Llama a getSitesByWorkspaceId() --> E[Supabase DB];
E -- Retorna sitios + count(campaigns) --> D;
D --> C;
C -- Pasa datos como props --> F[Client Component: sites-client.tsx];
F -- Renderiza UI --> G[Cuadrícula de Sitios Interactiva];

Mermaid
Flujo 3: Guardado de una Campaña (Interacción con el Constructor)
Este flujo demuestra el patrón de Server Actions para la mutación de datos.
Generated mermaid
graph TD
A[Usuario edita en el Builder] --> B{Estado en Zustand Store se actualiza};
B --> C[Usuario hace clic en 'Guardar' en BuilderHeader.tsx];
C --> D[Llamada a Server Action: updateCampaignContentAction(campaignId, content)];
D -- "use server" --> E{Lógica del Servidor};
E -- 1. Valida permisos del usuario --> F[Supabase DB];
E -- 2. UPDATE campaigns SET content = ... --> F;
F -- Retorna éxito/error --> D;
D -- 3. Llama a revalidatePath() --> G[Cache de Next.js se invalida];
D --> H[Cliente recibe respuesta];
H --> I[Muestra Toast de Éxito/Error];
