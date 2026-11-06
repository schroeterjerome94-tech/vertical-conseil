"use client";

import { useLayoutEffect, useState } from "react";

import "./site-intro.css";

const STORAGE_KEY = "vc-intro-played";

export function SiteIntro() {
  const [step, setStep] = useState<
    "idle" | "open" | "close" | "ride" | "leave" | "done"
  >("idle");

  useLayoutEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const intro = new URLSearchParams(window.location.search).get("intro");
    const force = intro !== null;
    if (reduce || (!force && sessionStorage.getItem(STORAGE_KEY))) {
      setStep("done");
      return;
    }

    if (intro === "open" || intro === "close" || intro === "ride") {
      setStep(intro);
      return;
    }

    setStep("open");

    const close = window.setTimeout(() => setStep("close"), 120);
    const ride = window.setTimeout(() => setStep("ride"), 1400);
    const leave = window.setTimeout(() => setStep("leave"), 2300);
    const done = window.setTimeout(() => {
      if (!force) sessionStorage.setItem(STORAGE_KEY, "1");
      setStep("done");
    }, 3200);

    return () => {
      window.clearTimeout(close);
      window.clearTimeout(ride);
      window.clearTimeout(leave);
      window.clearTimeout(done);
    };
  }, []);

  if (step === "done" || step === "idle") return null;

  return (
    <div
      className={`site-intro site-intro--${step}`}
      role="presentation"
      aria-hidden="true"
    >
      <div className="site-intro__badge">
        <img
          src="/brand/intro-shaft.png?v=2"
          alt=""
          className="site-intro__shaft"
        />
        <div className="site-intro__car">
          <img
            src="/brand/intro-rails.png?v=1"
            alt=""
            className="site-intro__rails"
          />
          <div className="site-intro__half site-intro__half--left">
            <img
              src="/brand/intro-cabin.png?v=1"
              alt=""
              className="site-intro__cabin"
            />
          </div>
          <div className="site-intro__half site-intro__half--right">
            <img
              src="/brand/intro-cabin.png?v=1"
              alt=""
              className="site-intro__cabin"
            />
          </div>
          <svg
            className="site-intro__chevron"
            viewBox="0 0 24 14"
            aria-hidden="true"
          >
            <path d="M3 11 L12 3 L21 11" />
          </svg>
        </div>
      </div>
    </div>
  );
}
