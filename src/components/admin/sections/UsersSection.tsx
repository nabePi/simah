"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import { ParticipantPhotoModal } from "@/components/directory/ParticipantPhotoModal";
import type { Participant } from "@/components/directory/participants-data";
import type { AdminUserRow } from "@/actions/admin";
import type { Sector } from "@/components/directory/participants-data";
import {
  sectorLabel,
  sectorBadgeClass,
} from "../badges";

type Props = {
  users: AdminUserRow[];
  onToggleBlock: (id: number) => void;
  onDelete: (id: number) => void;
  onResetPassword: (id: number) => void;
  onImport: (
    rows: { nama: string; wa: string; sektor: string }[],
    totalCount: number
  ) => void;
  onAddUser: (input: { nama: string; wa: string; sektor: string }) => void;
};

type PendingAction = {
  type: "block" | "delete" | "resetPassword";
  user: AdminUserRow;
};

const sectorOptions: (Sector | "all")[] = [
  "all",
  "pendidikan",
  "ekonomi",
  "profesional",
];

export function UsersSection({
  users,
  onToggleBlock,
  onDelete,
  onResetPassword,
  onImport,
  onAddUser,
}: Props) {
  const [showImport, setShowImport] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [query, setQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState<Sector | "all">("all");
  const [detailUser, setDetailUser] = useState<AdminUserRow | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users
      .filter((user) => {
        const matchSector =
          sectorFilter === "all" || user.sector === sectorFilter;
        if (!matchSector) return false;
        if (!q) return true;
        return (
          user.name.toLowerCase().includes(q) ||
          user.waNumber.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.name.localeCompare(b.name, "id"));
  }, [users, query, sectorFilter]);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Daftar User
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            {filtered.length} dari {users.length} user. Kelola status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddUser(true)}
            className="inline-flex items-center gap-2 h-10 px-4 bg-secondary text-on-secondary font-label-md text-label-md rounded-lg hover:bg-secondary/90 active:scale-[0.98] transition-all"
          >
            <Icon name="person_add" className="text-[20px]" />
            Tambah User
          </button>
          <button
            type="button"
            onClick={() => setShowImport(true)}
            className="inline-flex items-center gap-2 h-10 px-4 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary/90 active:scale-[0.98] transition-all"
          >
            <Icon name="upload" className="text-[20px]" />
            Import CSV
          </button>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon name="search" className="text-on-surface-variant/70" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari nama atau no WhatsApp..."
            className="w-full pl-10 pr-4 py-3 bg-surface border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors placeholder:text-outline/50"
          />
        </div>
        <SectorFilter
          value={sectorFilter}
          onChange={setSectorFilter}
        />
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low text-on-surface-variant">
              <tr>
                <th className="px-4 py-3 font-label-md text-label-sm">User</th>
                <th className="px-4 py-3 font-label-md text-label-sm hidden sm:table-cell">
                  WhatsApp
                </th>
                <th className="px-4 py-3 font-label-md text-label-sm hidden md:table-cell">
                  Sektor
                </th>
                <th className="px-4 py-3 font-label-md text-label-sm">Status</th>
                <th className="px-4 py-3 font-label-md text-label-sm text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filtered.map((user) => {
                const blocked = user.status === "blocked";
                return (
                  <tr key={user.id} className="hover:bg-surface-container-low/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={user.name}
                          src={user.avatarUrl ?? undefined}
                          initials={user.initials ?? undefined}
                          size={40}
                          className="shrink-0"
                        />
                        <div className="flex flex-col">
                          <span className="font-label-md text-label-md text-on-surface">
                            {user.name}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-body-sm text-body-sm text-on-surface-variant hidden sm:table-cell">
                      {user.waNumber}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {user.sector && (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full font-caption text-caption font-bold border ${sectorBadgeClass[user.sector]}`}
                        >
                          {sectorLabel[user.sector]}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-sm text-label-sm ${
                          blocked
                            ? "bg-error-container text-on-error-container"
                            : "bg-primary-container text-on-primary-container"
                        }`}
                      >
                        <Icon
                          name={blocked ? "block" : "check_circle"}
                          className="text-[14px]"
                          filled
                        />
                        {blocked ? "Diblokir" : "Aktif"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          aria-label="Lihat detail user"
                          title="View Detail"
                          onClick={() => setDetailUser(user)}
                          className="w-9 h-9 flex items-center justify-center rounded-lg text-primary hover:bg-primary-container transition-colors"
                        >
                          <Icon name="person" />
                        </button>
                        <button
                          type="button"
                          aria-label={
                            blocked ? "Buka blokir user" : "Blokir user"
                          }
                          title={blocked ? "Buka blokir" : "Blokir"}
                          onClick={() =>
                            setPendingAction({ type: "block", user })
                          }
                          className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
                            blocked
                              ? "text-primary hover:bg-primary-container"
                              : "text-error hover:bg-error-container"
                          }`}
                        >
                          <Icon name={blocked ? "lock_open" : "block"} />
                        </button>
                        <button
                          type="button"
                          aria-label="Reset password user"
                          title="Reset Password"
                          onClick={() =>
                            setPendingAction({ type: "resetPassword", user })
                          }
                          className="w-9 h-9 flex items-center justify-center rounded-lg text-secondary hover:bg-secondary-container transition-colors"
                        >
                          <Icon name="lock_reset" />
                        </button>
                        <button
                          type="button"
                          aria-label="Hapus user"
                          title="Hapus"
                          onClick={() =>
                            setPendingAction({ type: "delete", user })
                          }
                          className="w-9 h-9 flex items-center justify-center rounded-lg text-error hover:bg-error-container transition-colors"
                        >
                          <Icon name="delete" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-8 text-center text-on-surface-variant font-body-md">
              <Icon
                name="search_off"
                className="text-[28px] mb-2 block mx-auto"
              />
              Tidak ada user yang cocok.
            </div>
          )}
        </div>
      </div>

      {showImport && (
        <ImportCsvInline
          existingWaNumbers={users.map((u) => u.waNumber)}
          onClose={() => setShowImport(false)}
          onSubmit={(rows, totalCount) => {
            onImport(rows, totalCount);
            setShowImport(false);
          }}
        />
      )}

      {showAddUser && (
        <AddUserModal
          onClose={() => setShowAddUser(false)}
          onSubmit={(input) => {
            onAddUser(input);
            setShowAddUser(false);
          }}
        />
      )}

      {detailUser && (
        <ParticipantPhotoModal
          participant={detailUser as unknown as Participant}
          onClose={() => setDetailUser(null)}
        />
      )}

      {pendingAction && (
        <ConfirmActionModal
          action={pendingAction}
          onCancel={() => setPendingAction(null)}
          onConfirm={() => {
            if (pendingAction.type === "block") {
              onToggleBlock(pendingAction.user.id);
            } else if (pendingAction.type === "delete") {
              onDelete(pendingAction.user.id);
            } else {
              onResetPassword(pendingAction.user.id);
            }
            setPendingAction(null);
          }}
        />
      )}
    </section>
  );
}

function SectorFilter({
  value,
  onChange,
}: {
  value: Sector | "all";
  onChange: (value: Sector | "all") => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const currentLabel =
    value === "all" ? "Semua Sektor" : sectorLabel[value];

  return (
    <div ref={ref} className="relative w-full sm:w-60">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="w-full flex items-center gap-2 pl-3 pr-2 py-3 bg-surface border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors cursor-pointer"
      >
        <Icon name="filter_list" className="text-[20px] text-on-surface-variant/70 shrink-0" />
        <span className="flex-1 text-left truncate">{currentLabel}</span>
        <Icon
          name={open ? "expand_less" : "expand_more"}
          className="text-[20px] text-on-surface-variant shrink-0"
        />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute z-50 left-0 right-0 sm:right-auto sm:min-w-full mt-1 bg-surface border border-outline-variant rounded-lg shadow-lg max-h-60 overflow-auto"
        >
          {sectorOptions.map((opt) => {
            const isActive = opt === value;
            return (
              <li key={opt} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 text-left text-body-md transition-colors ${
                    isActive
                      ? "bg-primary-container text-on-primary-container"
                      : "text-on-surface hover:bg-surface-container-low"
                  }`}
                >
                  <Icon
                    name={isActive ? "check_circle" : "radio_button_unchecked"}
                    filled={isActive}
                    className="text-[18px]"
                  />
                  <span className="truncate">
                    {opt === "all" ? "Semua Sektor" : sectorLabel[opt]}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function ImportCsvInline({
  onClose,
  onSubmit,
  existingWaNumbers,
}: {
  onClose: () => void;
  onSubmit: (
    rows: { nama: string; wa: string; sektor: string }[],
    totalCount: number
  ) => void;
  existingWaNumbers: string[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<
    {
      nama: string;
      wa: string;
      sektor: string;
      status: "ok" | "duplicate" | "error";
    }[]
  >([]);

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
      if (lines.length < 2) {
        setError("CSV kosong atau tidak memiliki baris data.");
        setRows([]);
        return;
      }
      const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const namaIdx = header.indexOf("nama");
      const waIdx = header.indexOf("no whatsapp");
      const sektorIdx = header.indexOf("sektor");
      if (namaIdx === -1 || waIdx === -1 || sektorIdx === -1) {
        setError("Header tidak valid. Gunakan: nama,no whatsapp,sektor");
        setRows([]);
        return;
      }
      const validSectors = ["pendidikan", "ekonomi", "profesional"];
      const sectorAliases: Record<string, string> = {};
      const existingSet = new Set(existingWaNumbers);
      const seenWa = new Set<string>();

      const parsed = lines.slice(1).map((line) => {
        const cols = line.split(",").map((c) => c.trim());
        const rawSektor = (cols[sektorIdx] ?? "").toLowerCase();
        const sektor = sectorAliases[rawSektor] ?? rawSektor;
        const nama = cols[namaIdx] ?? "";
        const wa = cols[waIdx] ?? "";
        const formatValid =
          validSectors.includes(sektor) && nama !== "" && wa !== "";

        let status: "ok" | "duplicate" | "error";
        if (!formatValid) {
          status = "error";
        } else if (existingSet.has(wa) || seenWa.has(wa)) {
          status = "duplicate";
        } else {
          status = "ok";
          seenWa.add(wa);
        }
        return { nama, wa, sektor, status };
      });
      setRows(parsed);
    };
    reader.readAsText(file);
  }

  const okRows = rows.filter((r) => r.status === "ok");

  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="font-headline-sm text-headline-sm text-on-surface">
          Import Data User (CSV)
        </h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-high"
        >
          <Icon name="close" />
        </button>
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant">
        Format kolom: <code className="font-mono">nama,no whatsapp,sektor</code>.
        Sektor valid: pendidikan, ekonomi, profesional.
      </p>
      <input
        type="file"
        accept=".csv"
        onChange={handleFile}
        className="font-body-md text-body-md text-on-surface-variant file:mr-3 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-primary file:text-on-primary file:font-label-md file:cursor-pointer"
      />
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 bg-error-container text-on-error-container rounded-lg font-body-sm text-body-sm">
          <Icon name="error" filled className="text-[18px]" />
          {error}
        </div>
      )}
      {rows.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-outline-variant/30">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low text-on-surface-variant">
              <tr>
                <th className="px-3 py-2 font-label-sm text-label-sm">Nama</th>
                <th className="px-3 py-2 font-label-sm text-label-sm">
                  WhatsApp
                </th>
                <th className="px-3 py-2 font-label-sm text-label-sm">Sektor</th>
                <th className="px-3 py-2 font-label-sm text-label-sm">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {rows.map((row, idx) => (
                <tr key={idx}>
                  <td className="px-3 py-2 font-body-sm text-body-sm text-on-surface">
                    {row.nama || "-"}
                  </td>
                  <td className="px-3 py-2 font-body-sm text-body-sm text-on-surface-variant">
                    {row.wa || "-"}
                  </td>
                  <td className="px-3 py-2 font-body-sm text-body-sm text-on-surface-variant">
                    {row.sektor || "-"}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-caption text-caption ${
                        row.status === "ok" ? "text-status-done" : "text-error"
                      }`}
                    >
                      <Icon
                        name={
                          row.status === "ok"
                            ? "check_circle"
                            : row.status === "duplicate"
                              ? "content_copy"
                              : "warning"
                        }
                        filled
                        className="text-[14px]"
                      />
                      {row.status === "ok"
                        ? "OK"
                        : row.status === "duplicate"
                          ? "Duplikat"
                          : "Error"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="h-10 px-4 rounded-lg font-label-md text-label-md text-on-surface-variant border border-outline-variant hover:bg-surface-container-low transition-colors"
        >
          Batal
        </button>
        <button
          type="button"
          disabled={okRows.length === 0}
          onClick={() =>
            onSubmit(
              okRows.map((r) => ({ nama: r.nama, wa: r.wa, sektor: r.sektor })),
              rows.length
            )
          }
          className="h-10 px-4 rounded-lg font-label-md text-label-md bg-primary text-on-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Tambah{" "}
          {okRows.length > 0 ? `${okRows.length} User` : ""}
        </button>
      </div>
    </div>
  );
}

function ConfirmActionModal({
  action,
  onCancel,
  onConfirm,
}: {
  action: PendingAction;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const isDelete = action.type === "delete";
  const isReset = action.type === "resetPassword";
  const blocked = action.user.status === "blocked";
  const title = isDelete
    ? "Hapus User"
    : isReset
      ? "Reset Password"
      : blocked
        ? "Buka Blokir User"
        : "Blokir User";
  const message = isDelete
    ? `Yakin ingin menghapus ${action.user.name}? Tindakan ini tidak dapat dibatalkan.`
    : isReset
      ? `Reset password ${action.user.name} ke password default? User wajib mengganti password saat login berikutnya.`
      : blocked
        ? `Yakin ingin membuka blokir ${action.user.name}?`
        : `Yakin ingin memblokir ${action.user.name}? User yang diblokir tidak dapat login.`;
  const confirmLabel = isDelete
    ? "Hapus"
    : isReset
      ? "Reset"
      : blocked
        ? "Buka Blokir"
        : "Blokir";
  const confirmClass = isReset
    ? "bg-secondary text-on-secondary hover:bg-secondary/90"
    : isDelete || !blocked
      ? "bg-error text-on-error hover:bg-error/90"
      : "bg-primary text-on-primary hover:bg-primary/90";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-action-title"
      onClick={onCancel}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-on-background/60 p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface rounded-2xl p-6 max-w-sm w-full flex flex-col gap-4 shadow-2xl"
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              isReset
                ? "bg-secondary-container text-on-secondary-container"
                : isDelete || !blocked
                  ? "bg-error-container text-on-error-container"
                  : "bg-primary-container text-on-primary-container"
            }`}
          >
            <Icon
              name={
                isDelete
                  ? "delete"
                  : isReset
                    ? "lock_reset"
                    : blocked
                      ? "lock_open"
                      : "block"
              }
              filled
              className="text-[22px]"
            />
          </div>
          <div className="flex-1">
            <h3
              id="confirm-action-title"
              className="font-headline-sm text-headline-sm text-on-surface"
            >
              {title}
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              {message}
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 px-4 rounded-lg font-label-md text-label-md text-on-surface-variant border border-outline-variant hover:bg-surface-container-low transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`h-10 px-4 rounded-lg font-label-md text-label-md transition-colors ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function AddUserModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (input: { nama: string; wa: string; sektor: string }) => void;
}) {
  const [form, setForm] = useState({
    nama: "",
    wa: "",
    sektor: "",
  });
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const name = form.nama.trim();
    const waNumber = form.wa.trim();
    const sector = form.sektor.trim().toLowerCase();
    const validSectors = ["pendidikan", "ekonomi", "profesional"];

    if (!name) {
      setError("Nama lengkap wajib diisi.");
      return;
    }
    if (!waNumber) {
      setError("No WhatsApp wajib diisi.");
      return;
    }
    if (!validSectors.includes(sector)) {
      setError("Pilih sektor yang valid.");
      return;
    }

    onSubmit({ nama: name, wa: waNumber, sektor: sector });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-user-title"
      onClick={onClose}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-on-background/60 p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface rounded-2xl p-6 max-w-md w-full flex flex-col gap-4 shadow-2xl"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
            <Icon name="person_add" filled className="text-[22px]" />
          </div>
          <div className="flex-1">
            <h3
              id="add-user-title"
              className="font-headline-sm text-headline-sm text-on-surface"
            >
              Tambah User Baru
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              User akan dibuat dengan password default dan mengisi profil setelah login.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="add-user-name"
              className="font-label-sm text-label-sm text-on-surface-variant"
            >
              Nama Lengkap
            </label>
            <input
              id="add-user-name"
              type="text"
              value={form.nama}
              onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))}
              placeholder="Masukkan nama lengkap"
              className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors placeholder:text-outline/50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="add-user-wa"
              className="font-label-sm text-label-sm text-on-surface-variant"
            >
              No WhatsApp
            </label>
            <input
              id="add-user-wa"
              type="text"
              inputMode="tel"
              value={form.wa}
              onChange={(e) => setForm((f) => ({ ...f, wa: e.target.value }))}
              placeholder="Contoh: 08123456789"
              className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors placeholder:text-outline/50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="add-user-sector"
              className="font-label-sm text-label-sm text-on-surface-variant"
            >
              Sektor
            </label>
            <select
              id="add-user-sector"
              value={form.sektor}
              onChange={(e) =>
                setForm((f) => ({ ...f, sektor: e.target.value }))
              }
              className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors appearance-none"
            >
              <option value="">Pilih sektor</option>
              <option value="pendidikan">Pendidikan</option>
              <option value="ekonomi">Ekonomi</option>
              <option value="profesional">Profesional</option>
            </select>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2 bg-error-container text-on-error-container rounded-lg font-body-sm text-body-sm">
              <Icon name="error" filled className="text-[18px]" />
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-lg font-label-md text-label-md text-on-surface-variant border border-outline-variant hover:bg-surface-container-low transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="h-10 px-4 rounded-lg font-label-md text-label-md bg-primary text-on-primary hover:bg-primary/90 transition-colors"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
