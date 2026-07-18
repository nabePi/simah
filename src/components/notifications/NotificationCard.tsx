"use client";

import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import type { Participant } from "@/components/directory/participants-data";
import { formatNotificationDate } from "./notifications-data";
import type { NotificationItem } from "./notifications-data";

type NotificationCardProps = {
  item: NotificationItem;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onActorClick?: (participant: Participant) => void;
  onOpen?: (item: NotificationItem) => void;
};

export function NotificationCard({
  item,
  onApprove,
  onReject,
  onActorClick,
  onOpen,
}: NotificationCardProps) {
  const actor: Participant | undefined = item.actorId
    ? item.actorName
      ? {
          id: item.actorId,
          name: item.actorName,
          sector: item.actorSector ?? "profesional",
          role: item.actorRole ?? "",
          organization: item.actorOrganization ?? "-",
          skills: item.actorSkills ?? [],
          offering: item.actorOffering ?? "",
          avatarUrl: item.actorAvatarUrl,
          initials: item.actorInitials,
        }
      : undefined
    : undefined;

  const isBroadcast = item.type === "broadcast";
  const isAlert = isBroadcast && item.variant === "alert";
  const iconName = isBroadcast
    ? "campaign"
    : item.type === "text"
      ? "info"
      : "notifications";
  const isUnread = !item.read;
  const isOpenable = (item.type === "text" || item.type === "broadcast") && onOpen;

  return (
    <article
      className={`glass-card rounded-xl p-4 flex flex-col gap-3 relative transition-colors ${
        isAlert
          ? "before:absolute before:left-0 before:top-4 before:bottom-4 before:w-1 before:bg-error before:rounded-r-full"
          : ""
      } ${isUnread ? "bg-primary/5 border border-primary/20" : "opacity-70"}`}
    >
      <div
        className={`flex items-start gap-3 ${isOpenable ? "cursor-pointer" : ""}`}
        onClick={isOpenable ? () => onOpen!(item) : undefined}
      >
        {actor ? (
          <button
            type="button"
            aria-label={`Lihat profil ${actor.name}`}
            onClick={(event) => {
              event.stopPropagation();
              onActorClick?.(actor);
            }}
            className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant overflow-hidden flex items-center justify-center shrink-0 hover:ring-2 hover:ring-primary/40 transition-all"
          >
            {actor.avatarUrl ? (
              <Image
                alt={actor.name}
                src={actor.avatarUrl}
                width={40}
                height={40}
                unoptimized
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                {actor.initials ?? actor.name.slice(0, 2).toUpperCase()}
              </span>
            )}
          </button>
        ) : (
          <div
            className={
              isAlert
                ? "w-10 h-10 rounded-full bg-error-container text-on-error-container border border-error/20 overflow-hidden flex items-center justify-center shrink-0"
                : "w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant overflow-hidden flex items-center justify-center shrink-0"
            }
          >
            <Icon name={iconName} filled className="text-[20px] text-primary" />
          </div>
        )}

        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span
              className={`font-label-md text-label-md text-on-surface flex items-center gap-1.5 ${
                isUnread ? "font-bold" : ""
              }`}
            >
              {isUnread && (
                <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
              )}
              {item.title}
            </span>
            <span className="font-caption text-caption text-on-surface-variant/70 shrink-0">
              {formatNotificationDate(item.createdAt)}
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {item.body}
          </p>
        </div>
      </div>

      {item.type === "connect_request" && onApprove && onReject && (
        <div className="flex gap-2 pl-13">
          <button
            type="button"
            className="flex-1 h-10 bg-primary text-on-primary font-label-md text-label-md rounded-lg flex items-center justify-center gap-1.5 hover:bg-primary/90 active:scale-[0.98] transition-all"
            onClick={() => onApprove(item.id)}
          >
            <Icon name="check" className="text-[18px]" />
            Approve
          </button>
          <button
            type="button"
            className="flex-1 h-10 rounded-lg border border-error/30 bg-error/5 text-error font-label-md text-label-md flex items-center justify-center gap-1.5 hover:bg-error/10 transition-colors"
            onClick={() => onReject(item.id)}
          >
            <Icon name="close" className="text-[18px]" />
            Reject
          </button>
        </div>
      )}
    </article>
  );
}
