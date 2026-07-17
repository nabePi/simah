"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "simah:install-banner-dismissed";

function detectIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || navigator.vendor || "";
  return /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && "ontouchend" in document);
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari exposes standalone on navigator
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export function InstallPromptBanner() {
  const [visible, setVisible] = useState(false);
  const [promptEvent, setPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    if (localStorage.getItem(DISMISS_KEY) === "1") return;

    setIsIOS(detectIOS());

    function onBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
      setVisible(true);
    }
    function onAppInstalled() {
      setVisible(false);
      localStorage.setItem(DISMISS_KEY, "1");
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);

    // On iOS there's no beforeinstallprompt event; surface the
    // instructions banner directly so the user knows how to install.
    if (detectIOS()) setVisible(true);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  function handleDismiss() {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, "1");
  }

  async function handleInstall() {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice.outcome === "accepted") {
      setVisible(false);
      localStorage.setItem(DISMISS_KEY, "1");
    }
    setPromptEvent(null);
  }

  if (!visible) return null;

  // Android/Chrome: only show once the browser offered an install prompt.
  if (!isIOS && !promptEvent) return null;

  return (
    <div className="bg-primary-container text-on-primary-container border border-primary/20 rounded-xl p-4 flex items-start gap-3 relative">
      <Icon name="install_mobile" filled className="text-[20px] shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0 pr-6">
        <p className="font-label-md text-label-md">Pasang Simah di perangkat Anda</p>
        <p className="font-body-sm text-body-sm mt-0.5">
          {isIOS
            ? "Tekan tombol Share di Safari, lalu pilih “Tambah ke Layar Utama” untuk memasang aplikasi Simah."
            : "Pasang aplikasi Simah agar lebih cepat diakses dari layar utama perangkat Anda."}
        </p>
      </div>
      {!isIOS && promptEvent ? (
        <div className="shrink-0 flex items-center gap-1">
          <button
            type="button"
            onClick={handleInstall}
            className="inline-flex items-center gap-1 px-3 h-9 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary/90 transition-colors"
          >
            Pasang
          </button>
          <button
            type="button"
            aria-label="Tutup"
            onClick={handleDismiss}
            className="p-1 rounded-full text-on-primary-container/70 hover:bg-on-primary-container/10 transition-colors"
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          aria-label="Tutup"
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 rounded-full text-on-primary-container/70 hover:bg-on-primary-container/10 transition-colors"
        >
          <Icon name="close" className="text-[18px]" />
        </button>
      )}
    </div>
  );
}
