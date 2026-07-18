import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Avatar } from "@/components/ui/Avatar";
import type { AdminActionRow, AdminUserRow } from "@/actions/admin";
import { sectorLabel, sectorBadgeClass } from "../badges";

type Props = {
  users: AdminUserRow[];
  actions: AdminActionRow[];
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function OverviewSection({ users, actions }: Props) {
  const inProgressCount = actions.filter(
    (a) => a.status === "in_progress"
  ).length;
  const doneCount = actions.filter((a) => a.status === "done").length;
  const topActions = [...actions]
    .sort((a, b) => b.votes - a.votes)
    .slice(0, 5);
  const findUser = (id: number) => users.find((u) => u.id === id);

  const stats = [
    { icon: "group", label: "Total User", value: users.length },
    { icon: "assignment_turned_in", label: "Total Action", value: actions.length },
    { icon: "progress_activity", label: "Action Sedang Berjalan", value: inProgressCount },
    { icon: "task_alt", label: "Action Selesai", value: doneCount },
  ];

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="font-headline-md text-headline-md text-on-surface">
          Ringkasan
        </h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          Gambaran umum aktivitas peserta dan action item.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="glass-card rounded-2xl p-4 flex flex-col gap-2"
          >
            <div className="w-9 h-9 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center">
              <Icon name={stat.icon} className="text-[18px]" />
            </div>
            <span className="font-headline-md text-headline-md text-on-surface">
              {stat.value}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <span className="font-label-lg text-label-lg font-bold text-on-surface">
            5 Action dengan Vote Terbanyak
          </span>
          <Link
            href="/admin/dashboard?tab=actions"
            className="inline-flex items-center gap-1 font-label-sm text-label-sm text-primary hover:underline shrink-0"
          >
            Lihat semua
            <Icon name="arrow_forward" className="text-[16px]" />
          </Link>
        </div>
        {topActions.length > 0 ? (
          <div className="flex flex-col gap-3">
            {topActions.map((action, index) => {
              const creator = findUser(action.createdById);
              return (
                <div
                  key={action.id}
                  className="flex items-start gap-3 py-2 border-b border-outline-variant/20 last:border-0"
                >
                  <span className="font-label-md text-label-md text-on-surface-variant w-5 shrink-0">
                    {index + 1}.
                  </span>
                  <div className="flex flex-col gap-2 min-w-0 flex-1">
                    <span className="font-label-lg text-label-lg text-on-surface font-bold">
                      {action.title}
                    </span>
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar
                        name={creator?.name ?? "?"}
                        src={creator?.avatarUrl ?? undefined}
                        initials={creator?.initials ?? undefined}
                        size={32}
                        className="shrink-0"
                      />
                      <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                        <span className="font-label-md text-label-md text-on-surface truncate">
                          {creator?.name ?? "Tidak diketahui"}
                        </span>
                        {creator && creator.sector && (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full font-caption text-caption font-bold border ${sectorBadgeClass[creator.sector]}`}
                          >
                            {sectorLabel[creator.sector]}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap font-body-sm text-body-sm text-on-surface-variant">
                      <span className="inline-flex items-center gap-1">
                        <Icon name="thumb_up" className="text-[14px]" />
                        <span className="font-label-md text-label-md text-on-surface">
                          {action.votes}
                        </span>
                        <span>vote</span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Icon name="calendar_today" className="text-[14px]" />
                        {formatDate(action.createdAt)}
                      </span>
                      <Link
                        href={`/admin/action/${action.id}`}
                        className="ml-auto inline-flex items-center gap-1.5 h-8 px-3 rounded-lg font-label-sm text-label-sm bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80 transition-colors"
                      >
                        <Icon name="visibility" className="text-[16px]" />
                        Lihat Detail
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Belum ada action item.
          </p>
        )}
      </div>
    </section>
  );
}
