"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import type { AdminActionRow, AdminUserRow } from "@/actions/admin";
import type { ActionStatus } from "@/components/action/action-items-data";
import {
  sectorLabel,
  sectorBadgeClass,
  statusLabel,
  statusBadgeClass,
} from "../badges";

type Props = {
  actions: AdminActionRow[];
  users: AdminUserRow[];
  onStatusChange: (id: number, status: ActionStatus) => void;
  onTogglePublish: (id: number) => void;
  onDelete: (id: number) => void;
};

type StatusFilter = ActionStatus | "all";
type SortKey = "votes_desc" | "votes_asc" | "newest" | "oldest" | "title_az";

const sortOptions: { value: SortKey; label: string }[] = [
  { value: "votes_desc", label: "Vote Terbanyak" },
  { value: "votes_asc", label: "Vote Tersedikit" },
  { value: "newest", label: "Terbaru" },
  { value: "oldest", label: "Terlama" },
  { value: "title_az", label: "Judul A-Z" },
];

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Semua Status" },
  { value: "todo", label: statusLabel.todo },
  { value: "in_progress", label: statusLabel.in_progress },
  { value: "done", label: statusLabel.done },
];

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function Dropdown({
  icon,
  value,
  options,
  onChange,
  ariaLabel,
}: {
  icon: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: any) => void;
  ariaLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const currentLabel =
    options.find((opt) => opt.value === value)?.label ?? value;

  return (
    <div ref={ref} className="relative w-full sm:w-52">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className="w-full flex items-center gap-2 pl-3 pr-2 py-3 bg-surface border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors cursor-pointer"
      >
        <Icon
          name={icon}
          className="text-[20px] text-on-surface-variant/70 shrink-0"
        />
        <span className="flex-1 text-left truncate">{currentLabel}</span>
        <Icon
          name={open ? "expand_less" : "expand_more"}
          className="text-[20px] text-on-surface-variant shrink-0"
        />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute z-50 left-0 right-0 sm:right-auto sm:min-w-full mt-1 bg-surface border border-outline-variant rounded-lg shadow-lg max-h-60 overflow-auto"
        >
          {options.map((opt) => {
            const isActive = opt.value === value;
            return (
              <li key={opt.value} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 text-left text-body-md transition-colors ${
                    isActive
                      ? "bg-primary-container text-on-primary-container"
                      : "text-on-surface hover:bg-surface-container-low"
                  }`}
                >
                  <Icon
                    name={isActive ? "check_circle" : "radio_button_unchecked"}
                    filled={isActive}
                    className="text-[18px]"
                  />
                  <span className="truncate">{opt.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function ActionsSection({
  actions,
  users,
  onStatusChange,
  onTogglePublish,
  onDelete,
}: Props) {
  const findUser = (id: number) =>
    users.find((u) => u.id === id);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortKey>("votes_desc");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const creatorById = new Map(users.map((u) => [u.id, u]));
    const result = actions.filter((action) => {
      if (statusFilter !== "all" && action.status !== statusFilter) return false;
      if (q.length === 0) return true;
      const creator = creatorById.get(action.createdById);
      return (
        action.title.toLowerCase().includes(q) ||
        action.description.toLowerCase().includes(q) ||
        (creator?.name ?? "").toLowerCase().includes(q)
      );
    });
    return result.sort((a, b) => {
      switch (sortBy) {
        case "votes_desc":
          return b.votes - a.votes;
        case "votes_asc":
          return a.votes - b.votes;
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "title_az":
          return a.title.localeCompare(b.title, "id");
        default:
          return 0;
      }
    });
  }, [actions, users, query, statusFilter, sortBy]);

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="font-headline-md text-headline-md text-on-surface">
          Daftar Action
        </h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          {filtered.length} dari {actions.length} action item. Kelola progres
          dan detail setiap aksi.
        </p>
      </div>

      <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon name="search" className="text-on-surface-variant/70" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari judul, deskripsi, atau pembuat..."
            className="w-full pl-10 pr-4 py-3 bg-surface border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors placeholder:text-outline/50"
          />
        </div>
        <Dropdown
          icon="filter_list"
          value={statusFilter}
          options={statusOptions}
          onChange={(v) => setStatusFilter(v as StatusFilter)}
          ariaLabel="Filter status"
        />
        <Dropdown
          icon="sort"
          value={sortBy}
          options={sortOptions}
          onChange={(v) => setSortBy(v as SortKey)}
          ariaLabel="Urutkan"
        />
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map((action) => {
          const creator = findUser(action.createdById);
          return (
            <div
              key={action.id}
              className="glass-card rounded-xl p-4 sm:p-5 flex flex-col gap-4"
            >
              <div className="flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface w-full sm:flex-1 sm:min-w-0 font-bold">
                    {action.title}
                  </h3>
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap self-start sm:shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-sm text-label-sm ${action.isPublished ? "bg-tertiary-container text-on-tertiary-container" : "bg-surface-container-high text-on-surface-variant"}`}
                    >
                      <Icon
                        name={action.isPublished ? "public" : "public_off"}
                        className="text-[14px]"
                        filled
                      />
                      {action.isPublished ? "Published" : "Draft"}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-sm text-label-sm ${statusBadgeClass[action.status]}`}
                    >
                      <Icon
                        name={
                          action.status === "done"
                            ? "check_circle"
                            : action.status === "in_progress"
                              ? "progress_activity"
                              : "schedule"
                        }
                        filled
                        className="text-[14px]"
                      />
                      {statusLabel[action.status]}
                    </span>
                  </span>
                </div>

                {action.manifestasiPoin && (
                  <span className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full font-label-sm text-label-sm bg-tertiary-container text-on-tertiary-container">
                    <Icon name="auto_stories" className="text-[14px]" filled />
                    <span className="truncate max-w-[260px] sm:max-w-[360px]">
                      {action.manifestasiPoin}
                    </span>
                  </span>
                )}

                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  {action.description}
                </p>
              </div>

              <div className="flex items-center justify-between gap-3 pt-3 border-t border-outline-variant/20">
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar
                    name={creator?.name ?? "?"}
                    src={creator?.avatarUrl ?? undefined}
                    initials={creator?.initials ?? undefined}
                    size={40}
                    className="shrink-0"
                  />
                  <div className="flex flex-col min-w-0 gap-1">
                    <span className="font-label-md text-label-md text-on-surface truncate">
                      {creator?.name ?? "Tidak diketahui"}
                    </span>
                    {creator && creator.sector && (
                      <span
                        className={`inline-flex items-center self-start px-2 py-0.5 rounded-full font-caption text-caption font-bold border ${sectorBadgeClass[creator.sector]}`}
                      >
                        {sectorLabel[creator.sector]}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 font-body-sm text-body-sm text-on-surface-variant shrink-0">
                  <Icon name="thumb_up" className="text-[16px]" />
                  <span className="font-label-md text-label-md text-on-surface">
                    {action.votes}
                  </span>
                  <span className="hidden sm:inline">vote</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-body-sm text-body-sm text-on-surface-variant">
                <Icon name="calendar_today" className="text-[16px]" />
                <span>Dipublikasikan {formatDate(action.createdAt)}</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-outline-variant/20">
                <Link
                  href={`/admin/action/${action.id}`}
                  className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg font-label-sm text-label-sm bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80 transition-colors"
                >
                  <Icon name="visibility" className="text-[16px]" />
                  Lihat Detail
                </Link>
                <Link
                  href={`/admin/action/${action.id}/edit`}
                  className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg font-label-sm text-label-sm bg-primary-container text-on-primary-container hover:bg-primary-container/80 transition-colors"
                >
                  <Icon name="edit" className="text-[16px]" />
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => onTogglePublish(action.id)}
                  className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-lg font-label-sm text-label-sm transition-colors ${
                    action.isPublished
                      ? "bg-surface-container-high text-on-surface-variant hover:bg-surface-container"
                      : "bg-tertiary-container text-on-tertiary-container hover:bg-tertiary-container/80"
                  }`}
                >
                  <Icon
                    name={action.isPublished ? "public_off" : "public"}
                    className="text-[16px]"
                    filled
                  />
                  {action.isPublished ? "Unpublish" : "Publish"}
                </button>
                <span className="font-label-sm text-label-sm text-on-surface-variant hidden sm:inline">
                  Ubah status:
                </span>
                <div className="inline-flex gap-1">
                  {(["todo", "in_progress", "done"] as ActionStatus[]).map(
                    (status) => {
                      const isActive = action.status === status;
                      return (
                        <button
                          key={status}
                          type="button"
                          onClick={() => onStatusChange(action.id, status)}
                          className={`px-3 h-8 rounded-lg font-label-sm text-label-sm transition-colors ${
                            isActive
                              ? "bg-primary text-on-primary"
                              : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container"
                          }`}
                        >
                          {statusLabel[status]}
                        </button>
                      );
                    }
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onDelete(action.id)}
                  aria-label="Hapus action"
                  title="Hapus"
                  className="ml-auto w-9 h-9 flex items-center justify-center rounded-lg text-error hover:bg-error-container transition-colors"
                >
                  <Icon name="delete" />
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="glass-card rounded-xl p-8 text-center text-on-surface-variant font-body-md flex flex-col items-center gap-2">
            <Icon name="search_off" className="text-[28px]" />
            {actions.length === 0
              ? "Belum ada action item."
              : "Tidak ada action yang cocok dengan pencarian/filter."}
          </div>
        )}
      </div>
    </section>
  );
}
