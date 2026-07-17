import { redirect } from "next/navigation";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { BottomNavBar } from "@/components/layout/BottomNavBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { HomeBoard } from "@/components/beranda/HomeBoard";
import { ProfileCompletenessBanner } from "@/components/profile/ProfileCompletenessBanner";
import { InstallPromptBanner } from "@/components/home/InstallPromptBanner";
import { fetchHomeData } from "@/lib/queries";
import { auth } from "@/auth/config";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Simah | Aksi, Sinergi, Berdaya",
  description:
    "Simah - Aksi, Sinergi, Berdaya. Minal Aqwal Ilal Af'al - Dari Narasi menuju Aksi",
};

export const dynamic = "force-dynamic";

export default async function BerandaPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = Number(session.user.id);

  const [user] = await db
    .select({
      name: users.name,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const data = await fetchHomeData(userId);

  return (
    <>
      <TopAppBar />
      <Sidebar />
      <main className="flex-grow py-stack-md pb-24 md:pb-6 md:pl-64">
        <div className="px-container-margin flex flex-col gap-stack-lg max-w-4xl mx-auto w-full md:max-w-6xl">
          <ProfileCompletenessBanner />
          <InstallPromptBanner />
          <HomeBoard
            name={user?.name ?? "Pengguna"}
            data={data}
          />
        </div>
      </main>
      <BottomNavBar />
    </>
  );
}
