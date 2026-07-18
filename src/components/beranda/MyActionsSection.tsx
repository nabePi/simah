import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import type { ActionStatus } from "@/components/action/action-items-data";

const statusLabel: Record<ActionStatus, string> = {
  todo: "Belum Dimulai",
  in_progress: "Sedang Berjalan",
  done: "Selesai",
};

const statusBadgeClass: Record<ActionStatus, string> = {
  todo: "bg-status-todo/15 text-status-todo",
  in_progress: "bg-status-progress/15 text-status-progress",
  done: "bg-status-done/15 text-status-done",
};

const createdFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

type MyAction = {
  id: string;
  title: string;
  status: ActionStatus;
  createdAt: string;
};

export function MyActionsSection({
  actions,
  totalActions,
}: {
  actions: MyAction[];
  totalActions: number;
}) {
  const inProgressCount = actions.filter(
    (item) => item.status === "in_progress",
  ).length;

  return (
    <section className="glass-card rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon
            name="assignment_turned_in"
            filled
            className="text-[20px] text-primary"
          />
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Action/Project Saya
          </h2>
        </div>
        <Link
          href="/action?scope=created"
          className="font-label-sm text-label-sm text-primary hover:underline"
        >
          Lihat Semua
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary-container text-on-primary-container font-label-md text-label-md">
          {totalActions} action
        </span>
        <span className="font-body-sm text-body-sm text-on-surface-variant">
          {inProgressCount} sedang berjalan
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {actions.map((item) => (
          <Link
            key={item.id}
            href={`/action/${item.id}`}
            className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-low/50 hover:bg-surface-container-low active:scale-[0.99] transition-all"
          >
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <span className="font-label-md text-label-md text-on-surface truncate">
                {item.title}
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full font-caption text-caption ${statusBadgeClass[item.status]}`}
                >
                  {statusLabel[item.status]}
                </span>
                <span className="inline-flex items-center gap-1 font-caption text-caption text-on-surface-variant/70">
                  <Icon name="history" className="text-[12px]" />
                  {createdFormatter.format(new Date(item.createdAt))}
                </span>
              </div>
            </div>
            <Icon
              name="chevron_right"
              className="text-[20px] text-on-surface-variant/60 shrink-0"
            />
          </Link>
        ))}
      </div>

      <Link
        href="/action/new"
        className="inline-flex items-center justify-center gap-1.5 h-10 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary/90 active:scale-[0.98] transition-all"
      >
        <Icon name="add" className="text-[18px]" />
        Buat Action Item
      </Link>
    </section>
  );
}
