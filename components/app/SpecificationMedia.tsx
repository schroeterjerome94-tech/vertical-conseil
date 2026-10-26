"use client";

import type { DocumentItem } from "./DocumentSection";
import { PannellumViewer } from "./PannellumViewer";
import { PlanViewer } from "./PlanViewer";
import { documentsForSpecification } from "@/lib/specification";

const GROUPS = [
  { kind: "photo", title: "Photos" },
  { kind: "photo360", title: "Photos 360°" },
  { kind: "video", title: "Vidéos 360°" },
] as const;

function fileUrl(id: string) {
  return `/espace/fichiers/${id}`;
}

export function SpecificationMedia({
  documents,
  mediaIds,
}: {
  documents: DocumentItem[];
  mediaIds?: string[];
}) {
  const items = documentsForSpecification(
    documents.filter((item) =>
      GROUPS.some((group) => group.kind === item.kind),
    ),
    { mediaIds },
  );
  const plans = documents.filter((item) => item.kind === "plan");
  if (!items.length && !plans.length) return null;

  return (
    <section className="rounded-2xl border border-line bg-white p-6">
      <h2 className="text-lg font-semibold text-navy">Photos, vidéos et plans</h2>
      {GROUPS.map((group) => {
        const groupItems = items.filter((item) => item.kind === group.kind);
        if (!groupItems.length) return null;
        if (group.kind === "photo360") {
          return (
            <div key={group.kind} className="mt-5">
              <h3 className="text-[14px] font-semibold text-navy">
                {group.title}
              </h3>
              <p className="mt-1 text-[13px] text-muted print:hidden">
                Glissez pour regarder autour, molette pour zoomer.
              </p>
              <ul className="mt-3 grid gap-4">
                {groupItems.map((item) => (
                  <li key={item.id}>
                    <div
                      className="h-80 overflow-hidden rounded-xl bg-[#0b1b4a] print:hidden"
                      onClick={(event) => {
                        if ((event.target as HTMLElement).closest("button")) {
                          event.preventDefault();
                        }
                      }}
                    >
                      <PannellumViewer
                        panorama={fileUrl(item.id)}
                        title={item.originalName}
                      />
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={fileUrl(item.id)}
                      alt={item.originalName}
                      className="hidden max-h-64 w-full object-contain print:block"
                    />
                    <p className="mt-2 truncate text-[13px] text-navy">
                      {item.originalName}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          );
        }
        return (
          <div key={group.kind} className="mt-5">
            <h3 className="text-[14px] font-semibold text-navy">{group.title}</h3>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {groupItems.map((item) => (
                <li
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-line"
                >
                  <div className="aspect-[4/3] bg-soft">
                    {item.kind === "video" || item.mimeType.startsWith("video/") ? (
                      <video
                        src={fileUrl(item.id)}
                        muted
                        playsInline
                        controls
                        preload="none"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={fileUrl(item.id)}
                        alt={item.originalName}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <p className="truncate px-3 py-2 text-[13px] text-navy">
                    {item.originalName}
                  </p>
                </li>
              ))}
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
