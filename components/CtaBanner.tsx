"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { scrollToId } from "@/lib/scroll";

export function CtaBanner({
  title,
  subtitle,
  href = "/contact",
  action = "Nous contacter →",
  className = "page-wrap pb-16",
}: {
  title: string;
  subtitle?: string;
  href?: string;
  action?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="flex flex-col items-center justify-between gap-6 rounded-2xl bg-soft px-8 py-8 text-center sm:flex-row sm:text-left">
        <div>
          <h2 className="text-xl font-bold text-navy sm:text-[22px]">{title}</h2>
          {subtitle ? (
            <p className="mt-1 max-w-xl text-[15px] leading-6 text-muted">
              {subtitle}
            </p>
          ) : null}
        </div>
        <Link
          href={href}
          onClick={(event: MouseEvent<HTMLAnchorElement>) => {
            const id = href.split("#")[1];
            if (!id) return;
            const node = document.getElementById(id);
            if (!node) return;
            event.preventDefault();
            scrollToId(id);
            window.history.replaceState(null, "", `/#${id}`);
          }}
          className="inline-flex shrink-0 rounded-full bg-logo px-7 py-2.5 text-[15px] font-semibold text-white transition hover:bg-navy"
        >
          {action}
        </Link>
      </div>
    </div>
  );
}
