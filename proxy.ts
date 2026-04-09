import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { type NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

const PROTECTED = ["/dashboard"];

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
      return NextResponse.redirect(url);
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
      const locale = pathname.match(/^\/(en|ne)/)?.[1] ?? "en";
      const url = new URL(`/${locale}/login`, request.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!api|_next|_vercel|icon\\.svg|favicon\\.ico|.*\\..*).*)",
  ],
};
