import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavBar } from "@/components/layout/BottomNavBar";
import { ActionItemForm } from "@/components/action/ActionItemForm";
import { fetchManifestasiOptions } from "@/lib/queries";
import { db } from "@/db";
import { actions, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth/config";
import { avatarUrlToSrc } from "@/lib/avatar";

export const metadata: Metadata = {
  title: "Edit Action Item - Simah | Aksi, Sinergi, Berdaya",
  description: "Edit draft action / project lintas sektor Simah - Aksi, Sinergi, Berdaya",
};

export const dynamic = "force-dynamic";

export default async function EditDraftActionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const draftId = Number(id);

  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = Number(session.user.id);

  if (Number.isNaN(draftId)) redirect("/action/drafts");

  const [draft] = await db
    .select()
    .from(actions)
    .where(eq(actions.id, draftId))
    .limit(1);

  if (!draft || draft.createdById !== userId || draft.isPublished) {
    redirect("/action/drafts");
  }

  const [user] = await db.select().from(users).where(eq(users.id, userId));
  const manifestasiOptions = await fetchManifestasiOptions();

  return (
    <>
      <ActionItemForm
        draftId={draft.id}
        initialValues={{
          title: draft.title,
          background: draft.background ?? "",
          objectives: draft.objectives ?? "",
          beneficiary: draft.beneficiary ?? "",
          interactingSectors: (draft.interactingSectors ?? []) as (
            | "pendidikan"
            | "ekonomi"
            | "profesional"
          )[],
          description: draft.description,
          status: draft.status as "todo" | "in_progress" | "done",
          needsFunding: draft.needsFunding ?? false,
          isPic: draft.isPic ?? true,
          skills: draft.skills ?? [],
          hasDeadline: Boolean(draft.startDate || draft.endDate),
          startDate: draft.startDate ?? undefined,
          hasEndDate: Boolean(draft.endDate),
          endDate: draft.endDate ?? undefined,
          manifestasiId: draft.manifestasiId ?? undefined,
          breakdownId: draft.breakdownId ?? undefined,
        }}
        manifestasiOptions={manifestasiOptions}
        currentUser={
          user
            ? {
                name: user.name,
                avatarUrl: avatarUrlToSrc(user.avatarUrl),
              }
            : undefined
        }
      />
      <Sidebar />
      <BottomNavBar />
    </>
  );
}
