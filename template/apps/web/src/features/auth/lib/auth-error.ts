import type { AuthError } from "@/lib/auth-client";
import { isNetworkError } from "@/lib/network-error";

/**
 * Copy for an auth failure that has no dedicated message. A dropped connection
 * gets its own text — the browser's wording for it ("NetworkError when
 * attempting to fetch resource.") means nothing to the user — anything else
 * shows the server's message, then the generic error.
 *
 * @param error - What the auth client threw or returned
 * @param tErrors - `useTranslations('Auth.Errors')` from the calling component
 */
export function authFallbackMessage(error: AuthError, tErrors: (key: string) => string): string {
  if (isNetworkError(error)) return tErrors("networkError");
  return error.message || tErrors("defaultError");
}
