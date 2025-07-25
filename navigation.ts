// navigation.ts
import { createLocalizedPathnamesNavigation } from "next-intl/navigation";

export const locales = ["en", "es"] as const;
export const localePrefix = "as-needed";

export const pathnames = {
  "/login": "/login",
  "/signup": "/signup", // <-- NUEVO
  "/admin": "/admin",
  "/dashboard": "/dashboard", // <-- NUEVO
};

export const { Link, redirect, usePathname, useRouter } =
  createLocalizedPathnamesNavigation({ locales, localePrefix, pathnames });
