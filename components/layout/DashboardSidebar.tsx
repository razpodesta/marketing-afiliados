// Ruta: components/layout/DashboardSidebar.tsx
/**
 * @file components/layout/DashboardSidebar.tsx
 * @description Barra lateral de navegación principal del dashboard.
 *              Consume los datos del usuario desde el DashboardContext para
 *              renderizar los enlaces de navegación y el menú de perfil.
 *              Incorpora un estado de carga y adapta la navegación según el rol del usuario.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 10.1.0 (Architectural Path Correction)
 */
"use client";

import type { User } from "@supabase/supabase-js";
import {
  Globe,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Settings,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Image from "next/image"; // Importado para el logo
import Link from "next/link"; // Importado para la navegación
import { usePathname } from "next/navigation";
import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { session as sessionActions } from "@/lib/actions";
import { useDashboard } from "@/lib/context/DashboardContext";
import { cn } from "@/lib/utils";

/**
 * @interface NavLinkProps
 * @description Define las propiedades para un enlace de navegación en la barra lateral.
 */
interface NavLinkProps {
  href: string;
  label: string;
  icon: React.ElementType; // Icono de Lucide-React
}

/**
 * @function NavLink
 * @description Componente de enlace de navegación individual para la barra lateral.
 *              Aplica estilos de activo/inactivo basados en la ruta actual.
 * @param {NavLinkProps} props - Propiedades del enlace.
 * @returns {JSX.Element} Un enlace de navegación.
 */
function NavLink({ href, label, icon: Icon }: NavLinkProps) {
  const pathname = usePathname();
  // Determina si el enlace está activo. Un enlace es activo si el pathname coincide exactamente,
  // o si el pathname comienza con el href (para rutas anidadas), excepto para el dashboard raíz.
  const isActive =
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground hover:bg-muted/50",
        isActive && "bg-primary text-primary-foreground font-semibold" // Estilos para el enlace activo
      )}
    >
      <Icon className="h-4 w-4" /> {/* Icono del enlace */}
      {label} {/* Texto del enlace */}
    </Link>
  );
}

/**
 * @function UserMenuSkeleton
 * @description Esqueleto de carga para el menú de usuario en la barra lateral.
 *              Mejora la experiencia percibida durante la carga de los datos del usuario.
 * @returns {JSX.Element} Un esqueleto animado.
 */
const UserMenuSkeleton = () => (
  <div className="flex items-center gap-3 p-2">
    <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
    <div className="flex flex-col gap-1">
      <div className="h-4 w-24 rounded-md bg-muted animate-pulse" />
      <div className="h-3 w-32 rounded-md bg-muted animate-pulse" />
    </div>
  </div>
);

/**
 * @function DashboardSidebarContent
 * @description Contenido principal de la barra lateral del dashboard.
 *              Incluye el logo, los enlaces de navegación y el menú de perfil de usuario.
 *              Gestiona el estado de carga y los permisos de rol.
 * @returns {JSX.Element} El contenido de la barra lateral.
 */
export function DashboardSidebarContent() {
  const { user } = useDashboard(); // Obtiene el usuario del contexto global

  // Muestra un esqueleto si los datos del usuario aún no están disponibles.
  if (!user) {
    return (
      <>
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <div className="h-8 w-32 rounded-md bg-muted animate-pulse" />{" "}
          {/* Esqueleto del logo */}
        </div>
        <div className="flex-1 overflow-auto">
          <nav className="grid items-start gap-1 px-2 py-4 lg:px-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-9 w-full rounded-lg bg-muted animate-pulse" // Esqueletos de enlaces
              />
            ))}
          </nav>
        </div>
        <div className="mt-auto border-t p-4">
          <UserMenuSkeleton /> {/* Esqueleto del menú de usuario */}
        </div>
      </>
    );
  }

  // Extrae información del usuario para mostrar en la UI.
  const userName =
    user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuario";
  const userEmail = user.email || "";
  const userAvatarUrl = user.user_metadata?.avatar_url || "";
  const userRole = user.app_metadata?.app_role || "user"; // Asume 'user' si no hay rol definido.

  // Define los enlaces de navegación principales.
  const mainNavLinks: NavLinkProps[] = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/sites", label: "Mis Sitios", icon: Globe },
    { href: "/lia-chat", label: "Chat L.I.A", icon: Sparkles },
    { href: "/dashboard/settings", label: "Ajustes", icon: Settings },
  ];

  // Añade el enlace a la consola de desarrollador solo si el usuario tiene rol 'developer'.
  if (userRole === "developer") {
    mainNavLinks.push({
      href: "/dev-console",
      label: "Dev Console",
      icon: ShieldCheck,
    });
  }

  return (
    <>
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold text-foreground"
        >
          {/* Logo de la aplicación */}
          <Image
            src="/images/logo.png"
            width={32}
            height={32}
            alt="Metashark Logo"
            priority
          />
          <span>MetaShark</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto">
        <nav className="grid items-start gap-1 px-2 py-4 text-sm font-medium lg:px-4">
          {mainNavLinks.map((link) => (
            <NavLink key={link.href} {...link} /> // Renderiza los enlaces de navegación
          ))}
        </nav>
      </div>
      <div className="mt-auto border-t p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex h-auto w-full items-center justify-start gap-3 p-2 text-left"
            >
              {/* Avatar del usuario */}
              <Avatar className="h-9 w-9">
                {/* Futura mejora (4): Asegurarse de que `userAvatarUrl` se maneje con `<Image>` si es un dominio externo */}
                <AvatarImage src={userAvatarUrl} alt={userName} />
                <AvatarFallback>
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="overflow-hidden">
                <p className="truncate text-sm font-medium leading-none text-foreground">
                  {userName}
                </p>
                <p className="truncate text-xs leading-none text-muted-foreground">
                  {userEmail}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {userEmail}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>Ajustes de Cuenta</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LifeBuoy className="mr-2 h-4 w-4" />
              <span>Soporte</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {/* Formulario para la acción de cerrar sesión */}
            <form action={sessionActions.signOutAction} className="w-full">
              <button type="submit" className="w-full">
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </button>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}

/**
 * @function DashboardSidebar
 * @description Componente contenedor para la barra lateral del dashboard.
 *              Controla la visibilidad en diferentes tamaños de pantalla.
 * @returns {JSX.Element} La barra lateral del dashboard.
 */
export function DashboardSidebar() {
  return (
    <aside className="hidden border-r bg-card md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <DashboardSidebarContent /> {/* Contenido real de la barra lateral */}
      </div>
    </aside>
  );
}

/* MEJORAS FUTURAS DETECTADAS
 * 1.  **Sidebar Colapsable:** Implementar un botón para colapsar/expandir la barra lateral en la vista de escritorio, mostrando solo los iconos cuando está colapsada. El estado (colapsado/expandido) debería persistir en `localStorage` para que la preferencia del usuario se mantenga entre sesiones. Esto aumentaría el espacio de contenido para el usuario.
 * 2.  **Indicadores de Notificación/Estado:** Añadir un pequeño componente de "punto" o "contador" junto a los iconos en `NavLink` o en las entradas del menú. Esto podría activarse si hay notificaciones pendientes para esa sección (ej. "Tienes 2 invitaciones pendientes", "L.I.A. ha terminado de analizar tu landing page"), guiando la atención del usuario. Esto requeriría una tabla `notifications` en la base de datos y un sistema de suscripción en tiempo real (ej. Supabase Realtime).
 * 3.  **Carga de Enlaces desde la Base de Datos:** Para una máxima flexibilidad y permitir que los administradores controlen la navegación sin despliegues de código, la lista `mainNavLinks` podría cargarse desde la base de datos (una tabla `feature_modules` con sus roles asociados). Esto permitiría al equipo de producto configurar los elementos de navegación dinámicamente (añadir, quitar, reordenar, marcar como "beta") desde un panel de administración.
 * 4.  **Optimización del Avatar (Next/Image):** Si `userAvatarUrl` proviene de dominios externos (ej. Google, GitHub para avatares de OAuth), se debería utilizar el componente `next/image` para renderizar la imagen del avatar en lugar de un `<img>` nativo. Esto permitiría a Next.js optimizar automáticamente la imagen (redimensionamiento, formatos WebP/AVIF), mejorando el rendimiento y el Core Web Vitals. Para ello, los dominios externos deben configurarse en `next.config.mjs`.
 * 5.  **Internacionalización del `UserMenuSkeleton`:** Actualmente, el esqueleto no muestra texto, pero si lo hiciera en el futuro, debería ser internacionalizado.
 */
