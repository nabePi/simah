"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import type { NotificationItem } from "@/components/notifications/notifications-data";
import type { AdminUserRow, AdminActionRow } from "@/actions/admin";
import {
  importUsers,
  createUser,
  toggleBlockUser,
  deleteUser,
  resetUserPassword,
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
  const [resetPasswordUser, setResetPasswordUser] = useState<ImportedUser | null>(null);
  const [sendToast, setSendToast] = useState<number | null>(null);
  const [errorPopup, setErrorPopup] = useState<string | null>(null);
  const [importSummary, setImportSummary] = useState<{
    success: number;
    fail: number;
    passwords: ImportedUser[];
  } | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (sendToast === null) return;
    const timer = setTimeout(() => setSendToast(null), 2500);
    return () => clearTimeout(timer);
  }, [sendToast]);

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

  async function handleResetPassword(id: number) {
    const res = await resetUserPassword(id);
    if (res?.error) {
      alert(res.error);
      return;
    }
    if (res.user) {
      setResetPasswordUser(res.user);
    }
  }

  async function handleImport(
    rows: { nama: string; wa: string; sektor: string }[],
    totalCount: number
  ) {
    const res = await importUsers(rows);
    const successUsers = res.users ?? [];
    if (successUsers.length > 0) {
      const newRows: AdminUserRow[] = successUsers.map((u) => {
        const sector = rows.find((r) => r.nama.trim() === u.name)?.sektor;
        return buildAdminRow(u, sector);
      });
      setUsersList((prev) => [...prev, ...newRows]);
    }
    setImportSummary({
      success: successUsers.length,
      fail: totalCount - successUsers.length,
      passwords: successUsers,
    });
  }

  async function handleAddUser(input: {
    nama: string;
    wa: string;
    sektor: string;
  }) {
    const res = await createUser(input);
    if (res?.error) {
      setErrorPopup(res.error);
      return;
    }
    if (res.user) {
      const newUser = res.user;
      setUsersList((prev) => [...prev, buildAdminRow(newUser, input.sektor)]);
      setImportedPasswords([newUser]);
    }
  }

  function buildAdminRow(
    user: ImportedUser,
    sector: string | undefined
  ): AdminUserRow {
    return {
      id: user.id,
      name: user.name,
      waNumber: user.waNumber,
      sector: (sector as "pendidikan" | "ekonomi" | "profesional") ?? null,
      role: null,
      organization: "-",
      skills: [],
      avatarUrl: null,
      initials: user.name
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase(),
      status: "active",
    };
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
    setSendToast(res.count ?? null);
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
          onResetPassword={handleResetPassword}
          onImport={handleImport}
          onAddUser={handleAddUser}
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

      {resetPasswordUser && (
        <ImportPasswordSheet
          users={[resetPasswordUser]}
          onClose={() => setResetPasswordUser(null)}
          title="Password Direset"
          description={`Password ${resetPasswordUser.name} berhasil direset ke password default. User wajib mengganti password saat login berikutnya.`}
        />
      )}

      {sendToast !== null && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-on-background/60 p-6"
          role="status"
          aria-live="polite"
          onClick={() => setSendToast(null)}
        >
          <div
            className="bg-surface rounded-2xl p-6 max-w-sm w-full flex flex-col items-center gap-4 shadow-lg relative"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Tutup"
              onClick={() => setSendToast(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors"
            >
              <Icon name="close" />
            </button>

            <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center">
              <Icon name="check" className="text-[32px] text-primary" filled />
            </div>

            <div className="text-center flex flex-col items-center gap-1">
              <h3 className="font-headline-md text-headline-md text-on-surface">
                Notifikasi berhasil dikirim
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Pesan terkirim ke {sendToast} penerima.
              </p>
            </div>
          </div>
        </div>
      )}

      {errorPopup !== null && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-on-background/60 p-6"
          role="alertdialog"
          aria-live="assertive"
          onClick={() => setErrorPopup(null)}
        >
          <div
            className="bg-surface rounded-2xl p-6 max-w-sm w-full flex flex-col items-center gap-4 shadow-lg relative"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Tutup"
              onClick={() => setErrorPopup(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors"
            >
              <Icon name="close" />
            </button>

            <div className="w-16 h-16 rounded-full bg-error-container flex items-center justify-center">
              <Icon name="error" className="text-[32px] text-error" filled />
            </div>

            <div className="text-center flex flex-col items-center gap-1">
              <h3 className="font-headline-md text-headline-md text-on-surface">
                Gagal menyimpan user
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant whitespace-pre-line">
                {errorPopup}
              </p>
            </div>
          </div>
        </div>
      )}

      {importSummary && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-on-background/60 p-6"
          role="status"
          aria-live="polite"
          onClick={() => setImportSummary(null)}
        >
          <div
            className="bg-surface rounded-2xl p-6 max-w-sm w-full flex flex-col items-center gap-4 shadow-lg relative"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Tutup"
              onClick={() => setImportSummary(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors"
            >
              <Icon name="close" />
            </button>

            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                importSummary.fail > 0 ? "bg-error-container" : "bg-primary-container"
              }`}
            >
              <Icon
                name={importSummary.fail > 0 ? "error" : "check"}
                filled
                className={`text-[32px] ${
                  importSummary.fail > 0 ? "text-error" : "text-primary"
                }`}
              />
            </div>

            <div className="text-center flex flex-col items-center gap-1">
              <h3 className="font-headline-md text-headline-md text-on-surface">
                Import Selesai
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {importSummary.success} user berhasil diimport
                {importSummary.fail > 0
                  ? `, ${importSummary.fail} gagal (duplikat/error).`
                  : "."}
              </p>
            </div>

            {importSummary.passwords.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setImportedPasswords(importSummary.passwords);
                  setImportSummary(null);
                }}
                className="h-10 px-4 rounded-lg font-label-md text-label-md bg-primary text-on-primary hover:bg-primary/90 transition-colors"
              >
                Lihat Password
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
