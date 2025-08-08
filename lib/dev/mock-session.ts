// lib/dev/mock-session.ts
/**
 * @file mock-session.ts
 * @description Aparato especializado para generar datos de desarrollo simulados.
 *              Ha sido sincronizado con el tipo `SiteWithCampaignsCount` actualizado.
 * @author L.I.A Legacy
 * @version 3.1.0 (Type Contract Synchronization)
 */
import type { User } from "@supabase/supabase-js";

import type { FeatureModule } from "@/lib/data/modules";
import type { SiteWithCampaignsCount } from "@/lib/data/sites";
import type { Tables } from "@/lib/types/database";

// ... (mockUser, mockWorkspaces, mockModules no cambian)
const mockUser: User = {
  id: "dev-user-uuid-12345",
  app_metadata: {
    provider: "email",
    providers: ["email"],
    app_role: "developer",
  },
  user_metadata: {
    full_name: "Deve Loper",
    avatar_url: "https://avatars.githubusercontent.com/u/1024025?v=4",
  },
  aud: "authenticated",
  confirmation_sent_at: new Date().toISOString(),
  confirmed_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  email: "dev@metashark.tech",
  email_confirmed_at: new Date().toISOString(),
  identities: [],
  is_anonymous: false,
  last_sign_in_at: new Date().toISOString(),
  phone: "",
  role: "authenticated",
  updated_at: new Date().toISOString(),
};

const mockWorkspaces: Tables<"workspaces">[] = [
  {
    id: "ws-uuid-dev-01",
    name: "Deve's Workspace",
    icon: "🚀",
    owner_id: mockUser.id,
    created_at: new Date().toISOString(),
    updated_at: null,
    current_site_count: 0,
  },
  {
    id: "ws-uuid-dev-02",
    name: "Proyecto Secreto",
    icon: "🧪",
    owner_id: mockUser.id,
    created_at: new Date().toISOString(),
    updated_at: null,
    current_site_count: 0,
  },
];

const mockModules: FeatureModule[] = [
  {
    id: "sites",
    title: "Mis Sitios",
    description: "Gestiona tus subdominios y campañas.",
    tooltip: "Accede a la gestión de sitios",
    icon: "Globe",
    href: "/dashboard/sites",
    status: "active",
  },
  {
    id: "lia-chat",
    title: "Chat L.I.A",
    description: "Tu asistente de marketing personal.",
    tooltip: "Chatea con L.I.A.",
    icon: "Sparkles",
    href: "/lia-chat",
    status: "active",
  },
  {
    id: "dev-console",
    title: "Dev Console",
    description: "Herramientas para desarrolladores.",
    tooltip: "Accede a la consola de desarrollador",
    icon: "ShieldCheck",
    href: "/dev-console",
    status: "active",
  },
];

// --- INICIO DE CORRECCIÓN (TS2322) ---
// Se añaden las propiedades `name` y `description` faltantes para cumplir
// con el contrato de tipo `SiteWithCampaignsCount`.
export const mockSites: SiteWithCampaignsCount[] = [
  {
    id: "site-uuid-dev-01",
    name: "Mi Primer Sitio",
    description: "Descripción de mi primer sitio.",
    subdomain: "mi-primer-sitio",
    icon: "🚀",
    created_at: new Date().toISOString(),
    workspace_id: "ws-uuid-dev-01",
    owner_id: "dev-user-uuid-12345",
    custom_domain: null,
    updated_at: null,
    campaigns: [{ count: 2 }],
  },
  {
    id: "site-uuid-dev-02",
    name: "Proyecto Cliente",
    description: "Sitio para el proyecto del cliente.",
    subdomain: "proyecto-cliente",
    icon: "💼",
    created_at: new Date().toISOString(),
    workspace_id: "ws-uuid-dev-01",
    owner_id: "dev-user-uuid-12345",
    custom_domain: null,
    updated_at: null,
    campaigns: [{ count: 0 }],
  },
];
// --- FIN DE CORRECCIÓN ---

export function getMockLayoutData() {
  return {
    user: mockUser,
    workspaces: mockWorkspaces,
    activeWorkspace: mockWorkspaces[0],
    pendingInvitations: [],
    modules: mockModules,
    sites: mockSites,
    totalCount: mockSites.length,
  };
}
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1.  **Sincronización de Contrato de Mock**: ((Implementada)) Se han añadido las propiedades `name` y `description` al mock `mockSites`, alineándolo con el tipo `SiteWithCampaignsCount` actualizado y resolviendo el error de compilación `TS2322`.
 */
// lib/dev/mock-session.ts
