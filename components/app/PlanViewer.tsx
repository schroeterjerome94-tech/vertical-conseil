"use client";

import { useEffect, useRef, useState } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import { formatFileSize } from "@/lib/documents-ui";
import type { DocumentItem } from "./DocumentSection";

GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

function fileUrl(id: string) {
  return `/espace/fichiers/${id}`;
}

export function isPdfPlan(item: DocumentItem) {
  return (
    item.mimeType.includes("pdf") ||
    item.originalName.toLowerCase().endsWith(".pdf")
  );
}

export function PlanViewer({ item }: { item: DocumentItem }) {
  const pdf = isPdfPlan(item);

  return (
    <div className="overflow-hidden rounded-2xl border border-line">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold text-navy">
            {item.originalName}
          </p>
          <p className="text-[13px] text-muted">
            {pdf ? "PDF" : "DWG"} · {formatFileSize(item.sizeBytes)}
          </p>
        </div>
        <a
          href={fileUrl(item.id)}
          className="text-[14px] font-semibold text-logo"
        >
          {pdf ? "Télécharger" : "Télécharger"}
        </a>
      </div>
      {pdf ? (
        <PdfPages src={fileUrl(item.id)} />
      ) : (
        <div className="flex h-40 items-center justify-center bg-soft px-4 text-center text-[14px] text-muted">
          Fichier DWG : téléchargez-le pour l’ouvrir.
        </div>
      )}
    </div>
  );
}

function PdfPages({ src }: { src: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [src]);

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    const box = boxRef.current;
    if (!canvas || !box) return;
    let loadingTask: ReturnType<typeof getDocument> | null = null;

    async function draw() {
      setFailed(false);
      const response = await fetch(src, { credentials: "include" });
      if (!response.ok) throw new Error("pdf");
      const data = new Uint8Array(await response.arrayBuffer());
      if (cancelled) return;
      loadingTask = getDocument({ data });
      const pdf = await loadingTask.promise;
      if (cancelled) return;
      setPages(pdf.numPages);
      const current = Math.min(Math.max(page, 1), pdf.numPages);
      const pdfPage = await pdf.getPage(current);
      if (cancelled) return;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("pdf");

      const paint = async () => {
        if (cancelled) return;
        const boxSize = box.getBoundingClientRect();
        if (boxSize.width < 16) return;
        const base = pdfPage.getViewport({ scale: 1 });
        const cssScale = (boxSize.width - 16) / base.width;
        const sharpness = Math.max(window.devicePixelRatio || 1, 2);
        const viewport = pdfPage.getViewport({
          scale: Math.max(cssScale, 0.1) * sharpness,
        });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${viewport.width / sharpness}px`;
        canvas.style.height = `${viewport.height / sharpness}px`;
        await pdfPage.render({
          canvas,
          canvasContext: context,
          viewport,
        }).promise;
      };

      await paint();
      const observer = new ResizeObserver(() => {
        void paint();
      });
      observer.observe(box);
      return () => observer.disconnect();
    }

    const pending = draw();
    pending.catch(() => {
      if (!cancelled) setFailed(true);
    });
    return () => {
      cancelled = true;
      void pending.then((stop) => stop?.()).catch(() => undefined);
      void loadingTask?.destroy().catch(() => undefined);
    };
  }, [src, page]);

  if (failed) {
    return (
      <embed
        src={src}
        type="application/pdf"
        className="h-[32rem] w-full bg-white"
      />
    );
  }

  return (
    <div>
      <div
        ref={boxRef}
        className="flex min-h-[28rem] w-full items-start justify-center overflow-auto bg-soft p-2"
      >
        <canvas ref={canvasRef} className="max-w-full bg-white shadow-sm" />
      </div>
      {pages > 1 ? (
        <div className="flex items-center justify-center gap-3 py-3">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-navy disabled:opacity-30"
            aria-label="Page précédente"
          >
            ‹
          </button>
          <p className="text-[13px] text-muted">
            {page} / {pages}
          </p>
          <button
            type="button"
            disabled={page >= pages}
            onClick={() => setPage((value) => Math.min(pages, value + 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-navy disabled:opacity-30"
            aria-label="Page suivante"
          >
            ›
          </button>
        </div>
      ) : null}
    </div>
  );
}
