-- .docs/schema_v2.sql

-- 1. Crear la tabla de Campañas
-- Cada campaña pertenece a un tenant.
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- El enlace de afiliado base para esta campaña
  affiliate_url TEXT
);
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
-- Política: Los usuarios pueden gestionar campañas de los tenants que les pertenecen.
CREATE POLICY "Allow owners to manage their tenant's campaigns" ON public.campaigns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM tenants
      WHERE tenants.id = campaigns.tenant_id AND tenants.owner_id = auth.uid()
    )
  );


-- 2. Crear la tabla de Páginas
-- Cada página (Bridge, Review, etc.) pertenece a una campaña.
CREATE TABLE public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  -- ej. 'bridge', 'review', 'thankyou'
  type TEXT NOT NULL,
  -- El contenido completo de la página en formato JSON, inspirado en la estructura de GlobalFitWell
  content JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
-- Política: Los usuarios pueden gestionar páginas de las campañas que les pertenecen.
CREATE POLICY "Allow owners to manage their campaign's pages" ON public.pages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM campaigns
      JOIN tenants ON campaigns.tenant_id = tenants.id
      WHERE pages.campaign_id = campaigns.id AND tenants.owner_id = auth.uid()
    )
  );

-- 3. Crear una tabla de Temas
-- Cada tema pertenece a un tenant y puede ser aplicado a múltiples campañas.
CREATE TABLE public.themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  -- El contenido del tema en JSON, inspirado en la estructura de GlobalFitWell
  colors JSONB,
  typography JSONB
);
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
-- Política: Los usuarios pueden gestionar temas de los tenants que les pertenecen.
CREATE POLICY "Allow owners to manage their tenant's themes" ON public.themes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM tenants
      WHERE tenants.id = themes.tenant_id AND tenants.owner_id = auth.uid()
    )
  );

-- No olvides regenerar los tipos después de aplicar estos cambios!