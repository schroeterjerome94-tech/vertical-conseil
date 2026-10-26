"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import {
  sendClientRequest,
  type RequestState,
} from "@/app/espace/demandes/actions";
import type { RequestKind } from "@/lib/requests-ui";

const fieldClass =
  "h-12 w-full rounded-2xl border border-line bg-white px-4 text-[15px] font-normal outline-none transition focus:border-brand";

const DRAFT_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "street",
  "number",
  "npa",
  "locality",
  "owner",
  "access",
  "message",
  "acceptConditions",
] as const;

type Draft = Record<(typeof DRAFT_FIELDS)[number], string>;

function emptyDraft(): Draft {
  return {
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    number: "",
    npa: "",
    locality: "",
    owner: "",
    access: "",
    message: "",
    acceptConditions: "",
  };
}

function draftKey(kind: RequestKind) {
  return `vc-demande-draft:${kind}`;
}

function readDraft(kind: RequestKind): Draft {
  const empty = emptyDraft();
  try {
    const raw = sessionStorage.getItem(draftKey(kind));
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<Draft>;
    return { ...empty, ...parsed };
  } catch {
    return empty;
  }
}

export function ServiceRequestForm({
  kind,
  organization = "",
}: {
  kind: RequestKind;
  organization?: string;
}) {
  const [state, action, pending] = useActionState(
    sendClientRequest,
    { ok: false } satisfies RequestState,
  );
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  useEffect(() => {
    setDraft(readDraft(kind));
  }, [kind]);

  useEffect(() => {
    if (state.ok) sessionStorage.removeItem(draftKey(kind));
  }, [state.ok, kind]);

  function update<K extends keyof Draft>(name: K, value: Draft[K]) {
    setDraft((prev) => {
      const next = { ...prev, [name]: value };
      sessionStorage.setItem(draftKey(kind), JSON.stringify(next));
      return next;
    });
  }

  if (state.ok) {
    return (
      <div className="mt-6 rounded-2xl border border-line bg-white p-6">
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-brand">
          Demande envoyée
        </p>
        <h2 className="mt-2 text-xl font-semibold text-navy">
          Votre message a bien été envoyé.
        </h2>
        <p className="mt-2 text-[15px] leading-7 text-muted">
          Nous allons effectuer la visite de l’installation, puis nous
          prendrons contact avec vous.
        </p>
        <Link
          href="/espace"
          className="mt-5 inline-flex h-11 items-center rounded-full bg-logo px-6 text-[14px] font-semibold text-white"
        >
          Retour au tableau de bord
        </Link>
      </div>
    );
  }

  const tarifsHref = `/espace/tarifs?retour=${encodeURIComponent(`/espace/demandes/nouvelle?type=${kind}`)}`;

  return (
    <form action={action} className="mt-6 grid gap-4">
      <input type="hidden" name="kind" value={kind} />
      {state.error ? (
        <p className="text-[14px] font-semibold text-red-600">{state.error}</p>
      ) : null}
      {organization ? (
        <div>
          <p className="text-[13px] font-semibold text-navy">Société</p>
          <p className="mt-1 text-[16px] font-semibold text-navy">
            {organization}
          </p>
        </div>
      ) : null}
      <fieldset className="grid gap-4">
        <legend className="mb-1 text-[16px] font-semibold text-navy">
          Coordonnées du demandeur
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-[13px] font-semibold text-navy">
            Prénom *
            <input
              name="firstName"
              required
              autoComplete="given-name"
              placeholder="Prénom"
              value={draft.firstName}
              onChange={(event) => update("firstName", event.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="grid gap-2 text-[13px] font-semibold text-navy">
            Nom *
            <input
              name="lastName"
              required
              autoComplete="family-name"
              placeholder="Nom"
              value={draft.lastName}
              onChange={(event) => update("lastName", event.target.value)}
              className={fieldClass}
            />
          </label>
        </div>
        <label className="grid gap-2 text-[13px] font-semibold text-navy">
          Adresse e-mail *
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="prenom.nom@exemple.ch"
            value={draft.email}
            onChange={(event) => update("email", event.target.value)}
            className={fieldClass}
          />
        </label>
      </fieldset>
      <fieldset className="grid gap-4">
        <legend className="mb-1 text-[16px] font-semibold text-navy">
          Adresse de l’immeuble
        </legend>
        <div className="grid gap-4 sm:grid-cols-[1fr_6.5rem]">
          <label className="grid gap-2 text-[13px] font-semibold text-navy">
            Rue *
            <input
              name="street"
              required
              autoComplete="address-line1"
              placeholder="Rue"
              value={draft.street}
              onChange={(event) => update("street", event.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="grid gap-2 text-[13px] font-semibold text-navy">
            N° *
            <input
              name="number"
              required
              autoComplete="address-line2"
              placeholder="N°"
              value={draft.number}
              onChange={(event) => update("number", event.target.value)}
              className={fieldClass}
            />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-[7.5rem_1fr]">
          <label className="grid gap-2 text-[13px] font-semibold text-navy">
            NPA *
            <input
              name="npa"
              required
              inputMode="numeric"
              autoComplete="postal-code"
              placeholder="1000"
              value={draft.npa}
              onChange={(event) => update("npa", event.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="grid gap-2 text-[13px] font-semibold text-navy">
            Localité *
            <input
              name="locality"
              required
              autoComplete="address-level2"
              placeholder="Localité"
              value={draft.locality}
              onChange={(event) => update("locality", event.target.value)}
              className={fieldClass}
            />
          </label>
        </div>
      </fieldset>
      <label className="grid gap-2 text-[13px] font-semibold text-navy">
        Propriétaire *
        <input
          name="owner"
          required
          placeholder="Nom du propriétaire"
          value={draft.owner}
          onChange={(event) => update("owner", event.target.value)}
          className={fieldClass}
        />
      </label>
      <label className="grid gap-2 text-[13px] font-semibold text-navy">
        Accès au bâtiment *
        <textarea
          name="access"
          required
          rows={4}
          placeholder="Entrée, code, interphone, horaires…"
          value={draft.access}
          onChange={(event) => update("access", event.target.value)}
          className="min-h-28 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px] font-normal outline-none transition focus:border-brand"
        />
      </label>
      <label className="grid gap-2 text-[13px] font-semibold text-navy">
        Message
        <textarea
          name="message"
          rows={3}
          placeholder="Vous pouvez ajouter un message (facultatif)"
          value={draft.message}
          onChange={(event) => update("message", event.target.value)}
          className="min-h-24 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px] font-normal outline-none transition focus:border-brand"
        />
      </label>
      <label className="flex cursor-pointer items-start gap-3 text-[14px] font-normal leading-6 text-navy">
        <input
          type="checkbox"
          name="acceptConditions"
          value="oui"
          required
          checked={draft.acceptConditions === "oui"}
          onChange={(event) =>
            update("acceptConditions", event.target.checked ? "oui" : "")
          }
          className="mt-1 size-4 shrink-0"
        />
        <span>
          J’ai pris connaissance des{" "}
          <Link
            href={tarifsHref}
            className="font-semibold text-logo"
            onClick={(event) => event.stopPropagation()}
          >
            tarifs
          </Link>{" "}
          et j’accepte les conditions, notamment la facturation des honoraires.
        </span>
      </label>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 w-fit items-center rounded-full bg-logo px-7 text-[14px] font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Envoi…" : "Envoyer la demande"}
      </button>
    </form>
  );
}
