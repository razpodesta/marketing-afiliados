/**
 * @file 04-saas-schema-full-reset-with-rls.sql
 * @description Script maestro idempotente para resetear y construir el esquema
 *              completo para un SaaS multi-tenant con facturación (Stripe),
 *              gestión de cuotas automatizada y políticas de seguridad a nivel de fila (RLS).
 *
 * @author Code-Pilot Pro
 * @version 4.0.0
 */

-- Iniciar una transacción para garantizar la atomicidad.
BEGIN;

-- --- PASO 1: ELIMINAR OBJETOS ANTIGUOS (CON 'IF EXISTS') ---
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_campaign_updated ON public.campaigns;
DROP TRIGGER IF EXISTS on_site_created ON public.sites;
DROP TRIGGER IF EXISTS on_site_deleted ON public.sites;
DROP TRIGGER IF EXISTS on_workspace_updated ON public.workspaces;

DROP FUNCTION IF EXISTS public.handle_new_user_setup();
DROP FUNCTION IF EXISTS public.handle_updated_at();
DROP FUNCTION IF EXISTS public.increment_site_count();
DROP FUNCTION IF EXISTS public.decrement_site_count();

DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.prices CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.invitations CASCADE;
DROP TABLE IF EXISTS public.pages CASCADE;
DROP TABLE IF EXISTS public.campaigns CASCADE;
DROP TABLE IF EXISTS public.sites CASCADE;
DROP TABLE IF EXISTS public.workspace_members CASCADE;
DROP TABLE IF EXISTS public.workspaces CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.subscribers CASCADE;

DROP TYPE IF EXISTS public.app_role;
DROP TYPE IF EXISTS public.workspace_role;
DROP TYPE IF EXISTS public.subscription_status;


-- --- PASO 2: CREAR TIPOS ENUM PERSONALIZADOS ---
CREATE TYPE public.app_role AS ENUM ('user', 'admin', 'developer');
CREATE TYPE public.workspace_role AS ENUM ('owner', 'admin', 'member');
CREATE TYPE public.subscription_status AS ENUM ('trialing', 'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid');


-- --- PASO 3: CREAR TABLAS ---

CREATE TABLE public.profiles (
    id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text,
    avatar_url text,
    app_role public.app_role NOT NULL DEFAULT 'user'::app_role
);
COMMENT ON TABLE public.profiles IS 'Stores public profile data for each user.';

CREATE TABLE public.products (
    id text NOT NULL PRIMARY KEY,
    active boolean,
    name text,
    description text,
    metadata jsonb
);
COMMENT ON TABLE public.products IS 'Stores product information from Stripe.';

CREATE TABLE public.prices (
    id text NOT NULL PRIMARY KEY,
    product_id text NOT NULL REFERENCES public.products(id),
    active boolean,
    unit_amount bigint,
    currency text,
    type text,
    "interval" text
);
COMMENT ON TABLE public.prices IS 'Stores price information for products from Stripe.';

CREATE TABLE public.workspaces (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone,
    name text NOT NULL,
    owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    current_site_count integer NOT NULL DEFAULT 0,
    storage_used_mb numeric(10, 2) NOT NULL DEFAULT 0.00
);
COMMENT ON TABLE public.workspaces IS 'Workspaces are team environments for users.';

CREATE TABLE public.customers (
    id uuid NOT NULL PRIMARY KEY REFERENCES public.workspaces(id) ON DELETE CASCADE,
    stripe_customer_id text UNIQUE
);
COMMENT ON TABLE public.customers IS 'Maps workspaces to Stripe customers for billing.';

CREATE TABLE public.subscriptions (
    id text NOT NULL PRIMARY KEY,
    workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    status public.subscription_status,
    price_id text REFERENCES public.prices(id),
    quantity integer,
    cancel_at_period_end boolean,
    created timestamp with time zone NOT NULL DEFAULT now(),
    current_period_start timestamp with time zone NOT NULL DEFAULT now(),
    current_period_end timestamp with time zone NOT NULL DEFAULT now(),
    ended_at timestamp with time zone,
    cancel_at timestamp with time zone,
    canceled_at timestamp with time zone,
    trial_start timestamp with time zone,
    trial_end timestamp with time zone
);
COMMENT ON TABLE public.subscriptions IS 'Stores subscription data for workspaces from Stripe.';

CREATE TABLE public.workspace_members (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    role public.workspace_role NOT NULL,
    UNIQUE(user_id, workspace_id)
);
COMMENT ON TABLE public.workspace_members IS 'Links users to workspaces with specific roles.';

CREATE TABLE public.sites (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone,
    workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    subdomain text UNIQUE,
    custom_domain text UNIQUE,
    icon text
);
COMMENT ON TABLE public.sites IS 'Each site represents a tenant, accessible via subdomain or custom domain.';

CREATE TABLE public.campaigns (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone,
    site_id uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    name text NOT NULL,
    slug text NOT NULL,
    content jsonb,
    affiliate_url text,
    UNIQUE(site_id, slug)
);
COMMENT ON TABLE public.campaigns IS 'Stores individual marketing campaigns linked to a site.';

CREATE TABLE public.subscribers (
    id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    email text NOT NULL UNIQUE,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.subscribers IS 'Stores email addresses for the marketing newsletter.';

-- --- PASO 4: CREAR FUNCIONES Y TRIGGERS DE AUTOMATIZACIÓN ---

CREATE OR REPLACE FUNCTION public.handle_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION public.increment_site_count() RETURNS TRIGGER AS $$ BEGIN UPDATE public.workspaces SET current_site_count = current_site_count + 1 WHERE id = NEW.workspace_id; RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION public.decrement_site_count() RETURNS TRIGGER AS $$ BEGIN UPDATE public.workspaces SET current_site_count = current_site_count - 1 WHERE id = OLD.workspace_id; RETURN OLD; END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.handle_new_user_setup() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_workspace_id uuid;
BEGIN
  INSERT INTO public.profiles (id, app_role) VALUES (new.id, 'user');
  INSERT INTO public.workspaces (name, owner_id) VALUES ('Mi Primer Workspace', new.id) RETURNING id INTO new_workspace_id;
  INSERT INTO public.workspace_members (user_id, workspace_id, role) VALUES (new.id, new_workspace_id, 'owner');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_setup();
CREATE TRIGGER on_campaign_updated BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_site_updated BEFORE UPDATE ON public.sites FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_workspace_updated BEFORE UPDATE ON public.workspaces FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER on_site_created AFTER INSERT ON public.sites FOR EACH ROW EXECUTE PROCEDURE public.increment_site_count();
CREATE TRIGGER on_site_deleted AFTER DELETE ON public.sites FOR EACH ROW EXECUTE PROCEDURE public.decrement_site_count();


-- --- PASO 5: HABILITAR RLS Y DEFINIR POLÍTICAS DE SEGURIDAD ---

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow user to update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow access to members" ON public.workspaces FOR SELECT USING (EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = id AND user_id = auth.uid()));
CREATE POLICY "Allow owner to manage" ON public.workspaces FOR ALL USING (auth.uid() = owner_id);

ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to members" ON public.workspace_members FOR SELECT USING (EXISTS (SELECT 1 FROM public.workspace_members AS m WHERE m.workspace_id = workspace_members.workspace_id AND m.user_id = auth.uid()));

ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.sites FOR SELECT USING (true);
CREATE POLICY "Allow write access to members" ON public.sites FOR ALL USING (EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = sites.workspace_id AND user_id = auth.uid() AND (role = 'owner' OR role = 'admin')));

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to members" ON public.campaigns FOR SELECT USING (EXISTS (SELECT 1 FROM public.sites s JOIN public.workspace_members m ON s.workspace_id = m.workspace_id WHERE s.id = campaigns.site_id AND m.user_id = auth.uid()));
CREATE POLICY "Allow write access to members" ON public.campaigns FOR ALL USING (EXISTS (SELECT 1 FROM public.sites s JOIN public.workspace_members m ON s.workspace_id = m.workspace_id WHERE s.id = campaigns.site_id AND m.user_id = auth.uid() AND (m.role = 'owner' OR m.role = 'admin')));

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.products FOR SELECT USING (true);

ALTER TABLE public.prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON public.prices FOR SELECT USING (true);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to members" ON public.customers FOR SELECT USING (EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = id AND user_id = auth.uid()));

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to members" ON public.subscriptions FOR SELECT USING (EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = subscriptions.workspace_id AND user_id = auth.uid()));

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow insert for anyone" ON public.subscribers FOR INSERT WITH CHECK (true);

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow access to members of workspace" ON public.invitations FOR ALL USING (EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = invitations.workspace_id AND user_id = auth.uid()));

-- Finalizar la transacción
COMMIT;

/* MEJORAS FUTURAS DETECTADAS
 * 1. Versionado de Migraciones: Para un entorno de producción formal, estos scripts deberían ser gestionados como archivos de migración numerados por la CLI de Supabase. Esto permite un control de versiones robusto y despliegues automatizados y seguros.
 * 2. Pruebas de Base de Datos: Implementar un framework de pruebas para la base de datos (como `pgTAP`) para escribir pruebas unitarias para estas funciones de trigger, asegurando que se comporten como se espera ante diferentes escenarios.
 * 3. Funciones de Agregación para Cuotas: Para cuotas más complejas (como el uso de almacenamiento), en lugar de actualizar un contador, se podrían usar funciones de base de datos que calculen el uso actual sobre la marcha. Esto puede ser más preciso, aunque potencialmente más lento, y es una decisión de diseño a considerar.
 */