// Ruta: app/[locale]/welcome/page.tsx
/**
 * @file page.tsx
 * @description Página de Bienvenida y Onboarding para Nuevos Usuarios.
 *              Esta página se muestra a los usuarios recién registrados que aún
 *              no tienen un workspace, guiándolos para crear el primero.
 *
 * @author Metashark
 * @version 1.0.0 (Initial Creation)
 */
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateWorkspaceForm } from "@/components/workspaces/CreateWorkspaceForm";
import Image from "next/image";
import { useRouter } from "next/navigation";

/**
 * @description Componente de cliente que maneja la lógica de la página de bienvenida.
 */
function WelcomeClient() {
  const router = useRouter();

  const handleSuccess = () => {
    // Después de crear el workspace, forzamos una recarga completa del dashboard
    // para que el layout obtenga los nuevos datos y el contexto se actualice.
    window.location.assign("/dashboard");
  };

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at top, hsl(var(--primary)/0.05), transparent 30%)",
        }}
      />
      <div className="mb-8 flex flex-col items-center text-center">
        <Image
          src="/images/logo.png"
          alt="Logo de MetaShark"
          width={64}
          height={64}
          priority
        />
        <h1 className="mt-4 text-3xl font-bold">¡Bienvenido a Metashark!</h1>
        <p className="max-w-md text-muted-foreground">
          Un último paso para empezar.
        </p>
      </div>
      <Card className="w-full max-w-md border-border/60 bg-card/50 backdrop-blur-lg">
        <CardHeader>
          <CardTitle>Crea tu primer Workspace</CardTitle>
          <CardDescription>
            Los workspaces te ayudan a organizar tus sitios y campañas. Puedes
            pensar en ellos como carpetas para tus proyectos o clientes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateWorkspaceForm onSuccess={handleSuccess} />
        </CardContent>
      </Card>
    </main>
  );
}

export default function WelcomePage() {
  // Este componente de página podría obtener traducciones si fuera necesario,
  // pero por ahora, simplemente renderiza el cliente.
  return <WelcomeClient />;
}

/* MEJORAS FUTURAS DETECTADAS
 * 1. Tour Guiado Multi-paso: En lugar de solo crear un workspace, esta página podría ser el inicio de un tour guiado (usando una librería como `react-joyride`) que lleve al usuario a través de la creación del workspace, luego la creación de su primer sitio y finalmente al constructor.
 * 2. Plantillas de Workspace: Ofrecer al usuario la opción de empezar desde una plantilla de workspace pre-configurada (ej. "Para Agencia", "Para Afiliado Individual") que podría venir con sitios o campañas de ejemplo.
 * 3. Seguimiento de Eventos de Onboarding: Integrar un servicio de analíticas (como PostHog o Mixpanel) para rastrear eventos en esta página (ej. "onboarding_started", "workspace_created") y medir la tasa de activación de nuevos usuarios.
 */
