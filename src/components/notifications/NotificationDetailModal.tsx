"use client";

import { useEffect } from "react";
import { Icon } from "@/components/ui/Icon";
import { formatNotificationDate } from "./notifications-data";
import type { NotificationItem } from "./notifications-data";

type NotificationDetailModalProps = {
  item: NotificationItem;
  onClose: () => void;
};

export function NotificationDetailModal({
  item,
  onClose,
}: NotificationDetailModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const isAlert = item.variant === "alert";
  const iconName = item.type === "broadcast" ? "campaign" : "info";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-on-background/60 p-6"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-2xl p-6 max-w-sm w-full flex flex-col gap-4 shadow-lg relative"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Tutup"
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors"
        >
          <Icon name="close" />
        </button>

        <div
          className={
            isAlert
              ? "w-12 h-12 rounded-full bg-error-container text-on-error-container flex items-center justify-center"
              : "w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center"
          }
        >
          <Icon name={iconName} filled className="text-[22px]" />
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="font-headline-md text-headline-md text-on-surface">
            {item.title}
          </h3>
          <span className="font-caption text-caption text-on-surface-variant/70">
            {formatNotificationDate(item.createdAt)}
          </span>
        </div>

        <p className="font-body-sm text-body-sm text-on-surface-variant">
          {item.body}
        </p>
      </div>
    </div>
  );
}
