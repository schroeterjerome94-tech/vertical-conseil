import { OFFER_PROPOSAL_FIELDS } from "@/lib/offer-proposal";
import type { OfferProposal } from "@/lib/offer-proposal";

const inputClass =
  "h-11 w-full rounded-2xl border border-line px-4 text-[15px] font-normal outline-none focus:border-brand";

export function OfferProposalFields({
  values,
  requested,
}: {
  values?: OfferProposal;
  requested?: {
    ratedLoad?: string;
    cabinWidth?: string;
    cabinDepth?: string;
    cabinHeight?: string;
    cabinDoorWidth?: string;
    cabinDoorHeight?: string;
  };
}) {
  return (
    <div className="grid gap-4">
      <p className="text-[14px] text-muted">
        Indiquez les caractéristiques que vous proposez. Les cotes sont en
        millimètres (mm).
      </p>
      <label className="grid gap-2 text-[14px] font-semibold text-navy">
        Charge utile proposée
        {requested?.ratedLoad ? (
          <span className="font-normal text-[13px] text-muted">
            Demandé : {requested.ratedLoad}
          </span>
        ) : null}
        <input
          name="ratedLoad"
          defaultValue={values?.ratedLoad ?? ""}
          className={inputClass}
        />
      </label>
      <div>
        <p className="text-[14px] font-semibold text-navy">
          Dimensions de cabine (mm)
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {OFFER_PROPOSAL_FIELDS.filter(
            (field) => "group" in field && field.group === "cabine",
          ).map(
            (field) => (
              <label
                key={field.name}
                className="grid gap-2 text-[13px] font-semibold text-navy"
              >
                {field.label.replace(" de cabine", "")} (mm)
                <input
                  name={field.name}
                  defaultValue={values?.[field.name] ?? ""}
                  inputMode="decimal"
                  className={inputClass}
                />
              </label>
            ),
          )}
        </div>
      </div>
      <div>
        <p className="text-[14px] font-semibold text-navy">
          Dimensions de porte (mm)
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {OFFER_PROPOSAL_FIELDS.filter(
            (field) => "group" in field && field.group === "porte",
          ).map(
            (field) => (
              <label
                key={field.name}
                className="grid gap-2 text-[13px] font-semibold text-navy"
              >
                {field.label.replace(" de porte", "")} (mm)
                <input
                  name={field.name}
                  defaultValue={values?.[field.name] ?? ""}
                  inputMode="decimal"
                  className={inputClass}
                />
              </label>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
