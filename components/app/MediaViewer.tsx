"use client";

import { useEffect, useRef, useState } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import { formatFileSize, kindLabel } from "@/lib/documents-ui";
import type { DocumentItem } from "./DocumentSection";
import { Video360Viewer } from "./Video360Viewer";

GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

function fileUrl(id: string) {
  return `/espace/fichiers/${id}`;
}

function isPdf(item: DocumentItem) {
  return item.mimeType.includes("pdf") || item.originalName.toLowerCase().endsWith(".pdf");
}

function isDwg(item: DocumentItem) {
  return item.kind === "plan" && !isPdf(item);
}

export function MediaViewer({
  items,
  empty = "Aucun fichier pour le moment.",
}: {
  items: DocumentItem[];
  empty?: string;
}) {
  const [index, setIndex] = useState(0);
  const current = items[index] ?? items[0];

  const itemIds = items.map((item) => item.id).join(",");
  useEffect(() => {
    setIndex(0);
  }, [itemIds]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") setIndex((value) => Math.max(0, value - 1));
      if (event.key === "ArrowRight") {
        setIndex((value) => Math.min(items.length - 1, value + 1));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [items.length]);

  if (!items.length) {
    return (
      <section className="rounded-2xl border border-line bg-white p-6">
        <p className="text-[14px] text-muted">{empty}</p>
      </section>
    );
  }

  if (!current) return null;

  const planView = current.kind === "plan" || isPdf(current);
  const lookAround = current.kind === "video" || current.kind === "photo360";

  return (
    <section
      className={`grid items-start gap-4 rounded-2xl border border-line bg-white p-4 ${
        lookAround
          ? ""
          : planView
            ? "sm:grid-cols-[minmax(0,1fr)_280px]"
            : "sm:grid-cols-[minmax(0,1fr)_220px]"
      }`}
    >
      <div className="min-w-0">
        <p className="truncate text-[15px] font-semibold text-navy">
          {current.originalName}
        </p>
        <p className="mt-1 text-[13px] text-muted">
          {kindLabel(current.kind)} · {formatFileSize(current.sizeBytes)} ·{" "}
          {index + 1} / {items.length}
        </p>
        {current.kind === "photo360" ? (
          <p className="mt-1 text-[13px] text-muted">
            Cliquez et glissez pour regarder autour. Les fichiers Insta360
            (.insp) s’ouvrent ici, sans application.
          </p>
        ) : null}
        {current.kind === "video" ? (
          <p className="mt-1 text-[13px] text-muted">
            Cliquez pour pause ou lecture, glissez pour regarder autour.
          </p>
        ) : null}
        <ul className="mt-4 grid gap-1">
          {items.map((item, itemIndex) => {
            const active = itemIndex === index;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setIndex(itemIndex)}
                  className={`w-full truncate rounded-lg px-2 py-1.5 text-left text-[13px] ${
                    active
                      ? "bg-soft font-semibold text-navy"
                      : "text-muted hover:text-navy"
                  }`}
                >
                  {item.originalName}
                </button>
              </li>
            );
          })}
        </ul>
        <a
          href={fileUrl(current.id)}
          className="mt-4 inline-flex h-9 items-center rounded-full border border-line px-4 text-[13px] font-semibold text-navy"
        >
          Télécharger
        </a>
      </div>

      <div
        className={
          lookAround
            ? "order-first w-full"
            : planView
              ? "w-full sm:w-[280px]"
              : "w-full sm:w-[220px]"
        }
      >
        <div
          className={`relative w-full overflow-hidden rounded-xl bg-[#0b1b4a] ${
            lookAround
              ? "h-80 sm:h-[28rem]"
              : planView
                ? "aspect-[4/3]"
                : "aspect-square"
          }`}
        >
          <ViewerStage item={current} />
        </div>
        {items.length > 1 ? (
          <div className="mt-2 flex justify-center gap-2">
            <button
              type="button"
              disabled={index === 0}
              onClick={() => setIndex(index - 1)}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-line text-base text-navy disabled:opacity-30"
              aria-label="Précédent"
            >
              ‹
            </button>
            <button
              type="button"
              disabled={index === items.length - 1}
              onClick={() => setIndex(index + 1)}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-line text-base text-navy disabled:opacity-30"
              aria-label="Suivant"
            >
              ›
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ViewerStage({ item }: { item: DocumentItem }) {
  if (isDwg(item)) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-3 text-center text-white">
        <p className="text-[13px] font-semibold">DWG</p>
        <p className="text-[11px] text-white/75">
          À télécharger pour l’ouvrir.
        </p>
      </div>
    );
  }

  if (isPdf(item)) {
    return <PlanPreview src={fileUrl(item.id)} />;
  }

  if (item.kind === "video" || item.mimeType.startsWith("video/")) {
    return (
      <Video360Viewer src={fileUrl(item.id)} fileName={item.originalName} />
    );
  }

  if (item.kind === "photo360") {
    return (
      <Photo360Viewer
        src={fileUrl(item.id)}
        fileName={item.originalName}
      />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center p-1">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={fileUrl(item.id)}
        alt={item.originalName}
        className="max-h-full max-w-full object-contain"
      />
    </div>
  );
}

function PlanPreview({ src }: { src: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    const box = boxRef.current;
    if (!canvas || !box) return;

    async function draw() {
      setFailed(false);
      const response = await fetch(src, { credentials: "include" });
      if (!response.ok) throw new Error("pdf");
      const data = new Uint8Array(await response.arrayBuffer());
      const pdf = await getDocument({ data }).promise;
      const page = await pdf.getPage(1);
      if (cancelled || !canvas || !box) return;

      const paint = async () => {
        if (cancelled) return;
        const boxSize = box.getBoundingClientRect();
        if (boxSize.width < 16 || boxSize.height < 16) return;
        const base = page.getViewport({ scale: 1 });
        const cssScale = Math.min(
          (boxSize.width - 8) / base.width,
          (boxSize.height - 8) / base.height,
        );
        const sharpness = Math.max(window.devicePixelRatio || 1, 2);
        const viewport = page.getViewport({
          scale: Math.max(cssScale, 0.1) * sharpness,
        });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${viewport.width / sharpness}px`;
        canvas.style.height = `${viewport.height / sharpness}px`;
        await page.render({ canvas, viewport }).promise;
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
      void pending.then((stop) => stop?.());
    };
  }, [src]);

  if (failed) {
    return (
      <embed
        src={src}
        type="application/pdf"
        className="h-full w-full bg-white"
      />
    );
  }

  return (
    <div
      ref={boxRef}
      className="flex h-full w-full items-center justify-center bg-white p-1"
    >
      <canvas ref={canvasRef} className="max-h-full max-w-full" />
    </div>
  );
}

function Photo360Viewer({ src, fileName }: { src: string; fileName: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const wrapEl = wrapRef.current;
    const canvasEl = canvasRef.current;
    if (!wrapEl || !canvasEl) return;
    const glContext = canvasEl.getContext("webgl", {
      alpha: false,
      antialias: true,
    });
    if (!glContext) {
      setFallback(true);
      return;
    }
    const wrap: HTMLDivElement = wrapEl;
    const canvas: HTMLCanvasElement = canvasEl;
    const gl: WebGLRenderingContext = glContext;

    let cancelled = false;
    let objectUrl: string | null = null;
    let raf = 0;
    const look = { yaw: 0, pitch: 0 };
    const drag = { active: false, x: 0, y: 0, yaw: 0, pitch: 0 };

    const vertex = compile(
      gl,
      gl.VERTEX_SHADER,
      `attribute vec2 a;
       void main(){ gl_Position = vec4(a, 0.0, 1.0); }`,
    );
    const fragment = compile(
      gl,
      gl.FRAGMENT_SHADER,
      `precision mediump float;
       uniform sampler2D uTex;
       uniform vec2 uRes;
       uniform vec2 uLook;
       uniform float uFisheye;
       vec2 dualFisheye(vec3 dir) {
         float right = dir.z < 0.0 ? 1.0 : 0.0;
         vec3 d = right > 0.5 ? vec3(-dir.x, dir.y, -dir.z) : dir;
         float theta = atan(length(d.xy), max(d.z, 0.0001));
         float r = theta / 1.57079632679;
         vec2 n = length(d.xy) > 0.0001 ? normalize(d.xy) : vec2(0.0);
         vec2 center = vec2(0.25 + right * 0.5, 0.5);
         return center + n * r * vec2(0.25, 0.5) * 0.96;
       }
       void main() {
         vec2 uv = (gl_FragCoord.xy / uRes) * 2.0 - 1.0;
         uv.x *= uRes.x / max(uRes.y, 1.0);
         vec3 dir = normalize(vec3(uv * 1.15, -1.0));
         float cy = cos(uLook.y);
         float sy = sin(uLook.y);
         float cx = cos(uLook.x);
         float sx = sin(uLook.x);
         dir = vec3(dir.x, dir.y * cy - dir.z * sy, dir.y * sy + dir.z * cy);
         dir = vec3(dir.x * cx + dir.z * sx, dir.y, -dir.x * sx + dir.z * cx);
         vec2 tex;
         if (uFisheye > 0.5) {
           tex = dualFisheye(dir);
         } else {
           float lon = atan(dir.x, dir.z);
           float lat = asin(clamp(dir.y, -1.0, 1.0));
           tex = vec2(lon / 6.28318530718 + 0.5, 0.5 - lat / 3.14159265359);
         }
         gl_FragColor = texture2D(uTex, tex);
       }`,
    );
    if (!vertex || !fragment) {
      setFallback(true);
      return;
    }
    const program = gl.createProgram();
    if (!program) {
      setFallback(true);
      return;
    }
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const loc = gl.getAttribLocation(program, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(program, "uRes");
    const uLook = gl.getUniformLocation(program, "uLook");
    const uFisheye = gl.getUniformLocation(program, "uFisheye");
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    function resize() {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    }

    function frame() {
      if (cancelled) return;
      gl.uniform2f(uLook, look.yaw, look.pitch);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(frame);
    }

    function onDown(event: PointerEvent) {
      drag.active = true;
      drag.x = event.clientX;
      drag.y = event.clientY;
      drag.yaw = look.yaw;
      drag.pitch = look.pitch;
      canvas.setPointerCapture(event.pointerId);
    }
    function onMove(event: PointerEvent) {
      if (!drag.active) return;
      look.yaw = drag.yaw - (event.clientX - drag.x) * 0.008;
      look.pitch = Math.max(
        -1.2,
        Math.min(1.2, drag.pitch + (event.clientY - drag.y) * 0.008),
      );
    }
    function onUp() {
      drag.active = false;
    }

    async function start() {
      setFallback(false);
      const response = await fetch(src, { credentials: "include" });
      if (!response.ok) throw new Error("360");
      const blob = await response.blob();
      if (cancelled) return;
      objectUrl = URL.createObjectURL(blob);
      const image = new Image();
      image.src = objectUrl;
      await image.decode();
      if (cancelled) return;
      const max = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;
      let source: HTMLImageElement | HTMLCanvasElement = image;
      if (image.width > max || image.height > max) {
        const scale = Math.min(max / image.width, max / image.height);
        const copy = document.createElement("canvas");
        copy.width = Math.max(1, Math.floor(image.width * scale));
        copy.height = Math.max(1, Math.floor(image.height * scale));
        copy.getContext("2d")?.drawImage(image, 0, 0, copy.width, copy.height);
        source = copy;
      }
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      const insp = fileName.toLowerCase().endsWith(".insp");
      gl.uniform1f(uFisheye, insp || isDualFisheye(image) ? 1 : 0);
      resize();
      frame();
    }

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    const observer = new ResizeObserver(resize);
    observer.observe(wrap);
    start().catch(() => {
      if (!cancelled) setFallback(true);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src, fileName]);

  if (fallback) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt="" className="h-full w-full object-contain" />
    );
  }

  return (
    <div ref={wrapRef} className="absolute inset-0 cursor-grab active:cursor-grabbing">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}

function isDualFisheye(image: HTMLImageElement) {
  const probe = document.createElement("canvas");
  probe.width = 64;
  probe.height = 32;
  const ctx = probe.getContext("2d");
  if (!ctx) return false;
  ctx.drawImage(image, 0, 0, 64, 32);
  const data = ctx.getImageData(0, 0, 64, 32).data;
  const lum = (x: number, y: number) => {
    const i = (y * 64 + x) * 4;
    return (data[i] + data[i + 1] + data[i + 2]) / 3;
  };
  const corner =
    (lum(1, 1) + lum(30, 1) + lum(1, 30) + lum(30, 30)) / 4;
  const center = lum(16, 16);
  return center > 40 && corner < center * 0.35;
}

function compile(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}
