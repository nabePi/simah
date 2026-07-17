import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavBar } from "@/components/layout/BottomNavBar";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth/config";
import { avatarUrlToSrc } from "@/lib/avatar";

export const metadata: Metadata = {
  title: "Profil - Simah | Aksi, Sinergi, Berdaya",
  description:
    "Kelola informasi profil Anda agar mudah ditemukan dan terhubung dengan peserta lain di Direktori - Aksi, Sinergi, Berdaya",
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = Number(session.user.id);

  const [user] = await db.select().from(users).where(eq(users.id, userId));
  const initial = user ?? null;

  return (
    <>
      <TopAppBar />
      <Sidebar />
      <main className="flex-grow py-stack-md pb-24 md:pb-6 md:pl-64">
        <div className="px-container-margin flex flex-col gap-stack-lg max-w-4xl mx-auto w-full md:max-w-2xl">
          <div className="flex flex-col gap-2">
            <h1 className="font-headline-lg text-headline-lg text-on-surface">
              Profil
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Informasi ini akan tampil di Direktori Peserta agar kolaborasi dengan
              peserta lain lebih mudah.
            </p>
          </div>
          {initial && (
            <ProfileForm
              initialName={initial.name}
              initialWaNumber={initial.waNumber}
              initialSector={(initial.sector ?? "profesional") as
                | "pendidikan"
                | "pengusaha"
                | "profesional"}
              initialRole={initial.role ?? ""}
              initialOrganization={initial.organization ?? ""}
              initialSkills={initial.skills ?? []}
              initialOffering={initial.offering ?? ""}
              initialAvatarUrl={avatarUrlToSrc(initial.avatarUrl)}
            />
          )}
        </div>
      </main>
      <BottomNavBar />
    </>
  );
}
