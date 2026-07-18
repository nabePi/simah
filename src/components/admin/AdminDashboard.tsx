import {
  fetchAdminUsers,
  fetchAdminActions,
} from "@/actions/admin";
import { db } from "@/db";
import { notifications, users } from "@/db/schema";
import { desc } from "drizzle-orm";
import { AdminDashboardClient } from "./AdminDashboardClient";

export async function AdminDashboard() {
  const [adminUsers, adminActions, recentRows, userRows] = await Promise.all([
    fetchAdminUsers(),
    fetchAdminActions(),
    db
      .select({
        id: notifications.id,
        type: notifications.type,
        variant: notifications.variant,
        title: notifications.title,
        body: notifications.body,
        createdAt: notifications.createdAt,
        read: notifications.read,
        actorId: notifications.actorId,
        broadcastId: notifications.broadcastId,
      })
      .from(notifications)
      .orderBy(desc(notifications.createdAt))
      .limit(200),
    db.select().from(users),
  ]);

  // Collapse broadcast notifications to one entry per broadcast_id (target
  // "all"/"sector" fan out to N per-user rows). Non-broadcast rows (NULL
  // broadcast_id) are kept individually.
  const seenBroadcasts = new Set<number>();
  const deduped: typeof recentRows = [];
  for (const row of recentRows) {
    if (row.broadcastId != null) {
      if (seenBroadcasts.has(row.broadcastId)) continue;
      seenBroadcasts.add(row.broadcastId);
    }
    deduped.push(row);
  }

  const notifRows = deduped.slice(0, 50).map((n) => ({
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
