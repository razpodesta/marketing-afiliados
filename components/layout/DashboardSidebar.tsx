// components/layout/DashboardSidebar.tsx
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
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
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
 * @file DashboardSidebar.tsx
 * @description Barra lateral de navegación principal del dashboard, ahora
 *              completamente internacionalizada consumiendo el hook `useTranslations`.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 11.0.0 (Full Internationalization)
 */

interface NavLinkProps {
  href: string;
  label: string;
  icon: React.ElementType;
}

function NavLink({ href, label, icon: Icon }: NavLinkProps) {
  const pathname = usePathname();
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

const UserMenuSkeleton = () => (
  <div className="flex items-center gap-3 p-2">
    <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
    <div className="flex flex-col gap-1">
      <div className="h-4 w-24 rounded-md bg-muted animate-pulse" />
      <div className="h-3 w-32 rounded-md bg-muted animate-pulse" />
    </div>
  </div>
);

export function DashboardSidebarContent() {
  const { user } = useDashboard();
  const t = useTranslations("DashboardSidebar");

  if (!user) {
    return (
      <>
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <div className="h-8 w-32 rounded-md bg-muted animate-pulse" />
        </div>
        <div className="flex-1 overflow-auto">
          <nav className="grid items-start gap-1 px-2 py-4 lg:px-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-9 w-full rounded-lg bg-muted animate-pulse"
              />
            ))}
          </nav>
        </div>
        <div className="mt-auto border-t p-4">
          <UserMenuSkeleton />
        </div>
      </>
    );
  }

  const userName =
    user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuario";
  const userEmail = user.email || "";
  const userAvatarUrl = user.user_metadata?.avatar_url || "";
  const userRole = user.app_metadata?.app_role || "user";

  const mainNavLinks: NavLinkProps[] = [
    { href: "/dashboard", label: t("dashboard"), icon: LayoutDashboard },
    { href: "/dashboard/sites", label: t("mySites"), icon: Globe },
    { href: "/lia-chat", label: t("liaChat"), icon: Sparkles },
    { href: "/dashboard/settings", label: t("settings"), icon: Settings },
  ];

  if (userRole === "developer") {
    mainNavLinks.push({
      href: "/dev-console",
      label: t("devConsole"),
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
                <span>{t("userMenu_accountSettings")}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LifeBuoy className="mr-2 h-4 w-4" />
              <span>{t("userMenu_support")}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <form action={sessionActions.signOutAction} className="w-full">
              <button type="submit" className="w-full">
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t("userMenu_signOut")}</span>
                </DropdownMenuItem>
              </button>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}

export function DashboardSidebar() {
  return (
    <aside className="hidden border-r bg-card md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <DashboardSidebarContent />
      </div>
    </aside>
  );
}

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Internacionalización Completa**: ((Implementada)) Se ha eliminado todo el texto codificado en duro. El componente ahora consume el hook `useTranslations` con el namespace `DashboardSidebar` para renderizar su contenido.
 *
 * @subsection Melhorias Futuras
 * 1. **Sidebar Colapsable**: ((Vigente)) Implementar un botón para colapsar/expandir la barra lateral en la vista de escritorio, mostrando solo los iconos cuando está colapsada.
 * 2. **Carga de Enlaces desde la Base de Datos**: ((Vigente)) Para máxima flexibilidad, la lista `mainNavLinks` podría cargarse desde la base de datos (una tabla `feature_modules` con sus roles asociados).
 */
// components/layout/DashboardSidebar.tsx
