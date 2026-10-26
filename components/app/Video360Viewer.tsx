"use client";

import { Maximize2, Minimize2, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const QUALITY = [
  ["standard", "Standard", 1024],
  ["haute", "Haute", 2048],
] as const;

type Quality = (typeof QUALITY)[number][0];

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function Video360Viewer({ src }: { src: string; fileName?: string }) {
  return <Video360Player src={src} />;
}

function Video360Player({ src }: { src: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const dirtyRef = useRef(true);
  const qualityRef = useRef(1024);
  const resizeRef = useRef<() => void>(() => undefined);
  const [playing, setPlaying] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [quality, setQuality] = useState<Quality>("standard");
  const [overlay, setOverlay] = useState<"play" | "pause">("play");
  const [overlayHidden, setOverlayHidden] = useState(false);
  const overlayTimer = useRef(0);

  useEffect(() => {
    const next = QUALITY.find(([value]) => value === quality)?.[2] ?? 1024;
    qualityRef.current = next;
    dirtyRef.current = true;
    resizeRef.current();
  }, [quality]);

  useEffect(() => {
    const wrapEl = wrapRef.current;
    const canvasEl = canvasRef.current;
    const videoEl = videoRef.current;
    if (!wrapEl || !canvasEl || !videoEl) return;

    const glContext = canvasEl.getContext("webgl", {
      alpha: false,
      antialias: false,
      powerPreference: "low-power",
    });
    if (!glContext) return;
    const wrap: HTMLDivElement = wrapEl;
    const canvas: HTMLCanvasElement = canvasEl;
    const video: HTMLVideoElement = videoEl;
    const gl: WebGLRenderingContext = glContext;

    let cancelled = false;
    let raf = 0;
    const look = { yaw: 0, pitch: 0, fov: 1.15 };
    const drag = {
      active: false,
      moved: false,
      x: 0,
      y: 0,
      yaw: 0,
      pitch: 0,
    };
    const scratch = document.createElement("canvas");
    const scratchCtx = scratch.getContext("2d", { alpha: false });

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
       uniform float uFov;
       void main() {
         vec2 uv = (gl_FragCoord.xy / uRes) * 2.0 - 1.0;
         uv.x *= uRes.x / max(uRes.y, 1.0);
         vec3 dir = normalize(vec3(uv * uFov, -1.0));
         float cy = cos(uLook.y);
         float sy = sin(uLook.y);
         float cx = cos(uLook.x);
         float sx = sin(uLook.x);
         dir = vec3(dir.x, dir.y * cy - dir.z * sy, dir.y * sy + dir.z * cy);
         dir = vec3(dir.x * cx + dir.z * sx, dir.y, -dir.x * sx + dir.z * cx);
         float lon = atan(dir.x, dir.z);
         float lat = asin(clamp(dir.y, -1.0, 1.0));
         vec2 tex = vec2(lon / 6.28318530718 + 0.5, 0.5 - lat / 3.14159265359);
         gl_FragColor = texture2D(uTex, tex);
       }`,
    );
    if (!vertex || !fragment) return;
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
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
    const uFov = gl.getUniformLocation(program, "uFov");
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 0, 255]),
    );

    let tick = 0;

    function resize() {
      const rect = wrap.getBoundingClientRect();
      const light = qualityRef.current <= 1024;
      const dpr = Math.min(window.devicePixelRatio || 1, light ? 1 : 1.5);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      dirtyRef.current = true;
    }

    function uploadFrame() {
      if (video.readyState < 2 || !scratchCtx) return;
      const max = Math.min(
        qualityRef.current,
        (gl.getParameter(gl.MAX_TEXTURE_SIZE) as number) || qualityRef.current,
      );
      const scale = Math.min(
        1,
        max / Math.max(video.videoWidth, video.videoHeight, 1),
      );
      const width = Math.max(2, Math.floor(video.videoWidth * scale));
      const height = Math.max(2, Math.floor(video.videoHeight * scale));
      if (scratch.width !== width || scratch.height !== height) {
        scratch.width = width;
        scratch.height = height;
      }
      scratchCtx.drawImage(video, 0, 0, width, height);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        scratch,
      );
    }

    function draw() {
      if (cancelled) return;
      const moving = !video.paused && !video.ended;
      const light = qualityRef.current <= 1024;
      tick += 1;
      const skip = light && moving && !dirtyRef.current && tick % 2 === 0;
      if (!skip && (moving || dirtyRef.current)) {
        if (moving || video.readyState >= 2) uploadFrame();
        gl.uniform2f(uLook, look.yaw, look.pitch);
        gl.uniform1f(uFov, look.fov);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        dirtyRef.current = false;
      }
      raf = requestAnimationFrame(draw);
    }

    function onDown(event: PointerEvent) {
      drag.active = true;
      drag.moved = false;
      drag.x = event.clientX;
      drag.y = event.clientY;
      drag.yaw = look.yaw;
      drag.pitch = look.pitch;
      canvas.setPointerCapture(event.pointerId);
    }
    function onMove(event: PointerEvent) {
      if (!drag.active) return;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) drag.moved = true;
      if (!drag.moved) return;
      look.yaw = drag.yaw - dx * 0.008;
      look.pitch = Math.max(-1.2, Math.min(1.2, drag.pitch + dy * 0.008));
      dirtyRef.current = true;
    }
    function onUp() {
      const clicked = drag.active && !drag.moved;
      drag.active = false;
      if (clicked) {
        if (video.paused) void video.play();
        else video.pause();
      }
    }
    function onWheel(event: WheelEvent) {
      event.preventDefault();
      look.fov = Math.max(0.22, Math.min(2.1, look.fov + event.deltaY * 0.002));
      dirtyRef.current = true;
    }

    function onReady() {
      setDuration(video.duration || 0);
      video.pause();
      resize();
      dirtyRef.current = true;
    }

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    video.addEventListener("loadedmetadata", onReady);
    video.addEventListener("loadeddata", () => {
      dirtyRef.current = true;
    });
    video.addEventListener("timeupdate", () => setTime(video.currentTime));
    video.addEventListener("play", () => setPlaying(true));
    video.addEventListener("pause", () => setPlaying(false));
    video.autoplay = false;
    video.muted = true;
    video.preload = "metadata";
    const observer = new ResizeObserver(resize);
    observer.observe(wrap);
    resizeRef.current = resize;
    video.crossOrigin = "use-credentials";
    video.src = src;
    video.load();
    resize();
    raf = requestAnimationFrame(draw);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("wheel", onWheel);
      video.removeEventListener("loadedmetadata", onReady);
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [src]);

  useEffect(() => {
    window.clearTimeout(overlayTimer.current);
    setOverlay(playing ? "pause" : "play");
    setOverlayHidden(false);
    overlayTimer.current = window.setTimeout(() => {
      setOverlayHidden(true);
    }, 2000);
    return () => window.clearTimeout(overlayTimer.current);
  }, [playing]);

  useEffect(() => {
    function onFullscreen() {
      setFullscreen(Boolean(document.fullscreenElement));
      resizeRef.current();
    }
    document.addEventListener("fullscreenchange", onFullscreen);
    return () => document.removeEventListener("fullscreenchange", onFullscreen);
  }, []);

  async function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) await video.play();
    else video.pause();
  }

  async function toggleFullscreen() {
    const root = rootRef.current;
    if (!root) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await root.requestFullscreen();
    } catch {
      return;
    }
  }

  return (
    <div
      ref={rootRef}
      className={
        fullscreen
          ? "fixed inset-0 z-50 flex h-screen w-screen flex-col bg-black"
          : "absolute inset-0 flex flex-col"
      }
    >
      <div ref={wrapRef} className="relative min-h-0 flex-1 bg-black">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full cursor-grab touch-none active:cursor-grabbing"
        />
        <video
          ref={videoRef}
          playsInline
          preload="metadata"
          muted={true}
          className="pointer-events-none absolute h-px w-px opacity-0"
        />
        <div
          className={`pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
            overlayHidden ? "opacity-0" : "opacity-100"
          }`}
        >
          <span className="flex size-16 items-center justify-center rounded-full bg-black/45 text-white">
            {overlay === "pause" ? (
              <Pause className="size-8 fill-white" />
            ) : (
              <Play className="ml-0.5 size-8 fill-white" />
            )}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 bg-navy px-3 py-2 text-white">
        <button
          type="button"
          onClick={() => void togglePlay()}
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/15"
          aria-label={playing ? "Pause" : "Lecture"}
        >
          {playing ? (
            <Pause className="size-4 fill-white" />
          ) : (
            <Play className="ml-0.5 size-4 fill-white" />
          )}
        </button>
        <span className="w-10 shrink-0 text-[11px] tabular-nums text-white/80">
          {formatTime(time)}
        </span>
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={time}
          onChange={(event) => {
            const video = videoRef.current;
            const next = Number(event.target.value);
            if (video) video.currentTime = next;
            setTime(next);
            dirtyRef.current = true;
          }}
          className="min-w-0 flex-1"
        />
        <span className="w-10 shrink-0 text-right text-[11px] tabular-nums text-white/80">
          {formatTime(duration)}
        </span>
        <button
          type="button"
          onClick={() => void toggleFullscreen()}
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/15"
          aria-label={fullscreen ? "Quitter le plein écran" : "Plein écran"}
        >
          {fullscreen ? (
            <Minimize2 className="size-4" />
          ) : (
            <Maximize2 className="size-4" />
          )}
        </button>
        <span className="shrink-0 text-[11px] text-white/70">Qualité</span>
        {QUALITY.map(([value, label]) => (
          <button
            key={value}
            type="button"
            title={
              value === "standard"
                ? "Plus fluide sur un ordinateur peu puissant"
                : "Image plus nette"
            }
            onClick={() => setQuality(value)}
            className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold ${
              quality === value ? "bg-logo text-white" : "bg-white/15"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
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
