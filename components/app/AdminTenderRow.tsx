"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { deleteTenderAction } from "@/app/espace/admin/appels-doffres/actions";
import { InstallationCaption } from "./InstallationCaption";
import { TenderStatusBadge } from "./TenderStatusBadge";

export function AdminTenderRow({
  id,
  href,
  address,
  reference,
  workType,
  deadline,
  statusLabel,
}: {
  id: string;
  href: string;
  address?: string | null;
  reference?: string | null;
  workType: string;
  deadline: string;
  statusLabel: string;
}) {
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    function onClose(event: Event) {
      if (
        event instanceof MouseEvent &&
        menuRef.current?.contains(event.target as Node)
      ) {
        return;
      }
      setMenu(null);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenu(null);
    }
    window.addEventListener("mousedown", onClose);
    window.addEventListener("scroll", onClose, true);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onClose);
      window.removeEventListener("scroll", onClose, true);
      window.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  return (
    <div
      className="col-span-4 grid grid-cols-subgrid items-center border-b border-line last:border-0 hover:bg-soft"
      onContextMenu={(event) => {
        event.preventDefault();
        const width = 176;
        const height = 44;
        const x = Math.min(event.clientX, window.innerWidth - width - 12);
        const y = Math.min(event.clientY, window.innerHeight - height - 12);
        setMenu({ x, y });
      }}
    >
      <Link href={href} className="contents">
        <span className="py-3 pl-4 pr-3">
          <InstallationCaption address={address} reference={reference} />
        </span>
        <span className="truncate px-3 py-3 text-[14px] text-muted">
          {workType}
        </span>
        <span className="truncate px-3 py-3 text-[14px] text-muted">
          {deadline}
        </span>
        <span className="flex items-center py-3 pr-4 pl-3">
          <TenderStatusBadge label={statusLabel} />
        </span>
      </Link>
      {menu ? (
        <div
          ref={menuRef}
          className="fixed z-50 w-44 overflow-hidden rounded-xl border border-line bg-white shadow-lg"
          style={{ left: menu.x, top: menu.y }}
        >
          <form action={deleteTenderAction.bind(null, id)}>
            <button
              type="submit"
              className="flex h-11 w-full cursor-pointer items-center px-4 text-[14px] font-semibold text-navy hover:bg-soft"
            >
              Supprimer
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
