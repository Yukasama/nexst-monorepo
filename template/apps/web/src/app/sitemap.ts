import type { MetadataRoute } from "next";
import { env } from "@/env";
import { routing } from "@/i18n/routing";

/** Public, indexable pages (locale prefix is added per locale). */
const staticPaths = [
  "",
  // @if auth
  "/sign-in",
  "/sign-up",
  // @endif
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.NEXT_PUBLIC_HOST_URL.replace(/\/$/, "");
  const lastModified = new Date();

  return routing.locales.flatMap((locale) =>
    staticPaths.map((path) => ({
      lastModified,
      url: `${base}/${locale}${path}`,
    })),
  );
}
