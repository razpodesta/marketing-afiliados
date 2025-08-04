// lib/hooks/useOptimisticResourceManagement.ts
/**
 * @file useOptimisticResourceManagement.ts (Nuevo Aparato)
 * @description Hook genérico y reutilizable para gestionar un conjunto de recursos con
 *              actualizaciones de UI optimistas para operaciones de creación y eliminación.
 *              Este es un aparato de "Lego" arquitectónico fundamental para el proyecto.
 * @author L.I.A Legacy
 * @version 1.0.0
 *
 * @template T - El tipo del recurso, debe tener una propiedad `id` de tipo string.
 *
 * @param {T[]} initialItems - La lista inicial de recursos.
 * @param {string} entityName - El nombre singular de la entidad (e.g., "Sitio", "Campaña"). Se usa para los mensajes de toast.
 * @param {Function} createAction - La Server Action para crear un nuevo recurso.
 * @param {Function} deleteAction - La Server Action para eliminar un recurso.
 *
 * @returns Un objeto con el estado y los manejadores para gestionar los recursos.
 */
"use client";

import { useEffect, useState, useTransition } from "react";
import toast from "react-hot-toast";

import { type ActionResult } from "@/lib/validators";
import { useRouter } from "@/lib/navigation";

interface Resource {
  id: string;
  [key: string]: any;
}

export function useOptimisticResourceManagement<T extends Resource>({
  initialItems,
  entityName,
  createAction,
  deleteAction,
}: {
  initialItems: T[];
  entityName: string;
  createAction: (formData: FormData) => Promise<ActionResult<{ id: string }>>;
  deleteAction: (formData: FormData) => Promise<ActionResult<any>>;
}) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [isPending, startTransition] = useTransition();
  const [mutatingId, setMutatingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const handleCreate = (formData: FormData, optimisticItem: Omit<T, "id">) => {
    const phantomItem: T = {
      id: `optimistic-${Date.now()}`,
      ...optimisticItem,
    } as T;

    const previousItems = items;
    setItems((current) => [...current, phantomItem]);
    setMutatingId(phantomItem.id);

    startTransition(async () => {
      const result = await createAction(formData);
      if (result.success) {
        toast.success(`${entityName} creado con éxito.`);
        router.refresh(); // Sincroniza con los datos reales del servidor
      } else {
        toast.error(result.error || `No se pudo crear el ${entityName}.`);
        setItems(previousItems); // Rollback
      }
      setMutatingId(null);
    });
  };

  const handleDelete = (formData: FormData) => {
    const idToDelete = formData.get("id") as string;
    if (!idToDelete) return;

    const previousItems = items;
    setItems((current) => current.filter((item) => item.id !== idToDelete));
    setMutatingId(idToDelete);

    startTransition(async () => {
      const result = await deleteAction(formData);
      if (result.success) {
        toast.success(`${entityName} eliminado con éxito.`);
        router.refresh();
      } else {
        toast.error(result.error || `No se pudo eliminar el ${entityName}.`);
        setItems(previousItems); // Rollback
      }
      setMutatingId(null);
    });
  };

  return {
    items,
    isPending,
    mutatingId,
    handleCreate,
    handleDelete,
  };
}
