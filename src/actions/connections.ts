"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { connections, notifications } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth/config";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");
  const userId = Number(session.user.id);
  if (Number.isNaN(userId)) throw new Error("UNAUTHORIZED");
  return { session, userId };
}

export async function connectRequest(
  requesteeId: number
): Promise<{ error?: string }> {
  const { userId } = await requireUser();
  if (userId === requesteeId)
    return { error: "Tidak dapat terhubung dengan diri sendiri." };

  const [existing] = await db
    .select()
    .from(connections)
    .where(
      and(
        eq(connections.requesterId, userId),
        eq(connections.requesteeId, requesteeId)
      )
    )
    .limit(1);
  if (existing) return {};

  const [created] = await db
    .insert(connections)
    .values({
      requesterId: userId,
      requesteeId,
      status: "pending",
    })
    .returning({ id: connections.id });

  await db.insert(notifications).values({
    userId: requesteeId,
    type: "connect_request",
    variant: "info",
    title: "Permintaan Connect",
    body: "Seseorang ingin terhubung dengan Anda.",
    actorId: userId,
    read: false,
  });

  revalidatePath("/directory");
  revalidatePath("/notifications");
  return {};
}

export async function approveConnection(
  connectionId: number
): Promise<{ error?: string }> {
  const { userId } = await requireUser();
  const [row] = await db
    .select()
    .from(connections)
    .where(eq(connections.id, connectionId))
    .limit(1);
  if (!row) return { error: "Koneksi tidak ditemukan." };
  if (row.requesteeId !== userId) return { error: "Tidak diizinkan." };

  await db
    .update(connections)
    .set({ status: "accepted", updatedAt: new Date() })
    .where(eq(connections.id, connectionId));

  await db
    .update(notifications)
    .set({ read: true })
    .where(
      and(
        eq(notifications.userId, userId),
        eq(notifications.type, "connect_request"),
        eq(notifications.actorId, row.requesterId)
      )
    );

  await db.insert(notifications).values({
    userId: row.requesterId,
    type: "text",
    variant: "info",
    title: "Koneksi Disetujui",
    body: "Permintaan koneksi Anda telah disetujui.",
    actorId: userId,
    read: false,
  });

  revalidatePath("/notifications");
  revalidatePath("/directory");
  return {};
}

export async function rejectConnection(
  connectionId: number
): Promise<{ error?: string }> {
  const { userId } = await requireUser();
  const [row] = await db
    .select()
    .from(connections)
    .where(eq(connections.id, connectionId))
    .limit(1);
  if (!row) return { error: "Koneksi tidak ditemukan." };
  if (row.requesteeId !== userId) return { error: "Tidak diizinkan." };

  await db
    .update(connections)
    .set({ status: "rejected", updatedAt: new Date() })
    .where(eq(connections.id, connectionId));

  await db.insert(notifications).values({
    userId: row.requesterId,
    type: "text",
    variant: "info",
    title: "Koneksi Ditolak",
    body: "Permintaan koneksi Anda ditolak.",
    actorId: userId,
    read: false,
  });

  revalidatePath("/notifications");
  revalidatePath("/directory");
  return {};
}

export async function markNotificationRead(id: number): Promise<void> {
  const { userId } = await requireUser();
  await db
    .update(notifications)
    .set({ read: true })
    .where(
      and(eq(notifications.id, id), eq(notifications.userId, userId))
    );
  revalidatePath("/notifications");
}
