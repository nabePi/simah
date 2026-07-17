"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Icon } from "@/components/ui/Icon";
import type { ActionItem } from "./action-items-data";
import { createContribution } from "@/actions/actions-item";

type ContributeModalProps = {
  item: ActionItem;
  onClose: () => void;
  onSubmit: (types: string[]) => void;
};

type Option = {
  value: string;
  label: string;
  description: string;
  icon: string;
};

export function ContributeModal({ item, onClose, onSubmit }: ContributeModalProps) {
  const options = useMemo<Option[]>(() => {
    const list: Option[] = [];
    if (item.needsFunding) {
      list.push({
        value: "funding",
        label: "Dukung Dana",
        description: "Saya akan berkontribusi untuk pendanaan.",
        icon: "payments",
      });
    }
    if (!item.isPic) {
      list.push({
        value: "pic",
        label: "Jadi PIC",
        description: "Saya bersedia menjadi penanggung jawab.",
        icon: "person",
      });
    }
    (item.skills ?? []).forEach((skill) => {
      list.push({
        value: skill,
        label: skill,
        description: `Saya punya keahlian ${skill}.`,
        icon: "bolt",
      });
    });
    return list;
  }, [item]);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function toggleOption(value: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  }

  function handleSubmit() {
    const types = Array.from(selected);
    if (types.length === 0) {
      alert("Pilih minimal satu kebutuhan untuk dikontribusi.");
      return;
    }
    startTransition(async () => {
      const res = await createContribution(Number(item.id), types);
      if (res?.error) {
        alert(res.error);
        return;
      }
      onSubmit(types);
    });
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-on-background/60 p-0 sm:p-6"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-t-2xl sm:rounded-2xl p-6 w-full sm:max-w-md flex flex-col gap-4 shadow-lg max-h-[90vh] overflow-y-auto"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <h3 className="font-headline-md text-headline-md text-on-surface">
              Ikut Berkontribusi
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-1">
              {item.title}
            </p>
          </div>
          <button
            aria-label="Tutup"
            type="button"
            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container-low text-on-surface-variant transition-colors"
            onClick={onClose}
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Pilih kebutuhan yang bisa Anda penuhi. Anda bisa memilih lebih dari satu.
        </p>

        <div className="flex flex-col gap-2">
          {options.map((option) => {
            const active = selected.has(option.value);
            return (
              <label
                key={option.value}
                className="cursor-pointer flex items-start gap-3 p-3 rounded-xl border border-outline-variant bg-surface hover:bg-surface-container-low transition-colors"
              >
                <input
                  checked={active}
                  className="peer sr-only"
                  type="checkbox"
                  onChange={() => toggleOption(option.value)}
                />
                <span
                  className={`mt-0.5 w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
                    active
                      ? "bg-primary border-primary"
                      : "border-outline bg-surface"
                  }`}
                >
                  {active && <Icon name="check" className="text-on-primary text-[14px]" />}
                </span>
                <span className="flex flex-col gap-0.5 flex-1">
                  <span className="flex items-center gap-1.5 font-label-md text-label-md text-on-surface">
                    <Icon name={option.icon} className="text-[16px] text-primary" filled={option.icon === "person"} />
                    {option.label}
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    {option.description}
                  </span>
                </span>
              </label>
            );
          })}
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <button
            type="button"
            className="w-full h-touch-target bg-primary text-on-primary font-label-md text-label-md rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSubmit}
            disabled={pending}
          >
            <Icon
              name={pending ? "progress_activity" : "volunteer_activism"}
              className={`text-[20px] ${pending ? "animate-spin" : ""}`}
              filled={!pending}
            />
            {pending ? "Mengirim..." : "Kirim Kontribusi"}
          </button>
          <button
            type="button"
            className="w-full h-touch-target rounded-xl border border-outline-variant bg-surface text-on-surface font-label-md text-label-md hover:bg-surface-container-low transition-colors"
            onClick={onClose}
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
