import { db } from "@/db";
import {
  actions,
  users,
  votes,
  contributions,
  connections,
  notifications,
  manifestasiIwa,
  manifestasiBreakdowns,
} from "@/db/schema";
import { eq, and, or, ne, sql } from "drizzle-orm";
import type { Action } from "@/db/schema";
import { avatarUrlToSrc } from "@/lib/avatar";

export type ActionDetail = {
  id: number;
  title: string;
  description: string;
  status: string;
  createdById: number;
  createdAt: string;
  startDate: string | null;
  endDate: string | null;
  votes: number;
  background: string | null;
  objectives: string | null;
  needsFunding: boolean | null;
  isPic: boolean | null;
  skills: string[];
  isPublished: boolean;
  manifestasiId: number | null;
  breakdownId: number | null;
  creator: {
    id: number;
    name: string;
    avatarUrl: string | undefined;
    initials: string | null;
    sector: string | null;
    role: string | null;
    organization: string | null;
    skills: string[];
    offering: string;
  } | null;
};

export async function fetchActionById(id: number): Promise<ActionDetail | null> {
  const [row] = await db.select().from(actions).where(eq(actions.id, id));
  if (!row) return null;
  const creatorRow = row.createdById
    ? await db
        .select({
          id: users.id,
          name: users.name,
          avatarUrl: users.avatarUrl,
          initials: users.initials,
          sector: users.sector,
          role: users.role,
          organization: users.organization,
          skills: users.skills,
          offering: users.offering,
        })
        .from(users)
        .where(eq(users.id, row.createdById))
        .limit(1)
    : [];
  const creator = creatorRow[0] ?? null;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    createdById: row.createdById,
    createdAt: row.createdAt
      ? new Date(row.createdAt).toISOString()
      : new Date().toISOString(),
    startDate: row.startDate,
    endDate: row.endDate,
    votes: row.votes,
    background: row.background,
    objectives: row.objectives,
    needsFunding: row.needsFunding,
    isPic: row.isPic,
    skills: row.skills ?? [],
    isPublished: row.isPublished,
    manifestasiId: row.manifestasiId,
    breakdownId: row.breakdownId,
      creator: creator
      ? {
          id: creator.id,
          name: creator.name,
          avatarUrl: avatarUrlToSrc(creator.avatarUrl),
          initials: creator.initials,
          sector: creator.sector,
          role: creator.role,
          organization: creator.organization,
          skills: creator.skills ?? [],
          offering: creator.offering ?? "",
        }
      : null,
  };
}

export async function hasVoted(userId: number, actionId: number): Promise<boolean> {
  const [row] = await db
    .select({ userId: votes.userId })
    .from(votes)
    .where(and(eq(votes.userId, userId), eq(votes.actionId, actionId)))
    .limit(1);
  return !!row;
}

export async function fetchContributionsForAction(actionId: number) {
  const rows = await db
    .select({
      id: contributions.id,
      actionId: contributions.actionId,
      participantId: contributions.participantId,
      types: contributions.types,
      name: users.name,
      avatarUrl: users.avatarUrl,
      initials: users.initials,
      role: users.role,
      sector: users.sector,
      organization: users.organization,
      skills: users.skills,
      offering: users.offering,
    })
    .from(contributions)
    .innerJoin(users, eq(users.id, contributions.participantId))
    .where(eq(contributions.actionId, actionId));
  return rows.map((r) => ({
    id: r.id,
    actionId: r.actionId,
    participantId: r.participantId,
    types: r.types,
    name: r.name,
    avatarUrl: avatarUrlToSrc(r.avatarUrl),
    initials: r.initials,
    role: r.role,
    sector: r.sector,
    organization: r.organization,
    skills: r.skills,
    offering: r.offering,
  }));
}

export async function fetchParticipantsForAction(actionId: number) {
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      sector: users.sector,
      role: users.role,
      organization: users.organization,
      skills: users.skills,
      avatarUrl: users.avatarUrl,
      initials: users.initials,
      offering: users.offering,
      types: contributions.types,
    })
    .from(contributions)
    .innerJoin(users, eq(users.id, contributions.participantId))
    .where(eq(contributions.actionId, actionId));
  return rows.map((r) => ({
    id: String(r.id),
    name: r.name,
    sector: r.sector ?? "profesional",
    role: r.role ?? "",
    organization: r.organization ?? "-",
    skills: r.skills ?? [],
    avatarUrl: avatarUrlToSrc(r.avatarUrl),
    initials: r.initials ?? undefined,
    offering: r.offering ?? "",
    types: r.types ?? [],
  }));
}

export async function fetchAllParticipants() {
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      sector: users.sector,
      role: users.role,
      organization: users.organization,
      skills: users.skills,
      avatarUrl: users.avatarUrl,
      initials: users.initials,
      offering: users.offering,
    })
    .from(users)
    .where(eq(users.status, "active"));
  return rows.map((r) => ({
    id: String(r.id),
    name: r.name,
    sector: r.sector ?? "profesional",
    role: r.role ?? "",
    organization: r.organization ?? "-",
    skills: r.skills ?? [],
    avatarUrl: avatarUrlToSrc(r.avatarUrl),
    initials: r.initials ?? undefined,
    offering: r.offering ?? "",
  }));
}

export async function fetchConnectionStatus(
  requesterId: number,
  requesteeId: number
): Promise<"none" | "pending" | "accepted" | "rejected"> {
  const [row] = await db
    .select({ status: connections.status })
    .from(connections)
    .where(
      and(
        eq(connections.requesterId, requesterId),
        eq(connections.requesteeId, requesteeId)
      )
    )
    .limit(1);
  if (!row) return "none";
  return row.status;
}

export async function fetchNotificationsForUser(userId: number) {
  const rows = await db
    .select({
      id: notifications.id,
      userId: notifications.userId,
      type: notifications.type,
      variant: notifications.variant,
      title: notifications.title,
      body: notifications.body,
      actorId: notifications.actorId,
      read: notifications.read,
      createdAt: notifications.createdAt,
      actorName: users.name,
      actorAvatarUrl: users.avatarUrl,
      actorInitials: users.initials,
      actorSector: users.sector,
      actorRole: users.role,
      actorOrganization: users.organization,
      actorSkills: users.skills,
      actorOffering: users.offering,
    })
    .from(notifications)
    .leftJoin(users, eq(users.id, notifications.actorId))
    .where(
      and(
        eq(notifications.userId, userId),
        or(ne(notifications.type, "connect_request"), eq(notifications.read, false))
      )
    )
    .orderBy(sql`${notifications.createdAt} desc`);

  const connectRows =
    rows.filter((r) => r.type === "connect_request" && r.actorId).length > 0
      ? await db
          .select({
            id: connections.id,
            requesterId: connections.requesterId,
          })
          .from(connections)
          .where(eq(connections.requesteeId, userId))
      : [];

  const connByRequester = new Map(
    connectRows.map((c) => [c.requesterId, c.id]),
  );

  return rows.map((r) => ({
    id: String(r.id),
    type: r.type,
    variant: r.variant ?? undefined,
    title: r.title,
    body: r.body,
    createdAt: r.createdAt.toISOString(),
    read: r.read,
    actorId: r.actorId ? String(r.actorId) : undefined,
    actorName: r.actorName ?? undefined,
    actorAvatarUrl: avatarUrlToSrc(r.actorAvatarUrl),
    actorInitials: r.actorInitials ?? undefined,
    actorSector: (r.actorSector ?? undefined) as
      | "pendidikan"
      | "ekonomi"
      | "profesional"
      | undefined,
    actorRole: r.actorRole ?? undefined,
    actorOrganization: r.actorOrganization ?? undefined,
    actorSkills: r.actorSkills ?? undefined,
    actorOffering: r.actorOffering ?? undefined,
    connectionId:
      r.type === "connect_request" && r.actorId
        ? connByRequester.get(r.actorId)
        : undefined,
  }));
}

export async function fetchHomeData(userId: number) {
  const [connectionsCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(connections)
    .where(
      and(
        eq(connections.status, "accepted"),
        sql`(${connections.requesterId} = ${userId} OR ${connections.requesteeId} = ${userId})`,
      ),
    );

  const myActions = await db
    .select({
      id: actions.id,
      title: actions.title,
      status: actions.status,
      createdAt: actions.createdAt,
    })
    .from(actions)
    .where(eq(actions.createdById, userId))
    .orderBy(sql`${actions.createdAt} desc`)
    .limit(3);

  const actionsCount = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(actions)
    .where(eq(actions.createdById, userId));

  const myContributions = await db
    .select({
      id: contributions.id,
      actionId: contributions.actionId,
      types: contributions.types,
      title: actions.title,
      status: actions.status,
    })
    .from(contributions)
    .innerJoin(actions, eq(actions.id, contributions.actionId))
    .where(eq(contributions.participantId, userId))
    .orderBy(sql`${contributions.createdAt} desc`)
    .limit(3);

  const allContributionTypes = await db
    .select({ types: contributions.types })
    .from(contributions)
    .where(eq(contributions.participantId, userId));

  const contributionsCount = allContributionTypes.reduce(
    (sum, c) => sum + (c.types?.length ?? 0),
    0,
  );

  const connectionRows = await db
    .select({
      id: users.id,
      name: users.name,
      avatarUrl: users.avatarUrl,
      initials: users.initials,
    })
    .from(connections)
    .innerJoin(
      users,
      sql`CASE WHEN ${connections.requesterId} = ${userId} THEN ${connections.requesteeId} ELSE ${connections.requesterId} END = ${users.id}`,
    )
    .where(
      and(
        eq(connections.status, "accepted"),
        sql`(${connections.requesterId} = ${userId} OR ${connections.requesteeId} = ${userId})`,
      ),
    )
    .limit(4);

  return {
    stats: {
      connections: connectionsCount?.count ?? 0,
      actions: actionsCount[0]?.count ?? 0,
      contributions: contributionsCount,
    },
    myActions: myActions.map((a) => ({
      id: String(a.id),
      title: a.title,
      status: a.status,
      createdAt: a.createdAt
        ? new Date(a.createdAt).toISOString()
        : new Date().toISOString(),
    })),
    myContributions: myContributions.map((c) => {
      const types = c.types ?? [];
      const contributionItems: { type: "funding" | "pic" | "skill"; detail: string }[] = [];
      if (types.includes("funding")) {
        contributionItems.push({ type: "funding", detail: "Dana" });
      }
      if (types.includes("pic")) {
        contributionItems.push({ type: "pic", detail: "PIC" });
      }
      types
        .filter((t) => t !== "funding" && t !== "pic")
        .forEach((skill) => contributionItems.push({ type: "skill", detail: skill }));
      return {
        id: String(c.id),
        actionId: String(c.actionId),
        actionTitle: c.title,
        status: c.status,
        contributions: contributionItems,
      };
    }),
    connections: connectionRows.map((c) => ({
      id: String(c.id),
      name: c.name,
      avatarUrl: avatarUrlToSrc(c.avatarUrl),
      initials: c.initials ?? undefined,
    })),
    totalConnections: connectionsCount?.count ?? 0,
  };
}

export async function fetchManifestasiOptions() {
  const manifestasiRows = await db
    .select({ id: manifestasiIwa.id, poin: manifestasiIwa.poin })
    .from(manifestasiIwa)
    .orderBy(manifestasiIwa.id);

  const breakdownRows = await db
    .select({
      id: manifestasiBreakdowns.id,
      manifestasiId: manifestasiBreakdowns.manifestasiId,
      label: manifestasiBreakdowns.label,
    })
    .from(manifestasiBreakdowns)
    .orderBy(manifestasiBreakdowns.id);

  return manifestasiRows.map((m) => ({
    id: m.id,
    poin: m.poin,
    breakdowns: breakdownRows
      .filter((b) => b.manifestasiId === m.id)
      .map((b) => ({ id: b.id, label: b.label })),
  }));
}

export async function fetchManifestasiDetail(
  manifestasiId: number,
  breakdownId?: number | null,
): Promise<{
  poin: string;
  label: string | null;
  keterangan: string;
  dalil: string;
  contoh: string;
} | null> {
  const [manifestasi] = await db
    .select({ poin: manifestasiIwa.poin })
    .from(manifestasiIwa)
    .where(eq(manifestasiIwa.id, manifestasiId))
    .limit(1);
  if (!manifestasi) return null;

  const [breakdown] = breakdownId
    ? await db
        .select({
          label: manifestasiBreakdowns.label,
          keterangan: manifestasiBreakdowns.keterangan,
          dalil: manifestasiBreakdowns.dalil,
          contoh: manifestasiBreakdowns.contoh,
        })
        .from(manifestasiBreakdowns)
        .where(eq(manifestasiBreakdowns.id, breakdownId))
        .limit(1)
    : await db
        .select({
          label: manifestasiBreakdowns.label,
          keterangan: manifestasiBreakdowns.keterangan,
          dalil: manifestasiBreakdowns.dalil,
          contoh: manifestasiBreakdowns.contoh,
        })
        .from(manifestasiBreakdowns)
        .where(eq(manifestasiBreakdowns.manifestasiId, manifestasiId))
        .limit(1);
  if (!breakdown) return null;

  return {
    poin: manifestasi.poin,
    label: breakdown.label,
    keterangan: breakdown.keterangan,
    dalil: breakdown.dalil,
    contoh: breakdown.contoh,
  };
}

export async function fetchUnreadNotificationCount(
  userId: number,
): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notifications)
    .where(
      and(eq(notifications.userId, userId), eq(notifications.read, false)),
    );
  return row?.count ?? 0;
}
