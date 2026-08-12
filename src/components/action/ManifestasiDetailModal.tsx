"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { fetchManifestasiDetailsMultipleAction } from "@/actions/actions-item";

type ManifestasiDetail = {
  id: number;
  breakdownId?: number;
  poin: string;
  label: string | null;
  keterangan: string;
  dalil: string;
  contoh: string;
};

type ManifestasiDetailModalProps = {
  manifestasiId?: number | null;
  manifestasiIds?: number[];
  breakdownId?: number | null;
  breakdownIds?: number[];
  onClose: () => void;
};

export function ManifestasiDetailModal({
  manifestasiId,
  manifestasiIds,
  breakdownId,
  breakdownIds,
  onClose,
}: ManifestasiDetailModalProps) {
  const [details, setDetails] = useState<ManifestasiDetail[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const targetIds =
    manifestasiIds && manifestasiIds.length > 0
      ? manifestasiIds
      : manifestasiId != null
        ? [manifestasiId]
        : [];

  const targetBreakdownIds =
    breakdownIds && breakdownIds.length > 0
      ? breakdownIds
      : breakdownId != null
        ? [breakdownId]
        : [];

  const targetIdsKey = targetIds.join(",");
  const targetBreakdownIdsKey = targetBreakdownIds.join(",");
  const [loading, setLoading] = useState(targetIds.length > 0);

  useEffect(() => {
    if (targetIds.length === 0) return;
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    let isCancelled = false;

    fetchManifestasiDetailsMultipleAction(
      targetIds,
      targetBreakdownIds[0] ?? undefined,
      targetBreakdownIds,
    )
      .then((res) => {
        if (!isCancelled) setDetails(res);
      })
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
      window.removeEventListener("keydown", handleKey);
    };
  }, [targetIdsKey, targetBreakdownIdsKey, onClose]);

  if (targetIds.length === 0) return null;

  const currentDetail = details[activeTab] ?? details[0];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-on-background/60 p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-2xl p-6 max-w-xl w-full max-h-[85vh] overflow-y-auto flex flex-col gap-4 shadow-lg relative"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container transition-colors z-10"
          onClick={onClose}
        >
          <Icon name="close" className="text-[20px] text-on-surface-variant" />
        </button>

        {loading && (
          <p className="font-body-sm text-body-sm text-on-surface-variant py-4">
            Memuat detail manifestasi...
          </p>
        )}

        {!loading && details.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-outline-variant/40 pb-2.5 pr-8">
            {details.map((item, idx) => (
              <button
                key={`${item.id}-${item.breakdownId ?? "none"}-${idx}`}
                type="button"
                onClick={() => setActiveTab(idx)}
                className={`px-3 py-1.5 rounded-lg font-label-sm text-label-sm whitespace-nowrap transition-colors ${
                  activeTab === idx
                    ? "bg-primary text-on-primary font-semibold"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                {idx + 1}. {item.label ?? item.poin}
              </button>
            ))}
          </div>
        )}

        {!loading && currentDetail && (
          <div className="flex flex-col gap-4 pt-1">
            <div>
              <span className="font-label-sm text-label-sm text-primary uppercase tracking-wide">
                Manifestasi Iwa&apos; {details.length > 1 ? `(${activeTab + 1} dari ${details.length})` : ""}
              </span>
              <h3 className="font-headline-md text-headline-md text-on-surface mt-1">
                {currentDetail.poin}
              </h3>
              {currentDetail.label && (
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                  {currentDetail.label}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <span className="font-label-md text-label-md text-on-surface">
                Keterangan
              </span>
              <p className="font-body-sm text-body-sm text-on-surface-variant whitespace-pre-line">
                {currentDetail.keterangan}
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <span className="font-label-md text-label-md text-on-surface">
                Dalil Pendukung
              </span>
              <p className="font-body-sm text-body-sm text-on-surface-variant whitespace-pre-line">
                {currentDetail.dalil}
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <span className="font-label-md text-label-md text-on-surface">
                Contoh Nyata Saat Ini
              </span>
              <p className="font-body-sm text-body-sm text-on-surface-variant whitespace-pre-line">
                {currentDetail.contoh}
              </p>
            </div>
          </div>
        )}

        {!loading && details.length === 0 && (
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Detail tidak ditemukan.
          </p>
        )}
      </div>
    </div>
  );
}
