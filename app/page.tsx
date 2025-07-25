// app/page.tsx
import { redirect } from "next/navigation";
import { locales } from "@/navigation";

// Este componente se encarga de la ruta raíz (`/`).
// Su única función es redirigir al locale por defecto.
// El middleware se encargará de detectar el idioma preferido del
// usuario y, si es necesario, redirigirlo nuevamente (p. ej., a `/es`).
export default function RootPage() {
  redirect(`/${locales[0]}`); // Redirige a /en
}
