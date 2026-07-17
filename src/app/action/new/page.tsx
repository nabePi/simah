import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNavBar } from "@/components/layout/BottomNavBar";
import { ActionItemForm } from "@/components/action/ActionItemForm";
import { fetchManifestasiOptions } from "@/lib/queries";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth/config";
import { avatarUrlToSrc } from "@/lib/avatar";

export const metadata: Metadata = {
  title: "Action Item Baru - Simah | Aksi, Sinergi, Berdaya",
  description: "Buat action / project baru lintas sektor Simah - Aksi, Sinergi, Berdaya",
};

export default async function NewActionPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = Number(session.user.id);

  const [user] = await db.select().from(users).where(eq(users.id, userId));

  const manifestasiOptions = await fetchManifestasiOptions();
  return (
    <>
      <ActionItemForm
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

