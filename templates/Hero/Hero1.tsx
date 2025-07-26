/* Ruta: templates/Hero/Hero1.tsx */

import React from "react";

export interface Hero1Props {
  title: string;
  subtitle: string;
}

export function Hero1({ title, subtitle }: Hero1Props) {
  return (
    <section className="text-center py-20 bg-gray-100">
      <h1 className="text-4xl font-bold">{title}</h1>
      <p className="text-xl mt-4 text-gray-600">{subtitle}</p>
    </section>
  );
}
/* Ruta: templates/Hero/Hero1.tsx */
