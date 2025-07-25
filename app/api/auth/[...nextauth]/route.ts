// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth";

export const { GET, POST } = handlers;

// Forzamos el runtime de Node.js para compatibilidad con bcrypt y supabase-js.
export const runtime = "nodejs";
