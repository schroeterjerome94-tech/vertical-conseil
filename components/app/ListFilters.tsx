"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

export type FilterOption = { value: string; label: string };
export type FilterGroup = {
  name: string;
  label: string;
  exclusive?: boolean;
  options: FilterOption[];
};

export const WORK_TYPE_FILTER: FilterGroup = {
  name: "travaux",
  label: "Type de travaux",
  options: [
    { value: "remplacement", label: "Remplacement" },
    { value: "modernisation", label: "Modernisation" },
  ],
};

export const DATE_SORT_FILTER: FilterGroup = {
  name: "tri",
  label: "Échéance",
  exclusive: true,
  options: [
    { value: "croissante", label: "Date croissante" },
    { value: "decroissante", label: "Date décroissante" },
  ],
};

export const UPDATED_SORT_FILTER: FilterGroup = {
  ...DATE_SORT_FILTER,
  label: "Date",
};

function asList(value?: string | string[]) {
  return (Array.isArray(value) ? value : value ? [value] : []).filter(Boolean);
}

export function ListFilters({
  q,
  placeholder,
  groups,
  selected = {},
}: {
  q?: string;
  placeholder: string;
  groups: FilterGroup[];
  selected?: Record<string, string | string[] | undefined>;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const count = groups
    .filter((group) => !group.exclusive)
    .reduce((total, group) => total + asList(selected[group.name]).length, 0);

  useEffect(() => {
    function onPointer(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [open]);

  function submit(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    const qField = form.elements.namedItem("q");
    if (qField instanceof HTMLInputElement && !qField.value.trim()) {
      qField.disabled = true;
    }
  }

  return (
    <form
      className="mt-6 flex flex-wrap items-center gap-3"
      onSubmit={submit}
      onChange={(event) => {
        if (
          event.target instanceof HTMLInputElement &&
          (event.target.type === "checkbox" || event.target.type === "radio")
        ) {
          event.currentTarget.requestSubmit();
        }
      }}
    >
      <input
        name="q"
        defaultValue={q ?? ""}
        placeholder={placeholder}
        className="h-11 w-full max-w-md rounded-2xl border border-line px-4 text-[15px] outline-none focus:border-brand"
      />
      {groups.length ? (
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-11 items-center rounded-2xl border border-line bg-white px-4 text-[14px] font-semibold text-navy"
            aria-expanded={open}
            aria-haspopup="true"
          >
            Filtrer{count ? ` (${count})` : ""}
          </button>
          {open ? (
            <div className="absolute left-0 z-20 mt-2 w-64 rounded-2xl border border-line bg-white p-4 shadow-[0_12px_30px_rgba(7,29,68,0.1)]">
              {groups.map((group, index) => {
                const values = asList(selected[group.name]);
                return (
                  <div key={group.name} className={index ? "mt-4" : ""}>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                      {group.label}
                    </p>
                    <div className="mt-2 grid gap-2">
                      {group.options.map((option) => {
                        const current = values.at(-1);
                        const checked = group.exclusive
                          ? option.value === (current || "decroissante")
                          : values.includes(option.value);
                        return (
                          <label
                            key={option.value}
                            className="flex cursor-pointer items-center gap-2 text-[14px] text-navy"
                          >
                            <input
                              type="checkbox"
                              name={group.name}
                              value={option.value}
                              defaultChecked={checked}
                              className="size-4"
                              onChange={
                                group.exclusive
                                  ? (event) => {
                                      const form = event.currentTarget.form;
                                      if (!form) return;
                                      form
                                        .querySelectorAll<HTMLInputElement>(
                                          `input[name="${group.name}"]`,
                                        )
                                        .forEach((input) => {
                                          if (input !== event.currentTarget) {
                                            input.checked = !event.currentTarget.checked
                                              ? input.value !== option.value
                                              : false;
                                          }
                                        });
                                      if (!event.currentTarget.checked) {
                                        event.currentTarget.checked = true;
                                      }
                                    }
                                  : undefined
                              }
                            />
                            {option.label}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}
