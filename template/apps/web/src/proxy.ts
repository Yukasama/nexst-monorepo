import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server"; // @if auth
import { guestOnlyRoutes, publicPaths } from "./config/routes"; // @if auth
import { routing } from "./i18n/routing";
import { fetchSession } from "./lib/auth-server"; // @if auth
import { createCspContext, redirectToSignIn } from "./lib/proxy-utils"; // @if auth
// import { createCspContext } from "./lib/proxy-utils"; // @if !auth

const i18nMiddleware = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  const csp = createCspContext(request);
  const response = await handleRequest(request, csp.request);
  return csp.applyTo(response);
}

// @if auth
async function handleRequest(request: NextRequest, requestWithCsp: NextRequest) {
  const i18nResponse = i18nMiddleware(requestWithCsp);
  if (i18nResponse.status >= 300 && i18nResponse.status < 400) {
    return i18nResponse;
  }

  const { pathname } = request.nextUrl;
  const locale = pathname.match(/^\/([^/]+)/)?.[1] ?? routing.defaultLocale;
  const route = pathname.slice(locale.length + 1) || "/";
  const session = await fetchSession(request.headers.get("cookie"));

  if (!session && !publicPaths.has(pathname)) {
    return redirectToSignIn(request, pathname, locale);
  }

  if (session && guestOnlyRoutes.includes(route)) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  return i18nResponse;
}
// @endif
// @if !auth
// function handleRequest(_request: NextRequest, requestWithCsp: NextRequest) {
//   return i18nMiddleware(requestWithCsp);
// }
// @endif

export const config = {
  matcher: [
    {
      missing: [
        { key: "next-router-prefetch", type: "header" },
        { key: "purpose", type: "header", value: "prefetch" },
      ],
      source: "/((?!api|_next|.*\\.[\\w]+$).*)",
    },
  ],
};
