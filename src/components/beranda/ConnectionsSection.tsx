import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

type ConnectionPerson = {
  id: string;
  name: string;
  avatarUrl?: string;
  initials?: string;
};

export function ConnectionsSection({
  connections,
  totalConnections,
}: {
  connections: ConnectionPerson[];
  totalConnections: number;
}) {
  const shown = connections.slice(0, 4);
  const extra = Math.max(0, totalConnections - shown.length);

  return (
    <section className="glass-card rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="groups" filled className="text-[20px] text-primary" />
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Koneksi Saya
          </h2>
        </div>
        <Link
          href="/directory?koneksi=saya"
          className="font-label-sm text-label-sm text-primary hover:underline"
        >
          Lihat Semua
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          {shown.map((person) => (
            <div
              key={person.id}
              className="w-10 h-10 rounded-full bg-surface-container-high border-2 border-surface overflow-hidden flex items-center justify-center shrink-0"
            >
              {person.avatarUrl ? (
                <Image
                  alt={person.name}
                  src={person.avatarUrl}
                  width={40}
                  height={40}
                  unoptimized
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  {person.initials ?? person.name.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
          ))}
          {extra > 0 && (
            <div className="w-10 h-10 rounded-full bg-surface-container border-2 border-surface flex items-center justify-center shrink-0">
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                +{extra}
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <span className="font-label-md text-label-md text-on-surface">
            {totalConnections} koneksi
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Peserta yang sudah terhubung dengan Anda.
          </span>
        </div>
      </div>

      <Link
        href="/directory"
        className="inline-flex items-center justify-center gap-1.5 h-10 rounded-lg border border-primary/30 bg-primary/5 text-primary font-label-md text-label-md hover:bg-primary/10 active:scale-[0.98] transition-all"
      >
        <Icon name="person_search" className="text-[18px]" />
        Cari Koneksi Baru
      </Link>
    </section>
  );
}
