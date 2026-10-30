"use client";

import { useState } from "react";

const PEOPLE = [
  {
    name: "Michel Gosteli",
    role: "Associé gérant",
    phone: "+41 79 377 80 69",
    tel: "+41793778069",
    email: "michel.gosteli@vertical-conseil.ch",
  },
  {
    name: "Jérôme Schroeter",
    role: "Associé gérant",
    phone: "+41 79 737 45 59",
    tel: "+41797374559",
    email: "jerome.schroeter@vertical-conseil.ch",
  },
] as const;

export function ContactPeople() {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="mt-6 grid w-fit max-w-full gap-3">
      {PEOPLE.map((person) => (
        <div
          key={person.email}
          className="rounded-2xl border border-line bg-white p-4"
        >
          <p className="font-semibold text-navy">{person.name}</p>
          <p className="text-[13px] text-muted">{person.role}</p>
          {revealed ? (
            <p className="mt-2 text-[14px] leading-7 text-navy">
              <a href={`tel:${person.tel}`}>{person.phone}</a>
              <br />
              <a href={`mailto:${person.email}`}>{person.email}</a>
            </p>
          ) : (
            <p
              className="mt-2 select-none text-[14px] leading-7 text-navy blur-[6px]"
              aria-hidden="true"
            >
              +41 79 000 00 00
              <br />
              contact@vertical-conseil.ch
            </p>
          )}
        </div>
      ))}
      <label className="flex cursor-pointer items-start gap-3 text-[14px] font-medium text-navy">
        <input
          type="checkbox"
          checked={revealed}
          onChange={(event) => setRevealed(event.target.checked)}
          className="mt-0.5 size-4 shrink-0 rounded border-line accent-logo"
        />
        <span>Je ne suis pas un robot</span>
      </label>
    </div>
  );
}
