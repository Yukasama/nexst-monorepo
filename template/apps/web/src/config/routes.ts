import { routing } from "@/i18n/routing";

/** Paths reachable without a session. Everything else redirects to sign-in. */
const publicRoutes = ["/", "/sign-in", "/sign-up", "/recovery", "/reset-password", "/verify"];

/** Pages a signed-in user is bounced away from (to the dashboard). */
export const guestOnlyRoutes = ["/sign-in", "/sign-up"];

export const publicPaths = new Set([
  ...publicRoutes,
  ...routing.locales.flatMap((locale) =>
    publicRoutes.map((route) => (route === "/" ? `/${locale}` : `/${locale}${route}`)),
  ),
]);
