-- Ruta: supabase/seed.sql
/**
 * @file seed.sql
 * @description Script de Seeding Fundacional.
 *              Este aparato puebla la base de datos con un conjunto mínimo de
 *              datos de prueba para permitir el funcionamiento de los flujos
 *              clave de la aplicación (login, onboarding, dashboard).
 * @author L.I.A Legacy & RaZ Podestá
 * @version 1.0.0
 */

-- ==== FASE 1: CREACIÓN DE USUARIO DE PRUEBA ====
-- Inserta un usuario de prueba directamente en el esquema de autenticación de Supabase.
-- IMPORTANTE: Este bloque solo se ejecutará si el usuario no existe.
--             La contraseña es 'password'. Se recomienda cambiarla.

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_token, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, phone, phone_confirmed_at, email_change, email_change_sent_at)
values
  ('00000000-0000-0000-0000-000000000000', 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 'authenticated', 'authenticated', 'dev@metashark.tech', crypt('password', gen_salt('bf')), now(), '', null, null, '{"provider":"email","providers":["email"],"app_role":"developer"}', '{"full_name":"Deve Loper","avatar_url":"https://avatars.githubusercontent.com/u/1024025?v=4"}', now(), now(), null, null, '', null)
on conflict (id) do nothing;


-- ==== FASE 2: CREACIÓN DE PERFIL ASOCIADO ====
-- Crea la entrada correspondiente en la tabla 'profiles' para el usuario de prueba.

insert into public.profiles (id, full_name, avatar_url, app_role)
values
  ('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Deve Loper', 'https://avatars.githubusercontent.com/u/1024025?v=4', 'developer')
on conflict (id) do nothing;


-- ==== FASE 3: CREACIÓN DE WORKSPACE Y MEMBRESÍA ====
-- Crea un workspace de prueba y asigna al usuario como 'owner'.

-- Declaramos variables para evitar la repetición y mejorar la legibilidad.
do $$
declare
  dev_user_id uuid := 'a1b2c3d4-e5f6-7890-1234-567890abcdef';
  new_workspace_id uuid;
begin
  -- Insertar el workspace y obtener su ID generado.
  insert into public.workspaces (owner_id, name, icon)
  values (dev_user_id, 'Metashark Dev Workspace', '🚀')
  returning id into new_workspace_id;

  -- Crear la membresía que vincula al usuario con el nuevo workspace.
  insert into public.workspace_members (workspace_id, user_id, role)
  values (new_workspace_id, dev_user_id, 'owner');
end $$;