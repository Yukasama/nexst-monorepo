import type { MetadataRoute } from "next";
import { env } from "@/env";

export default function robots(): MetadataRoute.Robots {
  const base = env.NEXT_PUBLIC_HOST_URL.replace(/\/$/, "");

  return {
    rules: {
      allow: "/",
      disallow: "/*/dashboard", // @if auth
      userAgent: "*",
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
