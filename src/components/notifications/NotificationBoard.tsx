"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/ui/Icon";
import { ParticipantPhotoModal } from "@/components/directory/ParticipantPhotoModal";
import type { Participant } from "@/components/directory/participants-data";
import { NotificationCard } from "./NotificationCard";
import { NotificationDetailModal } from "./NotificationDetailModal";
import type { NotificationItem } from "./notifications-data";
import {
  approveConnection,
  rejectConnection,
  markNotificationRead,
} from "@/actions/connections";

export function NotificationBoard({ items }: { items: NotificationItem[] }) {
  const [list, setList] = useState<NotificationItem[]>(items);
  const [selectedParticipant, setSelectedParticipant] =
    useState<Participant | null>(null);
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationItem | null>(null);
  const [, startTransition] = useTransition();

  function handleOpenNotification(item: NotificationItem) {
    setSelectedNotification(item);
    if (item.read) return;
    setList((current) =>
      current.map((entry) =>
        entry.id === item.id ? { ...entry, read: true } : entry,
      ),
    );
    startTransition(async () => {
      await markNotificationRead(Number(item.id));
    });
  }

  function handleApprove(id: string) {
    const target = list.find((item) => item.id === id);
    if (!target || !target.connectionId) return;
    setList((current) => current.filter((item) => item.id !== id));
    startTransition(async () => {
      const res = await approveConnection(target.connectionId!);
      if (res?.error) alert(res.error);
    });
  }

  function handleReject(id: string) {
    const target = list.find((item) => item.id === id);
    if (!target || !target.connectionId) return;
    setList((current) => current.filter((item) => item.id !== id));
    startTransition(async () => {
      const res = await rejectConnection(target.connectionId!);
      if (res?.error) alert(res.error);
    });
  }

  return (
    <div className="flex flex-col gap-stack-md">
      <div className="flex items-center gap-2">
        <Icon name="notifications" className="text-[24px] text-primary" filled />
        <h1 className="font-headline-lg text-headline-lg text-on-surface">
          Notifikasi
        </h1>
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant">
        Permintaan connect dan update terbaru seputar action item Anda.
      </p>

      {list.length > 0 ? (
        <div className="flex flex-col gap-3">
          {list.map((item) => (
            <NotificationCard
              key={item.id}
              item={item}
              onApprove={handleApprove}
              onReject={handleReject}
              onActorClick={setSelectedParticipant}
              onOpen={handleOpenNotification}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center border border-dashed border-outline-variant/50 rounded-2xl">
          <Icon
            name="notifications_off"
            className="text-[48px] text-on-surface-variant/60"
          />
          <p className="font-body-md text-body-md text-on-surface-variant">
            Belum ada notifikasi.
          </p>
        </div>
      )}

      {selectedParticipant && (
        <ParticipantPhotoModal
          participant={selectedParticipant}
          onClose={() => setSelectedParticipant(null)}
        />
      )}

      {selectedNotification && (
        <NotificationDetailModal
          item={selectedNotification}
          onClose={() => setSelectedNotification(null)}
        />
      )}
    </div>
  );
}
