import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavBar } from "@/components/layout/BottomNavBar";
import { NotificationBoard } from "@/components/notifications/NotificationBoard";
import { fetchNotificationsForUser } from "@/lib/queries";
import { auth } from "@/auth/config";

export const metadata: Metadata = {
  title: "Notifikasi - Simah | Aksi, Sinergi, Berdaya",
  description:
    "Permintaan connect dan update terbaru seputar action item Anda di Simah - Aksi, Sinergi, Berdaya",
};

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = Number(session.user.id);
  const items = await fetchNotificationsForUser(userId);
  return (
    <>
      <TopAppBar />
      <Sidebar />
      <main className="flex-grow py-stack-md pb-24 md:pb-6 md:pl-64">
        <div className="px-container-margin flex flex-col gap-stack-lg max-w-4xl mx-auto w-full md:max-w-2xl">
          <NotificationBoard items={items} />
        </div>
      </main>
      <BottomNavBar />
    </>
  );
}
