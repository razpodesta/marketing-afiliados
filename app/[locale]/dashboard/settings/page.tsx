/**
 * @file page.tsx
 * @description Página de Ajustes del Workspace y Perfil.
 * REFACTORIZACIÓN ESTRUCTURAL: La página se ha dividido en secciones lógicas
 * utilizando componentes Card para separar los ajustes de perfil de los del
 * workspace, sentando las bases para futuras expansiones.
 *
 * @author Metashark
 * @version 2.0.0 (Structural Refactoring)
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Ajustes</h1>
        <p className="text-muted-foreground">
          Gestiona la configuración de tu cuenta y de tu workspace activo.
        </p>
      </div>
      <Separator />

      {/* Sección de Ajustes del Workspace */}
      <Card>
        <CardHeader>
          <CardTitle>Ajustes del Workspace</CardTitle>
          <CardDescription>
            Gestiona el nombre, miembros y facturación de tu workspace actual.
            (Funcionalidad en desarrollo).
          </CardDescription>
        </CardHeader>
        <CardContent>{/* Futuros componentes de gestión aquí */}</CardContent>
      </Card>

      {/* Sección de Ajustes de Perfil */}
      <Card>
        <CardHeader>
          <CardTitle>Ajustes de Perfil</CardTitle>
          <CardDescription>
            Actualiza tu nombre, avatar y preferencias de la cuenta.
            (Funcionalidad en desarrollo).
          </CardDescription>
        </CardHeader>
        <CardContent>{/* Futuros componentes de perfil aquí */}</CardContent>
      </Card>
    </div>
  );
}
