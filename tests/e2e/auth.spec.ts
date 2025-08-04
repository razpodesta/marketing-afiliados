// tests/e2e/auth.spec.ts
/**
 * @file auth.spec.ts
 * @description Prueba de Extremo a Extremo (E2E) para el flujo de autenticación.
 *              Valida que un usuario pueda navegar a la página de login,
 *              iniciar sesión con credenciales de prueba y ser redirigido al dashboard.
 * @author L.I.A Legacy
 * @version 1.0.0
 */
import { test, expect } from "@playwright/test";

test.describe("Flujo de Autenticación E2E", () => {
  test("un usuario debería poder iniciar sesión y ser redirigido al dashboard", async ({
    page,
  }) => {
    // 1. Navegar a la página de login
    await page.goto("/login");

    // 2. Rellenar el formulario de inicio de sesión
    // Usamos las credenciales del archivo `seed.sql`
    await page
      .getByLabel("Dirección de correo electrónico")
      .fill("dev@metashark.tech");
    await page.getByLabel("Contraseña").fill("password");

    // 3. Hacer clic en el botón de "Iniciar Sesión"
    await page.getByRole("button", { name: "Iniciar Sesión" }).click();

    // 4. Verificar la redirección al dashboard
    // `waitForURL` espera a que la URL del navegador cambie a la esperada.
    await page.waitForURL("/dashboard");

    // 5. Aserción final: verificar que el contenido del dashboard está presente
    // Esto confirma que el flujo se completó exitosamente.
    await expect(
      page.getByRole("heading", { name: "Bienvenido, Deve Loper" })
    ).toBeVisible();
  });
});
// tests/e2e/auth.spec.ts
