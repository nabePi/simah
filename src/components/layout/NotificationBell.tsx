"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { getUnreadNotificationCount } from "@/actions/notifications";

const POLL_INTERVAL_MS = 20_000;

type NotificationBellProps = {
  initialUnreadCount: number;
};

type NavigatorWithBadge = Navigator & {
  setAppBadge?: (count: number) => Promise<void>;
  clearAppBadge?: () => Promise<void>;
};

export function NotificationBell({ initialUnreadCount }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);

  useEffect(() => {
    async function refresh() {
      const count = await getUnreadNotificationCount();
      setUnreadCount(count);
    }

    const id = setInterval(refresh, POLL_INTERVAL_MS);

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") refresh();
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", refresh);

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  useEffect(() => {
    const nav = navigator as NavigatorWithBadge;
    if (!nav.setAppBadge || !nav.clearAppBadge) return;
    if (unreadCount > 0) {
      nav.setAppBadge(unreadCount).catch(() => {});
    } else {
      nav.clearAppBadge().catch(() => {});
    }
  }, [unreadCount]);

  return (
    <Link
      href="/notifications"
      aria-label="Notifikasi"
      className="flex items-center gap-2 hover:bg-surface-container-low dark:hover:bg-surface-container-high transition-colors active:scale-95 duration-200 rounded-full p-1 cursor-pointer relative"
    >
      <Icon
        name="notifications"
        className="text-on-surface-variant dark:text-outline-variant"
      />
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full border border-surface" />
      )}
    </Link>
  );
}
