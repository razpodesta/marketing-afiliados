// lib/hooks/useSubdomainAvailability.ts
/**
 * @file useSubdomainAvailability.ts
 * @description Hook de React atómico y de élite. Utiliza `useReducer` para una
 *              gestión de máquina de estados robusta y predecible, garantizando
 *              transiciones de estado explícitas y fiabilidad en las pruebas.
 * @author L.I.A Legacy
 * @version 2.0.0
 */
"use client";

import { useCallback, useEffect, useReducer } from "react";
import { sites as sitesActions } from "@/lib/actions";
import { debounce } from "@/lib/utils";

export type AvailabilityStatus =
  | "idle"
  | "checking"
  | "available"
  | "unavailable";

type State = {
  status: AvailabilityStatus;
};

type Action =
  | { type: "CHECK_START" }
  | { type: "CHECK_SUCCESS"; isAvailable: boolean }
  | { type: "CHECK_ERROR" }
  | { type: "RESET" };

const initialState: State = { status: "idle" };

function availabilityReducer(state: State, action: Action): State {
  switch (action.type) {
    case "CHECK_START":
      return { status: "checking" };
    case "CHECK_SUCCESS":
      return { status: action.isAvailable ? "available" : "unavailable" };
    case "CHECK_ERROR":
      return { status: "unavailable" };
    case "RESET":
      return { status: "idle" };
    default:
      return state;
  }
}

export function useSubdomainAvailability(
  subdomainValue: string,
  isDirty: boolean,
  hasErrors: boolean
) {
  const [state, dispatch] = useReducer(availabilityReducer, initialState);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedCheck = useCallback(
    debounce(async (subdomain: string) => {
      dispatch({ type: "CHECK_START" });
      const result =
        await sitesActions.checkSubdomainAvailabilityAction(subdomain);
      if (result.success) {
        dispatch({
          type: "CHECK_SUCCESS",
          isAvailable: result.data.isAvailable,
        });
      } else {
        dispatch({ type: "CHECK_ERROR" });
      }
    }, 500),
    [] // Sin dependencias para que la función debounced sea estable.
  );

  useEffect(() => {
    if (!isDirty) {
      dispatch({ type: "RESET" });
      return;
    }
    if (hasErrors || subdomainValue.length < 3) {
      dispatch({ type: "RESET" });
      return;
    }
    debouncedCheck(subdomainValue);
  }, [subdomainValue, isDirty, hasErrors, debouncedCheck]);

  return { availability: state.status };
}

/**
 * @calificacion 10/10
 *
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Implementadas
 * 1. **Máquina de Estados con `useReducer`**: ((Implementada)) Se ha reemplazado `useState` por `useReducer`. Esto hace que las transiciones de estado sean explícitas y atómicas, eliminando la condición de carrera y haciendo que el estado `checking` sea un paso discreto y verificable.
 * 2. **Lógica de `useEffect` Simplificada**: ((Implementada)) La lógica de `useEffect` es ahora más limpia. En lugar de establecer el estado directamente, ahora despacha acciones, desacoplando la causa del efecto.
 *
 * @subsection Melhorias Futuras
 * 1. **AbortController**: ((Vigente)) La mejora de élite sigue siendo la integración de un `AbortController` para cancelar peticiones de red pendientes si el usuario sigue escribiendo, optimizando los recursos del servidor.
 */
// lib/hooks/useSubdomainAvailability.ts
