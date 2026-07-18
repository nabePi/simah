import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/db";
import { users, adminAccounts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword } from "@/lib/password";

export const jwtCallback: NonNullable<NextAuthConfig["callbacks"]>["jwt"] = async ({
  token,
  user,
}) => {
  if (user) {
    token.id = user.id;
    token.role = (user as { role?: string }).role;
    token.mustChangePassword = (user as { mustChangePassword?: boolean })
      .mustChangePassword;
  }
  return token;
};

export const sessionCallback: NonNullable<
  NextAuthConfig["callbacks"]
>["session"] = async ({ session, token }) => {
  if (session.user) {
    (session.user as { id?: string }).id = token.id;
    (session.user as { role?: string }).role = token.role;
    (session.user as { mustChangePassword?: boolean }).mustChangePassword =
      token.mustChangePassword;
  }
  return session;
};

export const adminProvider = Credentials({
  id: "admin",
  name: "Admin",
  credentials: {
    username: { label: "Username", type: "text" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials) {
    const username = String(credentials?.username ?? "").trim();
    const password = String(credentials?.password ?? "");
    if (!username || !password) return null;
    const [admin] = await db
      .select()
      .from(adminAccounts)
      .where(eq(adminAccounts.username, username));
    if (!admin) return null;
    const ok = await verifyPassword(password, admin.passwordHash);
    if (!ok) return null;
    return {
      id: `admin-${admin.id}`,
      name: admin.name,
      role: "admin" as const,
    };
  },
});

export const userProvider = Credentials({
  id: "peserta",
  name: "Peserta",
  credentials: {
    waNumber: { label: "WhatsApp", type: "tel" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials) {
    const waNumber = String(credentials?.waNumber ?? "").trim();
    const password = String(credentials?.password ?? "");
    if (!waNumber || !password) return null;
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.waNumber, waNumber));
    if (!user) return null;
    if (user.status === "blocked") return null;
    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) return null;
    return {
      id: String(user.id),
      name: user.name,
      role: "peserta" as const,
      mustChangePassword: user.mustChangePassword,
    };
  },
});

declare module "next-auth" {
  interface User {
    role?: string;
    mustChangePassword?: boolean;
  }
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      role?: string;
      mustChangePassword?: boolean;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    mustChangePassword?: boolean;
  }
}
