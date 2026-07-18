"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { BackAppBar } from "@/components/layout/BackAppBar";
import type { ActionStatus } from "./action-items-data";
import { createDraft, updateDraft } from "@/actions/actions-item";
import { generateActionDescription, generateActionSkills } from "@/actions/ai";
import { ManifestasiDetailModal } from "./ManifestasiDetailModal";

type ManifestasiOption = {
  id: number;
  poin: string;
  breakdowns: { id: number; label: string | null }[];
};

export type ActionItemFormInitialValues = {
  title: string;
  background: string;
  objectives: string;
  description: string;
  status: ActionStatus;
  needsFunding: boolean;
  isPic: boolean;
  skills: string[];
  hasDeadline: boolean;
  startDate?: string;
  hasEndDate?: boolean;
  endDate?: string;
  manifestasiId?: number;
  breakdownId?: number;
};

const statusOptions: {
  value: ActionStatus;
  label: string;
  activeClass: string;
}[] = [
  {
    value: "todo",
    label: "To Do",
    activeClass:
      "peer-checked:bg-surface-container-high peer-checked:border-status-todo peer-checked:text-status-todo",
  },
  {
    value: "in_progress",
    label: "In Progress",
    activeClass:
      "peer-checked:bg-surface-container-high peer-checked:border-status-progress peer-checked:text-status-progress",
  },
  {
    value: "done",
    label: "Done",
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

export function ActionItemForm({
  manifestasiOptions = [],
  currentUser,
  draftId,
  initialValues,
}: {
  manifestasiOptions?: ManifestasiOption[];
  currentUser?: { name: string; avatarUrl?: string };
  draftId?: number;
  initialValues?: ActionItemFormInitialValues;
}) {
  const router = useRouter();
  const [selectedManifestasiId, setSelectedManifestasiId] = useState(
    initialValues?.manifestasiId ? String(initialValues.manifestasiId) : "",
  );
  const [selectedBreakdownId, setSelectedBreakdownId] = useState(
    initialValues?.breakdownId ? String(initialValues.breakdownId) : "",
  );
  const [showManifestasiModal, setShowManifestasiModal] = useState(false);
  const [manifestasiMenuOpen, setManifestasiMenuOpen] = useState(false);
  const [breakdownMenuOpen, setBreakdownMenuOpen] = useState(false);
  const selectedManifestasi = manifestasiOptions.find(
    (m) => String(m.id) === selectedManifestasiId,
  );
  const breakdownOptions = (selectedManifestasi?.breakdowns ?? []).filter(
    (b) => b.label !== null,
  );
  const skillInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [background, setBackground] = useState(initialValues?.background ?? "");
  const [objectives, setObjectives] = useState(initialValues?.objectives ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [needsFunding, setNeedsFunding] = useState(initialValues?.needsFunding ?? false);
  const [isPic, setIsPic] = useState(initialValues?.isPic ?? true);
  const [skills, setSkills] = useState<string[]>(initialValues?.skills ?? []);
  const [skillInput, setSkillInput] = useState("");
  const [status, setStatus] = useState<ActionStatus>(initialValues?.status ?? "todo");
  const [hasDeadline, setHasDeadline] = useState(initialValues?.hasDeadline ?? true);
  const [startDate, setStartDate] = useState(initialValues?.startDate ?? "");
  const [hasEndDate, setHasEndDate] = useState(initialValues?.hasEndDate ?? true);
  const [endDate, setEndDate] = useState(initialValues?.endDate ?? "");
  const [generating, setGenerating] = useState(false);
  const [descError, setDescError] = useState<string | null>(null);
  const [requiredFieldErrors, setRequiredFieldErrors] = useState({
    title: false,
    background: false,
    objectives: false,
  });
  const [generatingSkills, setGeneratingSkills] = useState(false);
  const [skillsError, setSkillsError] = useState<string | null>(null);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showRequiredModal, setShowRequiredModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function addSkill() {
    const trimmed = skillInput.trim();
    if (trimmed.length > 0 && !skills.includes(trimmed)) {
      setSkills((current) => [...current, trimmed]);
    }
    setSkillInput("");
    skillInputRef.current?.focus();
  }

  function removeSkill(skill: string) {
    setSkills((current) => current.filter((item) => item !== skill));
  }

  async function handleGenerateSkills() {
    if (generatingSkills) return;

    const missing = {
      title: title.trim().length === 0,
      background: background.trim().length === 0,
      objectives: objectives.trim().length === 0,
    };
    if (missing.title || missing.background || missing.objectives) {
      setRequiredFieldErrors(missing);
      setSkillsError(
        "Lengkapi Judul Action Item, Latar Belakang, dan Tujuan / Output terlebih dahulu.",
      );
      return;
    }

    setRequiredFieldErrors({ title: false, background: false, objectives: false });
    setSkillsError(null);
    setGeneratingSkills(true);
    try {
      const res = await generateActionSkills({
        title,
        background,
        objectives,
        description,
      });
      if (res.error) {
        setSkillsError(res.error);
      } else if (res.skills) {
        setSkills((current) => {
          const existing = new Set(current.map((s) => s.toLowerCase()));
          const added = res.skills!.filter((s) => !existing.has(s.toLowerCase()));
          return [...current, ...added];
        });
      }
    } catch {
      setSkillsError("Gagal menyarankan keahlian. Coba lagi.");
    } finally {
      setGeneratingSkills(false);
    }
  }

  async function handleGenerateDescription() {
    if (generating) return;

    const missing = {
      title: title.trim().length === 0,
      background: background.trim().length === 0,
      objectives: objectives.trim().length === 0,
    };
    if (missing.title || missing.background || missing.objectives) {
      setRequiredFieldErrors(missing);
      setDescError(
        "Lengkapi Judul Action Item, Latar Belakang, dan Tujuan / Output terlebih dahulu.",
      );
      return;
    }

    setRequiredFieldErrors({ title: false, background: false, objectives: false });
    setDescError(null);
    setGenerating(true);
    try {
      const res = await generateActionDescription({ title, background, objectives });
      if (res.error) {
        setDescError(res.error);
      } else if (res.description) {
        setDescription(res.description);
      }
    } catch {
      setDescError("Gagal menghasilkan deskripsi. Coba lagi.");
    } finally {
      setGenerating(false);
    }
  }

  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const missing = {
      title: title.trim().length === 0,
      background: background.trim().length === 0,
      objectives: objectives.trim().length === 0,
    };
    if (missing.title || missing.background || missing.objectives) {
      setRequiredFieldErrors(missing);
      setShowRequiredModal(true);
      setSubmitted(false);
      return;
    }
    setRequiredFieldErrors({ title: false, background: false, objectives: false });
    setSubmitted(true);
    startTransition(async () => {
      const payload = {
        title,
        background,
        objectives,
        description,
        status,
        needsFunding,
        isPic,
        skills,
        hasDeadline,
        startDate: startDate || undefined,
        hasEndDate,
        endDate: endDate || undefined,
        manifestasiId: selectedManifestasiId
          ? Number(selectedManifestasiId)
          : undefined,
        breakdownId: selectedBreakdownId
          ? Number(selectedBreakdownId)
          : undefined,
      };
      const res = draftId
        ? await updateDraft(draftId, payload)
        : await createDraft(payload);
      if (res?.error) {
        setSubmitted(false);
        alert(res.error);
        return;
      }
      router.push("/action/drafts");
    });
  }

  const isDirty = draftId
    ? title !== (initialValues?.title ?? "") ||
      background !== (initialValues?.background ?? "") ||
      objectives !== (initialValues?.objectives ?? "") ||
      description !== (initialValues?.description ?? "") ||
      needsFunding !== (initialValues?.needsFunding ?? false) ||
      isPic !== (initialValues?.isPic ?? true) ||
      skills.join("|") !== (initialValues?.skills ?? []).join("|") ||
      status !== (initialValues?.status ?? "todo") ||
      hasDeadline !== (initialValues?.hasDeadline ?? true) ||
      startDate !== (initialValues?.startDate ?? "") ||
      hasEndDate !== (initialValues?.hasEndDate ?? true) ||
      endDate !== (initialValues?.endDate ?? "") ||
      selectedManifestasiId !==
        (initialValues?.manifestasiId ? String(initialValues.manifestasiId) : "") ||
      selectedBreakdownId !==
        (initialValues?.breakdownId ? String(initialValues.breakdownId) : "")
    : title.trim().length > 0 ||
      background.trim().length > 0 ||
      objectives.trim().length > 0 ||
      description.trim().length > 0 ||
      needsFunding ||
      isPic !== true ||
      skills.length > 0 ||
      status !== "todo" ||
      hasDeadline !== true ||
      startDate.length > 0 ||
      hasEndDate !== true ||
      endDate.length > 0;

  function requestBack() {
    if (isDirty && !submitted) {
      setShowDiscardModal(true);
      return;
    }
    router.back();
  }

  const isDirtyRef = useRef(false);
  const submittedRef = useRef(false);

  useEffect(() => {
    isDirtyRef.current = isDirty;
    submittedRef.current = submitted;
  }, [isDirty, submitted]);

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (isDirtyRef.current && !submittedRef.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const descriptionRemaining = DESC_MAX - description.length;

  return (
    <>
      <BackAppBar title={draftId ? "Edit Action Item" : "Action Item"} onBack={requestBack} />
      <main className="flex-grow py-stack-md pb-44 md:pb-6 md:pl-64">
        <div className="px-container-margin flex flex-col gap-stack-lg max-w-4xl mx-auto w-full md:max-w-2xl">
          <form className="flex flex-col gap-stack-lg" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <h1 className="font-headline-lg text-headline-lg text-on-surface">
                {draftId ? "Edit Action Item" : "Action Item Baru"}
              </h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Lengkapi detail berikut agar kolaborator lintas sektor dapat
                memahami tujuan dan ruang lingkup action / project ini.
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
            Manifestasi Iwa'
          </label>
          <input type="hidden" name="manifestasi" value={selectedManifestasiId} />
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
                className={`truncate ${selectedManifestasiId ? "text-on-surface" : "text-outline"}`}
              >
                {selectedManifestasi
                  ? selectedManifestasi.poin
                  : "Pilih Manifestasi Iwa' (opsional)"}
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
                    aria-selected={!selectedManifestasiId}
                    onClick={() => {
                      setSelectedManifestasiId("");
                      setSelectedBreakdownId("");
                      setManifestasiMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-left font-label-md text-label-md transition-colors ${!selectedManifestasiId ? "bg-primary-container text-on-primary-container" : "text-on-surface hover:bg-surface-container-low"}`}
                  >
                    <span className="text-outline">Kosongkan (opsional)</span>
                    {!selectedManifestasiId && <Icon name="check" className="ml-auto text-[16px]" />}
                  </button>
                  {manifestasiOptions.map((m) => {
                    const active = String(m.id) === selectedManifestasiId;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        role="option"
                        aria-selected={active}
                        onClick={() => {
                          setSelectedManifestasiId(String(m.id));
                          setSelectedBreakdownId("");
                          setManifestasiMenuOpen(false);
                        }}
                        className={`w-full flex items-start gap-2 px-4 py-2.5 text-left font-label-md text-label-md transition-colors ${active ? "bg-primary-container text-on-primary-container" : "text-on-surface hover:bg-surface-container-low"}`}
                      >
                        <span className="whitespace-normal leading-snug">{m.poin}</span>
                        {active && <Icon name="check" className="shrink-0 text-[16px] mt-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {breakdownOptions.length > 0 && (
          <div className="flex flex-col gap-2">
            <label className={labelClass} htmlFor="breakdown">
              Breakdown
            </label>
            <input type="hidden" name="breakdown" value={selectedBreakdownId} />
            <div className="relative">
              <button
                type="button"
                id="breakdown"
                aria-haspopup="listbox"
                aria-expanded={breakdownMenuOpen}
                onClick={() => setBreakdownMenuOpen((open) => !open)}
                className={`${inputClass} flex items-center justify-between gap-2 text-left cursor-pointer`}
              >
                <span
                  className={`truncate ${selectedBreakdownId ? "text-on-surface" : "text-outline"}`}
                >
                  {selectedBreakdownId
                    ? breakdownOptions.find((b) => String(b.id) === selectedBreakdownId)?.label
                    : "Pilih Breakdown"}
                </span>
                <Icon
                  name="expand_more"
                  className={`shrink-0 text-[20px] text-on-surface-variant transition-transform ${breakdownMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {breakdownMenuOpen && (
                <>
                  <button
                    type="button"
                    aria-label="Tutup menu breakdown"
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setBreakdownMenuOpen(false)}
                  />
                  <div
                    role="listbox"
                    className="absolute left-0 right-0 top-full mt-2 max-h-72 overflow-y-auto bg-surface rounded-lg shadow-lg border border-outline-variant/50 py-1 z-50 no-scrollbar"
                  >
                    {breakdownOptions.map((b) => {
                      const active = String(b.id) === selectedBreakdownId;
                      return (
                        <button
                          key={b.id}
                          type="button"
                          role="option"
                          aria-selected={active}
                          onClick={() => {
                            setSelectedBreakdownId(String(b.id));
                            setBreakdownMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 text-left font-label-md text-label-md transition-colors ${active ? "bg-primary-container text-on-primary-container" : "text-on-surface hover:bg-surface-container-low"}`}
                        >
                          {b.label}
                          {active && <Icon name="check" className="text-[16px]" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {selectedManifestasiId && (
          <button
            type="button"
            className="self-start inline-flex items-center gap-2 text-primary font-label-md text-label-md hover:underline"
            onClick={() => setShowManifestasiModal(true)}
          >
            <Icon name="info" className="text-[18px]" />
            Lihat Detail Manifestasi
          </button>
        )}
      </section>

      <section className="glass-card rounded-xl p-5 flex flex-col gap-stack-md">
        <div className="flex flex-col gap-1">
          <label
            className={`${labelClass} ${requiredFieldErrors.title ? "text-error" : ""}`}
            htmlFor="title"
          >
            Judul Action Item
          </label>
          <input
            className={`${inputClass} ${requiredFieldErrors.title ? "border-error focus:border-error focus:ring-error" : ""}`}
            id="title"
            name="title"
            placeholder="Contoh: Pengembangan Modul Pelatihan"
            type="text"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              if (requiredFieldErrors.title && event.target.value.trim()) {
                setRequiredFieldErrors((current) => ({ ...current, title: false }));
              }
            }}
            required
          />
          {requiredFieldErrors.title && (
            <p className="font-caption text-caption text-error">Wajib diisi.</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label
            className={`${labelClass} ${requiredFieldErrors.background ? "text-error" : ""}`}
            htmlFor="background"
          >
            Latar Belakang
          </label>
          <textarea
            className={`${textareaClass} rows-4 ${requiredFieldErrors.background ? "border-error focus:border-error focus:ring-error" : ""}`}
            id="background"
            name="background"
            placeholder="Jelaskan konteks dan alasan action / project ini perlu dilakukan..."
            rows={4}
            value={background}
            onChange={(event) => {
              setBackground(event.target.value);
              if (requiredFieldErrors.background && event.target.value.trim()) {
                setRequiredFieldErrors((current) => ({ ...current, background: false }));
              }
            }}
          />
          <p
            className={`font-caption text-caption ${requiredFieldErrors.background ? "text-error" : "text-on-surface-variant/70"}`}
          >
            {requiredFieldErrors.background
              ? "Wajib diisi."
              : "Mengapa inisiatif ini relevan? Konteks ini membantu PIC dan kolaborator menyelaraskan ekspektasi."}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <label
            className={`${labelClass} ${requiredFieldErrors.objectives ? "text-error" : ""}`}
            htmlFor="objectives"
          >
            Tujuan / Output
          </label>
          <textarea
            className={`${textareaClass} ${requiredFieldErrors.objectives ? "border-error focus:border-error focus:ring-error" : ""}`}
            id="objectives"
            name="objectives"
            placeholder="Deskripsikan hasil akhir yang diharapkan..."
            rows={3}
            value={objectives}
            onChange={(event) => {
              setObjectives(event.target.value);
              if (requiredFieldErrors.objectives && event.target.value.trim()) {
                setRequiredFieldErrors((current) => ({ ...current, objectives: false }));
              }
            }}
          />
          {requiredFieldErrors.objectives && (
            <p className="font-caption text-caption text-error">Wajib diisi.</p>
          )}
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
          <div className="flex items-center justify-between gap-2">
            <p
              className={`font-caption text-caption ${descError ? "text-error" : "text-on-surface-variant/70"}`}
            >
              {generating
                ? "Membuat ringkasan..."
                : descError ||
                  "Tombol AI membantu meringkas dari latar belakang & tujuan."}
            </p>
            <button
              aria-label="Generate deskripsi via AI"
              className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-tertiary-container text-on-tertiary-container hover:bg-tertiary-container/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={generating}
              type="button"
              onClick={handleGenerateDescription}
            >
              <Icon
                name={generating ? "progress_activity" : "auto_awesome"}
                filled
                className={`text-[16px] ${generating ? "animate-spin" : ""}`}
              />
              <span className="font-label-sm text-label-sm">AI</span>
            </button>
          </div>
          <div className="relative">
            <textarea
              className={textareaClass}
              id="description"
              maxLength={DESC_MAX}
              name="description"
              placeholder="Ringkas action ini dalam maksimal 150 karakter..."
              rows={2}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
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
              Saya yang menjadi PIC
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Tandai jika Anda penanggung jawab action ini.
            </span>
          </div>
          <Switch checked={isPic} onChange={setIsPic} label="Saya menjadi PIC" />
        </div>

        {isPic && currentUser && (
          <div className="flex items-center gap-4 pt-2">
            <Avatar
              name={currentUser.name}
              src={currentUser.avatarUrl}
              size={56}
            />
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface">
                {currentUser.name}
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                PIC dari action / project ini
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <label className={labelClass} htmlFor="skills">
              Keahlian yang Dibutuhkan
            </label>
            <button
              aria-label="Sarankan keahlian via AI"
              className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-tertiary-container text-on-tertiary-container hover:bg-tertiary-container/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={generatingSkills}
              type="button"
              onClick={handleGenerateSkills}
            >
              <Icon
                name={generatingSkills ? "progress_activity" : "auto_awesome"}
                filled
                className={`text-[16px] ${generatingSkills ? "animate-spin" : ""}`}
              />
              <span className="font-label-sm text-label-sm">AI</span>
            </button>
          </div>
          <p
            className={`font-caption text-caption -mt-1 ${skillsError ? "text-error" : "text-on-surface-variant/70"}`}
          >
            {generatingSkills
              ? "Mencari keahlian yang relevan..."
              : skillsError ||
                "Tombol AI menyarankan keahlian dari konteks action ini."}
          </p>
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
              ref={skillInputRef}
              className={`${inputClass} pr-10`}
              id="skills"
              name="skills"
              placeholder="Ketik keahlian lalu tekan Enter (mis: Hukum, IT)"
              type="text"
              value={skillInput}
              onChange={(event) => setSkillInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
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
                    className={`text-center py-2 px-1 rounded-lg border border-outline-variant text-on-surface-variant font-label-md text-label-md transition-all ${option.activeClass}`}
                  >
                    {option.label}
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
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
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
                onChange={(event) => setStartDate(event.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className={`${labelClass} flex items-center gap-2`}>
                Tanggal Berakhir
              </label>
              <label className="flex items-center gap-2 mb-1 cursor-pointer">
                <input
                  checked={hasEndDate}
                  className="peer sr-only"
                  type="checkbox"
                  onChange={(event) => setHasEndDate(event.target.checked)}
                />
                <span className="relative inline-block w-9 h-5 rounded-full bg-surface-variant peer-checked:bg-primary transition-colors">
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
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
                onChange={(event) => setEndDate(event.target.value)}
              />
            </div>
          </div>
        )}
      </section>

      <div className="fixed bottom-0 md:bottom-0 left-0 w-full px-3 pt-3 pb-[4.25rem] md:p-4 bg-surface backdrop-blur-md border-t border-outline-variant/20 z-40 md:relative md:bg-transparent md:border-0 md:backdrop-blur-none">
        <button
          className="w-full h-touch-target bg-primary text-on-primary font-label-md text-label-md rounded-xl flex justify-center items-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all shadow-md"
          type="submit"
        >
          <Icon name="save" className="text-[20px]" />
          {draftId ? "Simpan Perubahan" : "Simpan Action Item"}
        </button>
      </div>

      {showDiscardModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-on-background/60 p-6"
          onClick={() => setShowDiscardModal(false)}
        >
          <div
            className="bg-surface rounded-2xl p-6 max-w-sm w-full flex flex-col items-center gap-4 shadow-lg relative"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center">
              <Icon name="warning" filled className="text-error text-[28px]" />
            </div>
            <div className="text-center">
              <h3 className="font-headline-md text-headline-md text-on-surface">
                Buang perubahan?
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                Isi form belum disimpan. Jika keluar sekarang, perubahan akan
                hilang.
              </p>
            </div>
            <div className="flex flex-col w-full gap-2">
              <button
                className="w-full h-touch-target bg-error text-on-error font-label-md text-label-md rounded-xl hover:bg-error/90 active:scale-[0.98] transition-all"
                type="button"
                onClick={() => {
                  setShowDiscardModal(false);
                  setSubmitted(true);
                  router.back();
                }}
              >
                Buang &amp; Keluar
              </button>
              <button
                className="w-full h-touch-target rounded-xl border border-outline-variant bg-surface text-on-surface font-label-md text-label-md hover:bg-surface-container-low transition-colors"
                type="button"
                onClick={() => setShowDiscardModal(false)}
              >
                Lanjut Mengisi
              </button>
            </div>
          </div>
        </div>
      )}

      {showRequiredModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-on-background/60 p-6"
          onClick={() => setShowRequiredModal(false)}
        >
          <div
            className="bg-surface rounded-2xl p-6 max-w-sm w-full flex flex-col items-center gap-4 shadow-lg relative"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center">
              <Icon name="warning" filled className="text-error text-[28px]" />
            </div>
            <div className="text-center">
              <h3 className="font-headline-md text-headline-md text-on-surface">
                Lengkapi wajib diisi
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                Judul Action Item, Latar Belakang, dan Tujuan / Output wajib
                diisi sebelum menyimpan.
              </p>
            </div>
            <button
              className="w-full h-touch-target bg-primary text-on-primary font-label-md text-label-md rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all"
              type="button"
              onClick={() => setShowRequiredModal(false)}
            >
              Lengkapi Sekarang
            </button>
          </div>
        </div>
      )}

      {showManifestasiModal && (
        <ManifestasiDetailModal
          manifestasiId={selectedManifestasiId ? Number(selectedManifestasiId) : null}
          breakdownId={selectedBreakdownId ? Number(selectedBreakdownId) : null}
          onClose={() => setShowManifestasiModal(false)}
        />
      )}
          </form>
        </div>
      </main>
    </>
  );
}

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
    <label className="cursor-pointer">
      <input
        aria-label={label}
        checked={checked}
        className="peer sr-only"
        type="checkbox"
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="relative inline-block w-12 h-6 rounded-full bg-surface-variant peer-checked:bg-primary transition-colors">
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            checked ? "translate-x-6" : ""
          }`}
        />
      </span>
    </label>
  );
}
