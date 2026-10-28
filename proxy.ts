import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function redirectHomeAuth(request: NextRequest, path = "/connexion") {
  const url = request.nextUrl.clone();
  url.pathname = path;
  url.search = "";
  return NextResponse.redirect(url);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api")) {
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

export const config = {
  matcher: [
    "/espace",
    "/espace/:path*",
    "/api/:path*",
    "/compte-en-attente",
    "/mot-de-passe-oublie",
    "/mot-de-passe-oublie/:path*",
    "/reinitialiser-mot-de-passe",
    "/reinitialiser-mot-de-passe/:path*",
    "/inscription/confirmation",
  ],
};
