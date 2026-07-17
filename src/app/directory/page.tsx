import type { Metadata } from "next";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavBar } from "@/components/layout/BottomNavBar";
import { ParticipantDirectory } from "@/components/directory/ParticipantDirectory";
import { db } from "@/db";
import { users, connections } from "@/db/schema";
import { eq, and, or } from "drizzle-orm";
import { auth } from "@/auth/config";
import { avatarUrlToSrc } from "@/lib/avatar";

export const metadata: Metadata = {
  title: "Direktori Peserta - Simah | Aksi, Sinergi, Berdaya",
  description:
    "Cari dan terhubung dengan peserta FGD dari sektor Pendidikan, Ekonomi, dan Profesional - Aksi, Sinergi, Berdaya",
};

export const dynamic = "force-dynamic";

export default async function DirectoryPage() {
  const session = await auth();
  const currentUserId = session?.user?.id ? Number(session.user.id) : NaN;

  const allUsers = await db
    .select()
    .from(users)
    .where(eq(users.status, "active"));

  const participants = allUsers
    .filter((u) => !Number.isNaN(currentUserId) && u.id !== currentUserId)
    .map((u) => ({
      id: String(u.id),
      name: u.name,
      sector: (u.sector ?? "profesional") as
        | "pendidikan"
        | "ekonomi"
        | "profesional",
      role: u.role ?? "Peserta",
      organization: u.organization ?? "-",
      skills: u.skills ?? [],
      avatarUrl: avatarUrlToSrc(u.avatarUrl),
      initials: u.initials ?? undefined,
      offering: u.offering ?? "",
    }));

  let initialPendingIds: string[] = [];
  let initialIncomingRequests: { participantId: string; connectionId: number }[] = [];
  let initialConnectedIds: string[] = [];
  if (!Number.isNaN(currentUserId)) {
    const outgoing = await db
      .select({ requesteeId: connections.requesteeId })
      .from(connections)
      .where(
        and(
          eq(connections.requesterId, currentUserId),
          eq(connections.status, "pending")
        )
      );
    initialPendingIds = outgoing.map((c) => String(c.requesteeId));

    const incoming = await db
      .select({ id: connections.id, requesterId: connections.requesterId })
      .from(connections)
      .where(
        and(
          eq(connections.requesteeId, currentUserId),
          eq(connections.status, "pending")
        )
      );
    initialIncomingRequests = incoming.map((c) => ({
      participantId: String(c.requesterId),
      connectionId: c.id,
    }));

    const connected = await db
      .select({
        requesterId: connections.requesterId,
        requesteeId: connections.requesteeId,
      })
      .from(connections)
      .where(
        and(
          eq(connections.status, "accepted"),
          or(
            eq(connections.requesterId, currentUserId),
            eq(connections.requesteeId, currentUserId)
          )
        )
      );
    initialConnectedIds = connected.map((c) =>
      String(c.requesterId === currentUserId ? c.requesteeId : c.requesterId),
    );
  }

  return (
    <>
      <TopAppBar />
      <Sidebar />
      <main className="flex-grow py-stack-md pb-24 md:pb-6 md:pl-64">
        <div className="px-container-margin flex flex-col gap-stack-lg max-w-4xl mx-auto w-full md:max-w-6xl">
          <h1 className="font-headline-lg text-headline-lg text-on-surface">
            Direktori Peserta
          </h1>
          <ParticipantDirectory
            participants={participants}
            initialPendingIds={initialPendingIds}
            initialIncomingRequests={initialIncomingRequests}
            initialConnectedIds={initialConnectedIds}
          />
        </div>
      </main>
      <BottomNavBar />
    </>
  );
}
