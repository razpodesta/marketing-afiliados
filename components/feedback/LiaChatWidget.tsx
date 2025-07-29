// Ruta: components/dashboard/LiaChatWidget.tsx (NUEVO ARCHIVO)

"use client";

import { Bot } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";

/**
 * @file LiaChatWidget.tsx
 * @description Botón de chat flotante para interactuar con L.I.A.
 *
 * @author Metashark
 * @version 1.0.0
 */
export function LiaChatWidget() {
  const handleClick = () => {
    toast.success("Próximamente: ¡Chatea con L.I.A. Affiliate Manager!");
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <Button
        size="lg"
        className="rounded-full h-16 w-16 shadow-lg"
        onClick={handleClick}
      >
        <Bot className="h-8 w-8" />
        <span className="sr-only">Chatear con L.I.A.</span>
      </Button>
    </div>
  );
}
