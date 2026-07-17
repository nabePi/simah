import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { BackAppBar } from "@/components/layout/BackAppBar";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminBottomNavBar } from "@/components/layout/AdminBottomNavBar";
import { ActionDetail } from "@/components/action/ActionDetail";
import {
  fetchActionById,
  fetchContributionsForAction,
  fetchManifestasiDetail,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const item = await fetchActionById(Number(id));
  if (!item) {
    return { title: "Action tidak ditemukan - Simah Admin | Aksi, Sinergi, Berdaya" };
  }
  return {
    title: `${item.title} - Simah Admin | Aksi, Sinergi, Berdaya`,
    description: `${item.description} - Aksi, Sinergi, Berdaya`,
  };
}

export default async function AdminActionDetailPage({
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
    needsFunding: actionRow.needsFunding ?? undefined,
    isPic: actionRow.isPic ?? undefined,
    skills: actionRow.skills,
    manifestasiId: actionRow.manifestasiId ?? undefined,
    breakdownId: actionRow.breakdownId ?? undefined,
  };
  return (
    <>
      <TopAppBar hideNotifications />
      <div className="md:hidden">
        <BackAppBar title="Detail Action" />
      </div>
      <AdminSidebar />
      <main className="flex-1 md:pl-64 px-4 pb-24 md:pb-6">
        <ActionDetail
          item={item}
          embedded
          creatorOverride={creatorOverride}
          initialContributions={initialContributions}
          manifestasi={manifestasiDetail}
        />
      </main>
      <AdminBottomNavBar />
    </>
  );
}
