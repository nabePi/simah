import { Suspense } from "react";
import {
  fetchAdminUsers,
  fetchAdminActions,
  type AdminUserRow,
  type AdminActionRow,
} from "@/actions/admin";
import { db } from "@/db";
import { notifications, users } from "@/db/schema";
import { desc } from "drizzle-orm";
import { AdminDashboardClient } from "./AdminDashboardClient";

export async function AdminDashboard() {
  const [adminUsers, adminActions, adminNotifs, userRows] = await Promise.all([
    fetchAdminUsers(),
    fetchAdminActions(),
    db
      .select()
      .from(notifications)
      .orderBy(desc(notifications.createdAt))
      .limit(50),
    db.select().from(users),
  ]);

  const notifRows = adminNotifs.map((n) => ({
    id: String(n.id),
    type: n.type,
    title: n.title,
    body: n.body,
    createdAt: n.createdAt.toISOString(),
    read: n.read,
    actorId: n.actorId ? String(n.actorId) : undefined,
    variant: n.variant ?? undefined,
  }));

  const userOptions = userRows.map((u) => ({
    id: String(u.id),
    name: u.name,
  }));

  return (
    <AdminDashboardClient
      initialUsers={adminUsers}
      initialActions={adminActions}
      initialNotifications={notifRows}
      userOptions={userOptions}
    />
  );
}
