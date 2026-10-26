import type { HistoryEvent } from "@/lib/history";

export function HistorySection({ events }: { events: HistoryEvent[] }) {
  return (
    <section className="mt-6 rounded-2xl border border-line bg-white p-6">
      <h2 className="text-lg font-semibold text-navy">Historique</h2>
      {events.length ? (
        <ol className="mt-4 grid gap-3">
          {events.map((event) => (
            <li key={event.id} className="flex flex-wrap gap-x-3 text-[14px]">
              <span className="shrink-0 text-muted">
                {event.at.toLocaleDateString("fr-CH")}
              </span>
              <span className="text-navy">{event.label}</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-3 text-[14px] text-muted">
          Aucun événement enregistré pour le moment.
        </p>
      )}
    </section>
  );
}