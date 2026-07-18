import NextAuth from "next-auth";
import { adminProvider, jwtCallback, sessionCallback } from "./shared";

const cookiePrefix = "simah.admin";

export const adminAuth = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers: [adminProvider],
  callbacks: { jwt: jwtCallback, session: sessionCallback },
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    callbackUrl: {
      name: `${cookiePrefix}.callback-url`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: `${cookiePrefix}.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    pkceCodeVerifier: {
      name: `${cookiePrefix}.pkce.co_verifier`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
});

export const {
  handlers: adminHandlers,
  signIn: adminSignIn,
  signOut: adminSignOut,
  auth: adminAuthFn,
} = adminAuth;
