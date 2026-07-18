import { userAuthFn } from "./user-auth";
import { adminAuthFn } from "./admin-auth";

export async function getSession() {
  return userAuthFn();
}

export async function getCurrentUser() {
  const session = await userAuthFn();
  return session?.user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }
  return user;
}

export async function getAdminSession() {
  return adminAuthFn();
}

export async function getCurrentAdmin() {
  const session = await adminAuthFn();
  if (session?.user?.role !== "admin") return null;
  return session.user;
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return null;
  }
  return admin;
}
