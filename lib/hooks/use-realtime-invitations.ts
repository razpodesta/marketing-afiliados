// Ruta: lib/hooks/use-realtime-invitations.ts
/**
 * @file use-realtime-invitations.ts
 * @description Hook de React para gestionar y suscribirse a las invitaciones
 *              pendientes de un usuario en tiempo real utilizando Supabase Realtime.
 *
 * @author Metashark
 * @version 1.0.0
 */

"use client";

import { createClient } from "@/lib/supabase/client";
import { type User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

/**
 * @typedef {object} InvitationPayload
 * @description Define la estructura esperada de una invitación entrante.
 */
type InvitationPayload = {
  id: string;
  status: string;
  workspaces: {
    name: string;
    icon: string | null;
  } | null;
};

/**
 * @description Un hook que gestiona las invitaciones pendientes, actualizándose en tiempo real.
 * @param {User} user - El objeto del usuario autenticado.
 * @param {InvitationPayload[]} serverInvitations - La lista inicial de invitaciones cargadas desde el servidor.
 * @returns {InvitationPayload[]} La lista de invitaciones actualizada.
 */
export const useRealtimeInvitations = (
  user: User,
  serverInvitations: InvitationPayload[]
) => {
  const [invitations, setInvitations] =
    useState<InvitationPayload[]>(serverInvitations);
  const router = useRouter();

  useEffect(() => {
    // Asegurarse de que el hook solo se ejecute si hay un usuario.
    if (!user) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`realtime-invitations:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "invitations",
          filter: `invitee_email=eq.${user.email}`,
        },
        (payload) => {
          toast.success(`¡Tienes una nueva invitación!`);
          // Forzamos una recarga de los datos del servidor para obtener la
          // información completa y actualizada, lo cual es más robusto que
          // manejar el estado solo en el cliente.
          router.refresh();
        }
      )
      .subscribe();

    // Función de limpieza para desuscribirse del canal cuando el componente se desmonte.
    // Esto es CRÍTICO para prevenir fugas de memoria.
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, router]);

  // Actualizamos el estado local si las props del servidor cambian (ej. por router.refresh()).
  useEffect(() => {
    setInvitations(serverInvitations);
  }, [serverInvitations]);

  return invitations;
};
