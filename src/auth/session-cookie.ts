import { decode, type JWT } from "@auth/core/jwt";
import type { NextRequest } from "next/server";

// Read a session JWT from a cookie without going through the full Auth.js
// request pipeline. Mirrors how @auth/core decodes sessions internally:
// salt === the cookie's own name. Returns the decoded payload (role/id/etc.)
// or null when the cookie is absent or invalid.
async function readSession(
  req: NextRequest,
  cookieName: string,
): Promise<JWT | null> {
  const raw = req.cookies.get(cookieName)?.value;
  if (!raw) return null;
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;
  try {
    return await decode<JWT>({
      token: raw,
      salt: cookieName,
      secret,
    });
  } catch {
    return null;
  }
}

export async function getAdminSessionCookie(
  req: NextRequest,
): Promise<JWT | null> {
  return readSession(req, "simah.admin.session-token");
}

export async function getUserSessionCookie(
  req: NextRequest,
): Promise<JWT | null> {
  return readSession(req, "simah.user.session-token");
}
