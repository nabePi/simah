import type { Metadata } from "next";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavBar } from "@/components/layout/BottomNavBar";
import { DraftBoard } from "@/components/action/DraftBoard";
import { db } from "@/db";
import { actions } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@/auth/config";

export const metadata: Metadata = {
  title: "Draft Saya - Simah | Aksi, Sinergi, Berdaya",
  description: "Kelola draft action item Anda sebelum publish ke feed publik - Aksi, Sinergi, Berdaya",
};

export const dynamic = "force-dynamic";

export default async function DraftsPage() {
  const session = await auth();
  const userId = Number(session?.user?.id);
  let draftItems: {
    id: string;
    title: string;
    background: string;
    objectives: string;
    description: string;
    status: "todo" | "in_progress" | "done";
    needsFunding: boolean;
    isPic: boolean;
    skills: string[];
    hasDeadline: boolean;
    startDate?: string;
    hasEndDate?: boolean;
    endDate?: string;
    createdById: string;
    createdAt: string;
  }[] = [];
  if (!Number.isNaN(userId)) {
    const rows = await db
      .select()
      .from(actions)
      .where(
        and(eq(actions.createdById, userId), eq(actions.isPublished, false))
      )
      .orderBy(desc(actions.createdAt));
    draftItems = rows.map((a) => ({
      id: String(a.id),
      title: a.title,
      background: a.background ?? "",
      objectives: a.objectives ?? "",
      description: a.description,
      status: a.status as "todo" | "in_progress" | "done",
      needsFunding: a.needsFunding ?? false,
      isPic: a.isPic ?? true,
      skills: a.skills ?? [],
      hasDeadline: Boolean(a.startDate || a.endDate),
      startDate: a.startDate ?? undefined,
      hasEndDate: Boolean(a.endDate),
      endDate: a.endDate ?? undefined,
      createdById: String(a.createdById),
      createdAt: a.createdAt
        ? new Date(a.createdAt).toISOString()
        : new Date().toISOString(),
    }));
  }
  return (
    <>
      <TopAppBar />
      <Sidebar />
      <main className="flex-grow py-stack-md pb-24 md:pb-6 md:pl-64">
        <div className="px-container-margin flex flex-col gap-stack-lg max-w-4xl mx-auto w-full md:max-w-6xl">
          <DraftBoard items={draftItems} />
        </div>
      </main>
      <BottomNavBar />
    </>
  );
}
