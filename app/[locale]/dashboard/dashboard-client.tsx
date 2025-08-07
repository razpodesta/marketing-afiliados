// app/[locale]/dashboard/dashboard-client.tsx
/**
 * @file dashboard-client.tsx
 * @description Orquestador de cliente puro para el dashboard. Ha sido refactorizado
 *              para importar su Server Action de forma atómica, respetando el límite
 *              Servidor-Cliente y resolviendo el error de compilación de forma definitiva.
 * @author RaZ Podestá & L.I.A Legacy
 * @version 17.0.0 (Definitive Atomic Import Fix)
 */
"use client";

import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useState, useTransition } from "react";
import toast from "react-hot-toast";

import { ActionCard } from "@/components/dashboard/ActionCard";
import { RecentCampaigns } from "@/components/dashboard/RecentCampaigns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { updateDashboardLayoutAction } from "@/lib/actions/profiles.actions";
import { useDashboard } from "@/lib/context/DashboardContext";
import { logger } from "@/lib/logging";
import type { Tables } from "@/lib/types/database";

export function DashboardClient({
  recentCampaigns,
}: {
  recentCampaigns: Tables<"campaigns">[];
}) {
  const t = useTranslations("DashboardPage");
  const { user, modules: initialModules } = useDashboard();
  const [modules, setModules] = useState(initialModules);
  const [, startTransition] = useTransition();
  const username = user.user_metadata?.full_name || user.email;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = modules.findIndex((m) => m.id === active.id);
      const newIndex = modules.findIndex((m) => m.id === over!.id);
      const newOrder = arrayMove(modules, oldIndex, newIndex);
      setModules(newOrder);

      const moduleIds = newOrder.map((m) => m.id);
      logger.trace("[DashboardClient] User reordered modules, saving layout.", {
        userId: user.id,
        newOrder: moduleIds,
      });
      startTransition(async () => {
        const result = await updateDashboardLayoutAction(moduleIds);
        if (!result.success) {
          toast.error(result.error || t("layoutSaveError"));
          logger.error("[DashboardClient] Failed to save new layout.", {
            userId: user.id,
            error: result.error,
          });
          setModules(modules); // Rollback optimistic update
        }
      });
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex h-full flex-col gap-8 relative">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="absolute top-0 right-0">
                <HelpCircle className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">{t("tooltip")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.1 } },
          }}
          className="flex flex-col gap-8"
        >
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0 },
            }}
          >
            <h1 className="text-2xl font-bold text-foreground">
              {t("welcomeMessage", { username })}
            </h1>
            <p className="text-md text-muted-foreground">{t("subtitle")}</p>
          </motion.div>
          <SortableContext items={modules.map((m) => m.id)}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {modules.map((module, index) => (
                <ActionCard
                  key={module.id}
                  module={module}
                  isPrimary={index === 0}
                />
              ))}
            </div>
          </SortableContext>
          <RecentCampaigns campaigns={recentCampaigns} />
        </motion.div>
      </div>
    </DndContext>
  );
}
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1.  **Desacoplamiento de Importaciones Definitivo**: ((Implementada)) Se ha refactorizado la importación para que apunte directamente a `lib/actions/profiles.actions.ts`, resolviendo la violación del límite Servidor-Cliente y corrigiendo el error de compilación.
 * 2.  **Full Observabilidad**: ((Implementada)) Se han añadido logs de `trace` y `error` con contexto de `userId` en `handleDragEnd`, mejorando la visibilidad del comportamiento del usuario.
 *
 * @subsection Melhorias Futuras
 * 1.  **Esqueleto de Carga Compuesto**: ((Vigente)) En el `PageSkeleton` del `page.tsx`, se podría componer el esqueleto usando `ActionCardSkeleton` y `RecentCampaignsSkeleton` para un estado de carga más fiel a la UI final.
 */
// app/[locale]/dashboard/dashboard-client.tsx
