"use client";

import { useMemo, useState } from "react";

export type AssigneeAccount = {
  id: string;
  name: string;
  email: string;
  organizationName: string | null;
  phone?: string | null;
  address?: string | null;
};

function matchesQuery(item: AssigneeAccount, query: string) {
  if (!query) return true;
  const haystack = [
    item.name,
    item.email,
    item.organizationName ?? "",
    item.phone ?? "",
    item.address ?? "",
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

export function AssignmentPicker({
  gerances,
  selectedIds,
}: {
  gerances: AssigneeAccount[];
  selectedIds?: string[];
}) {
  const [query, setQuery] = useState("");
  const [chosen, setChosen] = useState(() => new Set(selectedIds ?? []));
  const needle = query.trim().toLowerCase();

  const { selected, visibleOthers } = useMemo(() => {
    const selected = gerances.filter((item) => chosen.has(item.id));
    const visibleOthers = gerances.filter(
      (item) => !chosen.has(item.id) && matchesQuery(item, needle),
    );
    return { selected, visibleOthers };
  }, [gerances, chosen, needle]);

  if (!gerances.length) {
    return (
      <p className="mt-4 text-[14px] text-muted">
        Aucun compte gérance approuvé pour le moment.
      </p>
    );
  }

  function toggle(id: string) {
    setChosen((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="mt-4 grid gap-3">
      <label className="grid gap-2 text-[13px] font-semibold text-navy">
        Rechercher un compte
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Nom, gérance ou e-mail"
          className="h-11 w-full rounded-2xl border border-line px-4 text-[15px] font-normal outline-none transition focus:border-brand"
        />
      </label>
      <p className="text-[13px] text-muted">
        {chosen.size
          ? `${chosen.size} compte${chosen.size > 1 ? "s" : ""} attribué${chosen.size > 1 ? "s" : ""}`
          : "Aucun compte attribué pour le moment."}
      </p>
      <div className="max-h-80 overflow-y-auto rounded-2xl border border-line">
        {selected.length ? (
          <div className="border-b border-line bg-soft px-3 py-2 text-[12px] font-semibold uppercase tracking-wide text-muted">
            Attribués
          </div>
        ) : null}
        {selected.map((item) => (
          <AccountRow
            key={item.id}
            item={item}
            checked
            onToggle={() => toggle(item.id)}
          />
        ))}
        {needle && visibleOthers.length ? (
          <div className="border-b border-line bg-soft px-3 py-2 text-[12px] font-semibold uppercase tracking-wide text-muted">
            Résultats
          </div>
        ) : null}
        {visibleOthers.map((item) => (
          <AccountRow
            key={item.id}
            item={item}
            checked={false}
            onToggle={() => toggle(item.id)}
          />
        ))}
        {!selected.length && !visibleOthers.length ? (
          <p className="px-4 py-3 text-[14px] text-muted">
            Aucun compte ne correspond à cette recherche.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function AccountRow({
  item,
  checked,
  onToggle,
}: {
  item: AssigneeAccount;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 border-b border-line px-4 py-3 text-[14px] last:border-b-0">
      <input
        type="checkbox"
        name="assigneeIds"
        value={item.id}
        checked={checked}
        onChange={onToggle}
      />
      <span>
        <span className="font-semibold text-navy">
          {item.organizationName?.trim() || item.name}
        </span>
        <span className="block text-[13px] text-muted">{item.email}</span>
      </span>
    </label>
  );
}
