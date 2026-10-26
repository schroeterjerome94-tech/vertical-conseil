"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

function firstEmptyField(names: string[]) {
  const required = new Set(names);
  const form = document.querySelector("form");
  if (!form) return null;
  const inputs = form.querySelectorAll<HTMLInputElement>("input[name]");
  for (const input of inputs) {
    if (!required.has(input.name)) continue;
    const value = input.value.trim();
    if (!value || (input.name === "contactEmail" && !value.includes("@"))) {
      return input;
    }
  }
  return null;
}

export function FlashNotice({
  message,
  fieldNames = [],
  tone = "error",
}: {
  message: string;
  fieldNames?: string[];
  tone?: "error" | "success";
}) {
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = window.setTimeout(() => setVisible(false), 5000);
    const scroll = window.setTimeout(() => {
      const field = firstEmptyField(fieldNames);
      field?.scrollIntoView({ behavior: "smooth", block: "center" });
      field?.focus({ preventScroll: true });
    }, 50);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(scroll);
    };
  }, [fieldNames]);

  if (!mounted || !visible) return null;

  return createPortal(
    <div
      role="status"
      className="fixed inset-x-0 top-4 z-50 flex justify-center px-4 print:hidden md:top-6"
    >
      <div
        className={`w-full max-w-xl rounded-2xl border bg-white px-5 py-4 text-[14px] font-semibold leading-6 shadow-[0_12px_32px_rgba(7,29,68,0.16)] ${
          tone === "success"
            ? "border-green/30 text-navy"
            : "border-red-200 text-red-600"
        }`}
      >
        {message}
      </div>
    </div>,
    document.body,
  );
}
