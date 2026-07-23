"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { ParticipantPhotoModal } from "@/components/directory/ParticipantPhotoModal";
import type { Participant } from "@/components/directory/participants-data";
import { ActionItemCard } from "./ActionItemCard";
import type { ActionItem, ActionStatus } from "./action-items-data";
import { toggleVote as toggleVoteAction } from "@/actions/actions-item";

const statusOptions: { value: ActionStatus; label: string }[] = [
  { value: "todo", label: "Belum Dimulai" },
  { value: "in_progress", label: "Sedang Berjalan" },
  { value: "done", label: "Selesai" },
];

const statusLabel: Record<ActionStatus, string> = {
  todo: "Belum Dimulai",
  in_progress: "Sedang Berjalan",
  done: "Selesai",
};

const sectorLabel: Record<Participant["sector"], string> = {
  pendidikan: "Pendidikan",
  ekonomi: "Ekonomi",
  profesional: "Profesional",
};

type Scope = "all" | "created" | "contributed";

const scopeOptions: { value: Scope; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "created", label: "Dibuat oleh Saya" },
  { value: "contributed", label: "Kontribusi Saya" },
];

type SortOption = "created_desc" | "created_asc" | "votes_desc" | "votes_asc";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "votes_desc", label: "Vote Terbanyak" },
  { value: "votes_asc", label: "Vote Tersedikit" },
  { value: "created_desc", label: "Terbaru Diajukan" },
  { value: "created_asc", label: "Terlama Diajukan" },
];

type ActionBoardProps = {
  items: ActionItem[];
  initialVotedIds?: string[];
  currentUserId?: string;
  myContributedIds?: string[];
};

export function ActionBoard({
  items,
  initialVotedIds = [],
  currentUserId,
  myContributedIds = [],
}: ActionBoardProps) {
  const searchParams = useSearchParams();
  const initialScope: Scope =
    searchParams.get("scope") === "created" ||
    searchParams.get("scope") === "contributed"
      ? (searchParams.get("scope") as Scope)
      : "all";
  const [scope, setScope] = useState<Scope>(initialScope);
  const [status, setStatus] = useState<ActionStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("votes_desc");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [votedIds, setVotedIds] = useState<Set<string>>(
    () => new Set(initialVotedIds),
  );
  const [selectedCreator, setSelectedCreator] = useState<Participant | null>(
    null,
  );
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!sortMenuOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSortMenuOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [sortMenuOpen]);

  const filtered = useMemo(() => {
    let byScope = items;
    if (scope === "created" && currentUserId) {
      byScope = items.filter((item) => item.createdById === currentUserId);
    } else if (scope === "contributed") {
      const contributedIds = new Set(myContributedIds);
      byScope = items.filter((item) => contributedIds.has(item.id));
    }
    const byStatus = byScope.filter(
      (item) => status === "all" || item.status === status,
    );

    const q = query.trim().toLowerCase();
    const byQuery =
      q.length === 0
        ? byStatus
        : byStatus.filter((item) => {
            const creator = item.creator;
            const terms = [
              item.title,
              item.description,
              statusLabel[item.status],
              item.background,
              item.objectives,
              item.manifestasiPoin,
              item.startDate,
              item.endDate,
              creator?.name,
              creator?.role,
              creator?.organization,
              creator && sectorLabel[creator.sector],
              ...(item.skills ?? []),
              ...(item.contributorNames ?? []),
              item.needsFunding ? "Dana" : "Tanpa Dana",
              item.isPic ? "PIC" : "Butuh PIC",
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();
            return terms.includes(q);
          });

    const voteCount = (item: ActionItem) => item.votes;
    return [...byQuery].sort((a, b) => {
      switch (sort) {
        case "created_desc":
          return b.createdAt.localeCompare(a.createdAt);
        case "created_asc":
          return a.createdAt.localeCompare(b.createdAt);
        case "votes_desc":
          return voteCount(b) - voteCount(a);
        case "votes_asc":
          return voteCount(a) - voteCount(b);
      }
    });
  }, [
    items,
    status,
    sort,
    votedIds,
    scope,
    currentUserId,
    myContributedIds,
    query,
  ]);

  function toggleVote(id: string) {
    const actionId = Number(id);
    setVotedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    startTransition(async () => {
      await toggleVoteAction(actionId);
    });
  }

  return (
    <div className="flex flex-col gap-stack-md">
      <div className="flex justify-between items-center">
        <h1 className="font-headline-lg text-headline-lg text-on-surface">
          Action / Project
        </h1>
        <div className="flex items-center gap-2">
          <Link
            aria-label="Lihat draft saya"
            className="inline-flex items-center gap-1.5 px-3 h-10 rounded-full border border-outline-variant bg-surface text-on-surface-variant font-label-sm text-label-sm hover:bg-surface-container-low transition-colors"
            href="/action/drafts"
          >
            <Icon name="edit_note" className="text-[18px]" />
            <span>Draft</span>
          </Link>
          <Link
            aria-label="Tambah item aksi"
            className="bg-primary text-on-primary w-11 h-11 rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-transform duration-200"
            href="/action/new"
          >
            <Icon name="add" filled />
          </Link>
        </div>
      </div>

      <div className="glass-card rounded-xl p-3 flex items-center gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon name="search" className="text-on-surface-variant/70" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari judul, deskripsi, pembuat, kontributor, skill, manifestasi..."
            className="w-full pl-10 pr-4 py-3 bg-surface border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors placeholder:text-outline/50"
          />
        </div>
      </div>

      {currentUserId && (
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0 flex overflow-x-auto gap-2 pb-1 pr-4 no-scrollbar [mask-image:linear-gradient(to_right,black_90%,transparent)] [-webkit-mask-image:linear-gradient(to_right,black_90%,transparent)]">
            {scopeOptions.map((option) => {
              const active = scope === option.value;
              return (
                <button
                  key={option.value}
                  className={
                    active
                      ? "whitespace-nowrap px-4 py-2 h-10 rounded-full bg-secondary-container text-on-secondary-container font-label-md text-label-md transition-colors"
                      : "whitespace-nowrap px-4 py-2 h-10 rounded-full border border-outline-variant bg-surface text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-low transition-colors"
                  }
                  onClick={() => setScope(option.value)}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0 flex overflow-x-auto gap-2 pb-1 pr-4 no-scrollbar [mask-image:linear-gradient(to_right,black_90%,transparent)] [-webkit-mask-image:linear-gradient(to_right,black_90%,transparent)]">
          <button
            className={
              status === "all"
                ? "whitespace-nowrap px-4 py-2 h-10 rounded-full bg-primary-container text-on-primary-container font-label-md text-label-md transition-colors"
                : "whitespace-nowrap px-4 py-2 h-10 rounded-full border border-outline-variant bg-surface text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-low transition-colors"
            }
            onClick={() => setStatus("all")}
          >
            Semua
          </button>
          {statusOptions.map((option) => {
            const active = status === option.value;
            return (
              <button
                key={option.value}
                className={
                  active
                    ? "whitespace-nowrap px-4 py-2 h-10 rounded-full bg-primary-container text-on-primary-container font-label-md text-label-md transition-colors"
                    : "whitespace-nowrap px-4 py-2 h-10 rounded-full border border-outline-variant bg-surface text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-low transition-colors"
                }
                onClick={() => setStatus(option.value)}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="relative shrink-0">
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={sortMenuOpen}
            onClick={() => setSortMenuOpen((open) => !open)}
            className={`flex items-center gap-1.5 sm:gap-1 px-3 sm:pl-3 sm:pr-2 h-10 aspect-square sm:w-auto justify-center rounded-full border border-outline-variant bg-surface text-on-surface-variant font-label-sm text-label-sm transition-colors ${sortMenuOpen ? "bg-surface-container-low border-outline" : "hover:bg-surface-container-low"}`}
          >
            <Icon name="sort" className="text-[20px] sm:text-[18px]" />
            <span className="hidden sm:inline">Urutkan</span>
            <Icon
              name="expand_more"
              className={`hidden sm:block text-[16px] transition-transform ${sortMenuOpen ? "rotate-180" : ""}`}
            />
          </button>

          {sortMenuOpen && (
            <>
              <button
                type="button"
                aria-label="Tutup menu urutkan"
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setSortMenuOpen(false)}
              />
              <div
                role="listbox"
                className="absolute right-0 top-full mt-2 w-52 bg-surface rounded-lg shadow-lg border border-outline-variant/50 py-1 z-50"
              >
                {sortOptions.map((option) => {
                  const active = option.value === sort;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => {
                        setSort(option.value);
                        setSortMenuOpen(false);
                      }}
                      className={
                        active
                          ? "w-full flex items-center justify-between gap-2 px-3 py-2.5 font-label-md text-label-md bg-primary-container text-on-primary-container"
                          : "w-full flex items-center justify-between gap-2 px-3 py-2.5 font-label-md text-label-md text-on-surface hover:bg-surface-container-low transition-colors"
                      }
                    >
                      {option.label}
                      {active && <Icon name="check" className="text-[16px]" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {filtered.map((item) => (
            <ActionItemCard
              key={item.id}
              item={item}
              voted={votedIds.has(item.id)}
              onToggleVote={() => toggleVote(item.id)}
              onCreatorClick={(creator) => setSelectedCreator(creator)}
            />
          ))}
        </div>
      ) : (
        <p className="font-body-sm text-body-sm text-on-surface-variant text-center py-8">
          Belum ada item aksi untuk status ini.
        </p>
      )}

      {selectedCreator && (
        <ParticipantPhotoModal
          participant={selectedCreator}
          onClose={() => setSelectedCreator(null)}
        />
      )}
    </div>
  );
}
