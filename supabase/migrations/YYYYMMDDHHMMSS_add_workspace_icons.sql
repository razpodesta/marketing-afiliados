/**
 * @migration add_workspace_icons
 * @description Añade soporte para iconos (emojis) en la tabla de workspaces.
 *
 * Pasos de la migración:
 * 1. Añade una columna `icon` de tipo `text` a la tabla `public.workspaces`.
 * 2. Actualiza la función `create_workspace_with_owner` para que acepte un
 *    parámetro `new_workspace_icon` y lo inserte al crear un nuevo workspace.
 *    Esto mantiene la atomicidad de la operación.
 */

-- Paso 1: Añadir la columna a la tabla existente.
alter table public.workspaces
add column icon text null;

-- Paso 2: Reemplazar la función RPC para incluir el nuevo parámetro.
drop function if exists public.create_workspace_with_owner(uuid, text);

create or replace function public.create_workspace_with_owner(
  owner_user_id uuid,
  new_workspace_name text,
  new_workspace_icon text -- Nuevo parámetro
)
returns workspaces
language plpgsql
security definer
as $$
declare
  new_workspace workspaces;
begin
  -- Insertar el nuevo workspace con nombre e icono.
  insert into public.workspaces (name, owner_id, icon)
  values (new_workspace_name, owner_user_id, new_workspace_icon)
  returning * into new_workspace;

  -- Insertar al propietario como miembro (lógica sin cambios).
  insert into public.workspace_members (workspace_id, user_id, role)
  values (new_workspace.id, owner_user_id, 'owner');

  return new_workspace;
end;
$$;