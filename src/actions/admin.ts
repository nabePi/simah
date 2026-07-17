"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import {
  users,
  actions,
  notifications,
  manifestasiIwa,
  type User,
  type Action,
} from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import type { Sector } from "@/components/directory/participants-data";
import type { ActionStatus } from "@/components/action/action-items-data";
import { hashPassword } from "@/lib/password";
import { generateDefaultPassword, generateInitials } from "@/lib/default-password";
import { auth } from "@/auth/config";

export type ImportedUser = {
  id: number;
  name: string;
  waNumber: string;
  defaultPassword: string;
};

export type AdminActionRow = {
  id: number;
  title: string;
  description: string;
  status: ActionStatus;
  createdById: number;
  createdAt: string;
  startDate: string | null;
  endDate: string | null;
  votes: number;
  isPublished: boolean;
  manifestasiId: number | null;
  manifestasiPoin: string | null;
};

export type AdminUserRow = {
  id: number;
  name: string;
  waNumber: string;
  sector: Sector | null;
  role: string | null;
  organization: string | null;
  skills: string[];
  avatarUrl: string | null;
  initials: string | null;
  status: "active" | "blocked";
};

export async function requireAdminSession() {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function importUsers(
  rows: { nama: string; wa: string; sektor: string }[]
): Promise<{ users?: ImportedUser[]; error?: string }> {
  await requireAdminSession();
  if (!rows || rows.length === 0) {
    return { error: "Tidak ada baris untuk diimpor." };
  }
  const valid = rows.filter(
    (r) => r.nama.trim() && r.wa.trim() && r.sektor.trim()
  );
  if (valid.length === 0) {
    return { error: "Semua baris tidak valid." };
  }

  const created: ImportedUser[] = [];
  for (const row of valid) {
    const name = row.nama.trim();
    const waNumber = row.wa.trim();
    const sector = row.sektor.trim() as "pendidikan" | "ekonomi" | "profesional";
    const defaultPassword = generateDefaultPassword(name, waNumber);
    const [inserted] = await db
      .insert(users)
      .values({
        name,
        waNumber,
        sector,
        passwordHash: await hashPassword(defaultPassword),
        initials: generateInitials(name),
        role: "Peserta",
        organization: "-",
        offering: "",
      })
      .returning({ id: users.id });
    if (inserted) {
      created.push({ id: inserted.id, name, waNumber, defaultPassword });
    }
  }
  revalidatePath("/admin/dashboard");
  return { users: created };
}

export async function toggleBlockUser(id: number): Promise<{ error?: string }> {
  await requireAdminSession();
  const [current] = await db
    .select({ status: users.status })
    .from(users)
    .where(eq(users.id, id));
  if (!current) return { error: "User tidak ditemukan." };
  const next = current.status === "active" ? "blocked" : "active";
  await db
    .update(users)
    .set({ status: next as "active" | "blocked", updatedAt: new Date() })
    .where(eq(users.id, id));
  revalidatePath("/admin/dashboard");
  return {};
}

export async function deleteUser(id: number): Promise<{ error?: string }> {
  await requireAdminSession();
  await db.delete(users).where(eq(users.id, id));
  revalidatePath("/admin/dashboard");
  return {};
}

export async function updateActionStatus(
  id: number,
  status: "todo" | "in_progress" | "done"
): Promise<{ error?: string }> {
  await requireAdminSession();
  await db
    .update(actions)
    .set({ status, updatedAt: new Date() })
    .where(eq(actions.id, id));
  revalidatePath("/admin/dashboard");
  revalidatePath(`/admin/action/${id}`);
  revalidatePath(`/action/${id}`);
  return {};
}

export async function togglePublishAction(
  id: number
): Promise<{ error?: string }> {
  await requireAdminSession();
  const [current] = await db
    .select({ isPublished: actions.isPublished })
    .from(actions)
    .where(eq(actions.id, id));
  if (!current) return { error: "Action tidak ditemukan." };
  await db
    .update(actions)
    .set({ isPublished: !current.isPublished, updatedAt: new Date() })
    .where(eq(actions.id, id));
  revalidatePath("/admin/dashboard");
  revalidatePath(`/admin/action/${id}`);
  revalidatePath("/action");
  revalidatePath(`/action/${id}`);
  return {};
}

export async function deleteAction(id: number): Promise<{ error?: string }> {
  await requireAdminSession();
  await db.delete(actions).where(eq(actions.id, id));
  revalidatePath("/admin/dashboard");
  revalidatePath("/action");
  revalidatePath("/action/drafts");
  return {};
}

export async function adminUpdateAction(
  id: number,
  input: {
    title: string;
    background?: string;
    objectives?: string;
    description: string;
    needsFunding?: boolean;
    isPic?: boolean;
    skills?: string[];
    status?: "todo" | "in_progress" | "done";
    startDate?: string | null;
    endDate?: string | null;
    manifestasiId?: number | null;
    breakdownId?: number | null;
  }
): Promise<{ error?: string }> {
  await requireAdminSession();
  await db
    .update(actions)
    .set({
      title: input.title,
      description: input.description,
      background: input.background ?? null,
      objectives: input.objectives ?? null,
      needsFunding: input.needsFunding ?? false,
      isPic: input.isPic ?? true,
      skills: input.skills ?? [],
      status: input.status ?? "todo",
      startDate: input.startDate ?? null,
      endDate: input.endDate ?? null,
      manifestasiId: input.manifestasiId ?? null,
      breakdownId: input.breakdownId ?? null,
      updatedAt: new Date(),
    })
    .where(eq(actions.id, id));
  revalidatePath("/admin/dashboard");
  revalidatePath(`/admin/action/${id}`);
  revalidatePath(`/action/${id}`);
  return {};
}

export async function broadcastNotification(input: {
  title: string;
  body: string;
  variant: "alert" | "info";
  targetType: "all" | "sector" | "specific";
  sector?: string;
  userId?: number;
}): Promise<{ count?: number; error?: string }> {
  await requireAdminSession();
  const title = input.title.trim();
  const body = input.body.trim();
  if (!title || !body) return { error: "Judul dan isi pesan wajib diisi." };

  let targetIds: number[] = [];
  if (input.targetType === "all") {
    const all = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.status, "active"));
    targetIds = all.map((u) => u.id);
  } else if (input.targetType === "sector" && input.sector) {
    const bySector = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.sector, input.sector as "pendidikan" | "ekonomi" | "profesional"));
    targetIds = bySector.map((u) => u.id);
  } else if (input.targetType === "specific" && input.userId) {
    targetIds = [input.userId];
  }

  if (targetIds.length === 0) return { error: "Tidak ada penerima notifikasi." };

  await db.insert(notifications).values(
    targetIds.map((userId) => ({
      userId,
      type: "broadcast" as const,
      variant: input.variant,
      title,
      body,
      read: false,
    }))
  );
  revalidatePath("/admin/dashboard");
  revalidatePath("/notifications");
  return { count: targetIds.length };
}

// Server-side data fetchers (used by server component pages)
export async function fetchAdminUsers(): Promise<AdminUserRow[]> {
  const rows = await db.select().from(users);
  return rows.map((u: User) => ({
    id: u.id,
    name: u.name,
    waNumber: u.waNumber,
    sector: (u.sector as Sector | null) ?? null,
    role: u.role ?? null,
    organization: u.organization ?? null,
    skills: u.skills ?? [],
    avatarUrl: u.avatarUrl,
    initials: u.initials,
    status: u.status as "active" | "blocked",
  }));
}

export async function fetchAdminActions(): Promise<AdminActionRow[]> {
  const rows = await db
    .select({
      id: actions.id,
      title: actions.title,
      description: actions.description,
      status: actions.status,
      createdById: actions.createdById,
      createdAt: actions.createdAt,
      startDate: actions.startDate,
      endDate: actions.endDate,
      votes: actions.votes,
      isPublished: actions.isPublished,
      manifestasiId: actions.manifestasiId,
      manifestasiPoin: manifestasiIwa.poin,
    })
    .from(actions)
    .leftJoin(manifestasiIwa, eq(manifestasiIwa.id, actions.manifestasiId));
  return rows.map((a) => ({
    id: a.id,
    title: a.title,
    description: a.description,
    status: a.status as ActionStatus,
    createdById: a.createdById,
    createdAt: a.createdAt
      ? new Date(a.createdAt).toISOString()
      : new Date().toISOString(),
    startDate: a.startDate,
    endDate: a.endDate,
    votes: a.votes,
    isPublished: a.isPublished,
    manifestasiId: a.manifestasiId ?? null,
    manifestasiPoin: a.manifestasiPoin ?? null,
  }));
}
