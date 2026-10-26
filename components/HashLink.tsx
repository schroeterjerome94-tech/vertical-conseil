"use client";

import type { ReactNode } from "react";
import { goToSection } from "@/lib/scroll";

export function HashLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const id = href.split("#")[1] ?? "";

  return (
    <a
      href={href}
      className={className}
      onClick={(event) => goToSection(event, id)}
    >
      {children}
    </a>
  );
}
