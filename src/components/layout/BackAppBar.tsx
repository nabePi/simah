"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";

export function BackAppBar({
  title,
  onBack,
}: {
  title: string;
  onBack?: () => void;
}) {
  const router = useRouter();
  return (
    <header className="w-full sticky top-0 z-50 bg-surface flex items-center px-gutter h-16 border-b border-outline-variant/30">
      <button
        aria-label="Kembali"
        className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full hover:bg-surface-container-low text-on-surface-variant transition-colors"
        type="button"
        onClick={() => (onBack ? onBack() : router.back())}
      >
        <Icon name="arrow_back" className="text-[24px]" />
      </button>
      <h1 className="font-headline-md text-headline-md text-primary font-bold flex-1">
        {title}
      </h1>
    </header>
  );
}

