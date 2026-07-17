"use client";

import { useEffect } from "react";
import { Icon } from "@/components/ui/Icon";
import type { Participant } from "./participants-data";

type ConnectRequestModalProps = {
  participant: Participant | null;
  onClose: () => void;
};

export function ConnectRequestModal({
  participant,
  onClose,
}: ConnectRequestModalProps) {
  useEffect(() => {
    if (!participant) return;
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [participant, onClose]);

  if (!participant) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-on-background/60 p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-2xl p-6 max-w-sm w-full flex flex-col items-center gap-4 shadow-lg relative"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center">
          <Icon name="forward_to_inbox" filled className="text-[28px] text-on-primary-container" />
        </div>
        <div className="text-center">
          <h3 className="font-headline-md text-headline-md text-on-surface">
            Permintaan Terkirim
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1.5">
            Permintaan koneksi kepada <span className="font-semibold text-on-surface">{participant.name}</span> sudah dikirim. Tunggu hingga disetujui oleh pengguna tersebut.
          </p>
        </div>
        <button
          type="button"
          className="w-full h-10 bg-primary text-on-primary font-label-md text-label-md rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all"
          onClick={onClose}
        >
          Mengerti
        </button>
      </div>
    </div>
  );
}
