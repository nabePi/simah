"use client";

import { Fragment, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { BackAppBar } from "@/components/layout/BackAppBar";
import type { Participant } from "@/components/directory/participants-data";
import { ParticipantPhotoModal } from "@/components/directory/ParticipantPhotoModal";
import type { Contribution } from "./action-items-data";
import type { ActionItem } from "./action-items-data";
import { ContributeModal } from "./ContributeModal";
import { ManifestasiDetailModal } from "./ManifestasiDetailModal";

const statusLabel: Record<string, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

const statusBadgeClass: Record<string, string> = {
  todo: "bg-status-todo/15 text-status-todo",
  in_progress: "bg-status-progress/15 text-status-progress",
  done: "bg-status-done/15 text-status-done",
};

const sectorLabel: Record<string, string> = {
  pendidikan: "Pendidikan",
  ekonomi: "Ekonomi",
  profesional: "Profesional",
};

const sectorBadgeClass: Record<string, string> = {
  pendidikan:
    "bg-sector-pendidikan/10 text-sector-pendidikan border-sector-pendidikan/20",
  ekonomi:
    "bg-sector-ekonomi/10 text-sector-ekonomi border-sector-ekonomi/20",
  profesional:
    "bg-sector-profesional/10 text-sector-profesional border-sector-profesional/20",
};

const createdFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function formatCreatedAt(isoDate: string) {
  return createdFormatter.format(new Date(isoDate));
}

function getDurationNarrative(startDate?: string, endDate?: string) {
  if (!startDate && !endDate) return "Tanpa tenggat";
  if (startDate && !endDate) return `Mulai ${startDate} · berjalan selama mungkin`;
  if (!startDate && endDate) return `Sampai ${endDate}`;
  return `${startDate} — ${endDate}`;
}

function contributionBadge(type: string) {
  if (type === "funding")
    return { label: "Dana", icon: "payments" };
  if (type === "pic") return { label: "PIC", icon: "person" };
  return { label: type, icon: "bolt" };
}

export function ActionDetail({
  item,
  embedded = false,
  currentUserId,
  currentUserName,
  initialContributions = [],
  creatorOverride,
  manifestasi,
}: {
  item: ActionItem;
  embedded?: boolean;
  currentUserId?: string;
  currentUserName?: string;
  initialContributions?: Contribution[];
  creatorOverride?: {
    id: string;
    name: string;
    sector?: string;
    avatarUrl?: string;
    initials?: string;
    role?: string;
    organization?: string;
  };
  manifestasi?: {
    poin: string;
    label: string | null;
    keterangan: string;
    dalil: string;
    contoh: string;
  } | null;
}) {
  const router = useRouter();
  const [contributions, setContributions] =
    useState<Contribution[]>(initialContributions);
  const [showContribute, setShowContribute] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(
    null,
  );
  const [showManifestasiModal, setShowManifestasiModal] = useState(false);

  const creator = creatorOverride
    ? {
        ...creatorOverride,
        sector: (creatorOverride.sector ?? "pendidikan") as
          | "pendidikan"
          | "ekonomi"
          | "profesional",
        role: creatorOverride.role ?? "Peserta",
        organization: creatorOverride.organization ?? "-",
        offering: "",
        skills: [] as string[],
      }
    : undefined;

  function handleContribute(types: string[]) {
    if (currentUserId && currentUserName) {
      setContributions((current) => {
        const existingIndex = current.findIndex(
          (c) => c.participantId === currentUserId,
        );
        if (existingIndex >= 0) {
          const updated = { ...current[existingIndex], types };
          return [
            ...current.slice(0, existingIndex),
            updated,
            ...current.slice(existingIndex + 1),
          ];
        }
        return [
          ...current,
          {
            participantId: currentUserId,
            name: currentUserName,
            role: "Kontributor",
            types,
          },
        ];
      });
    } else {
      router.refresh();
    }
    setShowContribute(false);
  }

  const needsFunding = item.needsFunding ?? false;
  const isPic = item.isPic ?? true;
  const skills = item.skills ?? [];

  const Wrapper = embedded ? Fragment : "main";
  const wrapperProps = embedded
    ? {}
    : { className: "flex-grow py-stack-md pb-44 md:pb-6 md:pl-64" };

  return (
    <>
      {!embedded && <BackAppBar title="Action Detail" onBack={() => router.back()} />}
      <Wrapper {...wrapperProps}>
        <div className={`px-container-margin flex flex-col gap-stack-lg max-w-4xl mx-auto w-full md:max-w-2xl ${embedded ? "py-stack-md pb-6" : ""}`}>
          <section className="flex flex-col gap-3">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full font-label-sm text-label-sm self-start ${statusBadgeClass[item.status]}`}
            >
              {statusLabel[item.status]}
            </span>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">
              {item.title}
            </h1>
          </section>

          {manifestasi && (
            <section className="glass-card rounded-xl p-4 flex items-start justify-between gap-3 border-l-4 border-l-tertiary">
              <div className="flex flex-col gap-1">
                <span className="font-label-sm text-label-sm text-primary uppercase tracking-wide">
                  Manifestasi Iwa&apos;
                </span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">
                  {manifestasi.poin}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowManifestasiModal(true)}
                className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-tertiary-container text-on-tertiary-container font-label-sm text-label-sm hover:bg-tertiary-container/80 transition-colors"
              >
                <Icon name="open_in_new" className="text-[14px]" />
                Selengkapnya
              </button>
            </section>
          )}

          {creator && (
            <section className="flex items-center gap-3 pb-4 border-b border-outline-variant/30">
              <div className="w-12 h-12 rounded-full bg-surface-container-high border border-outline-variant overflow-hidden flex items-center justify-center shrink-0">
                {creator.avatarUrl ? (
                  <Image
                    alt={creator.name}
                    src={creator.avatarUrl}
                    width={48}
                    height={48}
                    unoptimized
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-label-md text-label-md text-on-surface-variant">
                    {creator.initials ?? creator.name.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-label-md text-label-md text-on-surface">
                  {creator.name}
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full font-label-sm text-label-sm ${sectorBadgeClass[creator.sector]}`}
                  >
                    {sectorLabel[creator.sector]}
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    {creator.role} · {creator.organization}
                  </span>
                </div>
              </div>
            </section>
          )}

          <section className="glass-card rounded-xl p-5 flex flex-col gap-stack-md">
            {item.background && (
              <div className="flex flex-col gap-1">
                <p className="font-label-md text-label-md text-on-surface-variant flex items-center gap-1">
                  <Icon name="description" className="text-[16px]" />
                  Latar Belakang
                </p>
                <p className="font-body-md text-body-md text-on-surface">
                  {item.background}
                </p>
              </div>
            )}
            {item.objectives && (
              <div className="flex flex-col gap-1">
                <p className="font-label-md text-label-md text-on-surface-variant flex items-center gap-1">
                  <Icon name="flag" className="text-[16px]" />
                  Tujuan / Output
                </p>
                <p className="font-body-md text-body-md text-on-surface">
                  {item.objectives}
                </p>
              </div>
            )}
            <div className="flex flex-col gap-1">
              <p className="font-label-md text-label-md text-on-surface-variant flex items-center gap-1">
                <Icon name="short_text" className="text-[16px]" />
                Deskripsi Singkat
              </p>
              <p className="font-body-md text-body-md text-on-surface">
                {item.description}
              </p>
            </div>
            <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm border-t border-outline-variant/20 pt-4">
              <Icon name="schedule" className="text-[16px]" />
              <span>{getDurationNarrative(item.startDate, item.endDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-on-surface-variant font-caption text-caption -mt-1">
              <Icon name="history" className="text-[14px]" />
              <span>Dibuat {formatCreatedAt(item.createdAt)}</span>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
              <Icon name="checklist" className="text-[20px] text-primary" />
              Kebutuhan
            </h2>
            <div className="glass-card rounded-xl p-5 flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                {needsFunding ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-tertiary-container text-on-tertiary-container font-label-md text-label-md">
                    <Icon name="payments" className="text-[16px]" />
                    Butuh Dana
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-md text-label-md">
                    <Icon name="check_circle" className="text-[16px]" filled />
                    Tanpa Kebutuhan Dana
                  </span>
                )}
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full font-label-md text-label-md ${
                    isPic
                      ? "bg-primary-container text-on-primary-container"
                      : "bg-error-container text-error"
                  }`}
                >
                  <Icon name={isPic ? "person" : "person_off"} className="text-[16px]" filled />
                  {isPic
                    ? creator
                      ? `PIC: ${creator.name}`
                      : "PIC tersedia"
                    : "PIC Kosong — Butuh PIC"}
                </span>
              </div>
              {skills.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="font-label-sm text-label-sm text-on-surface-variant">
                    Keahlian dibutuhkan
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm border border-outline-variant/50"
                      >
                        <Icon name="bolt" className="text-[12px]" />
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
              <Icon name="groups" className="text-[20px] text-primary" />
              Participants
            </h2>
            <div className="glass-card rounded-xl p-5 flex flex-col gap-3">
              {creator && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-label={`Lihat profil ${creator.name}`}
                    onClick={() => setSelectedParticipant(creator)}
                    className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant overflow-hidden flex items-center justify-center shrink-0 hover:ring-2 hover:ring-primary/40 transition-all"
                  >
                    {creator.avatarUrl ? (
                      <Image
                        alt={creator.name}
                        src={creator.avatarUrl}
                        width={40}
                        height={40}
                        unoptimized
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-label-sm text-label-sm text-on-surface-variant">
                        {creator.initials ?? creator.name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </button>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-label-md text-label-md text-on-surface">
                      {creator.name}
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full font-caption text-caption font-bold border ${sectorBadgeClass[creator.sector]}`}
                      >
                        {sectorLabel[creator.sector]}
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        · Pembuat
                      </span>
                    </div>
                  </div>
                </div>
              )}
              {contributions.length > 0 && (
                <div className="flex flex-col gap-3 border-t border-outline-variant/20 pt-3">
                  {contributions.map((contribution, index) => {
                    const contributorProfile: Participant | null =
                      contribution.sector
                        ? {
                            id: contribution.participantId,
                            name: contribution.name,
                            sector: contribution.sector,
                            role: contribution.role ?? "",
                            organization: contribution.organization ?? "-",
                            skills: [],
                            avatarUrl: contribution.avatarUrl,
                            initials: contribution.initials,
                            offering: "",
                          }
                        : null;
                    return (
                      <div key={`${contribution.participantId}-${index}`} className="flex items-start gap-3">
                        <button
                          type="button"
                          aria-label={`Lihat profil ${contribution.name}`}
                          onClick={() => {
                            if (contributorProfile) {
                              setSelectedParticipant(contributorProfile);
                            }
                          }}
                          disabled={!contributorProfile}
                          className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant overflow-hidden flex items-center justify-center shrink-0 hover:ring-2 hover:ring-primary/40 transition-all disabled:cursor-default disabled:hover:ring-0"
                        >
                          {contributorProfile?.avatarUrl ? (
                            <Image
                              alt={contribution.name}
                              src={contributorProfile.avatarUrl}
                              width={40}
                              height={40}
                              unoptimized
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="font-label-sm text-label-sm text-on-surface-variant">
                              {contribution.name.slice(0, 2).toUpperCase()}
                            </span>
                          )}
                        </button>
                        <div className="flex flex-col gap-1 flex-1">
                          <span className="font-label-md text-label-md text-on-surface">
                            {contribution.name}
                          </span>
                          {contributorProfile && (
                            <span
                              className={`inline-flex items-center self-start px-2 py-0.5 rounded-full font-caption text-caption font-bold border ${sectorBadgeClass[contributorProfile.sector]}`}
                            >
                              {sectorLabel[contributorProfile.sector]}
                            </span>
                          )}
                          <span className="font-body-sm text-body-sm text-on-surface-variant">
                            {contribution.role}
                            {contribution.organization ? ` · ${contribution.organization}` : ""}
                          </span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {contribution.types.map((type) => {
                              const badge = contributionBadge(type);
                              return (
                                <span
                                  key={type}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-label-sm"
                                >
                                  <Icon name={badge.icon} className="text-[12px]" />
                                  {badge.label}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {contributions.length === 0 && !creator && (
                <p className="font-body-sm text-body-sm text-on-surface-variant text-center py-4">
                  Belum ada participant.
                </p>
              )}
            </div>
          </section>
        </div>
      </Wrapper>

      {!embedded && (
        <div className="fixed bottom-[4rem] left-0 w-full p-3 bg-surface/95 backdrop-blur-md border-t border-outline-variant/20 z-40 md:bottom-6 md:left-auto md:right-6 md:w-auto md:p-0 md:bg-transparent md:border-0 md:backdrop-blur-none">
          <button
            type="button"
            className="relative w-full md:w-auto h-touch-target md:px-6 bg-primary text-on-primary font-label-md text-label-md rounded-xl md:rounded-full flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all shadow-md md:shadow-lg md:animate-pulse-ring md:hover:animate-none"
            onClick={() => setShowContribute(true)}
          >
            <span className="absolute inset-0 rounded-xl md:rounded-full bg-primary animate-ping-slow opacity-30 md:block hidden pointer-events-none" aria-hidden="true" />
            <Icon name="volunteer_activism" className="text-[20px] relative" filled />
            <span className="relative">Ikut Berkontribusi</span>
          </button>
        </div>
      )}

      {!embedded && showContribute && (
        <ContributeModal
          item={item}
          onClose={() => setShowContribute(false)}
          onSubmit={handleContribute}
        />
      )}

      {selectedParticipant && (
        <ParticipantPhotoModal
          participant={selectedParticipant}
          onClose={() => setSelectedParticipant(null)}
        />
      )}

      {showManifestasiModal && (
        <ManifestasiDetailModal
          manifestasiId={item.manifestasiId ?? null}
          breakdownId={item.breakdownId}
          onClose={() => setShowManifestasiModal(false)}
        />
      )}
    </>
  );
}
