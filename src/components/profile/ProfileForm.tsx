"use client";

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import type { Sector } from "@/components/directory/participants-data";
import { updateProfile, updateAvatar } from "@/actions/profile";

const sectorOptions: { value: Sector; label: string; icon: string }[] = [
  { value: "pendidikan", label: "Pendidikan", icon: "school" },
  { value: "ekonomi", label: "Ekonomi", icon: "storefront" },
  { value: "profesional", label: "Profesional", icon: "work" },
];

const sectorIconClass: Record<Sector, string> = {
  pendidikan: "text-sector-pendidikan",
  ekonomi: "text-sector-ekonomi",
  profesional: "text-sector-profesional",
};

const sectorActiveCardClass: Record<Sector, string> = {
  pendidikan: "border-sector-pendidikan bg-sector-pendidikan/5 ring-1 ring-sector-pendidikan",
  ekonomi: "border-sector-ekonomi bg-sector-ekonomi/5 ring-1 ring-sector-ekonomi",
  profesional: "border-sector-profesional bg-sector-profesional/5 ring-1 ring-sector-profesional",
};

const inputClass =
  "w-full h-touch-target px-4 rounded-lg border border-outline-variant bg-surface focus:border-primary focus:ring-1 focus:ring-primary font-body-sm text-body-sm text-on-surface placeholder-outline transition-colors outline-none";

type ProfileFormProps = {
  initialName: string;
  initialWaNumber: string;
  initialSector: Sector;
  initialRole: string;
  initialOrganization: string;
  initialSkills: string[];
  initialOffering: string;
  initialAvatarUrl?: string;
};

export function ProfileForm({
  initialName,
  initialWaNumber,
  initialSector,
  initialRole,
  initialOrganization,
  initialSkills,
  initialOffering,
  initialAvatarUrl,
}: ProfileFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    initialAvatarUrl ?? null,
  );
  const [sector, setSector] = useState<Sector>(initialSector);
  const [role, setRole] = useState(initialRole);
  const [organization, setOrganization] = useState(initialOrganization);
  const [skills, setSkills] = useState<string[]>(initialSkills);
  const [skillInput, setSkillInput] = useState("");
  const [offering, setOffering] = useState(initialOffering);
  const [showSuccess, setShowSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!showSuccess) return;
    const timer = setTimeout(() => setShowSuccess(false), 2500);
    return () => clearTimeout(timer);
  }, [showSuccess]);

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    const fd = new FormData();
    fd.append("avatar", file);
    const res = await updateAvatar(fd);
    if (res?.error) {
      alert(res.error);
      setAvatarPreview(initialAvatarUrl ?? null);
      return;
    }
    if (res?.avatarUrl) setAvatarPreview(res.avatarUrl);
  }

  function addSkill() {
    const trimmed = skillInput.trim();
    if (trimmed.length > 0 && !skills.includes(trimmed)) {
      setSkills((current) => [...current, trimmed]);
    }
    setSkillInput("");
  }

  function handleSkillKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      addSkill();
    }
  }

  function removeSkill(skill: string) {
    setSkills((current) => current.filter((item) => item !== skill));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const res = await updateProfile({
        sector,
        role,
        organization,
        skills,
        offering,
      });
      if (res?.error) {
        alert(res.error);
        return;
      }
      setShowSuccess(true);
    });
  }

  return (
    <form className="flex flex-col gap-stack-lg" onSubmit={handleSubmit}>
      <section className="flex flex-col items-center">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-surface-container-high border-2 border-outline-variant flex items-center justify-center overflow-hidden">
            {avatarPreview ? (
              <Image
                alt="Foto profil"
                src={avatarPreview}
                width={96}
                height={96}
                unoptimized
                className="w-full h-full object-cover"
              />
            ) : (
              <Icon name="person" className="text-outline text-[40px]" />
            )}
          </div>
          <button
            aria-label="Unggah foto profil"
            className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-sm hover:bg-primary/90 transition-colors border-2 border-surface"
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            <Icon name="edit" className="text-[18px]" />
          </button>
          <input
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            type="file"
            onChange={handlePhotoChange}
          />
        </div>
        <p className="mt-2 font-caption text-caption text-on-surface-variant">
          Foto Profil Profesional
        </p>
      </section>

      <div className="flex flex-col gap-stack-md">
        <div className="flex flex-col gap-1">
          <label className="font-label-md text-label-md text-on-surface" htmlFor="fullName">
            Nama Lengkap
          </label>
          <div className="relative">
            <input
              readOnly
              className="w-full h-touch-target px-4 pr-10 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface-variant font-body-sm text-body-sm outline-none cursor-default"
              defaultValue={initialName}
              id="fullName"
              name="fullName"
              type="text"
            />
            <Icon
              name="lock"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-[18px]"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-label-md text-label-md text-on-surface" htmlFor="whatsapp">
            Nomor WhatsApp
          </label>
          <div className="relative">
            <input
              readOnly
              className="w-full h-touch-target px-4 pr-10 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface-variant font-body-sm text-body-sm outline-none cursor-default"
              defaultValue={initialWaNumber}
              id="whatsapp"
              name="whatsapp"
              type="tel"
            />
            <Icon
              name="lock"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-[18px]"
            />
          </div>
        </div>
        <p className="font-caption text-caption text-on-surface-variant/70">
          Nama lengkap dan nomor WhatsApp terhubung dengan akun Anda dan tidak dapat diubah.
        </p>
      </div>

      <fieldset>
        <legend className="font-label-md text-label-md mb-stack-sm text-on-surface">
          Pilih Sektor Anda
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-gutter">
          {sectorOptions.map((option) => {
            const active = sector === option.value;
            return (
              <label key={option.value} className="cursor-pointer">
                <input
                  checked={active}
                  className="peer sr-only"
                  name="sector"
                  type="radio"
                  value={option.value}
                  onChange={() => setSector(option.value)}
                />
                <div
                  className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                    active
                      ? sectorActiveCardClass[option.value]
                      : "border-outline-variant bg-surface hover:bg-surface-container-low"
                  }`}
                >
                  <Icon
                    name={option.icon}
                    className={`text-[32px] ${sectorIconClass[option.value]}`}
                  />
                  <span className="font-label-md text-label-md text-center">
                    {option.label}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="flex flex-col gap-1">
        <label className="font-label-md text-label-md text-on-surface" htmlFor="role">
          Peran / Jabatan
        </label>
        <input
          className={inputClass}
          id="role"
          name="role"
          placeholder="Contoh: Senior Product Manager"
          type="text"
          value={role}
          onChange={(event) => setRole(event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label
          className="font-label-md text-label-md text-on-surface"
          htmlFor="organization"
        >
          Organisasi / Institusi
        </label>
        <input
          className={inputClass}
          id="organization"
          name="organization"
          placeholder="Contoh: Universitas Pendidikan Nusantara"
          type="text"
          value={organization}
          onChange={(event) => setOrganization(event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-label-md text-label-md text-on-surface" htmlFor="skills">
          Keahlian Utama
        </label>
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 bg-surface-container text-on-surface-variant px-3 py-1.5 rounded-full font-label-sm text-label-sm border border-outline-variant"
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
            className={`${inputClass} pl-4 pr-10`}
            id="skills"
            name="skills"
            placeholder="Ketik keahlian dan tekan Enter..."
            type="text"
            value={skillInput}
            onChange={(event) => setSkillInput(event.target.value)}
            onKeyDown={handleSkillKeyDown}
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

      <div className="w-full h-px bg-outline-variant my-2" />

      <div className="flex flex-col gap-stack-md bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm">
        <h3 className="font-headline-md text-headline-md text-primary font-bold">
          Kolaborasi yang Bisa Anda Bantu
        </h3>
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-2">
          Jelaskan apa yang bisa Anda bantu dalam kolaborasi, misalnya keahlian,
          sumber daya, atau dukungan yang bisa Anda berikan. Informasi ini akan
          tampil pada kartu profil Anda di Direktori Peserta.
        </p>

        <div className="flex flex-col gap-1">
          <label
            className="font-label-md text-label-md text-on-surface flex items-center gap-2"
            htmlFor="can_help"
          >
            <Icon name="volunteer_activism" className="text-[18px] text-tertiary" />
            Saya bisa berkontribusi dengan...
          </label>
          <textarea
            className="w-full p-4 rounded-lg border border-outline-variant bg-surface focus:border-tertiary focus:ring-1 focus:ring-tertiary font-body-sm text-body-sm text-on-surface placeholder-outline transition-colors outline-none resize-none"
            id="can_help"
            name="can_help"
            placeholder="Contoh: saya bisa membantu dengan strategi fundraising, jaringan di sektor pendidikan, atau mentoring tim operasional..."
            rows={3}
            value={offering}
            onChange={(event) => setOffering(event.target.value)}
          />
        </div>
      </div>

      <button
        className="w-full h-touch-target bg-primary text-on-primary font-label-md text-label-md rounded-xl flex justify-center items-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
        type="submit"
        disabled={pending}
      >
        {pending ? "Menyimpan..." : "Simpan"}
      </button>

      {showSuccess && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-on-background/60 p-6"
          role="status"
          aria-live="polite"
          onClick={() => setShowSuccess(false)}
        >
          <div
            className="bg-surface rounded-2xl p-6 max-w-sm w-full flex flex-col items-center gap-4 shadow-lg relative"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Tutup"
              onClick={() => setShowSuccess(false)}
              className="absolute top-3 right-3 p-1.5 rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors"
            >
              <Icon name="close" />
            </button>

            <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center">
              <Icon name="check" className="text-[32px] text-primary" filled />
            </div>

            <div className="text-center flex flex-col items-center gap-1">
              <h3 className="font-headline-md text-headline-md text-on-surface">
                Profil berhasil disimpan
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Perubahan profil Anda telah tersimpan.
              </p>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
