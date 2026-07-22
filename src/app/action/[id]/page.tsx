import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavBar } from "@/components/layout/BottomNavBar";
import { ActionDetail } from "@/components/action/ActionDetail";
import {
  fetchActionById,
  fetchContributionsForAction,
  fetchManifestasiDetail,
} from "@/lib/queries";
import { auth } from "@/auth/config";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const item = await fetchActionById(Number(id));
  if (!item) {
    return { title: "Action tidak ditemukan - Simah | Aksi, Sinergi, Berdaya" };
  }
  return {
    title: `${item.title} - Simah | Aksi, Sinergi, Berdaya`,
    description: `${item.description} - Aksi, Sinergi, Berdaya`,
  };
}

export default async function ActionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const actionRow = await fetchActionById(Number(id));
  if (!actionRow) {
    notFound();
  }
  const manifestasiDetail = actionRow.manifestasiId
    ? await fetchManifestasiDetail(actionRow.manifestasiId, actionRow.breakdownId)
    : null;

  const contributionRows = await fetchContributionsForAction(Number(id));
  const initialContributions = contributionRows.map((c) => ({
    participantId: String(c.participantId),
    name: c.name,
    role: c.role ?? "Kontributor",
    types: c.types,
    sector: (c.sector ?? undefined) as
      | "pendidikan"
      | "ekonomi"
      | "profesional"
      | undefined,
    avatarUrl: c.avatarUrl ?? undefined,
    initials: c.initials ?? undefined,
    organization: c.organization ?? undefined,
    skills: c.skills ?? undefined,
    offering: c.offering ?? undefined,
  }));
  const creator = actionRow.creator;
  const creatorOverride = creator
    ? {
        id: String(creator.id),
        name: creator.name,
        sector: (creator.sector ?? undefined) as
          | "pendidikan"
          | "ekonomi"
          | "profesional"
          | undefined,
        avatarUrl: creator.avatarUrl ?? undefined,
        initials: creator.initials ?? undefined,
        role: creator.role ?? undefined,
        organization: creator.organization ?? undefined,
        skills: creator.skills ?? undefined,
        offering: creator.offering ?? undefined,
      }
    : undefined;
  const item = {
    id: String(actionRow.id),
    title: actionRow.title,
    description: actionRow.description,
    status: actionRow.status as "todo" | "in_progress" | "done",
    createdById: String(actionRow.createdById),
    createdAt: actionRow.createdAt,
    startDate: actionRow.startDate ?? undefined,
    endDate: actionRow.endDate ?? undefined,
    votes: actionRow.votes,
    background: actionRow.background ?? undefined,
    objectives: actionRow.objectives ?? undefined,
    beneficiary: actionRow.beneficiary ?? undefined,
    interactingSectors: actionRow.interactingSectors ?? undefined,
    needsFunding: actionRow.needsFunding ?? undefined,
    isPic: actionRow.isPic ?? undefined,
    skills: actionRow.skills,
    manifestasiId: actionRow.manifestasiId ?? undefined,
    breakdownId: actionRow.breakdownId ?? undefined,
  };

  const session = await auth();
  const currentUserId = session?.user?.id;
  const currentUserName = session?.user?.name ?? undefined;

  return (
    <>
      <Sidebar />
      <ActionDetail
        item={item}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        initialContributions={initialContributions}
        creatorOverride={creatorOverride}
        manifestasi={manifestasiDetail}
      />
      <BottomNavBar />
    </>
  );
}
