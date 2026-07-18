import type { Metadata } from "next";
import { Suspense } from "react";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminBottomNavBar } from "@/components/layout/AdminBottomNavBar";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { Icon } from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "Admin Dashboard - Simah | Aksi, Sinergi, Berdaya",
  description:
    "Panel admin Simah untuk mengelola pengguna, action item, dan notifikasi - Aksi, Sinergi, Berdaya",
};

export const dynamic = "force-dynamic";

export default function AdminDashboardPage() {
  return (
    <>
      <TopAppBar hideNotifications admin />
      <Suspense fallback={null}>
        <AdminSidebar />
      </Suspense>
      <main className="flex-1 md:pl-64 px-4 py-6 pb-24 md:pb-6 max-w-6xl mx-auto w-full">
        <Suspense
          fallback={
            <div className="glass-card rounded-2xl p-8 flex items-center justify-center gap-2 text-on-surface-variant">
              <Icon
                name="progress_activity"
                className="text-[20px] animate-spin"
              />
              <span className="font-body-md text-body-md">Memuat...</span>
            </div>
          }
        >
          <AdminDashboard />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <AdminBottomNavBar />
      </Suspense>
    </>
  );
}
