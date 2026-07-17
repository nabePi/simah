"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { logout } from "@/actions/auth";

type UserMenuProps = {
  name: string;
  avatarUrl?: string;
};

export function UserMenu({ name, avatarUrl }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Menu pengguna"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center rounded-full p-1 hover:bg-surface-container-low dark:hover:bg-surface-container-high transition-colors active:scale-95 duration-200 cursor-pointer"
      >
        <Avatar name={name} src={avatarUrl} className="ring-1 ring-primary" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-surface-container rounded-xl shadow-md border border-outline-variant/20 py-1 z-50">
          <button
            type="button"
            onClick={() => logout()}
            className="flex items-center gap-3 px-4 py-2.5 w-full text-left text-error hover:bg-surface-container-high transition-colors font-body-md text-body-md"
          >
            <Icon name="logout" className="text-[20px]" />
            Keluar
          </button>
        </div>
      )}
    </div>
  );
}
