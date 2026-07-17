import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { auth } from "@/auth/config";
import { fetchUnreadNotificationCount } from "@/lib/queries";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { avatarUrlToSrc } from "@/lib/avatar";
import { UserMenu } from "./UserMenu";
import { NotificationBell } from "./NotificationBell";

type TopAppBarProps = {
  hideNotifications?: boolean;
};

export async function TopAppBar({ hideNotifications = false }: TopAppBarProps) {
  let unreadCount = 0;
  let currentUser: { name: string; avatarUrl?: string } | null = null;
  if (!hideNotifications) {
    const session = await auth();
    const userId = session?.user?.id ? Number(session.user.id) : NaN;
    if (!Number.isNaN(userId)) {
      unreadCount = await fetchUnreadNotificationCount(userId);
      const [user] = await db
        .select({ name: users.name, avatarUrl: users.avatarUrl })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      if (user) {
        currentUser = { name: user.name, avatarUrl: avatarUrlToSrc(user.avatarUrl) };
      }
    }
  }

  return (
    <header className="w-full sticky top-0 z-50 bg-surface dark:bg-surface-dim flex justify-between items-center px-gutter h-16 border-b border-outline-variant/30">
      <Link
        href="/"
        className="flex items-center gap-2 hover:bg-surface-container-low dark:hover:bg-surface-container-high transition-colors active:scale-95 duration-200 rounded-full p-1 cursor-pointer"
      >
        <Icon name="hub" className="text-primary dark:text-primary-fixed-dim" />
        <div className="flex flex-col leading-none">
          <span className="font-headline-md text-headline-md text-primary dark:text-primary-fixed-dim font-bold tracking-tight leading-none">
            Simah
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant dark:text-outline-variant leading-none mt-1 italic">
            Aksi. Sinergi. Berdaya.
          </span>
        </div>
      </Link>
      {!hideNotifications && (
        <div className="flex items-center gap-1">
          <NotificationBell initialUnreadCount={unreadCount} />
          {currentUser && (
            <UserMenu name={currentUser.name} avatarUrl={currentUser.avatarUrl} />
          )}
        </div>
      )}
    </header>
  );
}
