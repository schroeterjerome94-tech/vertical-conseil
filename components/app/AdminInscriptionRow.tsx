"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { deleteAccountAction } from "@/app/espace/admin/actions";

export function AdminInscriptionRow({
  userId,
  canDelete,
  children,
}: {
  userId: string;
  canDelete: boolean;
  children: ReactNode;
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
    <tr
      className="border-b border-line last:border-0 hover:bg-soft"
      onContextMenu={(event) => {
        if (!canDelete) return;
        event.preventDefault();
        const width = 176;
        const height = 44;
        const x = Math.min(event.clientX, window.innerWidth - width - 12);
        const y = Math.min(event.clientY, window.innerHeight - height - 12);
        setMenu({ x, y });
      }}
    >
      {children}
      {menu
        ? createPortal(
            <div
              ref={menuRef}
              className="fixed z-50 w-44 overflow-hidden rounded-xl border border-line bg-white shadow-lg"
              style={{ left: menu.x, top: menu.y }}
            >
              <form action={deleteAccountAction.bind(null, userId)}>
                <button
                  type="submit"
                  className="flex h-11 w-full cursor-pointer items-center px-4 text-[14px] font-semibold text-navy hover:bg-soft"
                >
                  Supprimer
                </button>
              </form>
            </div>,
            document.body,
          )
        : null}
    </tr>
  );
}
