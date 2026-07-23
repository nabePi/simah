import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
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
  title: "Edit Action - Simah | Aksi, Sinergi, Berdaya",
  description:
    "Edit action / project lintas sektor Simah - Aksi, Sinergi, Berdaya",
};

export const dynamic = "force-dynamic";

export default async function EditActionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const actionId = Number(id);

  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = Number(session.user.id);

  if (Number.isNaN(actionId)) redirect("/action");

  const [action] = await db
    .select()
    .from(actions)
    .where(eq(actions.id, actionId))
    .limit(1);

  if (!action) {
    notFound();
  }
  if (action.createdById !== userId || !action.isPublished) {
    redirect("/action");
  }

  const [user] = await db.select().from(users).where(eq(users.id, userId));
  const manifestasiOptions = await fetchManifestasiOptions();

  return (
    <>
      <ActionItemForm
        publishedActionId={action.id}
        initialValues={{
          title: action.title,
          background: action.background ?? "",
          objectives: action.objectives ?? "",
          beneficiary: action.beneficiary ?? "",
          interactingSectors: (action.interactingSectors ?? []) as (
            | "pendidikan"
            | "ekonomi"
            | "profesional"
          )[],
          description: action.description,
          status: action.status as "todo" | "in_progress" | "done",
          needsFunding: action.needsFunding ?? false,
          isPic: action.isPic ?? true,
          skills: action.skills ?? [],
          hasDeadline: Boolean(action.startDate || action.endDate),
          startDate: action.startDate ?? undefined,
          hasEndDate: Boolean(action.endDate),
          endDate: action.endDate ?? undefined,
          manifestasiId: action.manifestasiId ?? undefined,
          breakdownId: action.breakdownId ?? undefined,
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
