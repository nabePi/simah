import NextAuth from "next-auth";
import { userProvider, jwtCallback, sessionCallback } from "./shared";

const cookiePrefix = "simah.user";

export const userAuth = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [userProvider],
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
  handlers: userHandlers,
  signIn: userSignIn,
  signOut: userSignOut,
  auth: userAuthFn,
} = userAuth;
