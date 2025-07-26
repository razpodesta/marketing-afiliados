-- .docs/schema_v2_final.sql

-- Eliminar tablas antiguas si es necesario para empezar de cero
DROP TABLE IF EXISTS public.campaigns, public.pages, public.themes, public.tenants, public.profiles CASCADE;
DROP TYPE IF EXISTS public.user_role;

-- 1. Crear tipo ENUM para roles GLOBALES de la aplicación
CREATE TYPE public.app_role AS ENUM ('developer', 'user');

-- 2. Crear tipo ENUM para roles DENTRO de un workspace
CREATE TYPE public.workspace_role AS ENUM ('admin', 'member');

-- 3. Tabla de Perfiles (vinculada a la autenticación)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  app_role app_role NOT NULL DEFAULT 'user'
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow individual user access" ON public.profiles FOR ALL USING (auth.uid() = id);

-- 4. Tabla de Workspaces (el nivel más alto de organización del usuario)
CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL
);
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
-- Un usuario puede ver los workspaces de los que es miembro.
CREATE POLICY "Allow user to view their workspaces" ON public.workspaces FOR SELECT USING (
  id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
  )
);

-- 5. Tabla de Miembros del Workspace (para invitar a otros usuarios)
CREATE TABLE public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role workspace_role NOT NULL,
  UNIQUE(workspace_id, user_id) -- Un usuario solo puede tener un rol por workspace
);
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
-- Los miembros de un workspace pueden ver a otros miembros del mismo workspace.
CREATE POLICY "Allow members to see each other" ON public.workspace_members FOR SELECT USING (
  workspace_id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
  )
);

-- 6. Tabla de Sitios (anteriormente 'tenants')
-- Un Sitio es un subdominio o un dominio personalizado. Pertenece a un Workspace.
CREATE TABLE public.sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  subdomain TEXT UNIQUE,
  custom_domain TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
-- Un usuario puede gestionar los sitios del workspace del que es miembro.
CREATE POLICY "Allow members to manage workspace sites" ON public.sites FOR ALL USING (
  workspace_id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
  )
);

-- 7. Tabla de Campañas
-- Una Campaña vive dentro de un Sitio.
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL, -- La ruta, ej. 'mi-oferta-verano'
  affiliate_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(site_id, slug)
);
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
-- Política heredada a través del sitio.
CREATE POLICY "Allow members to manage site campaigns" ON public.campaigns FOR ALL USING (
  site_id IN (SELECT id FROM sites WHERE workspace_id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
  ))
);

-- 8. Tabla de Páginas
-- Contiene el contenido JSON de cada página de una campaña.
CREATE TABLE public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'bridge', 'review', etc.
  content JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, type)
);
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
-- Política heredada.
CREATE POLICY "Allow members to manage campaign pages" ON public.pages FOR ALL USING (
  campaign_id IN (SELECT id FROM campaigns WHERE site_id IN (
    SELECT id FROM sites WHERE workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  ))
);

-- Trigger para crear perfil y primer workspace al registrarse un nuevo usuario.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_workspace_id UUID;
BEGIN
  -- Crear el perfil del usuario
  INSERT INTO public.profiles (id, full_name, app_role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'user');

  -- Crear el primer workspace para el usuario
  INSERT INTO public.workspaces (owner_id, name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name' || '''s Workspace')
  RETURNING id INTO new_workspace_id;

  -- Añadir al usuario como 'admin' de su propio workspace
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (new_workspace_id, new.id, 'admin');

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();