"use client";

import { useActionState } from "react";
import {
  DOCUMENT_KINDS,
  formatFileSize,
  kindLabel,
} from "@/lib/documents-ui";
import {
  deleteDocument,
  uploadDocument,
} from "@/app/espace/admin/installations/document-actions";

export type DocumentItem = {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  kind: string;
  createdAt: Date | string;
};

export function DocumentSection({
  installationId,
  documents,
  canEdit,
  title = "Documents",
  empty = "Aucun document pour le moment.",
}: {
  installationId: string;
  documents: DocumentItem[];
  canEdit: boolean;
  title?: string;
  empty?: string;
}) {
  return (
    <section className="rounded-2xl border border-line bg-white p-6">
      <h2 className="text-lg font-semibold text-navy">{title}</h2>
      <p className="mt-1 text-[14px] text-muted">
        Plans PDF ou DWG, photos, photos 360° et vidéos 360°.
      </p>

      {canEdit ? <UploadForm installationId={installationId} /> : null}

      {documents.length ? (
        <ul className="mt-5 grid gap-2">
          {documents.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold text-navy">
                  {item.originalName}
                </p>
                <p className="text-[13px] text-muted">
                  {kindLabel(item.kind)} · {formatFileSize(item.sizeBytes)} ·{" "}
                  {new Date(item.createdAt).toLocaleDateString("fr-CH")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={`/espace/fichiers/${item.id}`}
                  className="text-[14px] font-semibold text-logo"
                >
                  Télécharger
                </a>
                {canEdit ? (
                  <form action={deleteDocument.bind(null, installationId, item.id)}>
                    <button
                      type="submit"
                      className="text-[14px] font-semibold text-muted hover:text-navy"
                    >
                      Supprimer
                    </button>
                  </form>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-5 text-[14px] text-muted">{empty}</p>
      )}
    </section>
  );
}

function UploadForm({ installationId }: { installationId: string }) {
  const [state, action, pending] = useActionState(
    uploadDocument.bind(null, installationId),
    { error: "" },
  );

  return (
    <form action={action} className="mt-5 grid gap-3 sm:grid-cols-[1fr_180px_auto]">
      <input
        type="file"
        name="file"
        required
        accept=".pdf,.dwg,.jpg,.jpeg,.png,.mp4,.mov,.webm,application/pdf,image/jpeg,image/png,video/mp4,video/quicktime,video/webm"
        className="h-11 w-full rounded-2xl border border-line bg-white px-3 text-[14px] file:mr-3 file:rounded-full file:border-0 file:bg-soft file:px-3 file:py-1 file:text-[13px] file:font-semibold file:text-navy"
      />
      <select
        name="kind"
        defaultValue="autre"
        className="h-11 rounded-2xl border border-line px-4 text-[14px] outline-none focus:border-brand"
      >
        {DOCUMENT_KINDS.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 items-center justify-center rounded-full bg-logo px-5 text-[14px] font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Envoi…" : "Ajouter"}
      </button>
      {state.error ? (
        <p className="text-[14px] font-semibold text-red-600 sm:col-span-3">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
