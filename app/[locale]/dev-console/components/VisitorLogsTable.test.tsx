// app/[locale]/dev-console/components/VisitorLogsTable.test.tsx
/**
 * @file VisitorLogsTable.test.tsx
 * @description Arnés de pruebas de producción para el componente VisitorLogsTable.
 *              Valida el renderizado correcto de los datos de telemetría, el
 *              estado vacío y la interacción con los diálogos de detalle.
 * @author L.I.A Legacy
 * @version 1.0.0
 * @see {@link file://./VisitorLogsTable.tsx} Para el aparato de producción bajo prueba.
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { VisitorLogsTable, type VisitorLogRow } from "./VisitorLogsTable";

// --- Simulación de Dependencias ---
vi.mock("next-intl", () => ({
  useFormatter: () => ({
    dateTime: (date: Date) => date.toISOString(),
  }),
}));

// --- Datos de Prueba (Test Data) ---
const mockLogs: VisitorLogRow[] = [
  {
    id: "log-1",
    session_id: "session-1",
    user_id: "user-abc",
    fingerprint: "fp-12345",
    ip_address: "192.168.1.1",
    geo_data: { country: "BR", city: "Florianopolis" },
    utm_params: { source: "google", campaign: "test" },
    created_at: new Date().toISOString(),
  },
  {
    id: "log-2",
    session_id: "session-2",
    user_id: null,
    fingerprint: "fp-67890",
    ip_address: "10.0.0.1",
    geo_data: { country: "US" },
    utm_params: null,
    created_at: new Date().toISOString(),
  },
];

describe("Componente: VisitorLogsTable", () => {
  const user = userEvent.setup();

  it("Camino Feliz: debe renderizar la tabla con todos los registros de log", () => {
    // Arrange
    render(<VisitorLogsTable logs={mockLogs} />);

    // Assert
    expect(screen.getByText("Usuario Registrado")).toBeInTheDocument();
    expect(screen.getByText("Sesión Anónima")).toBeInTheDocument();
    expect(screen.getByText("192.168.1.1")).toBeInTheDocument();
    expect(screen.getByText("fp-12345")).toBeInTheDocument();
    expect(screen.getByText("BR")).toBeInTheDocument();
  });

  it("Estado Vacío: debe renderizar el mensaje de estado vacío si no hay logs", () => {
    // Arrange
    render(<VisitorLogsTable logs={[]} />);

    // Assert
    expect(
      screen.getByText("No se han registrado visitas todavía.")
    ).toBeInTheDocument();
  });

  it("Interacción: debe abrir el diálogo de Geo Data al hacer clic en la acción", async () => {
    // Arrange
    render(<VisitorLogsTable logs={mockLogs} />);
    const actionButtons = screen.getAllByRole("button", {
      name: /morehorizontal/i,
    });

    // Act
    await user.click(actionButtons[0]);
    const viewGeoButton = await screen.findByText("Ver Geo Data");
    await user.click(viewGeoButton);

    // Assert
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText(/"country": "BR"/)).toBeInTheDocument();
    });
  });
});
/**
 * @section MEJORA CONTINUA
 * @description Mejoras para evolucionar esta suite de pruebas.
 *
 * @subsection Mejoras Adicionadas
 * 1. **Prueba de Interacción del Diálogo UTM**: (Vigente) Añadir una prueba similar a la de Geo Data para verificar que el diálogo de parámetros UTM se abre y muestra el contenido correcto.
 * 2. **Prueba de Formato de Fecha**: (Vigente) Hacer la aserción sobre la fecha más específica, verificando que el formato `toISOString` está presente en la celda.
 * 3. **Prueba de Accesibilidad (a11y)**: (Vigente) Integrar `jest-axe` para analizar el HTML renderizado y asegurar que la tabla y los diálogos cumplen con los estándares WCAG.
 */
// app/[locale]/dev-console/components/VisitorLogsTable.test.tsx
