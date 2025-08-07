// app/[locale]/admin/page.tsx
/**
 * @file page.tsx
 * @description Página del Dashboard de Administración (Server Component).
 *              Corrigido para incluir a propriedade `id` na transformação
 *              de dados, satisfazendo o contrato de tipo do `AdminClient`.
 * @author Metashark (Refatorado por L.I.A Legacy)
 * @version 10.0.0 (Type Contract Synchronization)
 */
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Card } from "@/components/ui/card";
import * as dataLayer from "@/lib/data";
import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database";
import { rootDomain } from "@/lib/utils";

import { AdminClient } from "./admin-client";

export const metadata: Metadata = {
  title: `Admin Dashboard | ${rootDomain}`,
  description: `Gestionar todos los sitios en la plataforma ${rootDomain}.`,
};

const ADMIN_SITES_PER_PAGE = 12;

const AdminDashboardSkeleton = () => (
  <div className="p-4 md:p-8">
    <div className="mx-auto w-full max-w-7xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="h-9 w-48 bg-muted rounded-md animate-pulse"></div>
          <div className="h-5 w-64 bg-muted rounded-md mt-2 animate-pulse"></div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="h-40 animate-pulse bg-muted" />
        ))}
      </div>
    </div>
  </div>
);

async function AdminDashboardLoader({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("app_role")
    .eq("id", user.id)
    .single();

  const allowedRoles: Array<Database["public"]["Enums"]["app_role"]> = [
    "admin",
    "developer",
  ];

  if (!profile || !allowedRoles.includes(profile.app_role)) {
    logger.warn(
      `Acceso denegado a /admin para el usuario ${user.id} con rol '${profile?.app_role}'`
    );
    return redirect("/dashboard");
  }

  try {
    const page = Number(searchParams.page) || 1;
    const { sites: rawSites, totalCount } = await dataLayer.admin.getAllSites({
      page,
      limit: ADMIN_SITES_PER_PAGE,
    });

    // --- INÍCIO DA CORREÇÃO DE TIPO ---
    const sites = rawSites.map((site) => ({
      id: site.id, // Adiciona a propriedade 'id' que faltava
      subdomain: site.subdomain || "N/A",
      icon: site.icon || "❓",
      createdAt: new Date(site.created_at).getTime(),
    }));
    // --- FIM DA CORREÇÃO DE TIPO ---

    return (
      <AdminClient
        sites={sites}
        user={user}
        totalCount={totalCount}
        page={page}
        limit={ADMIN_SITES_PER_PAGE}
      />
    );
  } catch (error) {
    const errorContext =
      error instanceof Error
        ? { message: error.message, stack: error.stack }
        : { error: String(error) };
    logger.error(
      "Error al cargar los datos del dashboard de admin:",
      errorContext
    );
    return (
      <p className="text-destructive p-8">
        Error al cargar los datos de la plataforma.
      </p>
    );
  }
}

export default function AdminPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  return (
    <div className="min-h-screen bg-card">
      <Suspense fallback={<AdminDashboardSkeleton />}>
        <AdminDashboardLoader searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Sincronização de Contrato de Tipo**: ((Implementada)) A propriedade `id` agora é incluída no objeto transformado, satisfazendo o contrato de tipo do `AdminClient` e resolvendo o erro de compilação.
 */
// app/[locale]/admin/page.tsx
