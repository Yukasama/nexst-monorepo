import bundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const isProductionBuild = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    // The pod's root filesystem is read-only: keep ISR renders in memory instead of
    // writing them to .next/server.
    isrFlushToDisk: false,
    optimizePackageImports: ["lucide-react"],
    turbopackFileSystemCacheForDev: true,
    useTypeScriptCli: true,
  },
  headers: async () => [
    {
      headers: [
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
      ],
      source: "/(.*)",
    },
  ],
  output: "standalone",
  typescript: {
    tsconfigPath: isProductionBuild ? "tsconfig.build.json" : "tsconfig.json",
  },
};

const withNextIntl = createNextIntlPlugin();
export default withBundleAnalyzer(withNextIntl(nextConfig));
