/* Ruta: app/[locale]/dashboard/dashboard-client.tsx */

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";
import {
  ArrowRight,
  HelpCircle,
  Image as ImageIcon,
  LayoutTemplate,
  PenSquare,
  PieChart,
  Puzzle,
  Search,
  Settings,
  Target,
  TestTube2,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import React from "react";

/**
 * @file dashboard-client.tsx
 * @description Dashboard principal "Centro de Comando".
 * ARQUITECTURA REFACTORIZADA: Se ha extraído la lógica de las tarjetas a un
 * sub-componente `ModuleCard` y se ha memoizado con `React.memo` para un rendimiento
 * óptimo. Se ha optimizado el uso de `TooltipProvider` y se han refinado las
 * animaciones para una experiencia de usuario superior.
 *
 * @author Metashark
 * @version 8.1.0 (Architectural Refactor & Optimization)
 */

// --- TIPOS Y DATOS ---

/**
 * @description Define el estado de disponibilidad de un módulo.
 */
type ModuleStatus = "active" | "beta" | "soon";

/**
 * @description Define la estructura de datos para cada módulo de funcionalidad.
 * Centralizar esta estructura facilita la gestión y una futura migración a una API.
 */
type FeatureModule = {
  title: string;
  description: string;
  tooltip: string;
  icon: React.ElementType;
  href: string;
  status: ModuleStatus;
};

const featureModules: FeatureModule[] = [
  {
    title: "Suite de Landings",
    description: "Constructor guiado para páginas de venta.",
    tooltip: "Crea y publica landing pages optimizadas para la conversión.",
    icon: LayoutTemplate,
    href: "/dashboard/sites/new",
    status: "active",
  },
  {
    title: "Bridge Pages",
    description: "Calienta el tráfico antes de la oferta.",
    tooltip: "Genera páginas puente para mejorar la calidad del tráfico y el EPC.",
    icon: Puzzle,
    href: "/dashboard/tools/bridge-pages",
    status: "active",
  },
  {
    title: "Generador de Quizzes",
    description: "Segmenta tu audiencia con quizzes.",
    tooltip: "Crea cuestionarios interactivos para capturar leads cualificados.",
    icon: TestTube2,
    href: "/dashboard/tools/quizzes",
    status: "active",
  },
  {
    title: "AI Copywriter Pro",
    description: "Genera copys persuasivos al instante.",
    tooltip: "Accede a nuestro motor de IA para crear textos de venta efectivos.",
    icon: PenSquare,
    href: "/dashboard/tools/copywriter",
    status: "beta",
  },
  {
    title: "Creador de Imágenes IA",
    description: "Diseña imágenes únicas para tus campañas.",
    tooltip: "Genera imágenes libres de derechos con IA para tus anuncios y landings.",
    icon: ImageIcon,
    href: "#",
    status: "soon",
  },
  {
    title: "Auditor de Conversión",
    description: "Analiza tu URL y recibe un análisis CRO.",
    tooltip: "Nuestra IA auditará tu página y te dará un plan de acción para mejorar la conversión.",
    icon: Search,
    href: "#",
    status: "soon",
  },
  {
    title: "Analista de Nichos IA",
    description: "Descubre nichos rentables y audiencias.",
    tooltip: "Encuentra oportunidades de mercado, audiencias y ángulos de marketing.",
    icon: Target,
    href: "#",
    status: "soon",
  },
  {
    title: "Analista de Ads IA",
    description: "Traduce métricas de Ads en insights.",
    tooltip: "Conecta tus cuentas de Google/FB Ads para obtener un análisis claro.",
    icon: PieChart,
    href: "#",
    status: "soon",
  },
  {
    title: "Ajustes del Sitio",
    description: "Personaliza tu workspace y perfil.",
    tooltip: "Gestiona el nombre, dominio, facturación y miembros de tu workspace.",
    icon: Settings,
    href: "/dashboard/settings",
    status: "active",
  },
];

// --- SUB-COMPONENTES ---

/**
 * @description Componente individual para cada módulo del dashboard.
 * Encapsula la lógica de presentación y animación de una única tarjeta.
 * Está envuelto en `React.memo` para prevenir re-renders innecesarios si sus props no cambian,
 * una optimización clave para listas y cuadrículas.
 * @param {object} props - Propiedades del componente.
 * @param {FeatureModule} props.module - Los datos del módulo a renderizar.
 * @returns {JSX.Element} La tarjeta del módulo interactiva.
 */
const ModuleCard = React.memo(({ module }: { module: FeatureModule }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, scale: 0.95, y: 10 },
        show: { opacity: 1, scale: 1, y: 0 },
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Link
        href={module.status !== "soon" ? module.href : "#"}
        className={cn("group", module.status === "soon" && "pointer-events-none")}
      >
        <Card
          className={cn(
            "relative flex h-full flex-col justify-between p-3 transition-all duration-300", // Padding reducido
            module.status === "soon"
              ? "border-dashed bg-card/50"
              : "bg-card hover:border-primary/80 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10"
          )}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute top-2 right-2 cursor-help">
                <HelpCircle className="h-4 w-4 text-muted-foreground/50 transition-colors group-hover:text-primary" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{module.tooltip}</p>
            </TooltipContent>
          </Tooltip>

          <CardHeader className="p-0">
            <div className="flex items-start justify-between">
              <module.icon
                className={cn(
                  "h-5 w-5 transition-colors",
                  module.status === "soon" ? "text-muted-foreground/50" : "text-primary"
                )}
              />
              {module.status === "beta" && (
                <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-400">
                  Beta
                </span>
              )}
              {module.status === "soon" && (
                <span className="rounded-full bg-muted/50 px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                  Próximamente
                </span>
              )}
            </div>
            <CardTitle
              className={cn(
                "pt-2 text-sm font-semibold", // Padding reducido
                module.status === "soon" ? "text-muted-foreground/80" : "text-foreground"
              )}
            >
              {module.title}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground line-clamp-2">
              {module.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto p-0 pt-2">
            <div className="flex items-center text-xs font-medium text-primary/80 transition-all group-hover:text-primary">
              <span>
                {module.status === "active"
                  ? "Acceder"
                  : module.status === "beta"
                  ? "Probar Beta"
                  : "Saber Más"}
              </span>
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
});
ModuleCard.displayName = "ModuleCard";

// --- COMPONENTE PRINCIPAL ---

export function DashboardClient({ user }: { user: User }) {
  const username = user.user_metadata?.full_name || user.email;

  return (
    <div className="flex h-full flex-col">
      <div className="pb-4">
        <h1 className="text-xl font-bold text-foreground">
          Bienvenido, {username}
        </h1>
        <p className="text-sm text-muted-foreground">Centro de Comando de IA</p>
      </div>
      
      <TooltipProvider delayDuration={100}>
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.04 } },
          }}
          className="grid flex-grow grid-cols-1 gap-3 pt-0 md:grid-cols-2 lg:grid-cols-3"
        >
          {featureModules.map((mod) => (
            <ModuleCard key={mod.title} module={mod} />
          ))}
        </motion.div>
      </TooltipProvider>
    </div>
  );
}
/* Ruta: app/[locale]/dashboard/dashboard-client.tsx */

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
