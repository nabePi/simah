import type { Metadata } from "next";
import { Icon } from "@/components/ui/Icon";
import { ChangePasswordForm } from "@/components/login/ChangePasswordForm";

export const metadata: Metadata = {
  title: "Ganti Password - Simah | Aksi, Sinergi, Berdaya",
  description:
    "Ganti password default Anda demi keamanan akun Simah - Minal Aqwal Ilal Af'al - Aksi, Sinergi, Berdaya",
};

export default function ChangePasswordPage() {
  return (
    <main className="flex-1 flex flex-col justify-center items-center p-6 min-h-screen bg-surface relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-1/2 h-1/2 bg-surface-variant/40 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-3/5 h-3/5 bg-primary-fixed/30 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="w-full max-w-md bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-outline-variant p-6 relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed/20 to-transparent -z-10 pointer-events-none rounded-2xl" />

        <header className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary-container text-on-secondary-container mb-4">
            <Icon name="lock_person" filled className="text-4xl" />
          </div>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-primary mb-2">
            Ganti Password
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Demi keamanan, silakan ganti password default Anda untuk
            melanjutkan akses ke Simah.
          </p>
        </header>

        <ChangePasswordForm />
      </div>
    </main>
  );
}
