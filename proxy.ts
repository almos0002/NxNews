import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { type NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

const PROTECTED = ["/dashboard"];

function pickLocale(pathname: string): "en" | "ne" {
  return pathname.startsWith("/ne") ? "ne" : "en";
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Nepal geo-redirect: visitors without a locale prefix from NP → /ne ──
  const hasLocalePrefix = /^\/(en|ne)(\/|$)/.test(pathname);
  if (!hasLocalePrefix) {
    const country =
      request.headers.get("x-vercel-ip-country") ||
      request.headers.get("cf-ipcountry");
    if (country === "NP") {
      const url = request.nextUrl.clone();
      url.pathname = "/ne" + (pathname === "/" ? "" : pathname);
      const redirect = NextResponse.redirect(url);
      // Geo-redirect varies by IP country header AND existing cookies (locale
      // override). Tell shared caches not to serve a single cached response
      // to all users.
      redirect.headers.set("Vary", "cookie, accept-language, x-vercel-ip-country");
      return redirect;
    }
  }

  // Strip locale prefix to check the real path
  const pathWithoutLocale = pathname.replace(/^\/(en|ne)/, "") || "/";
  const isProtected = PROTECTED.some(
    (p) => pathWithoutLocale === p || pathWithoutLocale.startsWith(p + "/")
  );

  if (isProtected) {
    // Better Auth session cookie (non-HTTPS dev vs HTTPS production)
    const sessionCookie =
      request.cookies.get("better-auth.session_token") ??
      request.cookies.get("__Secure-better-auth.session_token");

    if (!sessionCookie?.value) {
      const locale = pickLocale(pathname);
      const url = new URL(`/${locale}/login`, request.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
  }

  // For locale-prefixed URLs, skip next-intl rewrite logic and just forward
  // the request with our own headers attached. This lets the root server
  // layout read `x-pathname` to set `<html lang>` correctly.
  if (hasLocalePrefix) {
    const locale = pickLocale(pathname);
    const reqHeaders = new Headers(request.headers);
    reqHeaders.set("x-pathname", pathname);
    reqHeaders.set("x-locale", locale);

    const response = NextResponse.next({
      request: { headers: reqHeaders },
    });
    response.headers.set("Content-Language", locale);
    return response;
  }

  // No locale prefix → let next-intl negotiate and redirect to /en/...
  const intlResp = intlMiddleware(request);
  intlResp.headers.set("Vary", "cookie, accept-language");
  return intlResp;
}

export const config = {
  matcher: [
    "/((?!api|_next|_vercel|icon\\.svg|favicon\\.ico|.*\\..*).*)",
  ],
};
