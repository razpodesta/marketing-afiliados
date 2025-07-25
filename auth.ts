// auth.ts
/**
 * @file Configuración Principal de Auth.js
 * @description Este archivo configura los proveedores de autenticación y exporta los handlers
 * y helpers de Auth.js. Ha sido refactorizado para un manejo de tipos estricto con
 * las relaciones de Supabase, incluyendo la correcta inferencia de tipos en joins.
 *
 * @author Metashark
 * @version 2.4.0 (Type-Safe Supabase Join Array Handling)
 */

import bcrypt from "bcryptjs";
import NextAuth, { type User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

import type { Database } from "@/lib/database.types";
import { authConfig } from "./auth.config";
import { supabase } from "./lib/supabase/server";

/**
 * @description Obtiene la información completa de un usuario (incluyendo el rol) desde la base de datos.
 * @param {string} email - El email del usuario a buscar.
 * @returns {Promise<(User & { passwordHash: string }) | null>} El objeto de usuario completo si se encuentra, de lo contrario null.
 */
async function getUserForAuth(
  email: string
): Promise<(User & { passwordHash: string }) | null> {
  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select(
        `
        id,
        role,
        users (
          email,
          raw_user_meta_data
        )
      `
      )
      .eq("users.email", email)
      .single();

    // CORRECCIÓN CLAVE #1: Verificar si el `join` devolvió un array vacío o si `users` es null.
    if (
      error ||
      !profile ||
      !profile.users ||
      !Array.isArray(profile.users) ||
      profile.users.length === 0
    ) {
      console.log(
        "User not found, profile join was empty, or error fetching profile."
      );
      return null;
    }

    // CORRECCIÓN CLAVE #2: Acceder al primer elemento del array devuelto por el join.
    const userData = profile.users[0];

    // NOTA DE ARQUITECTURA: Simulación del hash de contraseña para el provider Credentials.
    const isMockAdmin = userData.email === process.env.MOCK_ADMIN_EMAIL;
    const passwordHash = isMockAdmin
      ? process.env.MOCK_ADMIN_PASSWORD_HASH!
      : "";

    if (!passwordHash && isMockAdmin) {
      console.error(
        "MOCK_ADMIN_PASSWORD_HASH no está configurado en .env.local"
      );
      return null;
    }

    return {
      id: profile.id,
      email: userData.email!,
      name: (userData.raw_user_meta_data as any)?.full_name || userData.email,
      role: profile.role,
      passwordHash: passwordHash,
    };
  } catch (err) {
    console.error("Failed to fetch user:", err);
    throw new Error("Failed to fetch user.");
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(1) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUserForAuth(email);

          if (!user || !user.passwordHash) return null;

          const passwordsMatch = await bcrypt.compare(
            password,
            user.passwordHash
          );

          if (passwordsMatch) {
            const { passwordHash, ...userToReturn } = user;
            return userToReturn;
          }
        }

        console.log("Invalid credentials");
        return null;
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      const userRole = token.role as Database["public"]["Enums"]["user_role"];

      session.user.id = token.sub!;
      session.user.role = userRole;
      return session;
    },
  },
});
/*
 * 1. **Abandonar el Provider 'Credentials':** El flujo de `Credentials` va en contra del modelo de seguridad de Supabase Auth. La mejora más importante es migrar a proveedores nativos de Supabase como `Email` (Magic Link) o `OAuth` (Google, GitHub), que son más seguros y ofrecen una mejor UX.
 * 2. **Tipos de Sesión Seguros:** Crear un archivo `types/next-auth.d.ts` para extender los tipos por defecto de `Session` y `User` de Auth.js, añadiendo el campo `role`. Esto proporcionará seguridad de tipos en toda la aplicación al acceder a `session.user.role`.
 * 3. **Flujo de Recuperación de Contraseña:** Implementar la funcionalidad de "Olvidé mi contraseña" utilizando los métodos integrados de Supabase Auth.
 * 1. **Seguridad Crítica:** Reemplazar la comparación de contraseñas en texto plano por `bcrypt.compare`. La contraseña del usuario en la base de datos debe estar hasheada.
 * 2. **Base de Datos Real:** Conectar esto a una base de datos real (PostgreSQL, MongoDB, etc.) en lugar de `MOCK_USERS`.
 * 3. **Múltiples Proveedores:** Añadir proveedores de OAuth como Google, GitHub o LinkedIn para ofrecer más opciones de inicio de sesión.
 * 4. **Tipos de Sesión:** Definir tipos más estrictos para el objeto `User` y `Session` en un archivo `types/next-auth.d.ts` para mejorar el autocompletado y la seguridad de tipos.
 */
