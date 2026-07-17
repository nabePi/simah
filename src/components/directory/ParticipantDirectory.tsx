"use client";

import { useMemo, useState, useTransition } from "react";
import { Icon } from "@/components/ui/Icon";
import { ParticipantCard } from "./ParticipantCard";
import { ParticipantPhotoModal } from "./ParticipantPhotoModal";
import { ConnectRequestModal } from "./ConnectRequestModal";
import type { Participant, Sector } from "./participants-data";
import { connectRequest, approveConnection } from "@/actions/connections";

const sectorOptions: { value: Sector; label: string; dotClass: string }[] = [
  { value: "pendidikan", label: "Pendidikan", dotClass: "bg-sector-pendidikan" },
  { value: "ekonomi", label: "Ekonomi", dotClass: "bg-sector-ekonomi" },
  { value: "profesional", label: "Profesional", dotClass: "bg-sector-profesional" },
];

type ParticipantDirectoryProps = {
  participants: Participant[];
  initialPendingIds?: string[];
  initialIncomingRequests?: { participantId: string; connectionId: number }[];
  initialConnectedIds?: string[];
};

export function ParticipantDirectory({
  participants,
  initialPendingIds = [],
  initialIncomingRequests = [],
  initialConnectedIds = [],
}: ParticipantDirectoryProps) {
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState<Sector | "all">("all");
  const [onlyConnected, setOnlyConnected] = useState(false);
  const [onlyPending, setOnlyPending] = useState(false);
  const [selectedParticipant, setSelectedParticipant] =
    useState<Participant | null>(null);
  const [pendingIds, setPendingIds] = useState<Set<string>>(
    () => new Set(initialPendingIds),
  );
  const [incomingRequests, setIncomingRequests] = useState<
    Map<string, number>
  >(
    () =>
      new Map(initialIncomingRequests.map((r) => [r.participantId, r.connectionId])),
  );
  const [connectedIds, setConnectedIds] = useState<Set<string>>(
    () => new Set(initialConnectedIds),
  );
  const [connectTarget, setConnectTarget] = useState<Participant | null>(null);
  const [, startTransition] = useTransition();

  function handleConnect(participant: Participant) {
    setPendingIds((current) =>
      current.has(participant.id)
        ? current
        : new Set(current).add(participant.id),
    );
    setConnectTarget(participant);
    startTransition(async () => {
      await connectRequest(Number(participant.id));
    });
  }

  function handleApprove(participant: Participant) {
    const connectionId = incomingRequests.get(participant.id);
    if (!connectionId) return;
    setIncomingRequests((current) => {
      const next = new Map(current);
      next.delete(participant.id);
      return next;
    });
    setConnectedIds((current) => new Set(current).add(participant.id));
    startTransition(async () => {
      const res = await approveConnection(connectionId);
      if (res?.error) alert(res.error);
    });
  }

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return participants.filter((participant) => {
      const matchesSector = sector === "all" || participant.sector === sector;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        `${participant.name} ${participant.role} ${participant.organization} ${participant.skills.join(" ")} ${participant.offering}`
          .toLowerCase()
          .includes(normalizedQuery);
      const isConnected = connectedIds.has(participant.id);
      const isPending =
        pendingIds.has(participant.id) || incomingRequests.has(participant.id);
      const matchesStatus =
        (!onlyConnected && !onlyPending) ||
        (onlyConnected && isConnected) ||
        (onlyPending && isPending);
      return matchesSector && matchesQuery && matchesStatus;
    });
  }, [
    participants,
    query,
    sector,
    onlyConnected,
    connectedIds,
    onlyPending,
    pendingIds,
    incomingRequests,
  ]);

  return (
    <div className="flex flex-col gap-stack-lg">
      <div className="flex flex-col gap-4 sticky top-16 z-20 bg-background pt-2 pb-1 -mt-2">
        <div className="relative w-full shadow-sm rounded-lg border border-outline-variant/50 bg-surface">
          <Icon
            name="search"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
          />
          <input
            className="w-full pl-10 pr-4 py-3 rounded-lg border-0 bg-transparent focus:outline-none focus:ring-2 focus:ring-primary font-body-sm text-body-sm placeholder:text-on-surface-variant/70 text-on-surface"
            placeholder="Cari nama, keahlian, atau kebutuhan..."
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            className={
              sector === "all"
                ? "px-4 py-2 rounded-full font-label-md text-label-md whitespace-nowrap bg-on-surface text-on-primary shadow-sm transition-colors"
                : "px-4 py-2 rounded-full font-label-md text-label-md whitespace-nowrap bg-surface text-on-surface border border-outline-variant hover:bg-surface-container-low transition-colors"
            }
            onClick={() => setSector("all")}
          >
            Semua Sektor
          </button>
          {sectorOptions.map((option) => {
            const active = sector === option.value;
            return (
              <button
                key={option.value}
                className={
                  active
                    ? "px-4 py-2 rounded-full font-label-md text-label-md whitespace-nowrap bg-on-surface text-on-primary shadow-sm transition-colors flex items-center gap-2"
                    : "px-4 py-2 rounded-full font-label-md text-label-md whitespace-nowrap bg-surface text-on-surface border border-outline-variant hover:bg-surface-container-low transition-colors flex items-center gap-2"
                }
                onClick={() => setSector(option.value)}
              >
                <span className={`w-2 h-2 rounded-full ${option.dotClass}`} />
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            className={
              onlyConnected
                ? "px-4 py-2 rounded-full font-label-md text-label-md whitespace-nowrap bg-on-surface text-on-primary shadow-sm transition-colors flex items-center gap-2"
                : "px-4 py-2 rounded-full font-label-md text-label-md whitespace-nowrap bg-surface text-on-surface border border-outline-variant hover:bg-surface-container-low transition-colors flex items-center gap-2"
            }
            onClick={() => setOnlyConnected((current) => !current)}
          >
            <Icon name="how_to_reg" className="text-[16px]" />
            Koneksi Saya
          </button>
          <button
            className={
              onlyPending
                ? "px-4 py-2 rounded-full font-label-md text-label-md whitespace-nowrap bg-on-surface text-on-primary shadow-sm transition-colors flex items-center gap-2"
                : "px-4 py-2 rounded-full font-label-md text-label-md whitespace-nowrap bg-surface text-on-surface border border-outline-variant hover:bg-surface-container-low transition-colors flex items-center gap-2"
            }
            onClick={() => setOnlyPending((current) => !current)}
          >
            <Icon name="schedule" className="text-[16px]" />
            Koneksi Pending
          </button>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
          {filtered.map((participant) => (
            <ParticipantCard
              key={participant.id}
              participant={participant}
              pending={pendingIds.has(participant.id)}
              canApprove={incomingRequests.has(participant.id)}
              connected={connectedIds.has(participant.id)}
              onAvatarClick={() => setSelectedParticipant(participant)}
              onConnect={() => handleConnect(participant)}
              onApprove={() => handleApprove(participant)}
            />
          ))}
        </div>
      ) : (
        <p className="font-body-sm text-body-sm text-on-surface-variant text-center py-8">
          Tidak ada peserta yang cocok dengan pencarian Anda.
        </p>
      )}

      {selectedParticipant && (
        <ParticipantPhotoModal
          participant={selectedParticipant}
          onClose={() => setSelectedParticipant(null)}
        />
      )}

      <ConnectRequestModal
        participant={connectTarget}
        onClose={() => setConnectTarget(null)}
      />
    </div>
  );
}
