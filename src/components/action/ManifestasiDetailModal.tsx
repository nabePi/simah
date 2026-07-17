"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { fetchManifestasiDetailAction } from "@/actions/actions-item";

type ManifestasiDetail = {
  poin: string;
  label: string | null;
  keterangan: string;
  dalil: string;
  contoh: string;
};

type ManifestasiDetailModalProps = {
  manifestasiId: number | null;
  breakdownId?: number | null;
  onClose: () => void;
};

export function ManifestasiDetailModal({
  manifestasiId,
  breakdownId,
  onClose,
}: ManifestasiDetailModalProps) {
  const [detail, setDetail] = useState<ManifestasiDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (manifestasiId == null) return;
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    setLoading(true);
    fetchManifestasiDetailAction(manifestasiId, breakdownId ?? undefined)
      .then(setDetail)
      .finally(() => setLoading(false));
    return () => window.removeEventListener("keydown", handleKey);
  }, [manifestasiId, breakdownId, onClose]);

  if (manifestasiId == null) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-on-background/60 p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-2xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto flex flex-col gap-4 shadow-lg relative"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container transition-colors"
          onClick={onClose}
        >
          <Icon name="close" className="text-[20px] text-on-surface-variant" />
        </button>

        {loading && (
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Memuat detail...
          </p>
        )}

        {!loading && detail && (
          <>
            <div>
              <span className="font-label-sm text-label-sm text-primary uppercase tracking-wide">
                Manifestasi Iwa'
              </span>
              <h3 className="font-headline-md text-headline-md text-on-surface mt-1">
                {detail.poin}
              </h3>
              {detail.label && (
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                  {detail.label}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <span className="font-label-md text-label-md text-on-surface">
                Keterangan
              </span>
              <p className="font-body-sm text-body-sm text-on-surface-variant whitespace-pre-line">
                {detail.keterangan}
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <span className="font-label-md text-label-md text-on-surface">
                Dalil Pendukung
              </span>
              <p className="font-body-sm text-body-sm text-on-surface-variant whitespace-pre-line">
                {detail.dalil}
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <span className="font-label-md text-label-md text-on-surface">
                Contoh Nyata Saat Ini
              </span>
              <p className="font-body-sm text-body-sm text-on-surface-variant whitespace-pre-line">
                {detail.contoh}
              </p>
            </div>
          </>
        )}

        {!loading && !detail && (
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Detail tidak ditemukan.
          </p>
        )}
      </div>
    </div>
  );
}
