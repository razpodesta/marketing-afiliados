/* Ruta: app/[locale]/dashboard/settings/page.tsx */

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * @file page.tsx
 * @description Página de Ajustes del Workspace y Perfil.
 * Esta página servirá como el centro para que los usuarios gestionen
 * la configuración de su cuenta y del workspace activo.
 *
 * @author Metashark
 * @version 1.0.0
 */
export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ajustes</CardTitle>
          <CardDescription>
            Gestiona la configuración de tu cuenta y de tu workspace.
            (Funcionalidad en desarrollo).
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
/* Ruta: app/[locale]/dashboard/settings/page.tsx */
