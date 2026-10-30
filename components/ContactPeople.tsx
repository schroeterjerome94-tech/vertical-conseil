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
    <div className="relative mt-6 w-fit max-w-full">
      <div className="grid gap-3">
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
      </div>
      {revealed ? null : (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="inline-flex h-8 items-center rounded-full bg-logo px-3.5 text-[12px] font-semibold text-white shadow-[0_6px_16px_rgba(7,29,68,0.18)] transition hover:bg-navy"
          >
            Je ne suis pas un robot
          </button>
        </div>
      )}
    </div>
  );
}
