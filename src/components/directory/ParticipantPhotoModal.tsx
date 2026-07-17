"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import type { Participant } from "./participants-data";

type ParticipantPhotoModalProps = {
  participant: Participant;
  onClose: () => void;
};

export function ParticipantPhotoModal({
  participant,
  onClose,
}: ParticipantPhotoModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const [avatarError, setAvatarError] = useState(false);
  const showAvatarImage = Boolean(participant.avatarUrl) && !avatarError;
  const fallbackInitials =
    participant.initials ||
    participant.name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-on-background/60 p-6"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-2xl p-6 max-w-sm w-full flex flex-col items-center gap-4 shadow-lg relative"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Tutup"
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors"
        >
          <Icon name="close" />
        </button>

        {showAvatarImage ? (
          <Image
            alt={participant.name}
            src={participant.avatarUrl!}
            width={160}
            height={160}
            unoptimized
            onError={() => setAvatarError(true)}
            className="w-40 h-40 rounded-full object-cover border border-outline-variant/20 shadow-sm"
          />
        ) : (
          <div className="w-40 h-40 rounded-full bg-surface-container-highest flex items-center justify-center text-primary font-headline-lg text-headline-lg border border-outline-variant/20 shadow-sm">
            {fallbackInitials || "?"}
          </div>
        )}

        <div className="text-center flex flex-col items-center gap-2">
          <h3 className="font-headline-md text-headline-md text-on-surface">
            {participant.name}
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {participant.role}
          </p>
          <p className="font-caption text-caption text-on-surface-variant/70">
            {participant.organization}
          </p>
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full font-label-sm text-label-sm border ${
              participant.sector === "pendidikan"
                ? "bg-sector-pendidikan/10 text-sector-pendidikan border-sector-pendidikan/20"
                : participant.sector === "pengusaha"
                  ? "bg-sector-pengusaha/10 text-sector-pengusaha border-sector-pengusaha/20"
                  : "bg-sector-profesional/10 text-sector-profesional border-sector-profesional/20"
            }`}
          >
            {participant.sector === "pendidikan"
              ? "Pendidikan"
                : participant.sector === "pengusaha"
                ? "Ekonomi"
                : "Profesional"}
          </span>
        </div>

        {participant.skills.length > 0 && (
          <div className="flex flex-col gap-2 w-full">
            <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1 justify-center">
              <Icon name="bolt" className="text-[14px]" />
              Keahlian
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {participant.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm border border-outline-variant/50"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
