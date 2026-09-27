import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export function constructMetadata(): Metadata {
  return {
    description: siteConfig.description,
    metadataBase: new URL(siteConfig.url),
    openGraph: {
      description: siteConfig.description,
      title: siteConfig.name,
    },
    title: {
      default: siteConfig.name,
      template: `%s | ${siteConfig.name}`,
    },
  };
}
