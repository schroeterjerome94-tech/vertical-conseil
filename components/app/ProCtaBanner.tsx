import { unlockAsceProAction } from "@/app/espace/appels-doffres/actions";
import {
  ASCE_CDC_BASE_HT,
  ASCE_CDC_SURCHARGE_PCT,
} from "@/lib/asce-pro-pricing";
import { formatChf } from "@/lib/money";

export function ProCtaBanner({ tenderId }: { tenderId: string }) {
  return (
    <section className="rounded-2xl border border-brand bg-soft p-6 print:hidden">
      <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-brand">
        Version Pro
      </p>
      <h2 className="mt-1 text-lg font-semibold text-navy">Version Pro</h2>
      <p className="mt-2 text-[14px] leading-6 text-muted">
        Les données du cahier des charges, photos et plans s’ouvrent dès
        confirmation, sans autorisation. Tarif : {formatChf(ASCE_CDC_BASE_HT)}{" "}
        CHF HT pour une installation, puis {ASCE_CDC_SURCHARGE_PCT} % de plus à
        chaque installation supplémentaire à la même adresse. Une facture vous
        parviendra par e-mail, payable à 30 jours.
      </p>
      <form action={unlockAsceProAction.bind(null, tenderId)}>
        <button
          type="submit"
          className="mt-4 inline-flex h-11 items-center rounded-full bg-logo px-6 text-[14px] font-semibold text-white shadow-[0_8px_20px_rgba(0,41,142,0.18)] transition hover:bg-navy"
        >
          Passer à la version Pro
        </button>
      </form>
    </section>
  );
}
