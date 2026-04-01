import { NextRequest, NextResponse } from "next/server";
import { getSession } from "./lib/auth";

const publicRoutes = ["/login", "/api/auth/login", "/api/auth/init"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isPublicRoute = publicRoutes.includes(path);

  // Pour Next.js App Router, il faut éviter d'intercepter les fichiers statiques ou _next
  if (
    path.startsWith("/_next") ||
    path.startsWith("/static") ||
    path.match(/\.(.*)$/) // Ex: favicon.ico, images, css
  ) {
    return NextResponse.next();
  }

  // 1. Lire la session
  const session = await getSession();

  // 2. Si non authentifié et route protégée -> Redirection vers /login
  if (!session?.user && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // 3. Si authentifié et sur la page de login -> Redirection vers l'accueil
  if (session?.user && path === "/login") {
    return NextResponse.redirect(new URL("/liste", req.nextUrl));
  }

  // 4. Règles spécifiques pour le rôle 'admin' (Lecture seule, pas d'écriture)
  if (session?.user?.role === "admin") {
    // Si l'admin tente d'accéder à la page de création, rediriger vers la liste
    if (path === "/") {
      return NextResponse.redirect(new URL("/liste", req.nextUrl));
    }

    // Protection des routes API globales pour forcer la lecture seule
    if (path.startsWith("/api/") && !path.startsWith("/api/auth/") && req.method !== "GET") {
      return NextResponse.json(
        { error: "Accès refusé. Les administrateurs sont en lecture seule." },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
