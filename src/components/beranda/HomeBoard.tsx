import { Icon } from "@/components/ui/Icon";
import { GreetingHeader } from "./GreetingHeader";
import { ConnectionsSection } from "./ConnectionsSection";
import { MyActionsSection } from "./MyActionsSection";
import { MyContributionsSection } from "./MyContributionsSection";

export type HomeData = {
  stats: { connections: number; actions: number; contributions: number };
  myActions: {
    id: string;
    title: string;
    status: "todo" | "in_progress" | "done";
    createdAt: string;
  }[];
  myContributions: {
    id: string;
    actionId: string;
    actionTitle: string;
    status: "todo" | "in_progress" | "done";
    contributions: { type: "funding" | "pic" | "skill"; detail: string }[];
  }[];
  connections: {
    id: string;
    name: string;
    avatarUrl?: string;
    initials?: string;
  }[];
  totalConnections: number;
};

export function HomeBoard({
  name,
  data,
}: {
  name: string;
  data: HomeData;
}) {
  const stats = [
    {
      label: "Koneksi",
      value: data.stats.connections,
      href: "/directory",
      icon: "groups",
    },
    {
      label: "Action Saya",
      value: data.stats.actions,
      href: "/action?scope=created",
      icon: "assignment_turned_in",
    },
    {
      label: "Kontribusi",
      value: data.stats.contributions,
      href: "/action?scope=contributed",
      icon: "volunteer_activism",
    },
  ];

  return (
    <>
      <GreetingHeader name={name} />

      <section className="bg-primary rounded-2xl p-5 text-on-primary shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full -mr-12 -mt-12" />
        <div className="absolute bottom-0 left-0 w-28 h-28 bg-white opacity-5 rounded-full -ml-8 -mb-8" />
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Icon name="handshake" filled className="text-[24px]" />
            <h2 className="font-headline-md text-headline-md">
              Siap untuk berkolaborasi hari ini?
            </h2>
          </div>
          <p className="font-body-sm text-body-sm text-on-primary/90">
            Pantau koneksi, action item, dan kontribusi Anda dalam satu tempat.
          </p>
          <div className="grid grid-cols-3 gap-2 mt-1">
            {stats.map((stat) => (
              <a
                key={stat.label}
                href={stat.href}
                className="flex flex-col gap-1 p-3 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 transition-all"
              >
                <Icon name={stat.icon} filled className="text-[18px]" />
                <span className="font-headline-lg-mobile text-headline-lg-mobile font-bold">
                  {stat.value}
                </span>
                <span className="font-caption text-caption text-on-primary/80">
                  {stat.label}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <ConnectionsSection
        connections={data.connections}
        totalConnections={data.totalConnections}
      />
      <MyActionsSection
        actions={data.myActions}
        totalActions={data.stats.actions}
      />
      <MyContributionsSection
        contributions={data.myContributions}
        totalContributions={data.stats.contributions}
      />
    </>
  );
}
