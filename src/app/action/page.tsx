import type { Metadata } from "next";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavBar } from "@/components/layout/BottomNavBar";
import { ActionBoard } from "@/components/action/ActionBoard";
import { db } from "@/db";
import { actions, votes, users, manifestasiIwa, contributions } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { auth } from "@/auth/config";
import { avatarUrlToSrc } from "@/lib/avatar";

export const metadata: Metadata = {
  title: "Action Items - Simah | Aksi, Sinergi, Berdaya",
  description:
    "Pantau dan kelola item aksi dari sektor Pendidikan, Ekonomi, dan Profesional - Aksi, Sinergi, Berdaya",
};

export const dynamic = "force-dynamic";

export default async function ActionPage() {
  const allActions = await db
    .select({
      action: actions,
      creatorName: users.name,
      creatorAvatarUrl: users.avatarUrl,
      creatorInitials: users.initials,
      creatorSector: users.sector,
      creatorRole: users.role,
      creatorOrganization: users.organization,
      creatorSkills: users.skills,
      creatorOffering: users.offering,
      manifestasiPoin: manifestasiIwa.poin,
    })
    .from(actions)
    .leftJoin(users, eq(users.id, actions.createdById))
    .leftJoin(manifestasiIwa, eq(manifestasiIwa.id, actions.manifestasiId))
    .where(eq(actions.isPublished, true));
  const actionItems = allActions.map((row) => {
    const a = row.action;
    return {
      id: String(a.id),
      title: a.title,
      description: a.description,
      status: a.status as "todo" | "in_progress" | "done",
      createdById: String(a.createdById),
      createdAt: a.createdAt
        ? new Date(a.createdAt).toISOString()
        : new Date().toISOString(),
      startDate: a.startDate ?? undefined,
      endDate: a.endDate ?? undefined,
      votes: a.votes,
      background: a.background ?? undefined,
      objectives: a.objectives ?? undefined,
      needsFunding: a.needsFunding ?? undefined,
      isPic: a.isPic ?? undefined,
      skills: a.skills ?? [],
      manifestasiPoin: row.manifestasiPoin ?? undefined,
      creator: row.creatorName
        ? {
            id: String(a.createdById),
            name: row.creatorName,
            sector: (row.creatorSector ?? "profesional") as
              | "pendidikan"
              | "ekonomi"
              | "profesional",
            role: row.creatorRole ?? "",
            organization: row.creatorOrganization ?? "-",
            skills: row.creatorSkills ?? [],
            avatarUrl: avatarUrlToSrc(row.creatorAvatarUrl),
            initials: row.creatorInitials ?? undefined,
            offering: row.creatorOffering ?? "",
          }
        : undefined,
    };
  });

  const actionIds = actionItems.map((item) => Number(item.id));
  const contributorRows =
    actionIds.length > 0
      ? await db
          .select({
            actionId: contributions.actionId,
            name: users.name,
          })
          .from(contributions)
          .innerJoin(users, eq(users.id, contributions.participantId))
          .where(inArray(contributions.actionId, actionIds))
      : [];
  const contributorsByAction = new Map<string, string[]>();
  for (const row of contributorRows) {
    const id = String(row.actionId);
    const list = contributorsByAction.get(id) ?? [];
    list.push(row.name);
    contributorsByAction.set(id, list);
  }
  const actionItemsWithContributors = actionItems.map((item) => ({
    ...item,
    contributorNames: contributorsByAction.get(item.id) ?? [],
  }));

  const session = await auth();
  let initialVotedIds: string[] = [];
  let myContributedIds: string[] = [];
  let currentUserId: string | undefined;
  if (session?.user?.id) {
    const userId = Number(session.user.id);
    if (!Number.isNaN(userId)) {
      currentUserId = String(userId);
      const userVotes = await db
        .select({ actionId: votes.actionId })
        .from(votes)
        .where(eq(votes.userId, userId));
      initialVotedIds = userVotes.map((v) => String(v.actionId));

      const contributedRows = await db
        .select({ actionId: contributions.actionId })
        .from(contributions)
        .where(eq(contributions.participantId, userId));
      myContributedIds = contributedRows.map((c) => String(c.actionId));
    }
  }

  return (
    <>
      <TopAppBar />
      <Sidebar />
      <main className="flex-grow py-stack-md pb-24 md:pb-6 md:pl-64">
        <div className="px-container-margin flex flex-col gap-stack-lg max-w-4xl mx-auto w-full md:max-w-6xl">
          <ActionBoard
            items={actionItemsWithContributors}
            initialVotedIds={initialVotedIds}
            currentUserId={currentUserId}
            myContributedIds={myContributedIds}
          />
        </div>
      </main>
      <BottomNavBar />
    </>
  );
}
