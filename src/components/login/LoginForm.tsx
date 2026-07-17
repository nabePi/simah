"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { loginUser } from "@/actions/auth";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await loginUser(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <form className="flex flex-col gap-stack-lg" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <label
          className="font-label-md text-label-md text-on-surface"
          htmlFor="whatsapp"
        >
          Nomor WhatsApp
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon name="call" className="text-on-surface-variant/70" />
          </div>
          <input
            className="w-full pl-10 pr-4 py-3 bg-surface border border-outline-variant rounded-lg font-body-lg text-body-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors placeholder:text-outline/50"
            id="whatsapp"
            name="whatsapp"
            placeholder="Contoh: 081234567890"
            required
            type="tel"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <label
            className="font-label-md text-label-md text-on-surface"
            htmlFor="password"
          >
            Kata Sandi
          </label>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon name="lock" className="text-on-surface-variant/70" />
          </div>
          <input
            className="w-full pl-10 pr-12 py-3 bg-surface border border-outline-variant rounded-lg font-body-lg text-body-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors placeholder:text-outline/50"
            id="password"
            name="password"
            placeholder="Masukkan kata sandi"
            required
            type={showPassword ? "text" : "password"}
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
        className="w-full h-touch-target mt-4 bg-primary text-on-primary font-label-md text-label-md rounded-xl flex justify-center items-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm disabled:opacity-60 disabled:pointer-events-none"
        type="submit"
        disabled={pending}
      >
        {pending ? "Memproses..." : "Masuk"}
        {!pending && <Icon name="arrow_forward" className="text-[20px]" />}
        {pending && (
          <Icon name="progress_activity" className="text-[20px] animate-spin" />
        )}
      </button>
    </form>
  );
}
