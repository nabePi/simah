"use server";

import { auth } from "@/auth/config";
import { fetchUnreadNotificationCount } from "@/lib/queries";

export async function getUnreadNotificationCount(): Promise<number> {
  const session = await auth();
  const userId = session?.user?.id ? Number(session.user.id) : NaN;
  if (Number.isNaN(userId)) return 0;
  return fetchUnreadNotificationCount(userId);
}
