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
  sector: "pendidikan" | "ekonomi" | "profesional";
  role: string;
  organization: string;
  skills: string[];
  offering: string;
  showWhatsapp: boolean;
}): Promise<{ error?: string }> {
  const startedAt = Date.now();
  let userId: number | undefined;
  try {
    const ctx = await requireUser();
    userId = ctx.userId;
    console.log("[updateProfile] start", {
      userId,
      sector: input.sector,
      role: input.role,
      organization: input.organization,
      skillsCount: input.skills.length,
      offeringLength: input.offering.length,
      showWhatsapp: input.showWhatsapp,
    });

    const returned = await db
      .update(users)
      .set({
        sector: input.sector,
        role: input.role,
        organization: input.organization,
        skills: input.skills,
        offering: input.offering,
        showWhatsapp: input.showWhatsapp,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    const row = returned[0] ?? null;
    console.log("[updateProfile] done", {
      userId,
      stored: row && {
        id: row.id,
        sector: row.sector,
        role: row.role,
        organization: row.organization,
        skillsCount: row.skills?.length ?? 0,
        offeringLength: row.offering?.length ?? 0,
        showWhatsapp: row.showWhatsapp,
        updatedAt: row.updatedAt,
      },
      ms: Date.now() - startedAt,
    });
    if (!row) {
      console.error("[updateProfile] no row updated — userId did not match any user", {
        userId,
      });
    }

    revalidatePath("/profile");
    revalidatePath("/directory");
    revalidatePath("/");
    console.log("[updateProfile] revalidated", {
      userId,
      paths: ["/profile", "/directory", "/"],
      ms: Date.now() - startedAt,
    });
    return {};
  } catch (err) {
    console.error("[updateProfile] failed", {
      userId,
      ms: Date.now() - startedAt,
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
    throw err;
  }
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
