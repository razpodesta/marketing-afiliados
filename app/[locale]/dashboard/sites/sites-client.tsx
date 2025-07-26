// NUEVO APARATO: app/[locale]/dashboard/sites/sites-client.tsx

"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { type Site } from "@/lib/data/sites";
import { ExternalLink, PlusCircle } from "lucide-react";
import Link from "next/link";
import { CreateSiteForm } from "@/components/sites/CreateSiteForm";

/**
 * @file sites-client.tsx
 * @description Componente de cliente para mostrar y gestionar los sitios.
 *
 * @author Metashark
 * @version 1.0.0 (Initial Creation)
 */
export function SitesClient({ initialSites }: { initialSites: Site[] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mis Sitios</h1>
          <p className="text-muted-foreground">
            Gestiona tus sitios de landing pages. Cada sitio puede tener
            múltiples campañas.
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear Nuevo Sitio
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear un nuevo sitio</DialogTitle>
            </DialogHeader>
            <CreateSiteForm />
          </DialogContent>
        </Dialog>
      </div>

      {initialSites.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {initialSites.map((site) => (
            <Card key={site.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{site.subdomain}</CardTitle>
                    <CardDescription>
                      {/* Aquí iría la lógica para mostrar campañas */}0
                      Campañas
                    </CardDescription>
                  </div>
                  <div className="text-4xl">{site.icon}</div>
                </div>
              </CardHeader>
              <CardFooter className="justify-between">
                <Button variant="outline" asChild>
                  {/* ESTE ES EL ESLABÓN FALTANTE HACIA EL CONSTRUCTOR */}
                  {/* Por ahora, lo dejamos como placeholder */}
                  <Link href={`/dashboard/sites/${site.id}/campaigns`}>
                    Gestionar Campañas
                  </Link>
                </Button>
                <a
                  href={`http://${site.subdomain}.localhost:3000`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Visitar
                  </Button>
                </a>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <p>Aún no has creado ningún sitio.</p>
      )}
    </div>
  );
}
