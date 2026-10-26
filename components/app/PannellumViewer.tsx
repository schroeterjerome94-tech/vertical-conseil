"use client";

import { useEffect, useRef } from "react";

type Viewer = { destroy: () => void };

declare global {
  interface Window {
    pannellum?: {
      viewer: (container: HTMLElement, config: Record<string, unknown>) => Viewer;
    };
  }
}

let pannellumLoading: Promise<void> | null = null;

function loadPannellum() {
  if (window.pannellum) return Promise.resolve();
  if (pannellumLoading) return pannellumLoading;
  pannellumLoading = new Promise((resolve, reject) => {
    const cssId = "pannellum-css";
    if (!document.getElementById(cssId)) {
      const link = document.createElement("link");
      link.id = cssId;
      link.rel = "stylesheet";
      link.href = "/vendor/pannellum/pannellum.css";
      document.head.appendChild(link);
    }
    const script = document.createElement("script");
    script.src = "/vendor/pannellum/pannellum.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Pannellum"));
    document.head.appendChild(script);
  });
  return pannellumLoading;
}

export function PannellumViewer({
  panorama,
  title,
}: {
  panorama: string;
  title?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    let viewer: Viewer | null = null;
    let cancelled = false;

    loadPannellum()
      .then(() => {
        if (cancelled || !window.pannellum || !container.isConnected) return;
        viewer = window.pannellum.viewer(container, {
          type: "equirectangular",
          panorama,
          autoLoad: true,
          autoRotate: 0,
          mouseZoom: true,
          draggable: true,
          showFullscreenCtrl: true,
          showZoomCtrl: true,
          compass: false,
          hfov: 100,
          minHfov: 50,
          maxHfov: 120,
          title,
          strings: {
            loadButtonLabel: "Cliquez pour afficher<br>la photo 360°",
            loadingLabel: "Chargement…",
            bylineLabel: "par %s",
            noPanoramaError: "Cette photo 360° n’a pas pu être chargée.",
            fileAccessError: "Le fichier n’a pas pu être lu : %s",
            malformedURLError: "Adresse de fichier incorrecte.",
            iOS8WebGLError:
              "Ce navigateur ne peut pas afficher la photo 360°.",
            genericWebGLError:
              "Ce navigateur ne peut pas afficher la photo 360°.",
            textureSizeError:
              "Cette photo 360° est trop grande pour ce navigateur.",
            unknownError: "Une erreur est survenue.",
          },
        });
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
      viewer?.destroy();
      container.replaceChildren();
    };
  }, [panorama, title]);

  return <div ref={ref} className="h-full w-full" />;
}
