import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import type { Participant, Sector } from "./participants-data";

const sectorLabel: Record<Sector, string> = {
  pendidikan: "Pendidikan",
  ekonomi: "Ekonomi",
  profesional: "Profesional",
};

const sectorAccentClass: Record<Sector, string> = {
  pendidikan: "bg-sector-pendidikan/5",
  ekonomi: "bg-sector-ekonomi/5",
  profesional: "bg-sector-profesional/5",
};

const sectorBadgeClass: Record<Sector, string> = {
  pendidikan:
    "bg-sector-pendidikan/10 text-sector-pendidikan border-sector-pendidikan/20",
  ekonomi:
    "bg-sector-ekonomi/10 text-sector-ekonomi border-sector-ekonomi/20",
  profesional:
    "bg-sector-profesional/10 text-sector-profesional border-sector-profesional/20",
};

const sectorButtonClass: Record<Sector, string> = {
  pendidikan: "bg-sector-pendidikan",
  ekonomi: "bg-sector-ekonomi",
  profesional: "bg-sector-profesional",
};

type ParticipantCardProps = {
  participant: Participant;
  pending?: boolean;
  canApprove?: boolean;
  connected?: boolean;
  onAvatarClick?: () => void;
  onConnect?: () => void;
  onApprove?: () => void;
};

export function ParticipantCard({
  participant,
  pending = false,
  canApprove = false,
  connected = false,
  onAvatarClick,
  onConnect,
  onApprove,
}: ParticipantCardProps) {
  return (
    <article className="bg-background-subtle rounded-xl border border-outline-variant/30 p-4 flex flex-col gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:shadow-md transition-shadow relative overflow-hidden">
      <div
        className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full -z-0 ${sectorAccentClass[participant.sector]}`}
      />
      <div className="flex items-start gap-4 relative z-10">
        <button
          type="button"
          aria-label={`Lihat foto ${participant.name}`}
          onClick={onAvatarClick}
          className="shrink-0 rounded-full active:scale-95 transition-transform"
        >
          {participant.avatarUrl ? (
            <Image
              alt={participant.name}
              src={participant.avatarUrl}
              width={48}
              height={48}
              unoptimized
              className="w-12 h-12 rounded-full object-cover border border-outline-variant/20 shadow-sm"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center text-primary font-headline-md border border-outline-variant/20 shadow-sm">
              {participant.initials}
            </div>
          )}
        </button>
        <div className="flex-1">
          <h3 className="font-headline-md text-headline-md text-on-surface leading-tight">
            {participant.name}
          </h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full font-caption text-caption font-bold border ${sectorBadgeClass[participant.sector]}`}
            >
              {sectorLabel[participant.sector]}
            </span>
            <span className="font-caption text-caption text-on-surface-variant">
              {participant.role}
            </span>
          </div>
          <p className="font-caption text-caption text-on-surface-variant/70 mt-0.5">
            {participant.organization}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-2">
        <div className="flex flex-col gap-1.5">
          <p className="font-label-md text-label-md text-on-surface flex items-center gap-1.5">
            <Icon name="workspace_premium" className="text-[16px] text-secondary" />
            Keahlian
          </p>
          <div className="flex flex-wrap gap-1.5">
            {participant.skills.map((skill) => (
              <span
                key={skill}
                className="px-2 py-1 rounded-md bg-surface-container-low text-on-surface-variant font-caption text-caption border border-outline-variant/20"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-surface-container-low p-3 rounded-lg border border-outline-variant/10">
          <p className="font-label-md text-label-md text-on-surface flex items-center gap-1.5 mb-1">
            <Icon
              name="volunteer_activism"
              className="text-[16px] text-primary"
            />
            Bisa membantu
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {participant.offering}
          </p>
        </div>
      </div>

      <div className="mt-auto pt-2 flex gap-2">
        {connected ? (
          <>
            <div className="flex-1 py-2 rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 bg-secondary/10 text-secondary border border-secondary/20">
              <Icon name="check_circle" filled className="text-[18px]" />
              Terhubung
            </div>
            {participant.whatsappUrl && (
              <a
                href={participant.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 bg-[#25D366]/10 text-[#128C7E] border border-[#25D366]/30 hover:bg-[#25D366]/20 transition-colors active:scale-95"
              >
                <Icon name="chat" filled className="text-[18px]" />
                WhatsApp
              </a>
            )}
          </>
        ) : (
          <button
            type="button"
            disabled={pending && !canApprove}
            className={`flex-1 py-2 rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 transition-all shadow-sm ${
              canApprove
                ? "bg-primary text-on-primary active:scale-95"
                : pending
                  ? "bg-surface-container-high text-on-surface-variant cursor-default"
                  : `text-on-primary active:scale-95 ${sectorButtonClass[participant.sector]}`
            }`}
            onClick={canApprove ? onApprove : onConnect}
          >
            <Icon
              name={canApprove ? "check" : pending ? "schedule" : "person_add"}
              className="text-[18px]"
              filled={pending && !canApprove}
            />
            {canApprove ? "Approve" : pending ? "Pending" : "Connect"}
          </button>
        )}
      </div>
    </article>
  );
}
