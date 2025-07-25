// components/dashboard/DashboardSidebar.tsx
/**
 * @file Dashboard Sidebar
 * @description Componente de cliente que renderiza la barra de navegación lateral para el
 * dashboard. Muestra información del usuario, enlaces de navegación y la acción de cerrar sesión.
 *
 * @author Metashark
 * @version 1.0.0
 */
"use client";

import type { User } from "next-auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Globe, Settings, LogOut } from "lucide-react";

import { logout } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/dashboard", label: "Vista General", icon: LayoutDashboard },
  { href: "/dashboard/sites", label: "Mis Sitios", icon: Globe },
  { href: "/dashboard/settings", label: "Configuración", icon: Settings },
];

/**
 * @description Renderiza un único enlace de navegación en la barra lateral.
 */
function NavLink({ href, label, icon: Icon }: (typeof navLinks)[0]) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href}>
      <span
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-gray-700 transition-colors hover:bg-gray-200 hover:text-gray-900",
          isActive && "bg-gray-900 text-white"
        )}
      >
        <Icon className="h-5 w-5" />
        <span className="font-medium">{label}</span>
      </span>
    </Link>
  );
}

/**
 * @description La barra lateral principal del dashboard.
 */
export function DashboardSidebar({ user }: { user: User }) {
  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-white">
      <div className="p-4">
        <h2 className="text-xl font-bold">Metashark</h2>
      </div>
      <nav className="flex-1 space-y-2 p-4">
        {navLinks.map((link) => (
          <NavLink key={link.href} {...link} />
        ))}
      </nav>
      <div className="p-4 border-t">
        <div className="mb-4">
          <p className="text-sm font-semibold">{user.name || "Usuario"}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
        <form action={logout}>
          <Button variant="outline" size="sm" className="w-full">
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
        </form>
      </div>
    </aside>
  );
}

/* MEJORAS PROPUESTAS
 * 1. **Componente de Avatar:** Añadir un componente de avatar (`<Avatar>` de Shadcn/UI) junto al nombre del usuario para una UI más pulida, usando una imagen de perfil si está disponible.
 * 2. **Menú Desplegable de Usuario:** Convertir la sección de información del usuario en un menú desplegable (`DropdownMenu` de Shadcn/UI) que contenga enlaces a "Mi Perfil" y la opción de "Cerrar Sesión".
 * 3. **Gestión de Rutas Activas:** Para rutas anidadas (ej. `/dashboard/sites/123`), la lógica de `isActive` necesitará ser mejorada (usando `pathname.startsWith(href)`) para mantener el enlace "Mis Sitios" activo.
 */
