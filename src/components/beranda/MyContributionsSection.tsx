import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import type { ActionStatus } from "@/components/action/action-items-data";

type ContributionType = "funding" | "pic" | "skill";

const contributionBadge: Record<
  ContributionType,
  { label: string; icon: string }
> = {
  funding: { label: "Dana", icon: "payments" },
  pic: { label: "PIC", icon: "person" },
  skill: { label: "Keahlian", icon: "bolt" },
};

type MyContribution = {
  id: string;
  actionId: string;
  actionTitle: string;
  status: ActionStatus;
  contributions: { type: ContributionType; detail: string }[];
};

export function MyContributionsSection({
  contributions,
  totalContributions,
}: {
  contributions: MyContribution[];
  totalContributions: number;
}) {
  const uniqueActions = new Set(
    contributions.map((c) => c.actionTitle),
  ).size;

  return (
    <section className="glass-card rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon
            name="volunteer_activism"
            filled
            className="text-[20px] text-primary"
          />
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Kontribusi Saya
          </h2>
        </div>
        <Link
          href="/action?scope=contributed"
          className="font-label-sm text-label-sm text-primary hover:underline"
        >
          Lihat Semua
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-tertiary-container text-on-tertiary-container font-label-md text-label-md">
          {totalContributions} kontribusi
        </span>
        <span className="font-body-sm text-body-sm text-on-surface-variant">
          di {uniqueActions} action item
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {contributions.map((item) => (
          <Link
            key={item.id}
            href={`/action/${item.actionId}`}
            className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-low/50 hover:bg-surface-container-low active:scale-[0.99] transition-all"
          >
            <div className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
              <Icon name="volunteer_activism" className="text-[18px]" filled />
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <span className="font-label-md text-label-md text-on-surface truncate">
                {item.actionTitle}
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {item.contributions.map((contribution) => {
                  const badge = contributionBadge[contribution.type];
                  return (
                    <span
                      key={`${contribution.type}-${contribution.detail}`}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-caption text-caption"
                    >
                      <Icon name={badge.icon} className="text-[12px]" />
                      {contribution.detail}
                    </span>
                  );
                })}
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
        href="/action"
        className="inline-flex items-center justify-center gap-1.5 h-10 rounded-lg border border-outline-variant bg-surface text-on-surface font-label-md text-label-md hover:bg-surface-container-low active:scale-[0.98] transition-all"
      >
        <Icon name="explore" className="text-[18px]" />
        Jelajahi Action Item
      </Link>
    </section>
  );
}
