import { NextResponse, type NextRequest } from "next/server";
import { getAdminSessionCookie, getUserSessionCookie } from "@/auth/session-cookie";

// Dual-session middleware: admin session lives in its own cookie and is only
// consulted on /admin/* routes; the peserta (user) session cookie is consulted
// everywhere else. Both can be alive at once in the same browser.
// JWT is decoded directly from the cookie (salt === cookie name) so this does
// not depend on running the full Auth.js request pipeline in middleware.
export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    const adminSession = await getAdminSessionCookie(req);
    const isAdmin = adminSession?.role === "admin";

    if (pathname === "/admin/login") {
      if (isAdmin) {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
      return NextResponse.next();
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.next();
  }

  // Peserta area: read user cookie only.
  const userSession = await getUserSessionCookie(req);
  const isUser = !!userSession?.id;
  const mustChangePassword = userSession?.mustChangePassword;

  const protectedUserRoutes = [
    "/profile",
    "/notifications",
    "/action/new",
    "/action/drafts",
  ];

  if (protectedUserRoutes.some((p) => pathname.startsWith(p))) {
    if (!isUser) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  if (pathname === "/login" && isUser && !mustChangePassword) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/profile",
    "/notifications",
    "/action/new",
    "/action/drafts",
    "/login",
    "/password",
  ],
};
