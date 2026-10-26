import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const PLATFORM_OPEN = process.env.PLATFORM_OPEN === "true";

function redirectHomeAuth(request: NextRequest, path = "/connexion") {
  const url = request.nextUrl.clone();
  url.pathname = path;
  url.search = "";
  return NextResponse.redirect(url);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!PLATFORM_OPEN) {
    if (pathname.startsWith("/api/auth")) {
      return NextResponse.json(
        { error: "Espace client en construction." },
        { status: 403 },
      );
    }
    if (
      pathname.startsWith("/espace") ||
      pathname === "/compte-en-attente" ||
      pathname.startsWith("/mot-de-passe-oublie") ||
      pathname.startsWith("/reinitialiser-mot-de-passe") ||
      pathname.startsWith("/inscription/confirmation")
    ) {
      return redirectHomeAuth(
        request,
        pathname.startsWith("/inscription") ? "/inscription" : "/connexion",
      );
    }
    return NextResponse.next();
  }

  if (!pathname.startsWith("/espace")) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    return redirectHomeAuth(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/espace",
    "/espace/:path*",
    "/api/auth",
    "/api/auth/:path*",
    "/compte-en-attente",
    "/mot-de-passe-oublie",
    "/mot-de-passe-oublie/:path*",
    "/reinitialiser-mot-de-passe",
    "/reinitialiser-mot-de-passe/:path*",
    "/inscription/confirmation",
  ],
};
