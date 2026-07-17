"use client";

import { useMemo, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import type { NotificationItem } from "@/components/notifications/notifications-data";
import type { AdminUserRow, AdminActionRow } from "@/actions/admin";
import {
  importUsers,
  toggleBlockUser,
  deleteUser,
  updateActionStatus,
  togglePublishAction,
  deleteAction,
  broadcastNotification,
} from "@/actions/admin";
import { OverviewSection } from "./sections/OverviewSection";
import { UsersSection } from "./sections/UsersSection";
import { ActionsSection } from "./sections/ActionsSection";
import { NotificationsSection } from "./sections/NotificationsSection";
import { ImportPasswordSheet } from "./sections/ImportPasswordSheet";
import type { ImportedUser } from "@/actions/admin";

const tabKeys = ["overview", "users", "actions", "notifications"] as const;
type TabKey = (typeof tabKeys)[number];

type UserOption = { id: string; name: string };

type Props = {
  initialUsers: AdminUserRow[];
  initialActions: AdminActionRow[];
  initialNotifications: NotificationItem[];
  userOptions: UserOption[];
};

export function AdminDashboardClient({
  initialUsers,
  initialActions,
  initialNotifications,
  userOptions,
}: Props) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab: TabKey = tabKeys.includes(tabParam as TabKey)
    ? (tabParam as TabKey)
    : "overview";

  const [usersList, setUsersList] = useState<AdminUserRow[]>(initialUsers);
  const [actionsList, setActionsList] =
    useState<AdminActionRow[]>(initialActions);
  const [notificationsList, setNotificationsList] =
    useState<NotificationItem[]>(initialNotifications);
  const [importedPasswords, setImportedPasswords] = useState<ImportedUser[] | null>(null);
  const [pending, startTransition] = useTransition();

  const userById = useMemo(
    () => new Map(usersList.map((u) => [String(u.id), u])),
    [usersList]
  );

  function handleToggleBlock(id: number) {
    startTransition(async () => {
      const res = await toggleBlockUser(id);
      if (res?.error) alert(res.error);
    });
    setUsersList((prev) =>
      prev.map((u) =>
        u.id === id
          ? {
              ...u,
              status: u.status === "active" ? "blocked" : "active",
            }
          : u
      )
    );
  }

  function handleDeleteUser(id: number) {
    startTransition(async () => {
      const res = await deleteUser(id);
      if (res?.error) alert(res.error);
    });
    setUsersList((prev) => prev.filter((u) => u.id !== id));
  }

  async function handleImport(
    rows: { nama: string; wa: string; sektor: string }[]
  ) {
    const res = await importUsers(rows);
    if (res?.error) {
      alert(res.error);
      return;
    }
    if (res.users && res.users.length > 0) {
      const newRows: AdminUserRow[] = res.users.map((u) => {
        const sector = rows.find((r) => r.nama.trim() === u.name)?.sektor;
        return {
          id: u.id,
          name: u.name,
          waNumber: u.waNumber,
          sector: (sector as "pendidikan" | "ekonomi" | "profesional") ?? null,
          role: "Peserta",
          organization: "-",
          skills: [],
          avatarUrl: null,
          initials: u.name
            .split(" ")
            .map((p) => p[0])
            .slice(0, 2)
            .join("")
            .toUpperCase(),
          status: "active",
        };
      });
      setUsersList((prev) => [...prev, ...newRows]);
      setImportedPasswords(res.users);
    }
  }

  function handleChangeActionStatus(id: number, status: "todo" | "in_progress" | "done") {
    startTransition(async () => {
      const res = await updateActionStatus(id, status);
      if (res?.error) alert(res.error);
    });
    setActionsList((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
  }

  function handleTogglePublish(id: number) {
    setActionsList((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, isPublished: !a.isPublished } : a
      )
    );
    startTransition(async () => {
      const res = await togglePublishAction(id);
      if (res?.error) alert(res.error);
    });
  }

  function handleDeleteAction(id: number) {
    if (!confirm("Hapus action item ini?")) return;
    setActionsList((prev) => prev.filter((a) => a.id !== id));
    startTransition(async () => {
      const res = await deleteAction(id);
      if (res?.error) alert(res.error);
    });
  }

  async function handleSendNotification(notif: {
    title: string;
    body: string;
    variant: "alert" | "info";
    targetType: "all" | "sector" | "specific";
    sector?: string;
    userId?: number;
  }) {
    const res = await broadcastNotification(notif);
    if (res?.error) {
      alert(res.error);
      return false;
    }
    const preview: NotificationItem = {
      id: `an-${Date.now()}`,
      type: "broadcast",
      variant: notif.variant,
      title: notif.title,
      body: notif.body,
      createdAt: new Date().toISOString(),
    };
    setNotificationsList((prev) => [preview, ...prev]);
    alert(`Notifikasi terkirim ke ${res.count} user.`);
    return true;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="glass-card rounded-2xl p-4 sm:p-6 flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center">
          <Icon name="shield_person" filled className="text-[24px]" />
        </div>
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface">
            Admin Dashboard
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Kelola user, action, dan notifikasi Simah.
          </p>
        </div>
      </div>

      {activeTab === "overview" && (
        <OverviewSection users={usersList} actions={actionsList} />
      )}
      {activeTab === "users" && (
        <UsersSection
          users={usersList}
          onToggleBlock={handleToggleBlock}
          onDelete={handleDeleteUser}
          onImport={handleImport}
        />
      )}
      {activeTab === "actions" && (
        <ActionsSection
          actions={actionsList}
          users={usersList}
          onStatusChange={handleChangeActionStatus}
          onTogglePublish={handleTogglePublish}
          onDelete={handleDeleteAction}
        />
      )}
      {activeTab === "notifications" && (
        <NotificationsSection
          notifications={notificationsList}
          userOptions={userOptions}
          onSend={handleSendNotification}
        />
      )}

      {importedPasswords && (
        <ImportPasswordSheet
          users={importedPasswords}
          onClose={() => setImportedPasswords(null)}
        />
      )}
    </div>
  );
}
