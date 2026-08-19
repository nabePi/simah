"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { type Participant, type Sector } from "@/components/directory/participants-data";
import {
  sectorLabel,
  sectorBadgeClass,
  statusLabel,
} from "../badges";
import {
  sectorOptions,
  sectorActivePillClass,
} from "@/components/action/sector-options";
import type { ActionItem, ActionStatus } from "@/components/action/action-items-data";
import { adminUpdateAction } from "@/actions/admin";
import { ManifestasiDetailModal } from "@/components/action/ManifestasiDetailModal";

type ManifestasiOption = {
  id: number;
  poin: string;
  breakdowns: { id: number; label: string | null }[];
};

const statusOptions: { value: ActionStatus; activeClass: string }[] = [
  {
    value: "todo",
    activeClass:
      "peer-checked:bg-surface-container-high peer-checked:border-status-todo peer-checked:text-status-todo",
  },
  {
    value: "in_progress",
    activeClass:
      "peer-checked:bg-surface-container-high peer-checked:border-status-progress peer-checked:text-status-progress",
  },
  {
    value: "done",
    activeClass:
      "peer-checked:bg-surface-container-high peer-checked:border-status-done peer-checked:text-status-done",
  },
];

const DESC_MAX = 150;

const inputClass =
  "w-full h-touch-target px-4 rounded-lg border border-outline-variant bg-surface focus:border-primary focus:ring-1 focus:ring-primary font-body-sm text-body-sm text-on-surface placeholder-outline transition-colors outline-none";

const textareaClass =
  "w-full p-4 rounded-lg border border-outline-variant bg-surface focus:border-primary focus:ring-1 focus:ring-primary font-body-sm text-body-sm text-on-surface placeholder-outline transition-colors outline-none resize-none";

const labelClass = "font-label-md text-label-md text-on-surface";

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        checked={checked}
        className="peer sr-only"
        type="checkbox"
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="relative inline-block w-11 h-6 rounded-full bg-surface-variant peer-checked:bg-primary transition-colors">
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-surface rounded-full shadow transition-transform ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </span>
      <span className="sr-only">{label}</span>
    </label>
  );
}

type Props = {
  item: ActionItem & { manifestasiId?: number; breakdownId?: number };
  participants?: Participant[];
  manifestasiOptions?: ManifestasiOption[];
  onSave?: (updated: ActionItem) => void;
};

export function ActionEditForm({
  item,
  participants: initialParticipants,
  manifestasiOptions = [],
  onSave,
}: Props) {
  const router = useRouter();

  const [title, setTitle] = useState(item.title);
  const [background, setBackground] = useState(item.background ?? "");
  const [objectives, setObjectives] = useState(item.objectives ?? "");
  const [beneficiary, setBeneficiary] = useState(item.beneficiary ?? "");
  const [description, setDescription] = useState(item.description);
  const [needsFunding, setNeedsFunding] = useState(item.needsFunding ?? false);
  const [isPic, setIsPic] = useState(item.isPic ?? true);
  const [skills, setSkills] = useState<string[]>(item.skills ?? []);
  const [skillInput, setSkillInput] = useState("");
  const [interactingSectors, setInteractingSectors] = useState<Sector[]>(
    item.interactingSectors ?? [],
  );
  const [status, setStatus] = useState<ActionStatus>(item.status);
  const [hasDeadline, setHasDeadline] = useState(
    Boolean(item.startDate || item.endDate),
  );
  const [startDate, setStartDate] = useState(item.startDate ?? "");
  const [hasEndDate, setHasEndDate] = useState(Boolean(item.endDate));
  const [endDate, setEndDate] = useState(item.endDate ?? "");
  const [members, setMembers] = useState<Participant[]>(
    initialParticipants ?? [],
  );
  const [selectedManifestasiIds, setSelectedManifestasiIds] = useState<number[]>(
    item.manifestasiIds && item.manifestasiIds.length > 0
      ? item.manifestasiIds
      : item.manifestasiId ? [item.manifestasiId] : [],
  );
  const [selectedBreakdownIds, setSelectedBreakdownIds] = useState<number[]>(
    item.breakdownIds && item.breakdownIds.length > 0
      ? item.breakdownIds
      : item.breakdownId ? [item.breakdownId] : [],
  );
  const [showManifestasiModal, setShowManifestasiModal] = useState(false);
  const [manifestasiMenuOpen, setManifestasiMenuOpen] = useState(false);

  function toggleManifestasi(id: number) {
    setSelectedManifestasiIds((current) => {
      const isRemoving = current.includes(id);
      const next = isRemoving
        ? current.filter((item) => item !== id)
        : [...current, id];
      if (isRemoving) {
        const opt = manifestasiOptions.find((m) => m.id === id);
        const mBreakdownIds = opt?.breakdowns.map((b) => b.id) ?? [];
        setSelectedBreakdownIds((curr) => curr.filter((bId) => !mBreakdownIds.includes(bId)));
      }
      if (next.length === 0) {
        setSelectedBreakdownIds([]);
      }
      return next;
    });
  }

  function toggleBreakdown(bId: number, mId: number) {
    setSelectedBreakdownIds((current) => {
      const isRemoving = current.includes(bId);
      return isRemoving
        ? current.filter((item) => item !== bId)
        : [...current, bId];
    });
    if (!selectedManifestasiIds.includes(mId)) {
      setSelectedManifestasiIds((curr) => [...curr, mId]);
    }
  }

  function addSkill() {
    const trimmed = skillInput.trim();
    if (trimmed.length > 0 && !skills.includes(trimmed)) {
      setSkills((current) => [...current, trimmed]);
    }
    setSkillInput("");
  }

  function removeSkill(skill: string) {
    setSkills((current) => current.filter((s) => s !== skill));
  }

  function removeMember(id: string) {
    setMembers((current) => current.filter((m) => m.id !== id));
  }

  function toggleSector(sector: Sector) {
    setInteractingSectors((current) =>
      current.includes(sector)
        ? current.filter((s) => s !== sector)
        : [...current, sector],
    );
  }

  const descriptionRemaining = DESC_MAX - description.length;

  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const updated: ActionItem = {
      ...item,
      title,
      background: background || undefined,
      objectives: objectives || undefined,
      beneficiary: beneficiary || undefined,
      description,
      needsFunding,
      isPic,
      skills,
      interactingSectors,
      status,
      startDate: hasDeadline && startDate ? startDate : undefined,
      endDate: hasDeadline && hasEndDate && endDate ? endDate : undefined,
    };
    onSave?.(updated);
    startTransition(async () => {
      const res = await adminUpdateAction(Number(item.id), {
        title,
        background: background || undefined,
        objectives: objectives || undefined,
        beneficiary: beneficiary || undefined,
        description,
        needsFunding,
        isPic,
        skills,
        interactingSectors,
        status,
        startDate:
          hasDeadline && startDate
            ? new Date(startDate).toISOString().slice(0, 10)
            : null,
        endDate:
          hasDeadline && hasEndDate && endDate
            ? new Date(endDate).toISOString().slice(0, 10)
            : null,
        manifestasiId: selectedManifestasiIds[0] ?? null,
        manifestasiIds: selectedManifestasiIds,
        breakdownId: selectedBreakdownIds[0] ?? null,
        breakdownIds: selectedBreakdownIds,
      });
      if (res?.error) {
        alert(res.error);
        return;
      }
      router.push(`/admin/action/${item.id}`);
    });
  }

  return (
    <form
      className="px-container-margin flex flex-col gap-stack-lg max-w-4xl mx-auto w-full md:max-w-2xl py-stack-md pb-[6rem] md:pb-6"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-2">
        <h1 className="font-headline-lg text-headline-lg text-on-surface">
          Edit Action Item
        </h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Perbarui detail action / project ini sebagai admin.
        </p>
      </div>

      <section className="flex flex-col gap-stack-md">
        <div className="flex items-center gap-2">
          <Icon name="menu_book" className="text-[20px] text-primary" />
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Materi FGD
          </h2>
        </div>

        <div className="flex flex-col gap-2">
          <label className={labelClass} htmlFor="manifestasi">
            Manifestasi Iwa&apos; (boleh pilih lebih dari satu)
          </label>
          <div className="relative">
            <button
              type="button"
              id="manifestasi"
              aria-haspopup="listbox"
              aria-expanded={manifestasiMenuOpen}
              onClick={() => setManifestasiMenuOpen((open) => !open)}
              className={`${inputClass} flex items-center justify-between gap-2 text-left cursor-pointer`}
            >
              <span
                className={`truncate ${selectedManifestasiIds.length > 0 ? "text-on-surface font-medium" : "text-outline"}`}
              >
                {selectedManifestasiIds.length > 0
                  ? `${selectedManifestasiIds.length} Manifestasi Iwa' dipilih`
                  : "Pilih Manifestasi Iwa' (opsional - dapat lebih dari satu)"}
              </span>
              <Icon
                name="expand_more"
                className={`shrink-0 text-[20px] text-on-surface-variant transition-transform ${manifestasiMenuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {manifestasiMenuOpen && (
              <>
                <button
                  type="button"
                  aria-label="Tutup menu manifestasi"
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setManifestasiMenuOpen(false)}
                />
                <div
                  role="listbox"
                  className="absolute left-0 right-0 top-full mt-2 max-h-72 overflow-y-auto bg-surface rounded-lg shadow-lg border border-outline-variant/50 py-1 z-50 no-scrollbar"
                >
                  <button
                    type="button"
                    role="option"
                    aria-selected={selectedManifestasiIds.length === 0}
                    onClick={() => {
                      setSelectedManifestasiIds([]);
                      setSelectedBreakdownIds([]);
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-left font-label-md text-label-md transition-colors ${selectedManifestasiIds.length === 0 ? "bg-primary-container text-on-primary-container font-semibold" : "text-on-surface hover:bg-surface-container-low"}`}
                  >
                    <span className="text-outline">Kosongkan Semua</span>
                    {selectedManifestasiIds.length === 0 && <Icon name="check" className="ml-auto text-[16px]" />}
                  </button>
                  {manifestasiOptions.map((m) => {
                    const active = selectedManifestasiIds.includes(m.id);
                    const breakdowns = (m.breakdowns ?? []).filter((b) => b.label !== null);
                    return (
                      <div key={m.id} className="flex flex-col border-b border-outline-variant/20 last:border-0">
                        <button
                          type="button"
                          role="option"
                          aria-selected={active}
                          onClick={() => toggleManifestasi(m.id)}
                          className={`w-full flex items-start gap-2.5 px-4 py-2.5 text-left font-label-md text-label-md transition-colors ${active ? "bg-primary-container/60 text-on-primary-container font-semibold" : "text-on-surface hover:bg-surface-container-low"}`}
                        >
                          <div className={`mt-0.5 shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-colors ${active ? "bg-primary border-primary text-on-primary" : "border-outline bg-surface"}`}>
                            {active && <Icon name="check" className="text-[12px]" />}
                          </div>
                          <span className="whitespace-normal leading-snug">{m.poin}</span>
                        </button>

                        {breakdowns.length > 0 && (
                          <div className="flex flex-col py-1.5 pl-8 pr-3 bg-surface-container-lowest/60 border-t border-outline-variant/20 gap-1">
                            <span className="text-[11px] font-label-sm text-outline font-semibold uppercase tracking-wider">
                              Sub-Opsi Breakdown:
                            </span>
                            {breakdowns.map((b) => {
                              const isSubSelected = selectedBreakdownIds.includes(b.id);
                              return (
                                <button
                                  key={b.id}
                                  type="button"
                                  onClick={() => toggleBreakdown(b.id, m.id)}
                                  className={`w-full flex items-start gap-2 px-3 py-2 text-left text-body-xs rounded-md transition-colors ${
                                    isSubSelected
                                      ? "bg-primary-container text-on-primary-container font-semibold"
                                      : "text-on-surface-variant hover:bg-surface-container-low"
                                  }`}
                                >
                                  <div
                                    className={`mt-0.5 shrink-0 w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${
                                      isSubSelected
                                        ? "border-primary bg-primary text-on-primary"
                                        : "border-outline bg-surface"
                                    }`}
                                  >
                                    {isSubSelected && <Icon name="check" className="text-[10px]" />}
                                  </div>
                                  <span className="whitespace-normal leading-snug">{b.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {selectedManifestasiIds.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {selectedManifestasiIds.map((id) => {
                const opt = manifestasiOptions.find((m) => m.id === id);
                if (!opt) return null;
                const selBreakdownLabels = opt.breakdowns
                  .filter((b) => selectedBreakdownIds.includes(b.id) && b.label)
                  .map((b) => b.label);
                return (
                  <span
                    key={id}
                    className="inline-flex items-start gap-1 px-2.5 py-1 rounded-md bg-primary-container/80 text-on-primary-container text-body-xs font-medium max-w-full"
                  >
                    <span className="line-clamp-2">
                      {opt.poin}
                      {selBreakdownLabels.length > 0 ? ` — (${selBreakdownLabels.join(", ")})` : ""}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleManifestasi(id)}
                      className="shrink-0 mt-0.5 text-on-primary-container/70 hover:text-on-primary-container focus:outline-none"
                      title="Hapus"
                    >
                      <Icon name="close" className="text-[14px]" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {selectedManifestasiIds.length > 0 && (
          <button
            type="button"
            className="self-start inline-flex items-center gap-2 text-primary font-label-md text-label-md hover:underline"
            onClick={() => setShowManifestasiModal(true)}
          >
            <Icon name="info" className="text-[18px]" />
            Lihat Detail Manifestasi {selectedManifestasiIds.length > 1 ? `(${selectedManifestasiIds.length})` : ""}
          </button>
        )}
      </section>

      <section className="glass-card rounded-xl p-5 flex flex-col gap-stack-md">
        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="title">
            Judul Action Item
          </label>
          <input
            className={inputClass}
            id="title"
            name="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="background">
            Latar Belakang
          </label>
          <textarea
            className={textareaClass}
            id="background"
            name="background"
            rows={4}
            value={background}
            onChange={(e) => setBackground(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="objectives">
            Tujuan / Output
          </label>
          <textarea
            className={textareaClass}
            id="objectives"
            name="objectives"
            rows={3}
            value={objectives}
            onChange={(e) => setObjectives(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className={labelClass} htmlFor="beneficiary">
            Penerima Manfaat
          </label>
          <textarea
            className={textareaClass}
            id="beneficiary"
            name="beneficiary"
            rows={3}
            value={beneficiary}
            onChange={(e) => setBeneficiary(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className={labelClass} htmlFor="description">
              Deskripsi Singkat
            </label>
            <span
              className={`font-label-sm text-label-sm ${
                descriptionRemaining < 20
                  ? "text-error"
                  : "text-on-surface-variant"
              }`}
            >
              {descriptionRemaining}
            </span>
          </div>
          <textarea
            className={textareaClass}
            id="description"
            maxLength={DESC_MAX}
            name="description"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Icon name="hub" className="text-[20px] text-primary" />
            <span className="font-label-md text-label-md text-on-surface">
              Interaksi Antar Sektor
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Pilih sektor yang berinteraksi dalam program ini (opsional, boleh lebih dari satu).
          </p>
          <div className="grid grid-cols-3 gap-2">
            {sectorOptions.map((option) => {
              const active = interactingSectors.includes(option.value);
              return (
                <label key={option.value} className="cursor-pointer">
                  <input
                    checked={active}
                    className="peer sr-only"
                    name="interactingSectors"
                    type="checkbox"
                    value={option.value}
                    onChange={() => toggleSector(option.value)}
                  />
                  <div
                    className={`h-full flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg border border-outline-variant text-on-surface-variant font-label-sm text-label-sm text-center transition-all ${sectorActivePillClass[option.value]}`}
                  >
                    <Icon name={option.icon} className="text-[16px]" filled={active} />
                    <span className="leading-tight">{option.label}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex items-start justify-between border-t border-outline-variant/20 pt-4 -mt-2">
          <div className="flex flex-col pr-4">
            <span className="font-label-md text-label-md text-on-surface">
              Butuh Dukungan Dana?
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Aktifkan jika memerlukan dana.
            </span>
          </div>
          <Switch
            checked={needsFunding}
            onChange={setNeedsFunding}
            label="Butuh dukungan dana"
          />
        </div>

        <div className="flex items-start justify-between border-t border-outline-variant/20 pt-4 -mt-2">
          <div className="flex flex-col pr-4">
            <span className="font-label-md text-label-md text-on-surface">
              Ada PIC?
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Tandai jika action ini punya penanggung jawab.
            </span>
          </div>
          <Switch checked={isPic} onChange={setIsPic} label="Ada PIC" />
        </div>

        <div className="flex flex-col gap-2">
          <label className={labelClass} htmlFor="skills">
            Keahlian yang Dibutuhkan
          </label>
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 bg-surface-container text-on-surface-variant px-3 py-1.5 rounded-full font-body-sm text-body-sm border border-outline-variant"
                >
                  {skill}
                  <button
                    aria-label={`Hapus ${skill}`}
                    className="hover:text-error transition-colors"
                    type="button"
                    onClick={() => removeSkill(skill)}
                  >
                    <Icon name="close" className="text-[16px]" />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="relative">
            <input
              className={`${inputClass} pr-10`}
              id="skills"
              name="skills"
              placeholder="Ketik keahlian lalu tekan Enter"
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill();
                }
              }}
            />
            <button
              aria-label="Tambah keahlian"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-primary p-1 hover:bg-surface-container rounded-full"
              type="button"
              onClick={addSkill}
            >
              <Icon name="add" className="text-[20px]" />
            </button>
          </div>
        </div>
      </section>

      <div className="flex items-center gap-2">
        <Icon name="schedule" className="text-[20px] text-primary" />
        <h2 className="font-headline-md text-headline-md text-on-surface">
          Status &amp; Linimasa
        </h2>
      </div>

      <section className="glass-card rounded-xl p-5 flex flex-col gap-stack-md">
        <fieldset>
          <legend className={`${labelClass} mb-stack-sm`}>Status Progres</legend>
          <div className="grid grid-cols-3 gap-2">
            {statusOptions.map((option) => {
              const active = status === option.value;
              return (
                <label key={option.value} className="cursor-pointer">
                  <input
                    checked={active}
                    className="peer sr-only"
                    name="status"
                    type="radio"
                    value={option.value}
                    onChange={() => setStatus(option.value)}
                  />
                  <div
                    className={`text-center py-2 px-1 rounded-lg border border-outline-variant text-on-surface-variant font-label-md text-label-md transition-all ${option.activeClass} ${
                      active
                        ? "bg-surface-container-high border-current text-on-surface"
                        : ""
                    }`}
                  >
                    {statusLabel[option.value]}
                  </div>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="border-t border-outline-variant/20 pt-4 -mt-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              checked={hasDeadline}
              className="peer sr-only"
              type="checkbox"
              onChange={(event) => setHasDeadline(event.target.checked)}
            />
            <span className="relative inline-block w-11 h-6 rounded-full bg-surface-variant peer-checked:bg-primary transition-colors">
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-surface rounded-full shadow transition-transform ${
                  hasDeadline ? "translate-x-5" : ""
                }`}
              />
            </span>
            <span className="font-label-md text-label-md text-on-surface">
              Ada tenggat waktu
            </span>
          </label>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Matikan jika action berjalan selama mungkin tanpa batas waktu.
          </p>
        </div>

        {hasDeadline && (
          <div className="flex flex-col gap-stack-md">
            <div className="flex flex-col gap-1">
              <label className={labelClass} htmlFor="startDate">
                Tanggal Mulai
              </label>
              <input
                className={`${inputClass} bg-surface-bright cursor-pointer`}
                id="startDate"
                name="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>Tanggal Berakhir</label>
              <label className="flex items-center gap-2 mb-1 cursor-pointer">
                <input
                  checked={hasEndDate}
                  className="peer sr-only"
                  type="checkbox"
                  onChange={(event) => setHasEndDate(event.target.checked)}
                />
                <span className="relative inline-block w-9 h-5 rounded-full bg-surface-variant peer-checked:bg-primary transition-colors">
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-surface rounded-full shadow transition-transform ${
                      hasEndDate ? "translate-x-4" : ""
                    }`}
                  />
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Ada tanggal berakhir
                </span>
              </label>
              <input
                className={`${inputClass} bg-surface-bright cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                disabled={!hasEndDate}
                id="endDate"
                name="endDate"
                placeholder="Tanpa tanggal berakhir"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        )}
      </section>

      <div className="flex items-center gap-2">
        <Icon name="group" className="text-[20px] text-primary" />
        <h2 className="font-headline-md text-headline-md text-on-surface">
          Participants
        </h2>
      </div>

      <section className="glass-card rounded-xl p-5 flex flex-col gap-3">
        {members.length > 0 ? (
          members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 py-2 border-b border-outline-variant/20 last:border-0"
            >
              <Avatar
                name={member.name}
                src={member.avatarUrl}
                initials={member.initials}
                size={48}
                className="shrink-0"
              />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-label-md text-label-md text-on-surface truncate">
                  {member.name}
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full font-caption text-caption font-bold border ${sectorBadgeClass[member.sector]}`}
                  >
                    {sectorLabel[member.sector]}
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                    {member.role} · {member.organization}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeMember(member.id)}
                aria-label={`Hapus ${member.name} dari action`}
                title="Hapus participant"
                className="w-9 h-9 flex items-center justify-center rounded-lg text-error hover:bg-error-container transition-colors shrink-0"
              >
                <Icon name="person_remove" />
              </button>
            </div>
          ))
        ) : (
          <p className="font-body-md text-body-md text-on-surface-variant text-center py-4">
            Belum ada participant.
          </p>
        )}
      </section>

      {showManifestasiModal && (
        <ManifestasiDetailModal
          manifestasiIds={selectedManifestasiIds}
          breakdownIds={selectedBreakdownIds}
          onClose={() => setShowManifestasiModal(false)}
        />
      )}

      <div className="fixed bottom-0 left-0 w-full px-3 pt-3 pb-[4.25rem] md:p-4 bg-surface/95 backdrop-blur-md border-t border-outline-variant/20 z-40 md:relative md:bg-transparent md:border-0 md:backdrop-blur-none">
        <div className="flex gap-2 max-w-2xl mx-auto w-full">
          <button
            type="button"
            onClick={() => router.back()}
            className="h-touch-target px-6 rounded-xl border border-outline-variant bg-surface text-on-surface font-label-md text-label-md hover:bg-surface-container-low transition-colors"
          >
            Batal
          </button>
          <button
            className="flex-1 h-touch-target bg-primary text-on-primary font-label-md text-label-md rounded-xl flex justify-center items-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            type="submit"
            disabled={pending}
          >
            <Icon
              name={pending ? "progress_activity" : "save"}
              className={`text-[20px] ${pending ? "animate-spin" : ""}`}
            />
            {pending ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </div>
    </form>
  );
}
