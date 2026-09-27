import { NextRequest, NextResponse } from "next/server";
import { generateCspHeader } from "@/config/csp";

/**
 * Generates a per-request nonce + CSP and returns the request to hand to the
 * next middleware (so Next.js nonces its own scripts) plus a helper that stamps
 * the same header on the response.
 */
export function createCspContext(request: NextRequest) {
  const nonce = crypto.randomUUID().replaceAll("-", "");
  const cspHeader = generateCspHeader({ nonce });
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("Content-Security-Policy", cspHeader);
  requestHeaders.set("x-nonce", nonce);

  return {
    applyTo(response: NextResponse) {
      response.headers.set("Content-Security-Policy", cspHeader);
      return response;
    },
    request: new NextRequest(request, { headers: requestHeaders }),
  };
}
// @if auth

/** Sends the user to sign-in, remembering where they wanted to go. */
export function redirectToSignIn(
  request: NextRequest,
  pathname: string,
  locale: string,
): NextResponse {
  const signInUrl = new URL(`/${locale}/sign-in`, request.url);

  const requestedPath =
    (locale ? pathname.slice(locale.length + 1) : pathname) + request.nextUrl.search;
  if (requestedPath && requestedPath !== "/" && !requestedPath.startsWith("/sign-in")) {
    signInUrl.searchParams.set("returnTo", requestedPath);
  }

  return NextResponse.redirect(signInUrl);
}
// @endif
