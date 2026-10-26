import Link from "next/link";
import type { ReactNode } from "react";

export function ProLockedMedia({
  children,
  framed = true,
  asce = false,
}: {
  children: ReactNode;
  framed?: boolean;
  asce?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden ${
        framed ? "rounded-2xl border border-line bg-white p-6" : ""
      }`}
    >
      <div className="pointer-events-none select-none blur-[14px]" aria-hidden>
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-white/35 p-4">
        <Link
          href="/espace/formule"
          className="inline-flex h-11 items-center rounded-full bg-logo px-6 text-[14px] font-semibold text-white shadow-[0_8px_20px_rgba(0,41,142,0.18)] transition hover:bg-navy"
        >
          {asce ? "Version Pro" : "Abonnement Pro"}
        </Link>
      </div>
    </div>
  );
}

export function PhotoPlaceholder() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-40 overflow-hidden rounded-2xl border border-line bg-soft"
        />
      ))}
    </div>
  );
}

export function Viewer360Placeholder() {
  return <div className="h-80 rounded-xl bg-[#0b1b4a]" />;
}

export function PlanPlaceholder() {
  return (
    <ul className="grid gap-2">
      {Array.from({ length: 3 }).map((_, index) => (
        <li
          key={index}
          className="h-14 rounded-xl border border-line bg-soft"
        />
      ))}
    </ul>
  );
}
