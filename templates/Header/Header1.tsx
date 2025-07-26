/* Ruta: templates/Header/Header1.tsx */

import React from "react";

export interface Header1Props {
  logoText: string;
  ctaText: string;
}

export function Header1({ logoText, ctaText }: Header1Props) {
  return (
    <header className="flex justify-between items-center p-4 bg-gray-800 text-white">
      <div className="font-bold text-lg">{logoText}</div>
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        {ctaText}
      </button>
    </header>
  );
}
/* Ruta: templates/Header/Header1.tsx */
