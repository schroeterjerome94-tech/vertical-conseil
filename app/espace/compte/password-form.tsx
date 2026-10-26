"use client";

import { useActionState } from "react";

const field =
  "h-11 rounded-2xl border border-line px-4 text-[15px] font-normal outline-none focus:border-brand";

export function PasswordForm({
  action,
}: {
  action: (
    prev: { error: string },
    formData: FormData,
  ) => Promise<{ error: string }>;
}) {
  const [state, formAction, pending] = useActionState(action, { error: "" });

  return (
    <form action={formAction} className="mt-4 grid gap-4">
      {state.error ? (
        <p className="text-[14px] font-semibold text-red-600">{state.error}</p>
      ) : null}
      <label className="grid gap-2 text-[14px] font-semibold text-navy">
        Mot de passe actuel
        <input
          type="password"
          name="currentPassword"
          required
          autoComplete="current-password"
          className={field}
        />
      </label>
      <label className="grid gap-2 text-[14px] font-semibold text-navy">
        Nouveau mot de passe
        <input
          type="password"
          name="newPassword"
          required
          minLength={8}
          autoComplete="new-password"
          className={field}
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 w-fit items-center rounded-full bg-logo px-6 text-[14px] font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Enregistrement…" : "Changer le mot de passe"}
      </button>
    </form>
  );
}
