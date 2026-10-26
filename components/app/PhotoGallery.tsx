"use client";

import { useEffect, useRef, useState } from "react";
import { formatPhotoDate, orderGalleryPhotos } from "@/lib/photos";
import type { DocumentItem } from "./DocumentSection";

function fileUrl(id: string, download = false) {
  return `/espace/fichiers/${id}${download ? "?download=1" : ""}`;
}

export function PhotoGallery({
  photos,
  coverPhotoId,
  empty = "Aucune photo pour le moment.",
  title = "Photos de l’installation",
}: {
  photos: DocumentItem[];
  coverPhotoId?: string | null;
  empty?: string;
  title?: string;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [stageSize, setStageSize] = useState({ w: 0, h: 0 });
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(
    null,
  );
  const stageRef = useRef<HTMLDivElement>(null);
  const items = orderGalleryPhotos(photos, coverPhotoId);
  const current = open !== null ? items[open] : items[0];
  const fit =
    natural.w && natural.h && stageSize.w && stageSize.h
      ? Math.min(stageSize.w / natural.w, stageSize.h / natural.h)
      : 1;
  const displayW = Math.round(natural.w * fit * scale);
  const displayH = Math.round(natural.h * fit * scale);

  function zoomBy(delta: number, around?: { x: number; y: number }) {
    setScale((value) => {
      const next = Math.min(6, Math.max(1, value + delta));
      if (next === 1) setOffset({ x: 0, y: 0 });
      else if (around) {
        const ratio = next / value;
        setOffset((pos) => ({
          x: around.x - (around.x - pos.x) * ratio,
          y: around.y - (around.y - pos.y) * ratio,
        }));
      }
      return next;
    });
  }

  function resetView() {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }

  useEffect(() => {
    resetView();
    setNatural({ w: 0, h: 0 });
  }, [open]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const update = () => {
      setStageSize({ w: stage.clientWidth, h: stage.clientHeight });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [open]);

  useEffect(() => {
    if (open === null) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(null);
      if (event.key === "+" || event.key === "=") zoomBy(0.25);
      if (event.key === "-" || event.key === "_") zoomBy(-0.25);
      if (event.key === "0") resetView();
      if (event.key === "ArrowLeft") {
        setOpen((value) => (value !== null && value > 0 ? value - 1 : value));
      }
      if (event.key === "ArrowRight") {
        setOpen((value) =>
          value !== null && value < items.length - 1 ? value + 1 : value,
        );
      }
    }
    window.addEventListener("keydown", onKey);
    const stage = stageRef.current;
    function onWheel(event: WheelEvent) {
      event.preventDefault();
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      zoomBy(event.deltaY < 0 ? 0.2 : -0.2, {
        x: event.clientX - rect.left - rect.width / 2,
        y: event.clientY - rect.top - rect.height / 2,
      });
    }
    stage?.addEventListener("wheel", onWheel, { passive: false });
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      stage?.removeEventListener("wheel", onWheel);
      document.body.style.overflow = previous;
    };
  }, [open, items.length]);

  if (!photos.length) {
    return (
      <section className="rounded-2xl border border-line bg-white p-6">
        <h2 className="text-lg font-semibold text-navy">{title}</h2>
        <p className="mt-2 text-[14px] text-muted">{empty}</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-line bg-white p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-navy">{title}</h2>
        {current ? (
          <a
            href={fileUrl(current.id, true)}
            download={current.originalName}
            className="inline-flex h-9 shrink-0 cursor-pointer items-center rounded-full border border-line px-4 text-[13px] font-semibold text-navy hover:bg-soft"
          >
            Télécharger
          </a>
        ) : null}
      </div>
      <div className="overflow-hidden">
        <button
          type="button"
          onClick={() => setOpen(0)}
          className="relative float-left mr-2 mb-2 block w-fit max-w-full cursor-pointer overflow-hidden rounded-lg"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fileUrl(items[0].id)}
            alt={items[0].originalName}
            className="max-h-80 w-auto max-w-full object-contain"
          />
          <span className="absolute bottom-1.5 left-1.5 text-[11px] text-white/70">
            {formatPhotoDate(items[0].createdAt)}
          </span>
        </button>
        {items.slice(1).map((item, index) => (
          <div key={item.id} className="float-left mb-2 mr-2 w-24">
            <button
              type="button"
              onClick={() => setOpen(index + 1)}
              className="group relative block size-24 cursor-pointer overflow-hidden rounded-lg border border-line bg-soft"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={fileUrl(item.id)}
                alt={item.originalName}
                className="size-full object-cover"
              />
              <span className="pointer-events-none absolute inset-0 bg-navy/0 transition-colors group-hover:bg-navy/20" />
            </button>
            <p className="mt-1 text-center text-[10px] text-muted">
              {formatPhotoDate(item.createdAt)}
            </p>
          </div>
        ))}
      </div>

      {open !== null && items[open] ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-black">
          <div className="pointer-events-none absolute top-0 right-0 left-0 z-30 flex items-center justify-end gap-2 p-3 sm:p-4">
            <div className="pointer-events-auto mr-auto flex items-center gap-1">
              <button
                type="button"
                onClick={() => zoomBy(-0.35)}
                className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/15 text-xl font-semibold text-white hover:bg-white/35"
                aria-label="Réduire"
              >
                −
              </button>
              <button
                type="button"
                onClick={resetView}
                className="inline-flex h-10 min-w-12 cursor-pointer items-center justify-center rounded-full bg-white/15 px-3 text-[13px] font-semibold text-white hover:bg-white/35"
              >
                {Math.round(scale * 100)}%
              </button>
              <button
                type="button"
                onClick={() => zoomBy(0.35)}
                className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/15 text-xl font-semibold text-white hover:bg-white/35"
                aria-label="Agrandir"
              >
                +
              </button>
            </div>
            <p className="pointer-events-none mr-2 text-[12px] text-white/50">
              {formatPhotoDate(items[open].createdAt)}
            </p>
            <a
              href={fileUrl(items[open].id, true)}
              download={items[open].originalName}
              className="pointer-events-auto inline-flex h-10 cursor-pointer items-center rounded-full bg-white/15 px-4 text-[13px] font-semibold text-white hover:bg-white/35"
            >
              Télécharger
            </a>
            <button
              type="button"
              onClick={() => setOpen(null)}
              className="pointer-events-auto inline-flex h-10 cursor-pointer items-center rounded-full bg-white px-4 text-[13px] font-semibold text-navy hover:bg-neutral-200 active:bg-neutral-300"
            >
              Fermer
            </button>
          </div>
          <div
            ref={stageRef}
            className="relative flex min-h-0 flex-1 cursor-grab items-center justify-center overflow-hidden active:cursor-grabbing"
            onPointerDown={(event) => {
              if (scale <= 1) return;
              event.currentTarget.setPointerCapture(event.pointerId);
              drag.current = {
                x: event.clientX,
                y: event.clientY,
                ox: offset.x,
                oy: offset.y,
              };
            }}
            onPointerMove={(event) => {
              if (!drag.current) return;
              setOffset({
                x: drag.current.ox + (event.clientX - drag.current.x),
                y: drag.current.oy + (event.clientY - drag.current.y),
              });
            }}
            onPointerUp={() => {
              drag.current = null;
            }}
            onDoubleClick={() => {
              if (scale > 1) resetView();
              else zoomBy(1);
            }}
          >
            {items.length > 1 ? (
              <button
                type="button"
                disabled={open === 0}
                onClick={() => setOpen(open - 1)}
                className="absolute top-0 bottom-0 left-4 z-10 my-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/45 text-navy hover:bg-white/70 disabled:opacity-30"
                aria-label="Précédent"
              >
                <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" aria-hidden>
                  <path
                    d="M15 5L8 12L15 19"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            ) : null}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fileUrl(items[open].id)}
              alt={items[open].originalName}
              draggable={false}
              onLoad={(event) => {
                setNatural({
                  w: event.currentTarget.naturalWidth,
                  h: event.currentTarget.naturalHeight,
                });
              }}
              className="relative max-h-none max-w-none select-none"
              style={{
                width: displayW || undefined,
                height: displayH || undefined,
                left: Math.round(offset.x),
                top: Math.round(offset.y),
              }}
            />
            {items.length > 1 ? (
              <button
                type="button"
                disabled={open === items.length - 1}
                onClick={() => setOpen(open + 1)}
                className="absolute top-0 bottom-0 right-4 z-10 my-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/45 text-navy hover:bg-white/70 disabled:opacity-30"
                aria-label="Suivant"
              >
                <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" aria-hidden>
                  <path
                    d="M9 5L16 12L9 19"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
