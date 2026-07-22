"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { actions, votes, contributions, notifications, users } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { auth } from "@/auth/config";
import { fetchManifestasiDetail } from "@/lib/queries";
import type { Sector } from "@/components/directory/participants-data";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");
  const userId = Number(session.user.id);
  if (Number.isNaN(userId)) throw new Error("UNAUTHORIZED");
  return { session, userId };
}

async function notifyActionOwners(actionId: number, joinerId: number) {
  const [action] = await db
    .select({ title: actions.title, createdById: actions.createdById })
    .from(actions)
    .where(eq(actions.id, actionId))
    .limit(1);
  if (!action) return;

  const [joiner] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, joinerId))
    .limit(1);
  const joinerName = joiner?.name ?? "Seorang peserta";

  const existingContributors = await db
    .select({ participantId: contributions.participantId, types: contributions.types })
    .from(contributions)
    .where(eq(contributions.actionId, actionId));

  const recipientIds = new Set<number>(
    existingContributors
      .filter((c) => c.participantId !== joinerId && c.types.includes("pic"))
      .map((c) => c.participantId)
  );
  if (action.createdById !== joinerId) recipientIds.add(action.createdById);
  if (recipientIds.size === 0) return;

  await db.insert(notifications).values(
    Array.from(recipientIds).map((userId) => ({
      userId,
      type: "text" as const,
      variant: "info" as const,
      title: "Kontributor Baru",
      body: `${joinerName} bergabung sebagai kontributor pada action "${action.title}".`,
      actorId: joinerId,
      read: false,
    }))
  );
}

export async function toggleVote(
  actionId: number
): Promise<{ voted?: boolean; error?: string }> {
  const { userId } = await requireUser();
  const [existing] = await db
    .select()
    .from(votes)
    .where(and(eq(votes.userId, userId), eq(votes.actionId, actionId)))
    .limit(1);
  if (existing) {
    await db
      .delete(votes)
      .where(and(eq(votes.userId, userId), eq(votes.actionId, actionId)));
    await db
      .update(actions)
      .set({ votes: sql`GREATEST(votes - 1, 0)` })
      .where(eq(actions.id, actionId));
    revalidatePath("/action");
    revalidatePath(`/action/${actionId}`);
    return { voted: false };
  }
  await db.insert(votes).values({ userId, actionId });
  await db
    .update(actions)
    .set({ votes: sql`votes + 1` })
    .where(eq(actions.id, actionId));
  revalidatePath("/action");
  revalidatePath(`/action/${actionId}`);
  return { voted: true };
}

export async function createContribution(
  actionId: number,
  types: string[]
): Promise<{ error?: string }> {
  const { userId } = await requireUser();
  if (!types || types.length === 0)
    return { error: "Pilih minimal satu kebutuhan." };
  const [existing] = await db
    .select()
    .from(contributions)
    .where(
      and(
        eq(contributions.actionId, actionId),
        eq(contributions.participantId, userId)
      )
    )
    .limit(1);
  if (existing) {
    await db
      .update(contributions)
      .set({ types, updatedAt: new Date() })
      .where(eq(contributions.id, existing.id));
  } else {
    await db
      .insert(contributions)
      .values({ actionId, participantId: userId, types });
    await notifyActionOwners(actionId, userId);
    revalidatePath("/notifications");
  }
  revalidatePath(`/action/${actionId}`);
  return {};
}

export async function createDraft(input: {
  title: string;
  background: string;
  objectives: string;
  beneficiary: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  needsFunding: boolean;
  isPic: boolean;
  skills: string[];
  interactingSectors: Sector[];
  hasDeadline: boolean;
  startDate?: string;
  hasEndDate?: boolean;
  endDate?: string;
  manifestasiId?: number;
  breakdownId?: number;
}): Promise<{ id?: number; error?: string }> {
  const { userId } = await requireUser();
  if (!input.title.trim()) return { error: "Judul wajib diisi." };
  const [created] = await db
    .insert(actions)
    .values({
      title: input.title.trim(),
      description: input.description.trim() || input.title.trim(),
      background: input.background || null,
      objectives: input.objectives || null,
      status: input.status,
      needsFunding: input.needsFunding,
      isPic: input.isPic,
      skills: input.skills,
      interactingSectors: input.interactingSectors,
      createdById: userId,
      isPublished: false,
      manifestasiId: input.manifestasiId ?? null,
      breakdownId: input.breakdownId ?? null,
      startDate:
        input.hasDeadline && input.startDate
          ? new Date(input.startDate).toISOString().slice(0, 10)
          : null,
      endDate:
        input.hasDeadline && input.hasEndDate && input.endDate
          ? new Date(input.endDate).toISOString().slice(0, 10)
          : null,
    })
    .returning({ id: actions.id });
  revalidatePath("/action/drafts");
  if (created) return { id: created.id };
  return { error: "Gagal membuat draft." };
}

export async function fetchManifestasiDetailAction(
  manifestasiId: number,
  breakdownId?: number,
) {
  return fetchManifestasiDetail(manifestasiId, breakdownId ?? null);
}

export async function updateDraft(
  id: number,
  input: {
    title: string;
    background: string;
    objectives: string;
    beneficiary: string;
    description: string;
    status: "todo" | "in_progress" | "done";
    needsFunding: boolean;
    isPic: boolean;
    skills: string[];
    interactingSectors: Sector[];
    hasDeadline: boolean;
    startDate?: string;
    hasEndDate?: boolean;
    endDate?: string;
    manifestasiId?: number;
    breakdownId?: number;
  },
): Promise<{ id?: number; error?: string }> {
  const { userId } = await requireUser();
  if (!input.title.trim()) return { error: "Judul wajib diisi." };
  const [row] = await db
    .select({ createdById: actions.createdById, isPublished: actions.isPublished })
    .from(actions)
    .where(eq(actions.id, id))
    .limit(1);
  if (!row) return { error: "Draft tidak ditemukan." };
  if (row.createdById !== userId) return { error: "Tidak diizinkan." };
  if (row.isPublished) return { error: "Action yang sudah dipublish tidak dapat diedit di sini." };

  await db
    .update(actions)
    .set({
      title: input.title.trim(),
      description: input.description.trim() || input.title.trim(),
      background: input.background || null,
      objectives: input.objectives || null,
      beneficiary: input.beneficiary.trim() || null,
      status: input.status,
      needsFunding: input.needsFunding,
      isPic: input.isPic,
      skills: input.skills,
      interactingSectors: input.interactingSectors,
      manifestasiId: input.manifestasiId ?? null,
      breakdownId: input.breakdownId ?? null,
      startDate:
        input.hasDeadline && input.startDate
          ? new Date(input.startDate).toISOString().slice(0, 10)
          : null,
      endDate:
        input.hasDeadline && input.hasEndDate && input.endDate
          ? new Date(input.endDate).toISOString().slice(0, 10)
          : null,
      updatedAt: new Date(),
    })
    .where(eq(actions.id, id));
  revalidatePath("/action/drafts");
  return { id };
}

export async function publishDraft(id: number): Promise<{ error?: string }> {
  const { userId } = await requireUser();
  const [row] = await db
    .select({ createdById: actions.createdById })
    .from(actions)
    .where(eq(actions.id, id))
    .limit(1);
  if (!row) return { error: "Draft tidak ditemukan." };
  if (row.createdById !== userId) return { error: "Tidak diizinkan." };
  await db
    .update(actions)
    .set({ isPublished: true, updatedAt: new Date() })
    .where(eq(actions.id, id));
  revalidatePath("/action/drafts");
  revalidatePath("/action");
  revalidatePath(`/action/${id}`);
  return {};
}

export async function deleteDraft(id: number): Promise<{ error?: string }> {
  const { userId } = await requireUser();
  const [row] = await db
    .select({ createdById: actions.createdById })
    .from(actions)
    .where(eq(actions.id, id))
    .limit(1);
  if (!row) return { error: "Draft tidak ditemukan." };
  if (row.createdById !== userId) return { error: "Tidak diizinkan." };
  await db.delete(actions).where(eq(actions.id, id));
  revalidatePath("/action/drafts");
  return {};
}
