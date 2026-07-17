import { auth } from "./config";

export async function getSession() {
  return auth();
}

export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return null;
  }
  return user;
}
