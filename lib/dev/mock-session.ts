// lib/dev/mock-session.ts
/**
 * @file mock-session.ts
 * @description Aparato especializado para generar datos de desarrollo simulados.
 * @author L.I.A Legacy
 * @version 2.1.0 (Explicit Typing)
 */
import type { User } from "@supabase/supabase-js";
import type { FeatureModule } from "@/lib/data/modules";
import type { SiteWithCampaignsCount } from "@/lib/data/sites";
import type { Tables } from "@/lib/types/database";

// --- DATOS SIMULADOS ---

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

// CORRECCIÓN: Se añade aserción de tipo explícita para guiar al compilador.
const mockWorkspaces = [
  {
    id: "ws-uuid-dev-01",
    name: "Deve's Workspace",
    icon: "🚀",
    owner_id: mockUser.id,
    created_at: new Date().toISOString(),
    updated_at: null,
    current_site_count: 0,
    storage_used_mb: 0,
  },
  {
    id: "ws-uuid-dev-02",
    name: "Proyecto Secreto",
    icon: "🧪",
    owner_id: mockUser.id,
    created_at: new Date().toISOString(),
    updated_at: null,
    current_site_count: 0,
    storage_used_mb: 0,
  },
] as Tables<"workspaces">[];

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

// CORRECCIÓN: Se añade aserción de tipo explícita.
export const mockSites = [
  {
    id: "site-uuid-dev-01",
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
    subdomain: "proyecto-cliente",
    icon: "💼",
    created_at: new Date().toISOString(),
    workspace_id: "ws-uuid-dev-01",
    owner_id: "dev-user-uuid-12345",
    custom_domain: null,
    updated_at: null,
    campaigns: [{ count: 0 }],
  },
] as SiteWithCampaignsCount[];

/**
 * @description Genera el conjunto completo de datos para la sesión simulada.
 */
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
/* MEJORAS FUTURAS DETECTADAS
 * 1. Datos Configurables desde JSON: Para mayor flexibilidad, los datos de `mockUser` y `mockWorkspaces` podrían ser leídos desde un archivo `mock-data.json`. Esto permitiría a los desarrolladores modificar los datos de prueba sin tocar el código TypeScript.
 * 2. Selector de Personas en UI: En un futuro, se podría crear una pequeña UI de desarrollo (un widget flotante) que permita cambiar entre diferentes "personas" simuladas (ej. "Usuario Admin", "Usuario Básico", "Usuario sin Workspaces") llamando a diferentes funciones de este módulo, para probar rápidamente diferentes estados de la aplicación.
 */
/* MEJORAS FUTURAS DETECTADAS (NUEVAS)
 * 1. Datos Configurables desde JSON: Para mayor flexibilidad, los datos de `mockUser` y `mockWorkspaces` podrían ser leídos desde un archivo `mock-data.json`. Esto permitiría a los desarrolladores modificar los datos de prueba sin tocar el código TypeScript.
 * 2. Selector de Personas en UI: En un futuro, se podría crear una pequeña UI de desarrollo (un widget flotante) que permita cambiar entre diferentes "personas" simuladas (ej. "Usuario Admin", "Usuario Básico", "Usuario sin Workspaces") llamando a diferentes funciones de este módulo, para probar rápidamente diferentes estados de la aplicación.
 */
