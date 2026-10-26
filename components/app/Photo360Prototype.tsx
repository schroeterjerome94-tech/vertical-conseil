"use client";

import type { DocumentItem } from "./DocumentSection";
import { PannellumViewer } from "./PannellumViewer";
import { UploadKindForm } from "./InstallationMedia";
import { ProLockedMedia, Viewer360Placeholder } from "./ProLockedMedia";
import { proLockedPart } from "@/lib/pro-copy";

export function Photo360Prototype({
  photos = [],
  installationId,
  canEdit = false,
  locked = false,
  asce = false,
}: {
  photos?: DocumentItem[];
  installationId?: string;
  canEdit?: boolean;
  locked?: boolean;
  asce?: boolean;
}) {
  return (
    <section className="mt-6 rounded-2xl border border-line bg-white p-6">
      <h2 className="text-lg font-semibold text-navy">Photos 360°</h2>
      {locked ? (
        <p className="mt-1 text-[14px] text-muted">{proLockedPart(asce)}</p>
      ) : (
        <p className="mt-1 text-[14px] text-muted">
          Glissez pour regarder autour, molette ou boutons pour zoomer, icône
          pour le plein écran.
        </p>
      )}

      {canEdit && installationId ? (
        <UploadKindForm
          installationId={installationId}
          kind="photo360"
          label="Ajouter une photo 360°"
          submitOnSelect
        />
      ) : null}

      {locked ? (
        <div className="mt-5">
          <ProLockedMedia framed={false} asce={asce}>
            <Viewer360Placeholder />
          </ProLockedMedia>
        </div>
      ) : photos.length ? (
        <ul className="mt-4 grid gap-5">
          {photos.map((item) => (
            <li key={item.id}>
              <div className="h-80 overflow-hidden rounded-xl bg-[#0b1b4a] sm:h-[28rem]">
                <PannellumViewer
                  panorama={`/espace/fichiers/${item.id}`}
                  title={item.originalName}
                />
              </div>
              <p className="mt-2 truncate text-[13px] font-semibold text-navy">
                {item.originalName}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-[14px] text-muted">
          Aucune photo 360° pour le moment.
        </p>
      )}
    </section>
  );
}
