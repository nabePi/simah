"use client";

import { useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import type { NotificationItem } from "@/components/notifications/notifications-data";
import type { Sector } from "@/components/directory/participants-data";
import { sectorLabel } from "../badges";

type TargetType = "all" | "sector" | "specific";

type UserOption = { id: string; name: string };

type Props = {
  notifications: NotificationItem[];
  userOptions: UserOption[];
  onSend: (input: {
    title: string;
    body: string;
    variant: "alert" | "info";
    targetType: TargetType;
    sector?: string;
    userId?: number;
  }) => Promise<boolean | void>;
};

export function NotificationsSection({
  notifications,
  userOptions,
  onSend,
}: Props) {
  const [judul, setJudul] = useState("");
  const [body, setBody] = useState("");
  const [targetType, setTargetType] = useState<TargetType>("all");
  const [sector, setSector] = useState<Sector>("pendidikan");
  const [userId, setUserId] = useState<string>(userOptions[0]?.id ?? "");
  const [variant, setVariant] = useState<"alert" | "info">("info");
  const [submitting, setSubmitting] = useState(false);

  const broadcasts = notifications.filter((n) => n.type === "broadcast");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!judul.trim() || !body.trim()) return;
    setSubmitting(true);
    const ok = await onSend({
      title: judul.trim(),
      body: body.trim(),
      variant,
      targetType,
      sector: targetType === "sector" ? sector : undefined,
      userId:
        targetType === "specific" && userId
          ? Number(userId)
          : undefined,
    });
    setSubmitting(false);
    if (ok !== false) {
      setJudul("");
      setBody("");
    }
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="glass-card rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Icon name="campaign" filled className="text-primary" />
          <h2 className="font-headline-sm text-headline-sm text-on-surface">
            Buat Notifikasi Baru
          </h2>
        </div>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="notif-judul"
              className="font-label-md text-label-md text-on-surface"
            >
              Judul
            </label>
            <input
              id="notif-judul"
              type="text"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Judul notifikasi"
              required
              className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors placeholder:text-outline/50"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="notif-body"
              className="font-label-md text-label-md text-on-surface"
            >
              Isi Pesan
            </label>
            <textarea
              id="notif-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Tulis isi notifikasi..."
              required
              rows={4}
              className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors placeholder:text-outline/50 resize-y"
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-label-md text-label-md text-on-surface">
              Tipe
            </span>
            <div className="inline-flex gap-2">
              {(["info", "alert"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVariant(v)}
                  className={`flex-1 px-3 h-10 rounded-lg font-label-md text-label-sm transition-colors ${
                    variant === v
                      ? v === "alert"
                        ? "bg-error text-on-error"
                        : "bg-primary text-on-primary"
                      : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  {v === "alert" ? "Penting (Alert)" : "Info"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="font-label-md text-label-md text-on-surface">
              Target
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { value: "all", label: "Semua", icon: "groups" },
                  { value: "sector", label: "Sektor", icon: "category" },
                  { value: "specific", label: "Spesifik", icon: "person" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTargetType(opt.value)}
                  className={`flex items-center justify-center gap-1 px-2 h-10 rounded-lg font-label-sm text-label-sm transition-colors ${
                    targetType === opt.value
                      ? "bg-primary-container text-on-primary-container"
                      : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  <Icon name={opt.icon} className="text-[18px]" />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {targetType === "sector" && (
            <div className="flex flex-col gap-2">
              <label
                htmlFor="notif-sector"
                className="font-label-md text-label-md text-on-surface"
              >
                Pilih Sektor
              </label>
              <select
                id="notif-sector"
                value={sector}
                onChange={(e) => setSector(e.target.value as Sector)}
                className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
              >
                {(["pendidikan", "ekonomi", "profesional"] as Sector[]).map(
                  (s) => (
                    <option key={s} value={s}>
                      {sectorLabel[s]}
                    </option>
                  )
                )}
              </select>
            </div>
          )}

          {targetType === "specific" && (
            <div className="flex flex-col gap-2">
              <label
                htmlFor="notif-user"
                className="font-label-md text-label-md text-on-surface"
              >
                Pilih User
              </label>
              <select
                id="notif-user"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
              >
                {userOptions.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="h-touch-target mt-2 bg-primary text-on-primary font-label-md text-label-md rounded-xl flex justify-center items-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {submitting ? (
              <>
                <Icon
                  name="progress_activity"
                  className="text-[20px] animate-spin"
                />
                Mengirim...
              </>
            ) : (
              <>
                <Icon name="send" className="text-[20px]" />
                Kirim Notifikasi
              </>
            )}
          </button>
        </form>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-headline-sm text-headline-sm text-on-surface">
          Riwayat ({broadcasts.length})
        </h3>
        {broadcasts.map((notif) => {
          const isAlert = notif.type === "broadcast" && notif.variant === "alert";
          return (
            <div
              key={notif.id}
              className="glass-card rounded-xl p-4 flex flex-col gap-1 relative before:absolute before:left-0 before:top-4 before:bottom-4 before:w-1 before:rounded-r-full before:bg-error"
            >
              <div className="flex items-start gap-3 pl-2">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    isAlert
                      ? "bg-error-container text-on-error-container"
                      : "bg-primary-container text-on-primary-container"
                  }`}
                >
                  <Icon
                    name={isAlert ? "warning" : "campaign"}
                    filled
                    className="text-[20px]"
                  />
                </div>
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <span className="font-label-md text-label-md text-on-surface">
                    {notif.title}
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    {notif.body}
                  </span>
                  <span className="font-caption text-caption text-on-surface-variant/70 mt-1">
                    {new Date(notif.createdAt).toLocaleString("id-ID", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        {broadcasts.length === 0 && (
          <div className="glass-card rounded-xl p-8 text-center text-on-surface-variant font-body-md">
            Belum ada notifikasi terkirim.
          </div>
        )}
      </div>
    </section>
  );
}
