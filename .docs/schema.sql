-- .docs/schema.sql

-- 1. Crear un tipo ENUM para los roles de usuario para garantizar la integridad de los datos.
CREATE TYPE public.user_role AS ENUM ('developer', 'admin', 'user');

-- 2. Crear la tabla de Perfiles (Profiles)
-- Esta tabla almacenará datos públicos y de la aplicación para cada usuario.
-- Se vincula a la tabla `auth.users` de Supabase mediante el `id`.
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'user'
);

-- 3. Habilitar la Seguridad a Nivel de Fila (Row Level Security - RLS) para la tabla de perfiles.
-- ¡CRÍTICO! Esto asegura que los usuarios solo puedan ver y editar sus propios datos por defecto.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Crear políticas de RLS para la tabla de perfiles.
-- Permite a los usuarios leer su propio perfil.
CREATE POLICY "Allow individual user read access" ON public.profiles FOR SELECT USING (auth.uid() = id);
-- Permite a los usuarios actualizar su propio perfil.
CREATE POLICY "Allow individual user update access" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 5. Crear la tabla de Tenants (los espacios de trabajo de nuestros suscriptores)
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subdomain TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL,
  -- Futuro: Se pueden añadir campos para planes de suscripción, temas, etc.
  -- plan_id UUID,
  -- custom_domain TEXT UNIQUE
);

-- 6. Habilitar RLS para la tabla de tenants.
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- 7. Crear políticas de RLS para la tabla de tenants.
-- Permite al propietario del tenant leer sus propios tenants.
CREATE POLICY "Allow owner to read their own tenants" ON public.tenants FOR SELECT USING (auth.uid() = owner_id);
-- Permite al propietario del tenant crear, actualizar y eliminar sus tenants.
CREATE POLICY "Allow owner to manage their own tenants" ON public.tenants FOR ALL USING (auth.uid() = owner_id);

-- Opcional, pero recomendado: crear un trigger para añadir automáticamente un perfil cuando un nuevo usuario se registra.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url', 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();