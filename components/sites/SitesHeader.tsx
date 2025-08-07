// components/sites/SitesHeader.tsx
/**
 * @file SitesHeader.tsx
 * @description Encabezado para la página "Mis Sitios". Refatorado para ser
 *              um componente puro que recebe todos os seus textos via props.
 * @author Metashark (Refatorado por L.I.A Legacy)
 * @version 10.0.0 (Pure I18n Component)
 */
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { PlusCircle, Search, X } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { CreateSiteForm, type CreateSiteFormTexts } from "./CreateSiteForm";

// --- INÍCIO DA ATUALIZAÇÃO DO CONTRATO DE PROPS ---
export interface SitesHeaderTexts {
  title: string;
  description: string;
  searchPlaceholder: string;
  clearSearchAria: string;
  createSiteButton: string;
  createDialogTitle: string;
}

interface SitesHeaderProps {
  texts: SitesHeaderTexts;
  formTexts: CreateSiteFormTexts;
  isCreateDialogOpen: boolean;
  setCreateDialogOpen: (isOpen: boolean) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  workspaceId: string;
  onCreate: (formData: FormData) => void;
  isPending: boolean;
}
// --- FIM DA ATUALIZAÇÃO DO CONTRATO DE PROPS ---

export function SitesHeader({
  texts,
  formTexts,
  isCreateDialogOpen,
  setCreateDialogOpen,
  searchQuery,
  onSearchChange,
  workspaceId,
  onCreate,
  isPending,
}: SitesHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative">
      <div>
        <h1 className="text-2xl font-bold">{texts.title}</h1>
        <p className="text-muted-foreground">{texts.description}</p>
      </div>
      <div className="flex w-full md:w-auto items-center gap-2">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={texts.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-10"
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onSearchChange("")}
                  aria-label={texts.clearSearchAria}
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shrink-0">
              <PlusCircle className="mr-2 h-4 w-4" />
              {texts.createSiteButton}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{texts.createDialogTitle}</DialogTitle>
            </DialogHeader>
            <CreateSiteForm
              workspaceId={workspaceId}
              onSuccess={onCreate}
              isPending={isPending}
              texts={formTexts}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Componente Puro de I18n**: ((Implementada)) O componente agora é 100% agnóstico ao conteúdo, recebendo todos os seus textos através da prop `texts`.
 */
// components/sites/SitesHeader.tsx
