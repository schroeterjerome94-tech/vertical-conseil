"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import { useActionState, useEffect, useRef, useState, type DragEvent } from "react";
import {
  sendPurchaseOrder,
  type RequestState,
} from "@/app/espace/demandes/actions";
import {
  REQUEST_KIND_LABEL,
  REQUEST_KINDS,
  type RequestKind,
} from "@/lib/requests-ui";

export function PurchaseOrderPanel() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [kind, setKind] = useState<RequestKind>("tender");

  const [state, action, pending] = useActionState(
    async (prev: RequestState, formData: FormData) => {
      if (file) formData.set("purchaseOrder", file);
      return sendPurchaseOrder(prev, formData);
    },
    { ok: false } satisfies RequestState,
  );

  useEffect(() => {
    function keepInPage(event: globalThis.DragEvent) {
      event.preventDefault();
    }
    window.addEventListener("dragover", keepInPage);
    window.addEventListener("drop", keepInPage);
    return () => {
      window.removeEventListener("dragover", keepInPage);
      window.removeEventListener("drop", keepInPage);
    };
  }, []);

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function takeFile(next: File | undefined) {
    if (!next || pending) return;
    setFile(next);
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    event.stopPropagation();
    setOver(false);
    takeFile(event.dataTransfer.files[0]);
  }

  if (state.ok) {
    return (
      <article className="rounded-[28px] border border-line bg-white px-6 py-8 sm:px-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-brand">
          Bon envoyé
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-navy">
          Votre bon de commande a bien été transmis.
        </h2>
        <p className="mt-3 max-w-lg text-[15px] leading-7 text-muted">
          Nous prendrons contact dans les plus brefs délais.
        </p>
      </article>
    );
  }

  return (
    <article className="overflow-hidden rounded-[28px] border border-line bg-white">
      <form action={action} className="grid lg:grid-cols-[1.15fr_0.85fr]">
        <div className="px-6 py-7 sm:px-8">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-brand">
            Bon de commande
          </p>
          <h2 className="mt-2 max-w-md text-2xl font-semibold tracking-tight text-navy">
            Envoyez votre bon tel quel
          </h2>
          <p className="mt-3 max-w-lg text-[15px] leading-7 text-muted">
            Glissez le fichier ou joignez-le. Nous le recevons sans lecture
            automatique. Si vous n’avez pas de bon, remplissez un formulaire
            ci-dessous.
          </p>
          {file ? (
            <div className="mt-6 grid gap-4">
              <input type="hidden" name="kind" value={kind} />
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-soft px-4 py-3">
                <p className="text-[14px] text-navy">
                  Fichier : <span className="font-semibold">{file.name}</span>
                </p>
                {previewUrl ? (
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[14px] font-semibold text-logo"
                  >
                    Ouvrir pour contrôler
                  </a>
                ) : null}
              </div>
              <fieldset className="grid gap-2">
                <legend className="text-[13px] font-semibold text-navy">
                  Type de demande
                </legend>
                <div className="flex flex-wrap gap-2">
                  {REQUEST_KINDS.map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setKind(value)}
                      className={`h-10 rounded-full px-4 text-[13px] font-semibold ${
                        kind === value
                          ? "bg-logo text-white"
                          : "border border-line bg-white text-navy"
                      }`}
                    >
                      {REQUEST_KIND_LABEL[value]}
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className="grid gap-2 text-[13px] font-semibold text-navy">
                Message
                <textarea
                  name="message"
                  rows={3}
                  placeholder="Vous pouvez ajouter un message (facultatif)"
                  className="min-h-24 w-full rounded-2xl border border-line bg-white px-4 py-3 text-[15px] font-normal outline-none transition focus:border-brand"
                />
              </label>
              <label className="flex cursor-pointer items-start gap-3 text-[14px] font-normal leading-6 text-navy">
                <input
                  type="checkbox"
                  name="acceptConditions"
                  value="oui"
                  required
                  className="mt-1 size-4 shrink-0"
                />
                <span>
                  J’ai pris connaissance des{" "}
                  <Link
                    href="/espace/tarifs"
                    className="font-semibold text-logo"
                    onClick={(event) => event.stopPropagation()}
                  >
                    tarifs
                  </Link>{" "}
                  et j’accepte les conditions, notamment la facturation des
                  honoraires.
                </span>
              </label>
              {state.error ? (
                <p className="text-[14px] font-semibold text-red-600">
                  {state.error}
                </p>
              ) : null}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={pending}
                  className="inline-flex h-12 items-center rounded-full bg-logo px-7 text-[14px] font-semibold text-white disabled:opacity-60"
                >
                  {pending ? "Envoi…" : "Envoyer le bon"}
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setFile(null)}
                  className="text-[14px] font-semibold text-logo"
                >
                  Changer de fichier
                </button>
              </div>
            </div>
          ) : null}
        </div>
        <div className="flex flex-col justify-center bg-soft px-6 py-7 sm:px-8">
          <input
            id="bon-de-commande"
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            className="sr-only"
            onChange={(event) => {
              takeFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
          <label
            htmlFor="bon-de-commande"
            onDragEnter={(event) => {
              event.preventDefault();
              setOver(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = "copy";
              setOver(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              if (event.currentTarget.contains(event.relatedTarget as Node)) {
                return;
              }
              setOver(false);
            }}
            onDrop={onDrop}
            className={`flex min-h-52 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-5 py-10 text-center transition ${
              over
                ? "border-brand bg-white shadow-[0_12px_32px_rgba(7,29,68,0.08)]"
                : "border-brand/30 bg-white hover:border-brand"
            } ${pending ? "pointer-events-none opacity-60" : ""}`}
          >
            <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-soft text-logo">
              <FileText className="size-6" strokeWidth={1.5} aria-hidden />
            </span>
            <span className="mt-3 text-[15px] font-semibold text-navy">
              {over ? "Déposez le fichier" : "Glissez le bon ici"}
            </span>
            <span className="mt-1 text-[13px] leading-5 text-muted">
              PDF, JPEG ou PNG
            </span>
          </label>
          <button
            type="button"
            disabled={pending}
            onClick={() => inputRef.current?.click()}
            className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-full bg-logo px-7 text-[14px] font-semibold text-white disabled:opacity-60"
          >
            Joindre
          </button>
        </div>
      </form>
    </article>
  );
}
