// app/[locale]/dev-console/components/DevSidebarClient.tsx
/**
 * @file DevSidebarClient.tsx
 * @description Componente de cliente para la barra lateral del `dev-console`.
 *              Ha sido actualizado para incluir la navegación a la nueva
 *              sección de Telemetría.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 2.1.0 (Telemetry Navigation Integration)
 */
"use client";

import {
  File,
  FileText,
  Folder,
  Home,
  LayoutGrid,
  LogOut,
  ShieldCheck,
  Users,
  Waypoints, // <-- NUEVO ICONO
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { session as sessionActions } from "@/lib/actions";
import { cn } from "@/lib/utils";

interface RouteNode {
  name: string;
  path: string;
  isPage: boolean;
  children: RouteNode[];
}

const NavLink = ({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
}) => {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        isActive && "bg-primary/10 text-primary font-semibold"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
};

const RouteTree = ({ node }: { node: RouteNode }) => {
  if (!node) return null;
  return (
    <div className="pl-4 text-xs">
      <div className="flex items-center gap-2 py-1">
        {node.children.length > 0 ? (
          <Folder className="h-3 w-3" />
        ) : (
          <File className="h-3 w-3" />
        )}
        <span className={cn(node.isPage && "font-semibold text-primary/80")}>
          {node.name}
        </span>
      </div>
      {node.children && (
        <div className="border-l border-dashed border-border ml-1.5 pl-2">
          {node.children.map((child) => (
            <RouteTree key={child.path} node={child} />
          ))}
        </div>
      )}
    </div>
  );
};

export function DevSidebarClient() {
  const [routes, setRoutes] = useState<RouteNode | null>(null);
  const navLinks = [
    { href: "/dev-console", label: "Overview", icon: Home },
    { href: "/dev-console/users", label: "Gestión de Usuarios", icon: Users },
    {
      href: "/dev-console/campaigns",
      label: "Visor de Campañas",
      icon: LayoutGrid,
    },
    // --- NUEVO ENLACE ---
    {
      href: "/dev-console/telemetry",
      label: "Telemetría",
      icon: Waypoints,
    },
    // --- FIN DE NUEVO ENLACE ---
    { href: "/dev-console/logs", label: "Logs de Auditoría", icon: FileText },
  ];

  useEffect(() => {
    fetch("/routes-manifest.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch routes manifest");
        return res.json();
      })
      .then((data) => setRoutes(data))
      .catch(console.error);
  }, []);

  return (
    <aside className="w-72 flex-shrink-0 border-r bg-card h-screen flex flex-col">
      <div className="flex h-16 items-center border-b px-6">
        <Link
          href="/dev-console"
          className="flex items-center gap-2 font-bold text-lg"
        >
          <ShieldCheck className="h-6 w-6 text-primary" />
          <span>DEV CONSOLE</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {navLinks.map((link) => (
          <NavLink key={link.href} {...link} />
        ))}
        <div className="pt-4">
          <Accordion type="single" collapsible>
            <AccordionItem value="routes">
              <AccordionTrigger className="text-sm font-semibold">
                Visor de Rutas del Proyecto
              </AccordionTrigger>
              <AccordionContent>
                {routes ? (
                  <RouteTree node={routes} />
                ) : (
                  <p className="text-xs text-muted-foreground p-2">
                    Cargando rutas...
                  </p>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </nav>
      <div className="mt-auto border-t p-4">
        <form action={sessionActions.signOutAction}>
          <Button variant="ghost" className="w-full justify-start">
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
        </form>
      </div>
    </aside>
  );
}
/**
 * @section MEJORA CONTINUA
 * @description Mejoras para evolucionar la barra lateral de la consola.
 *
 * @subsection Mejoras Futuras
 * 1. **Búsqueda en el Árbol de Rutas**: (Vigente) Añadir un campo de búsqueda para filtrar rápidamente las rutas.
 * 2. **Enlaces en el Árbol de Rutas**: (Vigente) Hacer que cada nodo del `RouteTree` que represente una página sea un `<Link>` navegable.
 * 3. **Sincronización de Estado del Acordeón**: (Vigente) Persistir el estado de apertura/cierre del acordeón en `localStorage`.
 *
 * @subsection Mejoras Adicionadas
 * 1. **Carga Dinámica de Enlaces**: (Vigente) Para una mayor flexibilidad, la lista `navLinks` podría ser cargada desde un archivo de configuración o incluso desde la base de datos, permitiendo añadir nuevas secciones a la `dev-console` sin necesidad de un redespliegue de código.
 */
// app/[locale]/dev-console/components/DevSidebarClient.tsx
