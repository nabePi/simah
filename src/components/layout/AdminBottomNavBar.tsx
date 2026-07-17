"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { adminNavItems } from "./admin-nav-items";

export function AdminBottomNavBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab = tabParam ?? "overview";

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-container-margin py-2 pb-safe bg-surface-container dark:bg-surface-container-highest rounded-t-xl shadow-sm border-t border-transparent">
      {adminNavItems.map((item) => {
        const [, query] = item.href.split("?tab=");
        const active =
          pathname === "/admin/dashboard" && (query ?? "overview") === activeTab;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={
              active
                ? "flex flex-col items-center justify-center bg-primary-container dark:bg-on-primary-fixed-variant text-on-primary-container dark:text-primary-fixed rounded-full px-4 py-1 hover:bg-surface-variant dark:hover:bg-inverse-surface transition-colors active:scale-90 duration-150 group"
                : "flex flex-col items-center justify-center text-on-surface-variant dark:text-outline-variant px-4 py-1 hover:bg-surface-variant dark:hover:bg-inverse-surface transition-colors active:scale-90 duration-150 group"
            }
          >
            <Icon
              name={item.icon}
              filled={active}
              className={
                active
                  ? "mb-1"
                  : "mb-1 group-hover:text-primary transition-colors"
              }
            />
            <span
              className={
                active
                  ? "font-label-sm text-label-sm"
                  : "font-label-sm text-label-sm group-hover:text-primary transition-colors"
              }
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
