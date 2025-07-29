// app/s/[subdomain]/page.tsx
/**
 * @file Public Site Page (Server Component)
 * @description Esta página se renderiza públicamente para cada sitio.
 * @author Metashark (Refactorizado por L.I.A Legacy)
 * @version 3.0.0 (Corrected Data Fetching)
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { sites as sitesData } from "@/lib/data";
import { protocol, rootDomain } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: { subdomain: string };
}): Promise<Metadata> {
  const siteData = await sitesData.getSiteDataByHost(params.subdomain);

  if (!siteData || !siteData.subdomain) {
    return { title: `Site Not Found | ${rootDomain}` };
  }

  return {
    title: `${siteData.subdomain}.${rootDomain}`,
    description: `Welcome to the page for ${siteData.subdomain}`,
  };
}

export default async function SubdomainPage({
  params,
}: {
  params: { subdomain: string };
}) {
  const siteData = await sitesData.getSiteDataByHost(params.subdomain);

  if (!siteData) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="absolute top-4 right-4">
        <Link
          href={`${protocol}://${rootDomain}`}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          {rootDomain}
        </Link>
      </div>
      <div className="text-center">
        <div className="mb-6 text-9xl">{siteData.icon || "🌐"}</div>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Welcome to {siteData.subdomain}.{rootDomain}
        </h1>
        <p className="mt-3 text-lg text-gray-600">
          This is your custom subdomain page.
        </p>
      </div>
    </div>
  );
}
