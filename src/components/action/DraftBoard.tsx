"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { DraftActionItemCard } from "./DraftActionItemCard";
import type { DraftItem } from "./action-items-data";

export function DraftBoard({ items }: { items: DraftItem[] }) {
  return (
    <div className="flex flex-col gap-stack-md">
      <div className="flex justify-between items-center">
        <h1 className="font-headline-lg text-headline-lg text-on-surface">
          Draft Saya
        </h1>
        <Link
          aria-label="Tambah action item"
          className="bg-primary text-on-primary w-11 h-11 rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-transform duration-200"
          href="/action/new"
        >
          <Icon name="add" filled />
        </Link>
      </div>

      <p className="font-body-sm text-body-sm text-on-surface-variant">
        Draft adalah action item yang belum dipublish. Publish untuk menampilkannya
        di feed publik Action / Project.
      </p>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {items.map((item) => (
            <DraftActionItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center border border-dashed border-outline-variant/50 rounded-2xl">
          <Icon
            name="edit_note"
            className="text-[48px] text-on-surface-variant/60"
          />
          <p className="font-body-md text-body-md text-on-surface-variant">
            Belum ada draft.
          </p>
          <Link
            href="/action/new"
            className="inline-flex items-center gap-2 px-4 h-10 bg-primary text-on-primary rounded-full font-label-md text-label-md hover:bg-primary/90 transition-colors"
          >
            <Icon name="add" className="text-[20px]" />
            Buat Action Item
          </Link>
        </div>
      )}
    </div>
  );
}
