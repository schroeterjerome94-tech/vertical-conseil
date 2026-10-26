import { TextInput } from "./DigitInput";
import type { OfferProposal } from "@/lib/offer-proposal";

const inputClass =
  "h-11 w-full rounded-2xl border border-line px-4 text-[15px] font-normal outline-none focus:border-brand";

export function OfferContactFields({
  proposal,
  fill,
  emptyRed = false,
}: {
  proposal?: OfferProposal;
  fill: boolean;
  emptyRed?: boolean;
}) {
  const lastName = proposal?.contactLastName ?? "";
  const firstName = proposal?.contactFirstName ?? "";
  const phone = proposal?.contactPhone ?? "";
  const email = proposal?.contactEmail ?? "";

  return (
    <section className="rounded-2xl border border-line bg-white p-6">
      <h2 className="text-lg font-semibold text-navy">Coordonnées</h2>
      <p className="mt-1 text-[14px] text-muted">
        Responsable qui a rempli le cahier des charges.
      </p>
      {fill ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-[12px] font-semibold text-navy">
            Nom
            <TextInput
              name="contactLastName"
              defaultValue={lastName}
              emptyRed={emptyRed}
              className={inputClass}
            />
          </label>
          <label className="grid gap-1 text-[12px] font-semibold text-navy">
            Prénom
            <TextInput
              name="contactFirstName"
              defaultValue={firstName}
              emptyRed={emptyRed}
              className={inputClass}
            />
          </label>
          <label className="grid gap-1 text-[12px] font-semibold text-navy">
            Téléphone
            <TextInput
              name="contactPhone"
              defaultValue={phone}
              emptyRed={emptyRed}
              className={inputClass}
            />
          </label>
          <label className="grid gap-1 text-[12px] font-semibold text-navy">
            E-mail
            <TextInput
              name="contactEmail"
              defaultValue={email}
              emptyRed={emptyRed}
              className={inputClass}
            />
          </label>
        </div>
      ) : (
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-[12px] font-semibold uppercase tracking-wide text-muted">
              Nom
            </dt>
            <dd className="mt-1 text-[15px] text-navy">{lastName || "—"}</dd>
          </div>
          <div>
            <dt className="text-[12px] font-semibold uppercase tracking-wide text-muted">
              Prénom
            </dt>
            <dd className="mt-1 text-[15px] text-navy">{firstName || "—"}</dd>
          </div>
          <div>
            <dt className="text-[12px] font-semibold uppercase tracking-wide text-muted">
              Téléphone
            </dt>
            <dd className="mt-1 text-[15px] text-navy">{phone || "—"}</dd>
          </div>
          <div>
            <dt className="text-[12px] font-semibold uppercase tracking-wide text-muted">
              E-mail
            </dt>
            <dd className="mt-1 text-[15px] text-navy">{email || "—"}</dd>
          </div>
        </dl>
      )}
    </section>
  );
}
