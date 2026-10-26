"use client";

import { useMemo, useState } from "react";
import { SPEC_CLAUSE_SECTIONS } from "@/lib/specification-clauses";

export function ClausePicker({ selectedIds }: { selectedIds?: string[] }) {
  const [chosen, setChosen] = useState(() => new Set(selectedIds ?? []));

  const bySection = useMemo(() => {
    return SPEC_CLAUSE_SECTIONS.map((section) => {
      const ids = section.clauses.map((clause) => clause.id);
      const count = ids.filter((id) => chosen.has(id)).length;
      return { section, ids, count, all: count === ids.length && ids.length > 0 };
    });
  }, [chosen]);

  function toggle(id: string) {
    setChosen((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSection(ids: string[], all: boolean) {
    setChosen((current) => {
      const next = new Set(current);
      for (const id of ids) {
        if (all) next.delete(id);
        else next.add(id);
      }
      return next;
    });
  }

  return (
    <div className="grid gap-6">
      <p className="text-[14px] text-muted">
        Cochez les blocs à faire apparaître dans le cahier des charges.
        {chosen.size ? ` ${chosen.size} sélectionné${chosen.size > 1 ? "s" : ""}.` : ""}
      </p>
      {bySection.map(({ section, ids, count, all }) => (
        <section
          key={section.id}
          className="rounded-2xl border border-line bg-white p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="text-lg font-semibold text-navy">{section.label}</h2>
            <button
              type="button"
              onClick={() => toggleSection(ids, all)}
              className="text-[13px] font-semibold text-logo"
            >
              {all ? "Tout décocher" : "Tout cocher"}
              {count ? ` (${count})` : ""}
            </button>
          </div>
          <div className="mt-3 grid gap-1">
            {section.clauses.map((clause) => (
              <label
                key={clause.id}
                className="flex cursor-pointer items-start gap-2 py-0.5 text-[13px] leading-5 text-navy"
              >
                <input
                  type="checkbox"
                  name="clauseIds"
                  value={clause.id}
                  checked={chosen.has(clause.id)}
                  onChange={() => toggle(clause.id)}
                  className="mt-0.5 size-3.5 shrink-0"
                />
                <span>{clause.text}</span>
              </label>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
