"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { navItems } from "./nav-items";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-surface flex-col border-r border-outline-variant/30 py-stack-md z-40">
      <nav className="flex flex-col gap-2 px-4">
        {navItems.map((item) => {
          const active = pathname === item.href;
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
