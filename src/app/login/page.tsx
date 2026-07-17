import type { Metadata } from "next";
import { Icon } from "@/components/ui/Icon";
import { LoginForm } from "@/components/login/LoginForm";

export const metadata: Metadata = {
  title: "Login - Simah | Aksi, Sinergi, Berdaya",
  description: "Masuk ke acara FGD dengan nomor WhatsApp dan kata sandi - Aksi, Sinergi, Berdaya",
};

export default function LoginPage() {
  return (
    <main className="flex-1 flex flex-col justify-center items-center p-6 min-h-screen bg-surface">
      <div className="w-full max-w-md bg-surface rounded-2xl p-8 shadow-sm border border-outline-variant/30 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary-container/10 text-primary flex items-center justify-center mb-4">
            <Icon name="hub" className="text-4xl" />
          </div>
          <h1 className="font-headline-lg text-headline-lg text-primary">
            Simah
          </h1>
          <div className="mt-2 text-center flex flex-col gap-1">
            <p className="font-label-md text-label-md text-on-surface-variant italic">
              Minal Aqwal Ilal Af&apos;al
            </p>
            <p className="font-body-sm text-body-sm text-on-surface-variant/70">
              Dari Narasi menuju Aksi
            </p>
          </div>
        </div>

        <LoginForm />

        <div className="mt-8 text-center">
          <a
            className="inline-flex items-center gap-2 font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors group"
            href="#"
          >
            <Icon
              name="help"
              className="text-[18px] group-hover:scale-110 transition-transform"
            />
            Butuh bantuan login?
          </a>
        </div>
      </div>
    </main>
  );
}
