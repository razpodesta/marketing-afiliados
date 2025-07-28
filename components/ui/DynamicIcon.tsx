// Ruta: components/ui/DynamicIcon.tsx
"use client";

import { icons, type LucideProps } from "lucide-react";
import React from "react";

interface DynamicIconProps extends LucideProps {
  name: string;
}

export const DynamicIcon = ({ name, ...props }: DynamicIconProps) => {
  const LucideIcon = icons[name as keyof typeof icons];

  if (!LucideIcon) {
    // Devuelve un fallback o null si el icono no se encuentra
    return null;
  }

  return <LucideIcon {...props} />;
};
