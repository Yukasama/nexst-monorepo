/**
 * Reads and sanitizes the `returnTo` query param from the current URL.
 * Client-only: returns undefined during SSR/prerender so callers fall back to their default.
 */
export function getReturnTo(): string | undefined {
  if (typeof window === "undefined") return undefined;

  return sanitizeReturnTo(new URLSearchParams(window.location.search).get("returnTo") ?? undefined);
}

function sanitizeReturnTo(value: string | string[] | undefined): string | undefined {
  const path = Array.isArray(value) ? value[0] : value;

  if (path && path.startsWith("/") && !path.startsWith("//") && !path.startsWith("/\\")) {
    return path;
  }

  return undefined;
}
