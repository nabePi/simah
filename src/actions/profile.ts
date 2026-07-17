"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth/config";
import { hashPassword } from "@/lib/password";
import { uploadAvatar } from "@/lib/r2";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");
  const userId = Number(session.user.id);
  if (Number.isNaN(userId)) throw new Error("UNAUTHORIZED");
  return { session, userId };
}

export async function updateProfile(input: {
  sector: "pendidikan" | "pengusaha" | "profesional";
  role: string;
  organization: string;
  skills: string[];
  offering: string;
}): Promise<{ error?: string }> {
  const { userId } = await requireUser();
  await db
    .update(users)
    .set({
      sector: input.sector,
      role: input.role,
      organization: input.organization,
      skills: input.skills,
      offering: input.offering,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
  revalidatePath("/profile");
  revalidatePath("/directory");
  revalidatePath("/");
  return {};
}

export async function updateAvatar(formData: FormData): Promise<{ error?: string; avatarUrl?: string }> {
  const { userId } = await requireUser();
  const file = formData.get("avatar") as File | null;
  if (!file) return { error: "File tidak ditemukan." };
  let key: string;
  try {
    key = await uploadAvatar({ userId, file });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Gagal mengunggah foto.";
    // Surface R2 config errors to the user so they know credentials are missing.
    return { error: msg };
  }
  await db
    .update(users)
    .set({ avatarUrl: key, updatedAt: new Date() })
    .where(eq(users.id, userId));
  revalidatePath("/profile");
  revalidatePath("/directory");
  revalidatePath("/");
  return { avatarUrl: `/api/avatar/${key}` };
}
