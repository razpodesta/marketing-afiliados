/* Ruta: components/landing/Footer.tsx */

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * @file Footer.tsx
 * @description Componente de pie de página rediseñado para la landing page.
 * Incluye el logo, navegación, enlaces a redes sociales y un formulario de
 * suscripción al boletín, todo con la nueva identidad de marca.
 *
 * @author Metashark
 * @version 2.0.0 (Full Redesign)
 */
export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container mx-auto px-4 py-12 md:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Columna de Marca */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/images/logo.png"
                alt="Logo de MetaShark"
                width={32}
                height={32}
                className="h-8 w-auto"
              />
              <span className="text-lg font-bold">Metashark</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Transformando el marketing de afiliados con IA.
            </p>
          </div>

          {/* Columnas de Navegación */}
          <div>
            <h3 className="font-semibold">Producto</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  href="#features"
                  className="text-muted-foreground hover:text-primary"
                >
                  Características
                </Link>
              </li>
              <li>
                <Link
                  href="#pricing"
                  className="text-muted-foreground hover:text-primary"
                >
                  Precios
                </Link>
              </li>
              <li>
                <Link
                  href="/docs"
                  className="text-muted-foreground hover:text-primary"
                >
                  Documentación
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">Compañía</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-primary"
                >
                  Sobre nosotros
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-muted-foreground hover:text-primary"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-primary"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna de Newsletter */}
          <div>
            <h3 className="font-semibold">Mantente Actualizado</h3>
            <p className="mt-4 text-sm text-muted-foreground">
              Suscríbete a nuestro boletín para recibir las últimas noticias.
            </p>
            <form className="mt-4 flex gap-2">
              <Input
                type="email"
                placeholder="tu@email.com"
                className="bg-input"
              />
              <Button type="submit">Suscribirse</Button>
            </form>
          </div>
        </div>

        {/* Barra Inferior */}
        <div className="mt-12 border-t border-border/40 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} MetaShark. Todos los derechos
            reservados.
          </p>
          <div className="flex gap-4 text-sm">
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-primary"
            >
              Política de Privacidad
            </Link>
            <Link
              href="/terms"
              className="text-muted-foreground hover:text-primary"
            >
              Términos de Servicio
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
/* Ruta: components/landing/Footer.tsx */

/* MEJORAS PROPUESTAS
 * 1. **Newsletter Funcional:** Conectar el formulario de suscripción a una Server Action que guarde el correo en una tabla de `subscribers` en Supabase o lo envíe a un servicio de email marketing como Mailchimp o ConvertKit.
 * 2. **Enlaces de Redes Sociales Dinámicos:** Añadir una sección para los iconos de redes sociales (ej. X, LinkedIn, YouTube). Los enlaces podrían ser gestionados desde una tabla de configuración en la base de datos para que no estén codificados en duro.
 * 3. **Mapa del Sitio (Sitemap):** Los enlaces del footer son un buen punto de partida para generar un `sitemap.xml` dinámico, lo cual es crucial para el SEO. Se podría crear una ruta de API que genere este archivo a partir de las rutas de la aplicación y las páginas dinámicas.
 */
