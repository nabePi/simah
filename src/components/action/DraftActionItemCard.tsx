"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import type { DraftItem } from "./action-items-data";
import { publishDraft, deleteDraft } from "@/actions/actions-item";

const createdFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function formatCreatedAt(isoDate: string) {
  return createdFormatter.format(new Date(isoDate));
}

function getDurationNarrative(item: DraftItem) {
  if (!item.hasDeadline) return "Tanpa tenggat";
  if (item.startDate && item.hasEndDate === false)
    return `Mulai ${item.startDate} · berjalan selama mungkin`;
  if (item.startDate && item.endDate) return `${item.startDate} — ${item.endDate}`;
  if (item.startDate) return `Mulai ${item.startDate}`;
  if (item.endDate) return `Sampai ${item.endDate}`;
  return "Tanpa tenggat";
}

const MAX_SKILLS = 3;

export function DraftActionItemCard({ item }: { item: DraftItem }) {
  const router = useRouter();
  const [publishOpen, setPublishOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handlePublish() {
    setPublishOpen(false);
    startTransition(async () => {
      const res = await publishDraft(Number(item.id));
      if (res?.error) {
        alert(res.error);
        return;
      }
      router.push("/action");
    });
  }

  function handleDelete() {
    setDeleteOpen(false);
    startTransition(async () => {
      const res = await deleteDraft(Number(item.id));
      if (res?.error) {
        alert(res.error);
        return;
      }
      router.refresh();
    });
  }

  const visibleSkills = item.skills.slice(0, MAX_SKILLS);
  const extraSkills = item.skills.length - visibleSkills.length;

  return (
    <article className="bg-surface rounded-xl border border-outline-variant/50 shadow-sm p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
          <Icon name="edit_note" className="text-[14px]" />
          Draft
        </span>
      </div>

      <h3 className="font-headline-md text-headline-md text-on-surface line-clamp-2">
        {item.title}
      </h3>

      <div className="flex flex-col gap-2">
        <div>
          <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
            <Icon name="description" className="text-[14px]" />
            Latar Belakang
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 mt-0.5">
            {item.background}
          </p>
        </div>
        <div>
          <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
            <Icon name="flag" className="text-[14px]" />
            Tujuan / Output
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 mt-0.5">
            {item.objectives}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {item.needsFunding && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-tertiary-container text-on-tertiary-container font-label-sm text-label-sm">
            <Icon name="payments" className="text-[14px]" />
            Butuh Dana
          </span>
        )}
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-label-sm text-label-sm ${
            item.isPic
              ? "bg-primary-container text-on-primary-container"
              : "bg-surface-container-high text-on-surface-variant"
          }`}
        >
          <Icon name={item.isPic ? "person" : "group"} className="text-[14px]" filled />
          {item.isPic ? "Saya PIC" : "Cari PIC"}
        </span>
      </div>

      {visibleSkills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {visibleSkills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm border border-outline-variant/50"
            >
              {skill}
            </span>
          ))}
          {extraSkills > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
              +{extraSkills}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm border-t border-outline-variant/30 pt-3">
        <Icon name="schedule" className="text-[16px]" />
        <span>{getDurationNarrative(item)}</span>
      </div>
      <div className="flex items-center gap-2 text-on-surface-variant font-caption text-caption -mt-1">
        <Icon name="history" className="text-[14px]" />
        <span>Dibuat {formatCreatedAt(item.createdAt)}</span>
      </div>

      <div className="flex flex-col gap-2 mt-auto pt-3">
        <button
          type="button"
          className="w-full h-touch-target bg-primary text-on-primary font-label-md text-label-md rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all"
          onClick={() => setPublishOpen(true)}
        >
          <Icon name="publish" className="text-[20px]" filled />
          Publish
        </button>
        <div className="flex gap-2">
          <Link
            href={`/action/drafts/${item.id}/edit`}
            className="flex-1 h-touch-target rounded-lg border border-outline-variant bg-surface text-on-surface font-label-md text-label-md flex items-center justify-center gap-2 hover:bg-surface-container-low transition-colors"
          >
            <Icon name="edit" className="text-[18px]" />
            Edit
          </Link>
          <button
            type="button"
            aria-label={`Hapus draft ${item.title}`}
            className="h-touch-target px-4 rounded-lg border border-error/30 bg-error/5 text-error font-label-md text-label-md flex items-center justify-center gap-2 hover:bg-error/10 transition-colors"
            onClick={() => setDeleteOpen(true)}
          >
            <Icon name="delete" className="text-[18px]" />
          </button>
        </div>
      </div>

      {publishOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-on-background/60 p-6"
          onClick={() => setPublishOpen(false)}
        >
          <div
            className="bg-surface rounded-2xl p-6 max-w-sm w-full flex flex-col items-center gap-4 shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center">
              <Icon name="publish" filled className="text-primary text-[28px]" />
            </div>
            <div className="text-center">
              <h3 className="font-headline-md text-headline-md text-on-surface">
                Publish draft?
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                &ldquo;{item.title}&rdquo; akan tampil di feed publik Action / Project
                dan dapat dilihat semua pengguna.
              </p>
            </div>
            <div className="flex flex-col w-full gap-2">
              <button
                className="w-full h-touch-target bg-primary text-on-primary font-label-md text-label-md rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all"
                type="button"
                onClick={handlePublish}
              >
                Publish Sekarang
              </button>
              <button
                className="w-full h-touch-target rounded-xl border border-outline-variant bg-surface text-on-surface font-label-md text-label-md hover:bg-surface-container-low transition-colors"
                type="button"
                onClick={() => setPublishOpen(false)}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-on-background/60 p-6"
          onClick={() => setDeleteOpen(false)}
        >
          <div
            className="bg-surface rounded-2xl p-6 max-w-sm w-full flex flex-col items-center gap-4 shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center">
              <Icon name="warning" filled className="text-error text-[28px]" />
            </div>
            <div className="text-center">
              <h3 className="font-headline-md text-headline-md text-on-surface">
                Hapus draft?
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                Draft &ldquo;{item.title}&rdquo; akan dihapus permanen dan tidak dapat
                dikembalikan.
              </p>
            </div>
            <div className="flex flex-col w-full gap-2">
              <button
                className="w-full h-touch-target bg-error text-on-error font-label-md text-label-md rounded-xl hover:bg-error/90 active:scale-[0.98] transition-all"
                type="button"
                onClick={handleDelete}
              >
                Hapus Permanen
              </button>
              <button
                className="w-full h-touch-target rounded-xl border border-outline-variant bg-surface text-on-surface font-label-md text-label-md hover:bg-surface-container-low transition-colors"
                type="button"
                onClick={() => setDeleteOpen(false)}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
