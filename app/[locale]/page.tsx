import { SubdomainForm } from "@/app/subdomain-form";
import { useTranslations } from "next-intl";
import Link from "next/link";

/**
 * @description Página de inicio de la aplicación.
 */
export default function HomePage() {
  const t = useTranslations("HomePage");
  console.log("[HomePage] Renderizando la página de inicio.");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4 relative">
      <div className="absolute top-4 right-4">
        <Link
          href="/admin"
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          {t("adminLink")}
        </Link>
      </div>
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            {t("title")}
          </h1>
          <p className="mt-3 text-lg text-gray-600">{t("description")}</p>
        </div>
        <div className="mt-8 bg-white shadow-md rounded-lg p-6">
          <SubdomainForm />
        </div>
      </div>
    </div>
  );
}
/* MEJORAS PROPUESTAS
 * 1. **Aplicar Estilos de Shadcn/UI:** Reemplazar los divs genéricos con los componentes de Shadcn/UI como `<Card>`, `<CardHeader>`, `<CardContent>` para unificar el estilo visual con el resto de la aplicación.
 * 2. **Llamada a la Acción Dinámica:** Obtener la sesión en el servidor y si el usuario está autenticado, cambiar el enlace "Admin" por "Ir al Dashboard".
 * 1. **Carga Asíncrona:** El componente `SubdomainForm` es un candidato ideal para ser cargado de forma dinámica con `next/dynamic` para mejorar la métrica LCP (Largest Contentful Paint) de la página principal.
 * 2. **Estado de Autenticación:** Mostrar "Ir al Dashboard" en lugar de "Admin" si el usuario ya ha iniciado sesión. Esto se puede lograr leyendo la sesión en el servidor.
 */
