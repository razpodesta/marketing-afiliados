// tests/app/[locale]/dev-console/components/VisitorLogsTable.test.tsx
/**
 * @file VisitorLogsTable.test.tsx
 * @description Arnés de pruebas para VisitorLogsTable. Ha sido refactorizado
 *              para alinearse con las mejoras de accesibilidad del componente,
 *              resolviendo los errores de consulta (`TestingLibraryElementError`).
 * @author L.I.A Legacy & RaZ Podestá
 * @co-author MetaShark
 * @version 3.0.0 (Accessible Querying Fix)
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  VisitorLogsTable,
  type VisitorLogRow,
} from "@/app/[locale]/dev-console/components/VisitorLogsTable";
import React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";

// --- Simulación de Dependencias ---
vi.mock("next-intl", () => ({
  useFormatter: () => ({
    dateTime: (date: Date) => date.toISOString(),
  }),
}));

// --- Helper de Renderizado con Proveedores ---
const renderWithProviders = (ui: React.ReactElement) => {
  return render(<TooltipProvider>{ui}</TooltipProvider>);
};

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
];

describe("Arnés de Pruebas: VisitorLogsTable", () => {
  const user = userEvent.setup();

  it("Estado Vacío: debe renderizar el mensaje correcto si no hay logs", () => {
    // Arrange
    renderWithProviders(<VisitorLogsTable logs={[]} />);

    // Assert
    expect(
      screen.getByText("No se han registrado visitas todavía.")
    ).toBeInTheDocument();
  });

  it("Interacción: debe abrir el diálogo de Geo Data con el contenido correcto", async () => {
    // Arrange
    renderWithProviders(<VisitorLogsTable logs={mockLogs} />);
    // --- INICIO DE REFACTORIZACIÓN ARQUITECTÓNICA ---
    // Consulta accesible y única por `aria-label`
    const actionButton = screen.getByLabelText("Acciones para el log log-1");
    // --- FIN DE REFACTORIZACIÓN ARQUITECTÓNICA ---

    // Act
    await user.click(actionButton);
    const viewGeoButton = await screen.findByText("Ver Geo Data");
    await user.click(viewGeoButton);

    // Assert
    await waitFor(() => {
      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
      expect(screen.getByText(/"country": "BR"/)).toBeInTheDocument();
    });
  });

  it("Interacción: debe abrir el diálogo de UTM Params con el contenido correcto", async () => {
    // Arrange
    renderWithProviders(<VisitorLogsTable logs={mockLogs} />);
    const actionButton = screen.getByLabelText("Acciones para el log log-1");

    // Act
    await user.click(actionButton);
    const viewUtmButton = await screen.findByText("Ver UTMs");
    await user.click(viewUtmButton);

    // Assert
    await waitFor(() => {
      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
      expect(screen.getByText(/"source": "google"/)).toBeInTheDocument();
    });
  });
});

/**
 * @section MEJORA CONTINUA
 *
 * @subsection Mejoras Implementadas
 * 1. **Consultas de Prueba Accesibles**: ((Implementada)) Se ha corregido el `TestingLibraryElementError` al utilizar el `aria-label` único para encontrar el botón de acción, haciendo la prueba más robusta y alineada con las mejores prácticas de accesibilidad.
 */
// tests/app/[locale]/dev-console/components/VisitorLogsTable.test.tsx
