import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { adminAuthFn } from "@/auth/admin-auth";
import { userAuthFn } from "@/auth/user-auth";
import { adminLogout, userLogout } from "@/actions/auth";
import { fetchUnreadNotificationCount } from "@/lib/queries";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { avatarUrlToSrc } from "@/lib/avatar";
import { UserMenu } from "./UserMenu";
import { NotificationBell } from "./NotificationBell";

type TopAppBarProps = {
  hideNotifications?: boolean;
  admin?: boolean;
};

export async function TopAppBar({
  hideNotifications = false,
  admin = false,
}: TopAppBarProps) {
  let unreadCount = 0;
  let currentUser: { name: string; avatarUrl?: string } | null = null;
  const logoutAction = admin ? adminLogout : userLogout;
  const session = admin ? await adminAuthFn() : await userAuthFn();
  const sessionName = session?.user?.name ?? null;
  const numericUserId = Number(session?.user?.id);
  // Admin sessions use a non-numeric id ("admin-<id>"); they aren't in the
  // users table, so we skip the DB lookup and render the menu from the session.
  const isAdminSession = session?.user?.role === "admin";
  if (isAdminSession && sessionName) {
    currentUser = { name: sessionName };
  } else if (!Number.isNaN(numericUserId) && sessionName) {
    if (!hideNotifications) {
      unreadCount = await fetchUnreadNotificationCount(numericUserId);
    }
    const [user] = await db
      .select({ avatarUrl: users.avatarUrl })
      .from(users)
      .where(eq(users.id, numericUserId))
      .limit(1);
    currentUser = {
      name: sessionName,
      avatarUrl: avatarUrlToSrc(user?.avatarUrl),
    };
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
      <div className="flex items-center gap-1">
        {!hideNotifications && (
          <NotificationBell initialUnreadCount={unreadCount} />
        )}
        {currentUser && (
          <UserMenu
            name={currentUser.name}
            avatarUrl={currentUser.avatarUrl}
            onLogout={logoutAction}
          />
        )}
      </div>
    </header>
  );
}
