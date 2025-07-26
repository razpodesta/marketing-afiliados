/* Ruta: components/dashboard/DashboardSidebar.tsx */

"use client";

import { signOutAction } from "@/app/actions";
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
import { cn } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";
import {
  Globe,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Settings,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * @file DashboardSidebar.tsx
 * @description Barra lateral de navegación principal del dashboard.
 * CORRECCIÓN DE ASSETS: Se ha verificado y reforzado la implementación del componente
 * `Image` de Next.js para asegurar que el `logo.png` se renderice correctamente. La ruta
 * `/images/logo.png` es la correcta, ya que es relativa al directorio `public`.
 * Se han afinado los estilos para una coherencia total con la identidad de marca.
 *
 * @author Metashark
 * @version 7.1.0 (Asset Rendering Fix & Style Refinement)
 */

const mainNavLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/sites", label: "Mis Sitios", icon: Globe },
  { href: "/dashboard/tools", label: "Herramientas IA", icon: Sparkles },
  { href: "/dashboard/settings", label: "Ajustes", icon: Settings },
];

function NavLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
}) {
  const pathname = usePathname();
  // Lógica mejorada para resaltar la ruta activa, incluyendo sub-rutas.
  const isActive =
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground hover:bg-muted/50",
        isActive && "bg-primary text-primary-foreground font-semibold"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

export function DashboardSidebarContent({ user }: { user: User }) {
  const userName =
    user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuario";
  const userEmail = user.email || "";
  const userAvatarUrl = user.user_metadata?.avatar_url || "";

  return (
    <>
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold text-foreground"
        >
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
            <NavLink key={link.href} {...link} />
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
              <Avatar className="h-9 w-9">
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
            <form action={signOutAction} className="w-full">
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

export function DashboardSidebar({ user }: { user: User }) {
  return (
    <aside className="hidden border-r bg-card md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <DashboardSidebarContent user={user} />
      </div>
    </aside>
  );
}

/* MEJORAS FUTURAS DETECTADAS
Navegación Basada en Roles: El array mainNavLinks está codificado en duro. Una mejora arquitectónica significativa sería filtrar este array basándose en el app_role del usuario. Esto permitiría, por ejemplo, mostrar un enlace a /admin o /dev-console directamente en la barra lateral solo para los usuarios con los permisos adecuados.
Sidebar Colapsable: Implementar un botón para colapsar/expandir la barra lateral en la vista de escritorio, mostrando solo los iconos cuando está colapsada. El estado (colapsado/expandido) debería persistir en localStorage para que la preferencia del usuario se mantenga entre sesiones.
Indicadores de Notificación: Añadir un pequeño componente de "punto" o "contador" junto a los iconos en NavLink que podría activarse si hay notificaciones pendientes para esa sección (ej. "L.I.A. ha terminado de analizar tu landing page"), guiando la atención del usuario. Esto requeriría una tabla notifications en la base de datos y un sistema de sondeo o websockets.
*/
/* Ruta: components/dashboard/DashboardSidebar.tsx */

/* MEJORAS PROPUESTAS
 * 1. **Componente de Logo de Marca:** Crear un componente `BrandLogo.tsx` que encapsule la lógica del `Image` y el `span` del nombre. Esto permitiría reutilizar el logo de forma consistente en toda la aplicación (header, footer, sidebar) y actualizarlo en un solo lugar.
 * 2. **Notificaciones Visuales:** Añadir un pequeño componente de "punto" o "contador" junto a los iconos en `NavLink` que podría activarse si hay notificaciones pendientes para esa sección, guiando la atención del usuario.
 * 3. **Sección de Ayuda Contextual:** En el pie del sidebar, se podría añadir un enlace a una sección de "Ayuda" que cambie dinámicamente según la página activa, ofreciendo al usuario guías o tutoriales relevantes para la tarea que está realizando.
 * 1. **Sidebar Colapsable:** Implementar un botón para colapsar/expandir la barra lateral, mostrando solo los iconos. El estado (colapsado/expandido) se debe persistir en `localStorage` para que la preferencia del usuario se mantenga entre sesiones.
 * 2. **Notificaciones con Indicador:** Añadir un pequeño punto rojo o un contador en el enlace de "Mis Sitios" o en el avatar del usuario si hay notificaciones pendientes (ej. "Tu nuevo sitio ha sido desplegado"). Esto requeriría una tabla de `notifications` en la base de datos.
 * 3. **Gestión de Roles en la UI:** Los `mainNavLinks` podrían ser filtrados dinámicamente basándose en el rol del usuario obtenido de la sesión. Por ejemplo, un enlace a `/admin` solo aparecería si el usuario tiene el rol de `developer`.
1.  **Reintroducción del Tema Oscuro:** Una vez que el layout sea estable, se puede reintentar la implementación
 *    de la paleta de colores personalizada, pero esta vez siguiendo estrictamente la documentación de Tailwind v4
 *    para `tailwind.config.js`, que es el método más robusto.
2.  **Sidebar Colapsable:** Implementar un botón para colapsar/expandir el sidebar, guardando el estado en
 *    `localStorage` para persistir la preferencia del usuario.
3.  **Gestión de Créditos IA:** Mostrar el balance de "Créditos de IA" del usuario en el menú de usuario,
 *    con un enlace rápido a la página de "Facturación y Planes".
1.  **Sidebar Colapsable:** Implementar un botón para colapsar/expandir el sidebar en la versión de escritorio, guardando el estado en `localStorage` para persistir la preferencia del usuario entre sesiones.
2.  **Gestión de Créditos IA:** Mostrar el balance de "Créditos de IA" del usuario directamente en el menú de usuario, con un enlace rápido a la página de "Facturación y Planes" para recargar.
3.  **Notificaciones:** Añadir un icono de campana en el menú de usuario o en el header principal. Este icono podría mostrar un indicador rojo cuando haya notificaciones no leídas (ej. "L.I.A. ha terminado de analizar tu landing page").
4.  **Enlaces de Navegación Dinámicos:** En el futuro, los enlaces de navegación podrían ser dinámicos basados en el rol del usuario o en las características que ha contratado en su plan de suscripción.
=== SECCIÓN DE MEJORAS IDENTIFICADAS (ACUMULATIVO) ===
1.  **Sidebar Colapsable:** Implementar un botón para colapsar/expandir el sidebar en la versión de escritorio, guardando el estado en `localStorage` para persistir la preferencia del usuario entre sesiones.
2.  **Gestión de Créditos IA:** Mostrar el balance de "Créditos de IA" del usuario directamente en el menú de usuario, con un enlace rápido a la página de "Facturación y Planes" para recargar.
3.  **Notificaciones:** Añadir un icono de campana en el menú de usuario o en el header principal. Este icono podría mostrar un indicador rojo cuando haya notificaciones no leídas (ej. "L.I.A. ha terminado de analizar tu landing page").
4.  **Enlaces de Navegación Dinámicos:** En el futuro, los enlaces de navegación podrían ser dinámicos basados en el rol del usuario o en las características que ha contratado en su plan de suscripción.
1.  **Sidebar Colapsable:** Implementar un botón para colapsar/expandir el sidebar en la versión de escritorio, guardando el estado en `localStorage` para persistir la preferencia del usuario.
2.  **Notificaciones:** Añadir un icono de campana en el menú de usuario que indique notificaciones no leídas (ej. "L.I.A. ha terminado de analizar tu landing page").
3.  **Gestión de Créditos IA:** Mostrar el balance de "Créditos de IA" del usuario directamente en el menú de usuario, con un enlace para recargar.
 * 1. **Componente de Avatar:** Añadir un componente de avatar (`<Avatar>` de Shadcn/UI) junto al nombre del usuario, utilizando `user.user_metadata?.avatar_url` si está disponible a través de un proveedor OAuth.
 * 2. **Menú Desplegable de Usuario:** Convertir la sección de información del usuario en un menú desplegable (`DropdownMenu` de Shadcn/UI) que contenga enlaces a "Mi Perfil" y la opción de "Cerrar Sesión".
 * 3. **Sidebar Colapsable:** Implementar la capacidad de colapsar la barra lateral para maximizar el espacio de contenido en pantallas más pequeñas, guardando el estado en el `localStorage`.
 */
/* MEJORAS PROPUESTAS
 * 1. **Componente de Avatar:** Añadir un componente de avatar (`<Avatar>` de Shadcn/UI) junto al nombre del usuario para una UI más pulida, usando una imagen de perfil si está disponible.
 * 2. **Menú Desplegable de Usuario:** Convertir la sección de información del usuario en un menú desplegable (`DropdownMenu` de Shadcn/UI) que contenga enlaces a "Mi Perfil" y la opción de "Cerrar Sesión".
 * 3. **Gestión de Rutas Activas:** Para rutas anidadas (ej. `/dashboard/sites/123`), la lógica de `isActive` necesitará ser mejorada (usando `pathname.startsWith(href)`) para mantener el enlace "Mis Sitios" activo.
 */
