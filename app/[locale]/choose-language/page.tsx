// app/[locale]/choose-language/page.tsx
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import React from "react";

import { ChooseLanguageClient } from "./choose-language-client";

/**
 * @file app/[locale]/choose-language/page.tsx
 * @description Orquestador de servidor para la página de selección de idioma.
 *              Obtiene las traducciones necesarias y las pasa al componente cliente.
 * @author L.I.A Legacy
 * @version 4.0.0
 */
export default async function ChooseLanguagePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);
  const t = await getTranslations("ChooseLanguagePage");

  const i18nProps = {
    title: t("title"),
    selectFromListText: t("selectFromListText"),
    redirectText: t("redirectText"),
  };

  return <ChooseLanguageClient {...i18nProps} />;
}
/**
 * @section MEJORA CONTINUA
 *
 * @subsection Melhorias Adicionadas
 * 1. **Cumplimiento de Internacionalización**: ((Implementada)) Este Server Component ahora obtiene las traducciones, cumpliendo con el mandato del proyecto.
 * 2. **Separación de Responsabilidades**: ((Implementada)) Se ha separado la lógica de obtención de datos (servidor) de la lógica de interacción (cliente).
 */
// app/[locale]/choose-language/page.tsx
