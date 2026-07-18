import { NextResponse } from "next/server";
import { auth } from "@/auth/config";

const protectedUserRoutes = [
  "/profile",
  "/notifications",
  "/action/new",
  "/action/drafts",
];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAdmin = req.auth?.user?.role === "admin";
  const isUser = !!req.auth?.user;

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    // Allow admin login page itself
    if (pathname === "/admin/login") {
      if (isAdmin) {
        return NextResponse.redirect(
          new URL("/admin/dashboard", req.url),
        );
      }
      return NextResponse.next();
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.next();
  }

  if (isAdmin) {
    return NextResponse.redirect(
      new URL("/admin/dashboard", req.url),
    );
  }

  // Protect user-only routes
  if (protectedUserRoutes.some((p) => pathname.startsWith(p))) {
    if (!isUser) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Redirect logged-in users away from /login and /password
  if (pathname === "/login" && isUser && !req.auth?.user?.mustChangePassword) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

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
