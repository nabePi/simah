"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { loginAdmin } from "@/actions/auth";

const labelClass = "font-label-md text-label-md text-on-surface";
const inputClass =
  "w-full pl-10 pr-12 py-3 bg-surface border border-outline-variant rounded-lg font-body-lg text-body-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors placeholder:text-outline/50";

export function AdminLoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await loginAdmin(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <form className="flex flex-col gap-stack-lg" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <label className={labelClass} htmlFor="username">
          Username / Email
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon name="badge" className="text-on-surface-variant/70" />
          </div>
          <input
            className={inputClass}
            id="username"
            name="username"
            placeholder="admin@simah.id"
            required
            type="text"
            autoComplete="username"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <label className={labelClass} htmlFor="password">
            Kata Sandi
          </label>
          <a
            className="font-label-sm text-label-sm text-primary hover:text-primary-fixed-variant transition-colors"
            href="#"
          >
            Lupa sandi?
          </a>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon name="lock" className="text-on-surface-variant/70" />
          </div>
          <input
            className={inputClass}
            id="password"
            name="password"
            placeholder="Masukkan kata sandi"
            required
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
          />
          <button
            aria-label="Toggle password visibility"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none"
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
          >
            <Icon name={showPassword ? "visibility" : "visibility_off"} />
          </button>
        </div>
      </div>

      {error && (
        <p className="font-body-sm text-body-sm text-error -mt-2">{error}</p>
      )}

      <button
        className="w-full h-touch-target mt-4 bg-primary text-on-primary font-label-md text-label-md rounded-xl flex justify-center items-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
        type="submit"
        disabled={pending}
      >
        {pending ? (
          <>
            <Icon name="progress_activity" className="text-[20px] animate-spin" />
            Memproses...
          </>
        ) : (
          <>
            Masuk Panel
            <Icon name="arrow_forward" className="text-[20px]" />
          </>
        )}
      </button>
    </form>
  );
}
