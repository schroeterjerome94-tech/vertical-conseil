"use client";

import { useActionState, useState } from "react";
import {
  deleteDocument,
  setCoverPhoto,
  uploadDocument,
} from "@/app/espace/admin/installations/document-actions";
import {
  acceptForKind,
  formatFileSize,
  formatSizeLimit,
  hintForKind,
  maxBytesForKind,
} from "@/lib/documents-ui";
import { formatPhotoDate } from "@/lib/photos";
import type { DocumentItem } from "./DocumentSection";
import {
  PhotoPlaceholder,
  PlanPlaceholder,
  ProLockedMedia,
} from "./ProLockedMedia";
import { proLockedPart } from "@/lib/pro-copy";
import { Video360Viewer } from "./Video360Viewer";
import { PlanViewer } from "./PlanViewer";

const GROUPS = [
  {
    kind: "plan",
    title: "Plans",
    empty: "Aucun plan pour le moment.",
    add: "Ajouter un plan",
  },
  {
    kind: "photo",
    title: "Photos",
    empty: "Aucune photo pour le moment.",
    add: "Ajouter une photo",
  },
  {
    kind: "video",
    title: "Vidéos 360°",
    empty: "Aucune vidéo 360° pour le moment.",
    add: "Ajouter une vidéo 360°",
  },
] as const;

export function InstallationMedia({
  installationId,
  documents,
  canEdit,
  kinds,
  coverPhotoId,
  lockedKinds = [],
  asce = false,
}: {
  installationId: string;
  documents: DocumentItem[];
  canEdit: boolean;
  kinds?: readonly string[];
  coverPhotoId?: string | null;
  lockedKinds?: readonly string[];
  asce?: boolean;
}) {
  const groups = kinds
    ? GROUPS.filter((group) => kinds.includes(group.kind))
    : GROUPS;

  return (
    <div className="mt-6 grid gap-6">
      {groups.map((group) => {
        const locked = lockedKinds.includes(group.kind);
        const items = locked
          ? []
          : documents.filter((item) => item.kind === group.kind);
        return (
          <section
            key={group.kind}
            className="rounded-2xl border border-line bg-white p-6"
          >
            <h2 className="text-lg font-semibold text-navy">{group.title}</h2>
            {locked ? (
              <p className="mt-1 text-[14px] text-muted">
                {proLockedPart(asce)}
              </p>
            ) : canEdit ? (
              <p className="mt-1 text-[14px] text-muted">
                {hintForKind(group.kind)}
                {group.kind === "video"
                  ? " Cliquez pour pause ou lecture, glissez pour regarder autour."
                  : " Visibles uniquement pour les comptes Pro."}
              </p>
            ) : null}
            {canEdit && !locked ? (
              <UploadKindForm
                installationId={installationId}
                kind={group.kind}
                label={group.add}
                submitOnSelect
              />
            ) : null}
            {locked ? (
              <div className="mt-5">
                <ProLockedMedia framed={false} asce={asce}>
                  {group.kind === "plan" ? (
                    <PlanPlaceholder />
                  ) : (
                    <PhotoPlaceholder />
                  )}
                </ProLockedMedia>
              </div>
            ) : items.length ? (
              group.kind === "plan" ? (
                <FileList
                  items={items}
                  installationId={installationId}
                  canEdit={canEdit}
                />
              ) : (
                <MediaGrid
                  items={items}
                  installationId={installationId}
                  kind={group.kind}
                  coverPhotoId={coverPhotoId}
                  canEdit={canEdit}
                />
              )
            ) : (
              <p className="mt-5 text-[14px] text-muted">{group.empty}</p>
            )}
          </section>
        );
      })}
    </div>
  );
}

function FileList({
  items,
  installationId,
  canEdit,
}: {
  items: DocumentItem[];
  installationId: string;
  canEdit: boolean;
}) {
  return (
    <ul className="mt-5 grid gap-4">
      {items.map((item) => (
        <li key={item.id}>
          <PlanViewer item={item} />
          {canEdit ? (
            <div className="mt-2 flex justify-end">
              <DeleteButton
                installationId={installationId}
                documentId={item.id}
              />
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function MediaGrid({
  items,
  installationId,
  kind,
  coverPhotoId,
  canEdit,
}: {
  items: DocumentItem[];
  installationId: string;
  kind: string;
  coverPhotoId?: string | null;
  canEdit: boolean;
}) {
  return (
    <ul className={`mt-5 grid gap-4 ${kind === "video" ? "" : "sm:grid-cols-2"}`}>
      {items.map((item) => (
        <li
          key={item.id}
          className="overflow-hidden rounded-2xl border border-line"
        >
          {kind === "video" ? (
            <div className="relative h-80 w-full overflow-hidden bg-[#0b1b4a] sm:h-[28rem]">
              <Video360Viewer
                src={`/espace/fichiers/${item.id}`}
                fileName={item.originalName}
              />
            </div>
          ) : (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/espace/fichiers/${item.id}`}
                alt={item.originalName}
                className="h-48 w-full bg-soft object-cover"
              />
              {kind === "photo360" ? (
                <span className="absolute left-3 top-3 rounded-full bg-navy/80 px-3 py-1 text-[12px] font-semibold text-white">
                  360°
                </span>
              ) : null}
              {kind === "photo" && coverPhotoId === item.id ? (
                <span className="absolute left-3 top-3 rounded-full bg-logo px-3 py-1 text-[12px] font-semibold text-white">
                  Photo du bâtiment
                </span>
              ) : null}
            </div>
          )}
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-navy">
                {item.originalName}
              </p>
              <p className="text-[12px] text-muted">
                {kind === "photo"
                  ? `${formatPhotoDate(item.createdAt)} · ${formatFileSize(item.sizeBytes)}`
                  : formatFileSize(item.sizeBytes)}
              </p>
            </div>
            {canEdit ? (
            <div className="flex shrink-0 flex-col items-end gap-2">
              {kind === "photo" && coverPhotoId !== item.id ? (
                <form action={setCoverPhoto.bind(null, installationId, item.id)}>
                  <button
                    type="submit"
                    className="cursor-pointer text-[13px] font-semibold text-logo hover:text-navy"
                  >
                    Photo principale
                  </button>
                </form>
              ) : null}
              <DeleteButton installationId={installationId} documentId={item.id} />
            </div>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}

function DeleteButton({
  installationId,
  documentId,
}: {
  installationId: string;
  documentId: string;
}) {
  return (
    <form action={deleteDocument.bind(null, installationId, documentId)}>
      <button
        type="submit"
        className="text-[13px] font-semibold text-muted hover:text-navy"
      >
        Supprimer
      </button>
    </form>
  );
}

export function UploadKindForm({
  installationId,
  kind,
  label,
  submitOnSelect = false,
}: {
  installationId: string;
  kind: string;
  label: string;
  submitOnSelect?: boolean;
}) {
  const [state, action, pending] = useActionState(
    uploadDocument.bind(null, installationId),
    { error: "" },
  );
  const [fileName, setFileName] = useState("");
  const [localError, setLocalError] = useState("");
  const limit = maxBytesForKind(kind);
  const error = localError || state.error;

  return (
    <form action={action} className="mt-5 grid gap-3">
      <input type="hidden" name="kind" value={kind} />
      <div className="flex items-center gap-3">
        <label className="relative flex h-11 min-w-0 flex-1 cursor-pointer items-center gap-3 overflow-hidden rounded-full border border-line bg-white pl-1.5 pr-4">
          <span className="pointer-events-none inline-flex h-8 shrink-0 items-center rounded-full bg-soft px-3 text-[13px] font-semibold text-navy">
            {submitOnSelect ? label : "Choisir un fichier"}
          </span>
          <span className="pointer-events-none min-w-0 truncate text-[14px] text-muted">
            {pending
              ? "Envoi…"
              : fileName || (submitOnSelect ? "" : "Aucun fichier n’a été sélectionné")}
          </span>
          <input
            type="file"
            name="file"
            required
            accept={acceptForKind(kind)}
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={(event) => {
              const file = event.target.files?.[0];
              setFileName(file?.name ?? "");
              if (file && file.size > limit) {
                setLocalError(`Le fichier dépasse ${formatSizeLimit(limit)}.`);
                event.target.value = "";
                setFileName("");
                return;
              }
              setLocalError("");
              if (file && submitOnSelect) {
                event.currentTarget.form?.requestSubmit();
              }
            }}
          />
        </label>
        {submitOnSelect ? null : (
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-logo px-5 text-[14px] font-semibold text-white disabled:opacity-60"
          >
            {pending ? "Envoi…" : label}
          </button>
        )}
      </div>
      {error ? (
        <p className="text-[14px] font-semibold text-red-600">{error}</p>
      ) : null}
    </form>
  );
}
