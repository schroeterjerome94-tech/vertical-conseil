"use client";

import { useState } from "react";
import type { DocumentItem } from "./DocumentSection";
import { PlanViewer } from "./PlanViewer";

const GROUPS = [
  { kind: "photo", title: "Photos" },
  { kind: "photo360", title: "Photos 360°" },
  { kind: "video", title: "Vidéos 360°" },
] as const;

function fileUrl(id: string) {
  return `/espace/fichiers/${id}`;
}

function MediaPreview({ item }: { item: DocumentItem }) {
  if (item.kind === "video" || item.mimeType.startsWith("video/")) {
    return (
      <video
        src={fileUrl(item.id)}
        muted
        playsInline
        preload="none"
        controls
        className="h-full w-full object-cover"
        onClick={(event) => event.stopPropagation()}
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={fileUrl(item.id)}
      alt={item.originalName}
      className="h-full w-full object-cover"
    />
  );
}

export function SpecificationMediaPicker({
  documents,
  selectedIds,
}: {
  documents: DocumentItem[];
  selectedIds?: string[];
}) {
  const media = documents.filter((item) =>
    GROUPS.some((group) => group.kind === item.kind),
  );
  const plans = documents.filter((item) => item.kind === "plan");
  const [chosen, setChosen] = useState<Set<string>>(
    () => new Set(selectedIds ?? media.map((item) => item.id)),
  );

  function toggle(id: string) {
    setChosen((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (!media.length && !plans.length) {
    return (
      <section className="rounded-2xl border border-line bg-white p-6">
        <h2 className="text-lg font-semibold text-navy">
          Photos, vidéos et plans
        </h2>
        <p className="mt-2 text-[14px] text-muted">
          Aucune photo, vidéo ni plan sur la fiche. Ajoutez-les sur
          l’installation, puis revenez ici pour choisir ceux transmis avec le
          cahier des charges.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-line bg-white p-6">
      <h2 className="text-lg font-semibold text-navy">
        Photos, vidéos et plans
      </h2>
      <p className="mt-1 text-[14px] text-muted">
        Cochez les photos et les vidéos à transmettre. Les plans sont visibles
        ci-dessous.
      </p>
      {GROUPS.map((group) => {
        const items = media.filter((item) => item.kind === group.kind);
        if (!items.length) return null;
        return (
          <div key={group.kind} className="mt-5">
            <h3 className="text-[14px] font-semibold text-navy">{group.title}</h3>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => {
                const on = chosen.has(item.id);
                const isVideo =
                  item.kind === "video" || item.mimeType.startsWith("video/");
                return (
                  <li key={item.id}>
                    <div
                      className={`overflow-hidden rounded-2xl border ${
                        on ? "border-logo ring-2 ring-logo/30" : "border-line"
                      }`}
                    >
                      <div className="relative aspect-[4/3] bg-soft">
                        {isVideo ? (
                          <MediaPreview item={item} />
                        ) : (
                          <button
                            type="button"
                            onClick={() => toggle(item.id)}
                            className="h-full w-full cursor-pointer"
                          >
                            <MediaPreview item={item} />
                          </button>
                        )}
                        <span
                          className={`pointer-events-none absolute top-2 left-2 flex size-6 items-center justify-center rounded-md text-[13px] font-semibold ${
                            on
                              ? "bg-logo text-white"
                              : "border border-line bg-white/90 text-muted"
                          }`}
                        >
                          {on ? "✓" : ""}
                        </span>
                      </div>
                      <label className="flex cursor-pointer items-center gap-2 px-3 py-2">
                        <input
                          type="checkbox"
                          name="mediaIds"
                          value={item.id}
                          checked={on}
                          onChange={() => toggle(item.id)}
                          className="size-4 shrink-0 accent-[#1d4ed8]"
                        />
                        <span className="truncate text-[13px] text-navy">
                          {item.originalName}
                        </span>
                      </label>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
      {plans.length ? (
        <div className="mt-5">
          <h3 className="text-[14px] font-semibold text-navy">Plans</h3>
          <ul className="mt-3 grid gap-4">
            {plans.map((item) => (
              <li key={item.id}>
                <PlanViewer item={item} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
