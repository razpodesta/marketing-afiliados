// auth.config.ts
import type { NextAuthConfig } from "next-auth";
import { NextRequest } from "next/server";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [
    // Los providers se definen en auth.ts, aquí puede quedar vacío.
  ],
  callbacks: {
    // La propiedad `auth` ahora está en el objeto `request`
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      // Rutas protegidas (todas las que están bajo /admin)
      if (pathname.startsWith("/admin")) {
        if (isLoggedIn) return true; // Si está logueado, permite el acceso
        return false; // No logueado, redirige a la página de login
      }

      // Permite el acceso a todas las demás rutas por defecto
      return true;
    },
  },
} satisfies NextAuthConfig;
/* MEJORAS PROPUESTAS
 * 1. Implementar un callback `jwt` para enriquecer el token con roles de usuario u otra información.
 * 2. Implementar un callback `session` para que la información del token (como los roles) esté disponible en el objeto de sesión del lado del cliente.
 * 3. Añadir más páginas personalizadas, como `error` o `verifyRequest`.
 */
