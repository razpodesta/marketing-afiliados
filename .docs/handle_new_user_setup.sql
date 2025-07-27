/**
 * @file handle_new_user_setup.sql
 * @description Función y Trigger de PostgreSQL para automatizar el onboarding de nuevos usuarios.
 * REFACTORIZACIÓN DE ROBUSTEZ Y SEGURIDAD: Esta función consolida la creación del
 * perfil y del workspace por defecto en una única operación. Utiliza `SECURITY DEFINER`
 * para ejecutarse con privilegios elevados, resolviendo los errores de base de datos
 * durante el registro de nuevos usuarios causados por fallos de permisos.
 *
 * @author Code-Pilot Pro
 * @version 1.0.0 (Robust Onboarding Trigger)
 */

-- 1. Primero, crea la función que se encargará de toda la lógica.
create or replace function public.handle_new_user_setup()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  new_workspace_id uuid;
begin
  -- Crear una entrada en la tabla 'profiles' para el nuevo usuario.
  insert into public.profiles (id, full_name, avatar_url, app_role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    'user'
  );

  -- Crear un workspace por defecto para el nuevo usuario.
  insert into public.workspaces (name, owner_id)
  values (
    'Mi Primer Workspace',
    new.id
  ) returning id into new_workspace_id;

  -- Asignar al nuevo usuario el rol de 'owner' en su nuevo workspace.
  insert into public.workspace_members (user_id, workspace_id, role)
  values (
    new.id,
    new_workspace_id,
    'owner'
  );
  
  return new;
end;
$$;

-- 2. A continuación, elimina cualquier trigger antiguo que puedas tener.
--    (Ejecuta esto si ya tienes un trigger, si no, puedes omitirlo).
drop trigger if exists on_auth_user_created on auth.users;

-- 3. Finalmente, crea el nuevo trigger que llama a la función anterior.
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user_setup();

  /* MEJORAS FUTURAS DETECTADAS
 * 1. Transaccionalidad Explícita: Aunque la ejecución dentro de una única función de trigger ya es atómica por defecto en PostgreSQL (si falla, todo se revierte), para lógicas de onboarding aún más complejas, se podría envolver el cuerpo de la función en un bloque `BEGIN...EXCEPTION...END` para un manejo de errores y rollback más granular y explícito.
 * 2. Nombres de Workspace Personalizados: El nombre "Mi Primer Workspace" está codificado en duro. Una mejora de UX sería permitir al usuario elegir el nombre de su primer workspace durante el proceso de registro o en una pantalla de bienvenida post-registro.
 * 3. Gestión de Disparadores desde Migraciones: Para un control de versiones robusto, este trigger y su función deberían ser parte de tus archivos de migración de Supabase, en lugar de ser aplicados manualmente a través del editor de SQL. Esto asegura que la estructura de la base de datos sea reproducible y esté versionada junto con tu código.
 */