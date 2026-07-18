import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { type Participant, type Sector } from "@/components/directory/participants-data";
import type { ActionItem, ActionStatus } from "./action-items-data";

const statusLabel: Record<ActionStatus, string> = {
  todo: "Belum Dimulai",
  in_progress: "Sedang Berjalan",
  done: "Selesai",
};

const statusBadgeClass: Record<ActionStatus, string> = {
  todo: "bg-status-todo/20 text-status-todo",
  in_progress: "bg-status-progress/20 text-status-progress",
  done: "bg-status-done/20 text-status-done",
};

const sectorLabel: Record<Sector, string> = {
  pendidikan: "Pendidikan",
  ekonomi: "Ekonomi",
  profesional: "Profesional",
};

const sectorBadgeClass: Record<Sector, string> = {
  pendidikan:
    "bg-sector-pendidikan/10 text-sector-pendidikan border-sector-pendidikan/20",
  ekonomi:
    "bg-sector-ekonomi/10 text-sector-ekonomi border-sector-ekonomi/20",
  profesional:
    "bg-sector-profesional/10 text-sector-profesional border-sector-profesional/20",
};

function getDurationNarrative(startDate?: string, endDate?: string) {
  if (startDate && endDate) return `Berlangsung ${startDate} – ${endDate}`;
  if (startDate) return `Dimulai ${startDate}`;
  if (endDate) return `Ditargetkan selesai ${endDate}`;
  return "Linimasa belum ditentukan";
}

function formatCreatedAt(isoDate: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(isoDate));
}

type ActionItemCardProps = {
  item: ActionItem;
  voted: boolean;
  onToggleVote: () => void;
  onCreatorClick: (creator: Participant) => void;
};

export function ActionItemCard({
  item,
  voted,
  onToggleVote,
  onCreatorClick,
}: ActionItemCardProps) {
  const voteCount = item.votes;
  const creator = item.creator;

  return (
    <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant flex flex-col gap-4 relative">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`px-2 py-1 font-label-sm text-label-sm rounded-full ${statusBadgeClass[item.status]}`}
            >
              {statusLabel[item.status].toUpperCase()}
            </span>
          </div>
          <h3 className="font-headline-md text-headline-md text-on-surface line-clamp-2">
            {item.title}
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            {item.description}
          </p>
          {item.manifestasiPoin && (
            <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full bg-tertiary-container text-on-tertiary-container max-w-full">
              <Icon name="link" className="text-[14px] shrink-0" />
              <span className="font-label-sm text-label-sm line-clamp-1">
                {item.manifestasiPoin}
              </span>
            </div>
          )}
        </div>
        <button
          aria-label={voted ? "Batalkan dukungan" : "Dukung gagasan ini"}
          className={
            voted
              ? "flex flex-col items-center justify-center p-2 rounded-lg bg-primary-container text-on-primary-container transition-colors"
              : "flex flex-col items-center justify-center p-2 rounded-lg bg-surface-container hover:bg-primary-container hover:text-on-primary-container transition-colors group"
          }
          type="button"
          onClick={onToggleVote}
        >
          <Icon
            name="thumb_up"
            filled={voted}
            className={
              voted
                ? ""
                : "text-outline group-hover:text-on-primary-container transition-colors"
            }
          />
          <span
            className={`font-label-md text-label-md mt-1 ${
              voted
                ? ""
                : "text-outline group-hover:text-on-primary-container transition-colors"
            }`}
          >
            {voteCount}
          </span>
        </button>
      </div>

      <button
        type="button"
        disabled={!creator}
        aria-label={creator ? `Lihat profil ${creator.name}` : undefined}
        onClick={(event) => {
          event.stopPropagation();
          if (creator) onCreatorClick(creator);
        }}
        className="flex items-center gap-3 text-left -mx-1 p-1 rounded-lg hover:bg-surface-container-low transition-colors disabled:hover:bg-transparent"
      >
        {creator?.avatarUrl ? (
          <Image
            alt={creator.name}
            src={creator.avatarUrl}
            width={40}
            height={40}
            unoptimized
            className="w-10 h-10 rounded-full object-cover border border-outline-variant"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center text-primary font-label-md border border-outline-variant">
            {creator?.initials ?? "?"}
          </div>
        )}
        <div className="flex flex-col gap-0.5">
          <span className="font-label-md text-label-md text-on-surface">
            Dibuat oleh {creator?.name ?? "Tidak diketahui"}
          </span>
          {creator && (
            <span
              className={`inline-flex items-center w-fit px-2 py-0.5 rounded-full font-caption text-caption font-bold border ${sectorBadgeClass[creator.sector]}`}
            >
              {sectorLabel[creator.sector]}
            </span>
          )}
        </div>
      </button>

      <div className="flex flex-col gap-1.5 pt-2 border-t border-surface-container-high">
        <div className="flex items-center gap-2 text-on-surface-variant">
          <Icon name="date_range" className="text-[16px]" />
          <span className="font-body-sm text-body-sm">
            {getDurationNarrative(item.startDate, item.endDate)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-on-surface-variant/70">
          <Icon name="schedule" className="text-[16px]" />
          <span className="font-caption text-caption">
            Diajukan {formatCreatedAt(item.createdAt)}
          </span>
        </div>
      </div>

      <Link
        href={`/action/${item.id}`}
        className="inline-flex items-center justify-center gap-1.5 h-10 px-3 rounded-lg text-primary font-label-md text-label-md hover:bg-primary/10 transition-colors self-start"
      >
        Lihat Detail
        <Icon name="arrow_forward" className="text-[16px]" />
      </Link>
    </div>
  );
}
