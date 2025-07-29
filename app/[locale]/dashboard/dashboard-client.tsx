// app/[locale]/dashboard/dashboard-client.tsx
"use client";

import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { HelpCircle, LayoutTemplate, PenSquare, Plus, Zap } from "lucide-react";
import { useFormatter } from "next-intl";
import React, { useState, useTransition } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { profiles as profileActions } from "@/lib/actions";
import { useDashboard } from "@/lib/context/DashboardContext";
import type { FeatureModule } from "@/lib/data/modules";
import type { Tables } from "@/lib/types/database";
import { type AppPathname, useRouter } from "@/navigation";

/**
 * @file dashboard-client.tsx
 * @description Interfaz de usuario principal del "Centro de Comando de Campañas".
 *              Ahora con personalización de layout mediante drag-and-drop.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 14.0.0 (Dashboard Personalization)
 */
const SortableActionCard = ({
  module,
  isPrimary = false,
}: {
  module: FeatureModule;
  isPrimary?: boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        className={`group h-full cursor-grab active:cursor-grabbing transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
          isPrimary
            ? "bg-primary/10 border-primary/40 hover:border-primary/80 hover:shadow-primary/20"
            : "bg-card hover:border-primary/40 hover:shadow-primary/10"
        }`}
      >
        <CardHeader>
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                isPrimary ? "bg-primary/20" : "bg-muted"
              }`}
            >
              <Plus
                className={`h-5 w-5 ${
                  isPrimary ? "text-primary" : "text-foreground"
                }`}
              />
            </div>
            <h3 className="text-md font-semibold">{module.title}</h3>
          </div>
          <p className="text-sm text-muted-foreground pt-2">
            {module.description}
          </p>
        </CardHeader>
      </Card>
    </div>
  );
};

const RecentCampaigns = ({
  campaigns,
}: {
  campaigns: Tables<"campaigns">[];
}) => {
  const format = useFormatter();
  const router = useRouter();

  if (campaigns.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-bold mb-4">
          ¡Empecemos tu primera campaña!
        </h2>
        <Card className="border-primary/40 border-dashed bg-primary/5">
          <CardHeader className="flex-row items-center gap-4">
            <Zap className="h-8 w-8 text-primary" />
            <div>
              <h3 className="font-bold">Campaña Guiada</h3>
              <p className="text-muted-foreground text-sm">
                Te guiaré paso a paso para crear una landing page de alta
                conversión.
              </p>
            </div>
            <Button
              className="ml-auto"
              onClick={() => {
                /* Lógica para abrir modal de creación */
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Crear mi Primera Campaña
            </Button>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Continuar trabajando en...</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {campaigns.map((campaign) => (
          <Card
            key={campaign.id}
            className="group cursor-pointer hover:border-primary/40"
            onClick={() =>
              router.push(`/builder/${campaign.id}` as AppPathname)
            }
          >
            <CardHeader>
              <h3 className="font-semibold truncate">{campaign.name}</h3>
              <p className="text-sm text-muted-foreground">
                Última edición:{" "}
                {format.relativeTime(
                  new Date(campaign.updated_at || campaign.created_at)
                )}
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-24 bg-muted rounded-md flex items-center justify-center">
                <span className="text-xs text-muted-foreground">
                  Previsualización
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export function DashboardClient({
  recentCampaigns,
}: {
  recentCampaigns: Tables<"campaigns">[];
}) {
  const { user, modules: initialModules } = useDashboard();
  const [modules, setModules] = useState(initialModules);
  const [isPending, startTransition] = useTransition();
  const username = user.user_metadata?.full_name || user.email;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = modules.findIndex((m) => m.id === active.id);
      const newIndex = modules.findIndex((m) => m.id === over!.id);
      const newOrder = arrayMove(modules, oldIndex, newIndex);
      setModules(newOrder);

      startTransition(async () => {
        const moduleIds = newOrder.map((m) => m.id);
        const result =
          await profileActions.updateDashboardLayoutAction(moduleIds);
        if (!result.success) {
          toast.error(
            result.error || "No se pudo guardar el orden del dashboard."
          );
          setModules(modules); // Revertir en caso de error
        }
      });
    }
  };

  const creationActions = [
    {
      id: "create-campaign", // Usar un ID único y estable
      title: "Crear Campaña Completa",
      description: "Inicia el flujo guiado para una nueva campaña.",
      icon: Plus,
      isPrimary: true,
    },
    {
      id: "quick-landing",
      title: "Landing Rápida",
      description: "Genera una landing a partir de una idea.",
      icon: LayoutTemplate,
    },
    {
      id: "ad-script-generator",
      title: "Generar Script de Anuncio",
      description: "Crea un copy persuasivo para tus ads.",
      icon: PenSquare,
    },
  ];

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex h-full flex-col gap-8 relative">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute top-0 right-0">
                <HelpCircle className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">
                Este es tu Centro de Comando. Arrastra y suelta las tarjetas
                para personalizar tu layout.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.1 } },
          }}
          className="flex flex-col gap-8"
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0 },
            }}
          >
            <h1 className="text-2xl font-bold text-foreground">
              Bienvenido, {username}
            </h1>
            <p className="text-md text-muted-foreground">
              ¿Qué campaña de alto rendimiento vamos a lanzar hoy?
            </p>
          </motion.div>
          <SortableContext
            items={creationActions.map((a) => a.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {creationActions.map((action) => (
                <SortableActionCard
                  key={action.id}
                  module={{
                    ...action,
                    href: "",
                    status: "active",
                    tooltip: "",
                  }} // Adaptar al tipo FeatureModule
                  isPrimary={action.isPrimary}
                />
              ))}
            </div>
          </SortableContext>
          <RecentCampaigns campaigns={recentCampaigns} />
        </motion.div>
      </div>
    </DndContext>
  );
}
/* MEJORAS FUTURAS DETECTADAS
 * 1. Carga de Módulos desde la Base de Datos: El array `featureModules` está codificado en duro. La mejor práctica es mover esta configuración a una tabla en Supabase. Esto permitiría al equipo de producto habilitar/deshabilitar módulos, cambiar su estado (`beta`, `soon`) o actualizar sus descripciones sin necesidad de un despliegue de código.
 * 2. Módulos Basados en Permisos del Plan: Para la monetización, la consulta que obtenga los módulos de la base de datos debería hacer un `JOIN` con el plan de suscripción del usuario actual. Esto permitiría filtrar la lista de `featureModules` y mostrar solo aquellos a los que el usuario tiene acceso, mostrando los demás como "bloqueados" con una invitación a actualizar su plan.
 * 3. Personalización del Dashboard (Drag-and-Drop): Implementar una librería como `dnd-kit` para permitir a los usuarios arrastrar y soltar los módulos para reorganizar su dashboard. La preferencia de orden se podría guardar como un JSON en la tabla `profiles` del usuario.
 */
/* MEJORAS PROPUESTAS
 * 1. **Analíticas de Módulos:** Integrar un hook de analíticas (como Vercel Analytics o PostHog) dentro del `onClick` del `Link` en `ModuleCard`. Esto permitiría rastrear qué módulos son los más utilizados por los usuarios, proporcionando datos valiosos para la toma de decisiones de producto.
 * 2. **Carga de Datos de Módulos desde API:** El siguiente paso evolutivo es mover el array `featureModules` a una tabla en Supabase. El componente de servidor (`page.tsx`) podría obtener estos datos y pasarlos como prop. Esto permitiría al equipo de producto habilitar/deshabilitar módulos o cambiar su estado (`beta`, `soon`) sin necesidad de un despliegue de código.
 * 3. **Tour Guiado con `react-joyride`:** Implementar un tour interactivo para nuevos usuarios que se active en su primera visita al dashboard. El tour podría resaltar el selector de workspace, un par de módulos clave y la sección de ajustes, mejorando drásticamente el proceso de onboarding.
 * 1. **Virtualización de la Cuadrícula:** Si el número de módulos creciera significativamente (ej. más de 20), en lugar de mapearlos todos, se podría usar una librería de virtualización como `TanStack Virtual`. Esto solo renderizaría los módulos visibles en la pantalla, manteniendo un rendimiento óptimo incluso con cientos de tarjetas.
 * 2. **Carga de Módulos Basada en Permisos del Plan:** El siguiente paso lógico para la monetización es filtrar el array `featureModules` basándose en el plan de suscripción del usuario. Módulos no incluidos en el plan podrían renderizarse en un estado "deshabilitado" con un tooltip que invite a hacer un upgrade.
 * 3. **Paleta de Comandos para Módulos (`Ctrl+K`):** Implementar una paleta de comandos (con `cmdk`) que permita a los usuarios buscar y navegar a cualquier módulo escribiendo su nombre. Esto transformaría el dashboard en una herramienta de productividad para usuarios avanzados.
 * 1. **Tooltips Enriquecidos:** Los tooltips podrían contener más que solo texto, como un pequeño gráfico de estadísticas o un enlace a la documentación de esa característica, usando el componente `Popover` en lugar de `Tooltip` para contenido más rico.
 * 2. **Carga de Módulos Basada en Permisos:** El array `featureModules` debería ser filtrado basándose en los permisos del plan de suscripción del usuario. Un usuario del plan "Básico" podría ver ciertos módulos deshabilitados con un tooltip que diga "Mejora a Pro para desbloquear".
 * 3. **Animaciones de Layout con `AnimatePresence`:** Al permitir la personalización del dashboard (drag-and-drop), envolver la cuadrícula en el componente `<AnimatePresence>` de Framer Motion permitiría animar la entrada, salida y reordenación de los módulos, creando una experiencia de usuario excepcionalmente fluida.
 * 1. **Carga Dinámica de Módulos desde DB:** En lugar de un array estático, la lista `featureModules` debería cargarse desde una tabla de Supabase. Esto permitiría al administrador activar/desactivar módulos, marcarlos como "beta" o "próximamente" desde un panel de admin sin necesidad de un nuevo despliegue.
 * 2. **Personalización del Dashboard (Drag-and-Drop):** Implementar una librería como `dnd-kit` para permitir a los usuarios arrastrar y soltar los módulos para reorganizar su dashboard. La preferencia de orden se podría guardar como un JSON en la tabla `profiles` del usuario.
 * 3. **Atajos de Teclado:** Implementar atajos de teclado para acceder a los módulos más importantes (ej. `Ctrl+L` para "Suite de Landing Pages"). Esto mejoraría drásticamente la productividad para los usuarios avanzados y reforzaría la sensación de "Centro de Comando".
1.  **Componente `ModuleCard`:** Extraer la lógica de renderizado de cada tarjeta a su propio sub-componente.
2.  **Carga Dinámica de Módulos:** Obtener la lista de `featureModules` de una base de datos o un archivo de configuración.
3.  **Visualización de Sitios Recientes:** Añadir una sección "Acceso Rápido" que utilice la prop `initialSites`.
4.  **Personalización del Dashboard:** Permitir a los usuarios reorganizar las cápsulas mediante drag-and-drop.
1.  **Componente `ModuleCard`:** Extraer la lógica de renderizado de cada tarjeta a su propio
 *    sub-componente (`ModuleCard.tsx`) para mantener este archivo más limpio y promover la
 *    reutilización, especialmente si se planea mostrar estas cápsulas en otros lugares.
2.  **Carga Dinámica de Módulos:** En lugar de tener un array estático, la lista de `featureModules`
 *    podría obtenerse de una base de datos o un archivo de configuración. Esto permitiría
 *    habilitar/deshabilitar funcionalidades a través de un panel de administrador sin necesidad
 *    de redesplegar el código.
3.  **Visualización de Sitios Recientes:** Debajo de la cuadrícula de módulos, añadir una sección de
 *    "Acceso Rápido" o "Sitios Recientes" que utilice la prop `initialSites` para mostrar las 3-4
 *    últimas landings en las que el usuario trabajó, mejorando el flujo de trabajo.
4.  **Personalización del Dashboard:** Permitir a los usuarios arrastrar y soltar (drag-and-drop)
 *    las cápsulas para reorganizar su dashboard según sus herramientas más utilizadas.
 * 1. **Botón "Gestionar Campañas":** Cada `Card` de sitio debería tener un botón principal que lleve a `/dashboard/sites/[siteId]`, donde el usuario gestionará las campañas de ese sitio.
 * 2. **Actualización Optimista:** Al crear o eliminar un sitio, se podría actualizar la UI localmente de inmediato para una experiencia más rápida, revirtiendo el cambio si la acción del servidor falla.
 * 3. **Estado de Carga por Tarjeta:** Refinar la lógica para que solo el botón del sitio que se está eliminando muestre el estado de carga, en lugar de un estado de carga global.
 * 1. **Botón "Gestionar Campañas":** Cada `Card` de sitio debería tener un botón principal que lleve a `/dashboard/sites/[siteId]`, donde el usuario gestionará las campañas de ese sitio.
 * 2. **Actualización Optimista:** Al crear o eliminar un sitio, se podría actualizar la UI localmente de inmediato para una experiencia más rápida, revirtiendo el cambio si la acción del servidor falla.
 * 3. **Estado de Carga por Tarjeta:** Refinar la lógica para que solo el botón del sitio que se está eliminando muestre el estado de carga, en lugar de deshabilitar todos los botones.
 * 1. **Botón "Gestionar Campañas":** Cada `Card` de sitio debería tener un botón principal que lleve a `/dashboard/sites/[siteId]`, donde el usuario gestionará las campañas de ese sitio.
 * 2. **Actualización Optimista:** Al crear o eliminar un sitio, se podría actualizar la UI localmente de inmediato para una experiencia más rápida, revirtiendo el cambio si la acción del servidor falla.
 * 3. **Estado de Carga por Tarjeta:** Refinar la lógica para que solo el botón del sitio que se está eliminando muestre el estado de carga, en lugar de deshabilitar todos los botones.
 * 1. **Botón "Gestionar Campañas":** Cada `Card` de sitio debería tener un botón principal que lleve a `/dashboard/sites/[siteId]`, donde el usuario gestionará las campañas de ese sitio.
 * 2. **Actualización Optimista:** Al crear o eliminar un sitio, se podría actualizar la UI localmente de inmediato para una experiencia más rápida, revirtiendo el cambio si la acción del servidor falla.
 * 3. **Estado de Carga por Tarjeta:** Refinar la lógica para que solo el botón del sitio que se está eliminando muestre el estado de carga, en lugar de deshabilitar todos los botones.
 * 1. **Botón "Gestionar Campañas":** Cada `Card` de tenant debería tener un botón principal que lleve a una nueva página, como `/dashboard/sites/[subdomain]`, donde el usuario pueda ver y gestionar la lista de campañas específicas de ese sitio.
 * 2. **Actualización Optimista de la UI:** Al crear o eliminar un tenant, se podría actualizar la UI localmente de inmediato (antes de que el servidor responda) para una experiencia de usuario más rápida, y luego revertir el cambio si la acción del servidor falla. Esto requiere un manejo de estado más avanzado pero mejora mucho la UX.
 * 3. **Estado de Carga por Tarjeta:** Actualmente, al eliminar un tenant, todos los botones de "Eliminar" se desactivan. La lógica se podría refinar para que solo el botón del tenant que se está eliminando muestre el estado de carga, pasando el `subdomain` específico a la transición.
 * 1. **Lista de Campañas Real:** Reemplazar el `placeholder` de `campaigns` con una llamada de datos real. El `page.tsx` debería cargar las campañas y pasarlas como prop.
 * 2. **Componente `CampaignCard`:** Crear un componente dedicado para mostrar la información de cada campaña en la cuadrícula, incluyendo un resumen de estadísticas y botones de acción (Editar, Ver, Analíticas).
 * 1. **Modal de Confirmación para Eliminar:** En lugar de una eliminación directa, el botón "Eliminar" debería abrir un componente `<Dialog>` pidiendo al usuario que confirme la acción para prevenir borrados accidentales.
 * 2. **Actualización Optimista de la UI:** Al crear o eliminar un tenant, se podría actualizar la UI localmente de inmediato (antes de que el servidor responda) para una experiencia de usuario más rápida, y luego revertir el cambio si la acción del servidor falla.
 * 3. **Componente de Layout:** Extraer la estructura de la página (el `div` contenedor principal) a un `app/[locale]/dashboard/layout.tsx` para añadir una barra de navegación lateral y un encabezado consistentes.
 */
