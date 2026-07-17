"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { adminNavItems } from "./admin-nav-items";

export function AdminSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab = tabParam ?? "overview";

  return (
    <aside className="hidden md:flex fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-surface flex-col border-r border-outline-variant/30 py-stack-md z-40">
      <div className="px-4 mb-2 flex items-center gap-2">
        <Icon name="shield_person" filled className="text-[20px] text-primary" />
        <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
          Panel Admin
        </span>
      </div>
      <nav className="flex flex-col gap-2 px-4">
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
                  ? "flex items-center gap-3 px-4 py-3 bg-primary-container text-on-primary-container rounded-lg font-label-md transition-colors"
                  : "flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-low rounded-lg font-label-md transition-colors"
              }
            >
              <Icon name={item.icon} filled={active} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
