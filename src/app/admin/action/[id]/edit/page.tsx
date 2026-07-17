import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { BackAppBar } from "@/components/layout/BackAppBar";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminBottomNavBar } from "@/components/layout/AdminBottomNavBar";
import { ActionEditForm } from "@/components/admin/sections/ActionEditForm";
import {
  fetchActionById,
  fetchParticipantsForAction,
  fetchManifestasiOptions,
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
    return { title: "Edit Action - Simah Admin | Aksi, Sinergi, Berdaya" };
  }
  return {
    title: `Edit ${item.title} - Simah Admin | Aksi, Sinergi, Berdaya`,
    description: `Edit detail action item ${item.title}. - Aksi, Sinergi, Berdaya`,
  };
}

export default async function AdminActionEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const actionRow = await fetchActionById(Number(id));
  if (!actionRow) {
    notFound();
  }
  const teamMembers = await fetchParticipantsForAction(Number(id));
  const manifestasiOptions = await fetchManifestasiOptions();
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
        <BackAppBar title="Edit Action" />
      </div>
      <AdminSidebar />
      <main className="flex-1 md:pl-64 px-4 pb-24 md:pb-6">
        <ActionEditForm
          item={item}
          participants={teamMembers}
          manifestasiOptions={manifestasiOptions}
        />
      </main>
      <AdminBottomNavBar />
    </>
  );
}
