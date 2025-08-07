// components/layout/LandingFooter.tsx
"use client";

import Image from "next/image";
import React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SmartLink, type NavLinkItem } from "@/components/ui/SmartLink";
import { type AppPathname, Link } from "@/lib/navigation";

/**
 * @file LandingFooter.tsx
 * @description Componente de pie de página, refactorizado para ser 100%
 *              agnóstico al contenido y consumir el componente atómico `SmartLink`.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 10.1.0
 * @see {@link file://./tests/unit/components/layout/LandingFooter.test.tsx} Para el arnés de pruebas correspondiente.
 */
export interface LandingFooterProps {
  slogan: string;
  productColumnTitle: string;
  productLinks: NavLinkItem[];
  companyColumnTitle: string;
  companyLinks: NavLinkItem[];
  legalLinks: NavLinkItem[];
  newsletterTitle: string;
  newsletterPrompt: string;
  subscribeButtonText: string;
  allRightsReservedText: string;
}

export function LandingFooter({
  slogan,
  productColumnTitle,
  productLinks,
  companyColumnTitle,
  companyLinks,
  legalLinks,
  newsletterTitle,
  newsletterPrompt,
  subscribeButtonText,
  allRightsReservedText,
}: LandingFooterProps) {
  const currentYear = new Date().getFullYear();
  const rootPath: AppPathname = "/";

  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container mx-auto px-4 py-12 md:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="flex flex-col gap-4">
            <Link href={rootPath} className="flex items-center gap-3">
              <Image
                src="/images/logo.png"
                alt="Logo de MetaShark"
                width={32}
                height={32}
                className="h-8 w-auto"
              />
              <span className="text-lg font-bold text-foreground">
                Metashark
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">{slogan}</p>
          </div>

          <div>
            <h3 className="font-semibold">{productColumnTitle}</h3>
            <ul className="mt-4 space-y-2 text-sm">
              {productLinks.map((link) => (
                <li
                  key={
                    typeof link.href === "string"
                      ? link.href
                      : link.href.pathname
                  }
                >
                  <SmartLink href={link.href} label={link.label} />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">{companyColumnTitle}</h3>
            <ul className="mt-4 space-y-2 text-sm">
              {companyLinks.map((link) => (
                <li
                  key={
                    typeof link.href === "string"
                      ? link.href
                      : link.href.pathname
                  }
                >
                  <SmartLink href={link.href} label={link.label} />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold">{newsletterTitle}</h3>
            <p className="mt-4 text-sm text-muted-foreground">
              {newsletterPrompt}
            </p>
            <form className="mt-4 flex gap-2">
              <Input
                type="email"
                name="email"
                placeholder="tu@email.com"
                className="bg-input"
                required
                disabled
              />
              <Button type="submit" disabled>
                {subscribeButtonText}
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-12 border-t border-border/40 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            {allRightsReservedText.replace("{year}", currentYear.toString())}
          </p>
          <div className="flex flex-wrap gap-4 text-sm">
            {legalLinks.map((link) => (
              <SmartLink
                key={
                  typeof link.href === "string" ? link.href : link.href.pathname
                }
                href={link.href}
                label={link.label}
              />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Corrección de Contrato de Tipos**: ((Implementada)) Se ha revertido el uso de `SmartLink` para el logo, utilizando en su lugar un `<Link>` directo de `next-intl`, que es el componente correcto para este caso de uso y resuelve el error `TS2322`.
 *
 * @subsection Melhorias Futuras
 * 1. **Funcionalidad de Newsletter**: ((Vigente)) Implementar la Server Action para el formulario de la newsletter.
 */
// components/layout/LandingFooter.tsx
