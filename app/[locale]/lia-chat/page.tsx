// Ruta: app/[locale]/lia-chat/page.tsx

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Bot } from "lucide-react"; // CORRECCIÓN: Se añade la importación del icono 'Bot'

/**
 * @file page.tsx
 * @description Página de la interfaz de chat con L.I.A. Affiliate Manager.
 * Proporciona un layout inspirado en aplicaciones de chat modernas.
 * CORREGIDO: Se ha añadido la importación del ícono 'Bot' que faltaba.
 *
 * @author Metashark
 * @version 1.1.0 (Icon Import Fix)
 */
export default function LiaChatPage() {
  return (
    <div className="flex h-full flex-col bg-card text-card-foreground rounded-lg border">
      <header className="border-b p-4">
        <h1 className="text-xl font-bold text-foreground">Chat con L.I.A.</h1>
        <p className="text-sm text-muted-foreground">
          Tu asistente de marketing de afiliados personal
        </p>
      </header>

      {/* Área de mensajes del chat */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Placeholder para los mensajes */}
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground flex-shrink-0">
            <Bot size={20} />
          </div>
          <div className="rounded-lg bg-secondary p-3">
            <p className="text-sm text-foreground">
              ¡Hola! Soy L.I.A. ¿En qué puedo ayudarte hoy? Puedes preguntarme
              sobre estrategias de nicho, pedirme que genere copys o que analice
              una de tus landing pages.
            </p>
          </div>
        </div>
      </div>

      {/* Área de entrada de texto */}
      <footer className="border-t border-border p-4">
        <form className="relative">
          <Input
            placeholder="Escribe tu mensaje a L.I.A...."
            className="pr-12 h-12 bg-input border-border"
          />
          <Button
            type="submit"
            size="icon"
            className="absolute right-2.5 top-1/2 -translate-y-1/2"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </footer>
    </div>
  );
}

/*
=== SECCIÓN DE MEJORAS IDENTIFICADAS (ACUMULATIVO) ===
1.  **Lógica de Chat Funcional:** Implementar la lógica para enviar mensajes a una API de IA (ej. Vercel AI SDK) y mostrar las respuestas en un estado de React.
2.  **Streaming de Respuestas:** Hacer que la respuesta de L.I.A. aparezca palabra por palabra (streaming) para una mejor experiencia de usuario.
3.  **Historial de Chat:** Guardar las conversaciones en la base de datos de Supabase para que el usuario pueda continuarlas más tarde.
4.  **Capacidad de Subir Archivos:** Añadir un botón en el `footer` del chat para permitir al usuario subir archivos (PDFs de landings, imágenes de Ads) para que L.I.A. los analice.
*/
