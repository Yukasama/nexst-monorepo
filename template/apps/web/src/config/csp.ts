import "server-only";
import { env } from "@/env";

const isDev = process.env.NODE_ENV === "development";

// next-themes 0.4.6 theme-init inline <script> for
// <ThemeProvider attribute="class" disableTransitionOnChange /> (see
// src/features/shared/provider.tsx). It gets no per-request nonce: reading one
// via `headers()` in the layout tree above the page blocks cacheComponents'
// static shell. Its content is fixed for our props, so a hash allowlist is the
// correct CSP tool here.
//
// Turbopack renders this script differently per mode, so both are listed.
// Regenerate when next-themes is upgraded, Turbopack's output changes, or the
// ThemeProvider props change (tests/csp-theme-script.spec.ts fails loudly if a
// hash goes stale):
//   dev:  next dev  -> curl /en, extract the <script> containing "colorScheme"
//   prod: next build && next start -> same extraction
//   hash: sha256(scriptText), base64
const themeScriptHashes = [
  "'sha256-rbbnijHn7DZ6ps39myQ3cVQF1H+U/PJfHh5ei/Q2kb8='", // dev
  "'sha256-n46vPwSWuMC0W703pBofImv82Z26xo4LXymv0E9caPk='", // prod
];

const inlineScriptHashes = [
  "'sha256-7mu4H06fwDCjmnxxr/xNHyuQC6pLTHr4M2E4jXw5WZs='",
  ...themeScriptHashes,
];

/** Origins the browser may call: the API (GraphQL + auth). Add CDNs/buckets here (and to img-src). */
const connectSrc = [env.NEXT_PUBLIC_API_URL];

export function generateCspHeader({ nonce }: { nonce: string }) {
  const isHttps = !isDev && env.NEXT_PUBLIC_HOST_URL.startsWith("https://");

  return `
    default-src 'self';
    connect-src 'self' ${connectSrc.join(" ")} ${isDev ? "localhost:* 127.0.0.1:* ws://localhost:*" : ""};
    script-src 'self' 'nonce-${nonce}' ${inlineScriptHashes.join(" ")} ${isDev ? "'unsafe-eval'" : ""};
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    ${isHttps ? "upgrade-insecure-requests;" : ""}
  `
    .replaceAll(/\s{2,}/g, " ")
    .trim();
}
