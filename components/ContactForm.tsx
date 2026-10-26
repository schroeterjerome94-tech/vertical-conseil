"use client";

import { useActionState } from "react";
import {
  sendContactMessage,
  type ContactState,
} from "@/app/(site)/contact-actions";

const SUBJECTS = [
  "Demande d’information",
  "Planifier une démonstration",
  "Gérance / propriétaires",
  "Entreprise d’ascenseurs",
  "Autre",
];

export function ContactForm() {
  const [state, action, pending] = useActionState(
    sendContactMessage,
    { ok: false } satisfies ContactState,
  );

  if (state.ok) {
    return (
      <div className="rounded-3xl border border-line bg-white p-8 sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
          Message reçu
        </p>
        <h3 className="mt-3 text-2xl font-semibold text-navy">
          Merci pour votre message.
        </h3>
        <p className="mt-3 text-[15px] leading-7 text-muted">
          L’envoi par e-mail sera connecté prochainement. Votre demande a été
          enregistrée localement pour cette démonstration. Vous pouvez aussi
          nous joindre directement à{" "}
          <a
            className="font-semibold text-logo underline-offset-4 hover:underline"
            href="mailto:info@vertical-conseil.ch"
          >
            info@vertical-conseil.ch
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form
      action={action}
      className="flex flex-col rounded-3xl border border-line bg-white p-5 shadow-[0_20px_60px_rgba(7,29,68,0.06)]"
    >
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">
        Envoyez-nous un message
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5 text-[13px] font-semibold text-navy">
          Nom *
          <input
            required
            name="nom"
            placeholder="Votre nom"
            className="h-10 rounded-2xl border border-line bg-white px-4 text-[14px] font-normal text-navy outline-none transition placeholder:text-slate focus:border-brand"
          />
        </label>
        <label className="grid gap-1.5 text-[13px] font-semibold text-navy">
          Société
          <input
            name="societe"
            placeholder="Nom de votre société"
            className="h-10 rounded-2xl border border-line bg-white px-4 text-[14px] font-normal text-navy outline-none transition placeholder:text-slate focus:border-brand"
          />
        </label>
        <label className="grid gap-1.5 text-[13px] font-semibold text-navy">
          E-mail *
          <input
            required
            type="email"
            name="email"
            placeholder="votre.email@exemple.ch"
            className="h-10 rounded-2xl border border-line bg-white px-4 text-[14px] font-normal text-navy outline-none transition placeholder:text-slate focus:border-brand"
          />
        </label>
        <label className="grid gap-1.5 text-[13px] font-semibold text-navy">
          Téléphone
          <input
            name="telephone"
            placeholder="Votre numéro de téléphone"
            className="h-10 rounded-2xl border border-line bg-white px-4 text-[14px] font-normal text-navy outline-none transition placeholder:text-slate focus:border-brand"
          />
        </label>
        <label className="grid gap-1.5 text-[13px] font-semibold text-navy sm:col-span-2">
          Sujet *
          <select
            required
            name="sujet"
            defaultValue=""
            className="h-10 rounded-2xl border border-line bg-white px-4 text-[14px] font-normal text-navy outline-none transition focus:border-brand"
          >
            <option value="" disabled>
              Sélectionnez un sujet
            </option>
            {SUBJECTS.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-[13px] font-semibold text-navy sm:col-span-2">
          Message *
          <textarea
            required
            name="message"
            rows={3}
            placeholder="Décrivez votre demande…"
            className="rounded-2xl border border-line bg-white px-4 py-2.5 text-[14px] font-normal text-navy outline-none transition placeholder:text-slate focus:border-brand"
          />
        </label>
      </div>
      {state.error ? (
        <p className="mt-3 text-[14px] font-semibold text-red-600">{state.error}</p>
      ) : null}
      <div className="mt-auto pt-4">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center rounded-full bg-logo px-7 text-[15px] font-semibold text-white transition hover:bg-navy disabled:opacity-60"
        >
          {pending ? "Envoi…" : "Envoyer le message"}
        </button>
      </div>
    </form>
  );
}
