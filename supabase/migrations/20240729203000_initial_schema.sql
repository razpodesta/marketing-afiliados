-- Ruta: supabase/migrations/20240729203000_initial_schema.sql
/**
 * @file 20240729203000_initial_schema.sql
 * @description Migración fundacional del esquema de la base de datos de Metashark.
 *              Este aparato crea todas las tablas, tipos, relaciones y políticas de
 *              seguridad (RLS) necesarias para el funcionamiento del núcleo de la aplicación.
 * @author L.I.A Legacy & RaZ Podestá
 * @version 1.0.0
 */

-- ==== FASE 1: DEFINICIÓN DE TIPOS (ENUMS) ====
-- Centraliza los roles y estados para garantizar la integridad de los datos.

create type public.app_role as enum ('user', 'admin', 'developer');
create type public.workspace_role as enum ('owner', 'admin', 'member', 'editor', 'viewer');

-- ==== FASE 2: CREACIÓN DE TABLAS FUNDACIONALES ====

-- Tabla de Perfiles: Extiende auth.users con metadatos específicos de la aplicación.
create table public.profiles (
    id uuid not null primary key references auth.users on delete cascade,
    full_name text,
    avatar_url text,
    app_role public.app_role not null default 'user'::public.app_role,
    dashboard_layout jsonb
);
comment on table public.profiles is 'User profile data, extending auth.users.';
comment on column public.profiles.app_role is 'Application-wide role for the user.';
comment on column public.profiles.dashboard_layout is 'User-defined order of dashboard modules.';


-- Tabla de Workspaces: Contenedor principal para proyectos y colaboración.
create table public.workspaces (
    id uuid not null default gen_random_uuid() primary key,
    created_at timestamp with time zone not null default now(),
    owner_id uuid not null references public.profiles,
    name text not null,
    icon text,
    current_site_count integer not null default 0,
    storage_used_mb integer not null default 0,
    updated_at timestamp with time zone
);
comment on table public.workspaces is 'Top-level container for organizing sites and members.';

-- Tabla de Miembros: Relación muchos-a-muchos entre usuarios y workspaces.
create table public.workspace_members (
    workspace_id uuid not null references public.workspaces on delete cascade,
    user_id uuid not null references public.profiles on delete cascade,
    role public.workspace_role not null default 'member'::public.workspace_role,
    created_at timestamp with time zone not null default now(),
    primary key (workspace_id, user_id)
);
comment on table public.workspace_members is 'Join table for user and workspace membership and roles.';

-- Tabla de Sitios: Representa un subdominio o dominio personalizado.
create table public.sites (
    id uuid not null default gen_random_uuid() primary key,
    workspace_id uuid not null references public.workspaces on delete cascade,
    owner_id uuid references public.profiles on delete set null,
    subdomain text unique,
    custom_domain text unique,
    icon text,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone
);
comment on table public.sites is 'Represents a unique site, mapped to a subdomain or custom domain.';

-- Tabla de Campañas: Almacena el contenido de las landing pages.
create table public.campaigns (
    id uuid not null default gen_random_uuid() primary key,
    site_id uuid not null references public.sites on delete cascade,
    name text not null,
    slug text,
    content jsonb,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone
);
comment on table public.campaigns is 'Stores the configuration and content for a specific landing page.';

-- ==== FASE 3: POLÍTICAS DE SEGURIDAD A NIVEL DE FILA (RLS) ====
-- Esta es la piedra angular de la seguridad multi-tenant.

-- 1. Habilitar RLS en todas las tablas.
alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.sites enable row level security;
alter table public.campaigns enable row level security;

-- 2. Políticas para 'profiles'
create policy "Los usuarios pueden ver su propio perfil." on public.profiles for select using (auth.uid() = id);
create policy "Los usuarios pueden actualizar su propio perfil." on public.profiles for update using (auth.uid() = id);

-- 3. Políticas para 'workspaces'
create policy "Los usuarios pueden ver los workspaces de los que son miembros." on public.workspaces for select using (
    exists (
        select 1 from public.workspace_members
        where workspace_members.workspace_id = workspaces.id and workspace_members.user_id = auth.uid()
    )
);
create policy "Los propietarios pueden actualizar sus workspaces." on public.workspaces for update using (auth.uid() = owner_id);

-- 4. Políticas para 'workspace_members'
create policy "Los miembros pueden ver la membresía de sus propios workspaces." on public.workspace_members for select using (
    exists (
        select 1 from public.workspace_members as m
        where m.workspace_id = workspace_members.workspace_id and m.user_id = auth.uid()
    )
);

-- 5. Políticas para 'sites' (heredan permisos de 'workspaces')
create policy "Los miembros de un workspace pueden ver sus sitios." on public.sites for select using (
    exists (
        select 1 from public.workspace_members
        where workspace_members.workspace_id = sites.workspace_id and workspace_members.user_id = auth.uid()
    )
);

-- 6. Políticas para 'campaigns' (heredan permisos de 'sites' -> 'workspaces')
create policy "Los miembros de un workspace pueden ver sus campañas." on public.campaigns for select using (
    exists (
        select 1 from public.sites
        join public.workspace_members on sites.workspace_id = workspace_members.workspace_id
        where campaigns.site_id = sites.id and workspace_members.user_id = auth.uid()
    )
);

-- Tabla de Invitaciones: Gestiona las invitaciones de usuarios a workspaces.
create table public.invitations (
    id uuid not null default gen_random_uuid() primary key,
    workspace_id uuid not null references public.workspaces on delete cascade,
    invited_by uuid not null references public.profiles on delete cascade,
    invitee_email text not null,
    role public.workspace_role not null,
    status text not null default 'pending', -- pending, accepted, declined, expired
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    -- Un usuario solo puede tener una invitación pendiente por workspace.
    unique (workspace_id, invitee_email)
);

comment on table public.invitations is 'Tracks user invitations to workspaces.';

-- Habilitar RLS para la tabla de invitaciones
alter table public.invitations enable row level security;

-- Los usuarios pueden ver las invitaciones dirigidas a ellos.
create policy "Los usuarios pueden ver sus propias invitaciones." on public.invitations for select using (invitee_email = auth.email());

-- Los administradores de un workspace pueden ver todas las invitaciones de su workspace.
create policy "Los administradores pueden ver las invitaciones de su workspace." on public.invitations for select using (
    exists (
        select 1 from public.workspace_members
        where workspace_members.workspace_id = invitations.workspace_id
          and workspace_members.user_id = auth.uid()
          and (workspace_members.role = 'admin' or workspace_members.role = 'owner')
    )
);