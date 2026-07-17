"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { changePassword } from "@/actions/auth";

const labelClass = "font-label-md text-label-md text-on-surface";
const inputWrapperClass = "relative";
const inputClass =
  "w-full h-touch-target pl-10 pr-4 bg-surface rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary font-body-sm text-body-sm text-on-surface placeholder:text-outline transition-colors outline-none";

export function ChangePasswordForm() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }
    if (!/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setError("Password harus kombinasi huruf dan angka.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await changePassword(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        setSuccess(true);
      }
    });
  }

  return (
    <form className="flex flex-col gap-stack-md" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-stack-sm">
        <label className={labelClass} htmlFor="new_password">
          Password baru
        </label>
        <div className={inputWrapperClass}>
          <Icon
            name="key"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
          />
          <input
            className={inputClass}
            id="new_password"
            name="new_password"
            placeholder="Minimal 8 karakter"
            required
            type={showNew ? "text" : "password"}
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
          <button
            type="button"
            aria-label={showNew ? "Sembunyikan password" : "Tampilkan password"}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant p-1 hover:text-primary transition-colors"
            onClick={() => setShowNew((value) => !value)}
          >
            <Icon name={showNew ? "visibility_off" : "visibility"} className="text-[20px]" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-stack-sm">
        <label className={labelClass} htmlFor="confirm_password">
          Ulangi password baru
        </label>
        <div className={inputWrapperClass}>
          <Icon
            name="lock_reset"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
          />
          <input
            className={inputClass}
            id="confirm_password"
            name="confirm_password"
            placeholder="Ketik ulang password"
            required
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
          <button
            type="button"
            aria-label={showConfirm ? "Sembunyikan password" : "Tampilkan password"}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant p-1 hover:text-primary transition-colors"
            onClick={() => setShowConfirm((value) => !value)}
          >
            <Icon name={showConfirm ? "visibility_off" : "visibility"} className="text-[20px]" />
          </button>
        </div>
      </div>

      <div className="bg-surface-container-low p-4 rounded-lg border border-primary-fixed-dim mt-2">
        <ul className="font-caption text-caption text-on-surface-variant space-y-1 list-disc pl-4">
          <li>Minimal 8 karakter</li>
          <li>Gunakan kombinasi huruf dan angka</li>
        </ul>
      </div>

      {error && (
        <p
          role="alert"
          className="font-body-sm text-body-sm text-error flex items-center gap-1.5"
        >
          <Icon name="error" className="text-[16px]" filled />
          {error}
        </p>
      )}

      <button
        className="mt-stack-lg w-full h-touch-target bg-primary hover:bg-primary-container hover:text-on-primary-container text-on-primary rounded-xl font-label-md text-label-md flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
        type="submit"
        disabled={pending}
      >
        {pending ? (
          <>
            <Icon name="progress_activity" className="text-[18px] animate-spin" />
            Menyimpan...
          </>
        ) : (
          <>
            Simpan
          </>
        )}
      </button>

      {success && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="password-success-title"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-on-background/60 p-6"
        >
          <div className="bg-surface rounded-2xl p-6 max-w-sm w-full flex flex-col gap-4 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-full bg-success-container text-on-success-container flex items-center justify-center mx-auto">
              <Icon name="check_circle" filled className="text-[32px]" />
            </div>
            <div>
              <h3
                id="password-success-title"
                className="font-headline-sm text-headline-sm text-on-surface"
              >
                Password Berhasil Diperbarui
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
                Silakan login kembali dengan password baru Anda.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="w-full h-touch-target bg-primary text-on-primary rounded-xl font-label-md text-label-md flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              Login Kembali
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
