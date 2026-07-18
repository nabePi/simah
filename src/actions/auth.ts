"use server";

import { userAuthFn } from "@/auth/user-auth";
import { adminAuthFn } from "@/auth/admin-auth";
import { adminSignIn, adminSignOut } from "@/auth/admin-auth";
import { userSignIn, userSignOut } from "@/auth/user-auth";
import { AuthError } from "next-auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "@/lib/password";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function loginAdmin(formData: FormData) {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  try {
    await adminSignIn("admin", {
      username,
      password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Username atau password salah." };
    }
    throw error;
  }
  redirect("/admin/dashboard");
}

export async function loginUser(formData: FormData) {
  const waNumber = String(formData.get("whatsapp") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  let result;
  try {
    result = await userSignIn("peserta", {
      waNumber,
      password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Nomor WhatsApp atau password salah." };
    }
    throw error;
  }
  // After login, check if user must change password
  // We re-query to confirm (session not available synchronously here reliably)
  const [user] = await db
    .select({
      id: users.id,
      mustChangePassword: users.mustChangePassword,
      status: users.status,
    })
    .from(users)
    .where(eq(users.waNumber, waNumber));
  if (user?.status === "blocked") {
    return { error: "Akun diblokir. Hubungi admin." };
  }
  if (user?.mustChangePassword) {
    redirect("/password");
  }
  redirect("/");
}

export async function changePassword(formData: FormData) {
  const newPassword = String(formData.get("new_password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

  if (newPassword.length < 8) {
    return { error: "Password minimal 8 karakter." };
  }
  if (!/[a-zA-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
    return { error: "Password harus kombinasi huruf dan angka." };
  }
  if (newPassword !== confirmPassword) {
    return { error: "Konfirmasi password tidak cocok." };
  }

  // Get current user from session
  const session = await userAuthFn();
  if (!session?.user?.id) {
    return { error: "Sesi tidak valid." };
  }
  const userId = Number(session.user.id);
  if (Number.isNaN(userId)) {
    return { error: "Sesi tidak valid." };
  }

  const passwordHash = await hashPassword(newPassword);
  await db
    .update(users)
    .set({ passwordHash, mustChangePassword: false })
    .where(eq(users.id, userId));

  revalidatePath("/");
  await userSignOut({ redirect: false });
  return { success: true };
}

export async function adminLogout() {
  await adminSignOut({ redirect: false });
  redirect("/admin/login");
}

export async function userLogout() {
  await userSignOut({ redirect: false });
  redirect("/login");
}
