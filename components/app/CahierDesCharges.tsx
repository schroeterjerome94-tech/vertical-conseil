import { DigitInput, SelectInput, TextInput } from "./DigitInput";
import { PriceWithVat } from "./PriceWithVat";
import { ProLockedValue } from "./ProLockedValue";
import { formatHtTtc } from "@/lib/money";
import { formatLxP } from "@/lib/dimensions";
import type { InstallationRecord } from "@/lib/installations";
import type { OfferProposal } from "@/lib/offer-proposal";
import { specPurposeLabel } from "@/lib/dossier";
import {
  DIMENSION_DISCLAIMER,
  parseCharacteristics,
  SPEC_FIELDS,
  type SpecificationRecord,
} from "@/lib/specification";
import { selectedClauseSections } from "@/lib/specification-clauses";
import { CABIN_DOOR_KINDS } from "@/lib/installation-options";
import { SpecificationMedia } from "./SpecificationMedia";
import type { DocumentItem } from "./DocumentSection";

const inputClass =
  "h-8 w-full max-w-[12rem] rounded-md border border-line px-2.5 text-[13px] font-normal outline-none focus:border-brand";

const MACHINE_LOCATION_CLAUSES = new Set(["trac-8", "trac-9", "trac-10"]);
const HIDDEN_TRACTION_CLAUSES = new Set(["trac-11", "trac-12"]);
const MACHINE_LOCATIONS = [
  "En tête de gaine",
  "Dans le local",
  "En fosse",
] as const;

const DOOR_KINDS = CABIN_DOOR_KINDS;

function MachineLocationSelect({
  defaultValue,
  emptyRed,
}: {
  defaultValue?: string;
  emptyRed?: boolean;
}) {
  return (
    <SelectInput
      name="machineLocation"
      defaultValue={defaultValue}
      options={MACHINE_LOCATIONS}
      emptyRed={emptyRed}
      className="h-8 w-[8.5rem] rounded-md border bg-white px-2 text-[13px] font-normal outline-none focus:border-brand"
    />
  );
}

function existingValue(item: InstallationRecord, name: string) {
  if (name === "doorType") {
    return [item.doorType, item.landingDoorType].filter(Boolean).join(" / ") || "—";
  }
  if (name === "shaft") {
    return formatLxP(item.shaftWidth, item.shaftDepth) || item.shaftDimensions || "—";
  }
  const value = item[name as keyof InstallationRecord];
  if (typeof value === "string" && value.trim()) return value;
  return "—";
}

function normSpecValue(value: string) {
  const text = value.trim().toLowerCase().replace(/\s+/g, " ");
  if (!text || text === "—" || text === "existante") return "";
  return text;
}

function nouvelleDisplay(
  installation: InstallationRecord,
  next: Record<string, string>,
  name: string,
) {
  const existing = normSpecValue(existingValue(installation, name));
  const incoming = next[name]?.trim() || "";
  const incomingNorm = normSpecValue(incoming);
  if (!incomingNorm || incomingNorm === existing) return "idem";
  return incoming;
}

const MM_LABELS: Record<string, string> = {
  cabinWidth: "Largeur",
  cabinDepth: "Profondeur",
  cabinHeight: "Hauteur",
  doorWidth: "Largeur",
  doorHeight: "Hauteur",
};

function proposalItems(
  sectionId: string,
  proposal?: OfferProposal,
): { label: string; value?: string }[] {
  if (sectionId === "cabine") {
    return [
      { label: "Largeur (mm)", value: proposal?.cabinWidth },
      { label: "Profondeur (mm)", value: proposal?.cabinDepth },
      { label: "Hauteur (mm)", value: proposal?.cabinHeight },
      { label: "Charge utile proposée", value: proposal?.ratedLoad },
    ];
  }
  if (sectionId === "portes-cabine") {
    return [
      { label: "Largeur de porte (mm)", value: proposal?.doorWidth },
      { label: "Hauteur de porte (mm)", value: proposal?.doorHeight },
      { label: "Marque de porte", value: proposal?.doorBrand },
      { label: "Type de porte", value: proposal?.doorKind },
    ];
  }
  if (sectionId === "traction") {
    return [
      { label: "Puissance (kW)", value: proposal?.power },
      { label: "Courant nominal (A)", value: proposal?.currentNom },
      { label: "Courant de démarrage (A)", value: proposal?.currentStart },
      { label: "Type de machine", value: proposal?.machineType },
      { label: "Emplacement de la machine", value: proposal?.machineLocation },
    ];
  }
  if (sectionId === "delais") {
    return [
      { label: "Délai de livraison (semaines)", value: proposal?.deliveryWeeks },
      { label: "Durée des travaux (jours ouvrables)", value: proposal?.workDays },
    ];
  }
  if (sectionId === "infos") {
    return [
      { label: "Échafaudages de montage", value: proposal?.scaffolds },
      { label: "Logement machines à modifier", value: proposal?.machineHousing },
    ];
  }
  if (sectionId === "maintenance") {
    return [
      { label: "Contrat simple — visites", value: proposal?.simpleVisits },
      {
        label: "Contrat simple — prix",
        value: formatHtTtc(proposal?.simplePriceHt),
      },
      { label: "Contrat complet — visites", value: proposal?.completeVisits },
      {
        label: "Contrat complet — prix",
        value: formatHtTtc(proposal?.completePriceHt),
      },
    ];
  }
  return [];
}

function ProposalNotes({
  items,
}: {
  items: { label: string; value?: string }[];
}) {
  const filled = items.filter((item) => item.value?.trim());
  if (!filled.length) return null;
  return (
    <div className="mt-2 grid gap-0.5 text-[13px] leading-5 text-navy">
      {filled.map((item) => (
        <p key={item.label}>
          {item.label} : {item.value}
        </p>
      ))}
    </div>
  );
}

function MaintenanceContractFields({
  title,
  text,
  visitsName,
  priceName,
  fill,
  proposal,
  emptyRed,
}: {
  title: string;
  text?: string;
  visitsName: "simpleVisits" | "completeVisits";
  priceName: "simplePriceHt" | "completePriceHt";
  fill: boolean;
  proposal?: OfferProposal;
  emptyRed?: boolean;
}) {
  const visits = proposal?.[visitsName] ?? "";
  const price = proposal?.[priceName] ?? "";
  return (
    <div className="flex h-full flex-col rounded-2xl border border-line bg-soft/40 p-5">
      <h3 className="text-[16px] font-semibold text-navy">{title}</h3>
      {text ? (
        <p className="mt-2 flex-1 text-[14px] leading-6 text-muted">
          {text
            .replace(/^(Contrat simple|Contrat complet)\s*:\s*/i, "")
            .replace(/^./, (letter) => letter.toUpperCase())}
        </p>
      ) : (
        <div className="flex-1" />
      )}
      {fill ? (
        <div className="mt-4 grid gap-3">
          <label className="grid gap-1 text-[12px] font-semibold text-navy">
            Nombre de visites
            <DigitInput
              name={visitsName}
              defaultValue={visits}
              emptyRed={emptyRed}
              maxDigits={2}
              className="h-10 w-12 rounded-xl border border-line bg-white px-2 text-center text-[14px] font-normal outline-none focus:border-brand"
            />
          </label>
          <PriceWithVat
            name={priceName}
            defaultValue={price}
            label="Prix HT (CHF)"
            emptyRed={emptyRed}
            maxWholeDigits={5}
          />
        </div>
      ) : (
        <div className="mt-4 grid gap-2 text-[14px] leading-6 text-navy">
          <p>Nombre de visites : {visits || "—"}</p>
          <p>Prix : {price ? formatHtTtc(price) : "—"}</p>
        </div>
      )}
    </div>
  );
}

function TractionFillFields({
  proposal,
  emptyRed,
}: {
  proposal?: OfferProposal;
  emptyRed?: boolean;
}) {
  const compactClass =
    "h-8 w-[4.75rem] rounded-md border border-line px-2 text-[13px] font-normal outline-none focus:border-brand";
  return (
    <div className="mt-2 grid w-fit grid-cols-2 gap-x-3 gap-y-2">
      <label className="grid gap-1 text-[12px] font-semibold text-navy">
        Type de machine
        <TextInput
          name="machineType"
          defaultValue={proposal?.machineType ?? ""}
          emptyRed={emptyRed}
          className="h-8 w-[8.5rem] rounded-md border border-line px-2 text-[13px] font-normal outline-none focus:border-brand"
        />
      </label>
      {(
        [
          ["power", "Puissance", "kW"],
          ["currentNom", "Courant nominal", "A"],
          ["currentStart", "Courant de démarrage", "A"],
        ] as const
      ).map(([name, label, unit]) => (
        <label
          key={name}
          className="grid gap-1 text-[12px] font-semibold text-navy"
        >
          {label}
          <span className="flex items-center gap-1.5">
            <DigitInput
              name={name}
              defaultValue={proposal?.[name] ?? ""}
              emptyRed={emptyRed}
              decimal
              className={compactClass}
            />
            <span className="text-[13px] font-medium text-muted">{unit}</span>
          </span>
        </label>
      ))}
    </div>
  );
}

function MmInputs({
  names,
  proposal,
  emptyRed,
}: {
  names: (keyof OfferProposal)[];
  proposal?: OfferProposal;
  emptyRed?: boolean;
}) {
  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-3">
      {names.map((name) => (
        <label
          key={name}
          className="grid gap-1 text-[12px] font-semibold text-navy"
        >
          {MM_LABELS[name] ?? name} (mm)
          <DigitInput
            name={name}
            defaultValue={proposal?.[name] ?? ""}
            emptyRed={emptyRed}
            className={inputClass}
          />
        </label>
      ))}
    </div>
  );
}

function CharacteristicsTable({
  installation,
  next,
  lockExisting,
}: {
  installation: InstallationRecord;
  next: Record<string, string>;
  lockExisting?: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-left text-[14px]">
        <thead className="border-b border-line text-[12px] uppercase tracking-wide text-muted">
          <tr>
            <th className="py-2 pr-4 font-semibold"> </th>
            <th className="py-2 pr-4 font-semibold">Existante</th>
            <th className="py-2 font-semibold">Nouvelle</th>
          </tr>
        </thead>
        <tbody>
          {SPEC_FIELDS.map((field) => {
            const displayed = nouvelleDisplay(installation, next, field.name);
            return (
              <tr key={field.name} className="border-b border-line last:border-0">
                <td className="py-3 pr-4 font-semibold text-navy">{field.label}</td>
                <td className="py-3 pr-4 text-muted">
                  <ProLockedValue
                    locked={lockExisting}
                    value={existingValue(installation, field.name)}
                  />
                </td>
                <td
                  className={
                    displayed === "idem" ? "py-3 text-muted" : "py-3 text-navy"
                  }
                >
                  {displayed}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function CahierDesCharges({
  installation,
  spec,
  documents = [],
  fill = false,
  proposal,
  incomplete = false,
  pro = true,
  proCta = false,
}: {
  installation: InstallationRecord;
  spec?: SpecificationRecord;
  documents?: DocumentItem[];
  fill?: boolean;
  proposal?: OfferProposal;
  incomplete?: boolean;
  pro?: boolean;
  proCta?: boolean;
}) {
  const next = parseCharacteristics(spec?.characteristics);
  const disclaimerLead = DIMENSION_DISCLAIMER.split("\n\n")[0];
  const notes =
    pro && proCta
      ? next.notes.replace(disclaimerLead, "").replace(/\n{3,}/g, "\n\n").trim()
      : next.notes;
  const sections = selectedClauseSections(spec?.selectedClauses ?? []);
  const heading = [
    spec?.purpose ? specPurposeLabel(spec.purpose) : "",
    installation.buildingAddress,
  ]
    .filter(Boolean)
    .join(" · ");
  const reference = installation.internalRef?.trim() || "";

  return (
    <div className="print-cdc">
      <div className="cdc-screen grid gap-6">
        {heading || reference ? (
          <div>
            {heading ? (
              <p className="text-[14px] text-muted">{heading}</p>
            ) : null}
            {reference ? (
              <p className="text-[13px] text-muted">{reference}</p>
            ) : null}
          </div>
        ) : null}
        <section className="rounded-2xl border border-line bg-white p-6">
          <h2 className="text-lg font-semibold text-navy">Caractéristiques</h2>
          <p className="mt-1 text-[13px] text-muted">
            Installation existante et nouvelle installation. Les cotes sont en
            millimètres (mm).
          </p>
          <div className="mt-4">
            <CharacteristicsTable
              installation={installation}
              next={next}
              lockExisting={!pro && proCta}
            />
          </div>
          {notes ? (
            <p className="mt-5 whitespace-pre-wrap text-[14px] leading-6 text-muted">
              {notes}
            </p>
          ) : null}
        </section>

        {sections.map((section) => (
          <section
            key={section.id}
            className="rounded-2xl border border-line bg-white p-6"
          >
            <h2 className="text-lg font-semibold text-navy">{section.label}</h2>
            {section.id === "maintenance" && section.clauses.length ? (
              <div className="mt-4 grid items-stretch gap-4 lg:grid-cols-2">
                {section.clauses
                  .filter((clause) => clause.id === "mai-1")
                  .map((clause) => (
                    <MaintenanceContractFields
                      key={clause.id}
                      title="Contrat simple"
                      text={clause.text}
                      visitsName="simpleVisits"
                      priceName="simplePriceHt"
                      fill={fill}
                      proposal={proposal}
                      emptyRed={incomplete}
                    />
                  ))}
                {section.clauses
                  .filter((clause) => clause.id === "mai-2")
                  .map((clause) => (
                    <MaintenanceContractFields
                      key={clause.id}
                      title="Contrat complet"
                      text={clause.text}
                      visitsName="completeVisits"
                      priceName="completePriceHt"
                      fill={fill}
                      proposal={proposal}
                      emptyRed={incomplete}
                    />
                  ))}
              </div>
            ) : section.clauses.length ? (
              <ul className="mt-4 grid gap-3 text-[15px] leading-7 text-navy">
                {section.clauses.map((clause) => {
                  if (HIDDEN_TRACTION_CLAUSES.has(clause.id)) return null;
                  if (MACHINE_LOCATION_CLAUSES.has(clause.id)) {
                    const first = section.clauses.find((item) =>
                      MACHINE_LOCATION_CLAUSES.has(item.id),
                    );
                    if (clause.id !== first?.id) return null;
                    const location = proposal?.machineLocation ?? "";
                    return (
                      <li key="machineLocation" className="grid gap-2">
                        <span>– Emplacement de la machine</span>
                        {fill ? (
                          <MachineLocationSelect
                            defaultValue={location}
                            emptyRed={incomplete}
                          />
                        ) : location ? (
                          <span className="text-[14px]">{location}</span>
                        ) : null}
                      </li>
                    );
                  }
                  if (clause.id === "trac-13") return null;
                  const tension = section.clauses.find(
                    (item) => item.id === "trac-13",
                  );
                  return (
                    <li
                      key={clause.id}
                      className={
                        fill && clause.id === "trac-7"
                          ? "grid gap-2"
                          : undefined
                      }
                    >
                      {clause.id === "trac-7" && tension ? (
                        <span>– {tension.text}</span>
                      ) : null}
                      <span>– {clause.text}</span>
                      {fill && clause.id === "trac-7" ? (
                        <TractionFillFields
                          proposal={proposal}
                          emptyRed={incomplete}
                        />
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-3 text-[14px] text-muted">
                Aucun élément retenu pour cette rubrique.
              </p>
            )}
            {section.id === "cabine" && fill ? (
              <>
                <p className="mt-5 text-[13px] font-semibold text-navy">
                  Dimensions de la cabine proposée
                </p>
                <MmInputs
                  names={["cabinWidth", "cabinDepth", "cabinHeight"]}
                  proposal={proposal}
                  emptyRed={incomplete}
                />
                <label className="mt-4 grid max-w-[12rem] gap-1 text-[12px] font-semibold text-navy">
                  Charge utile proposée
                  <DigitInput
                    name="ratedLoad"
                    defaultValue={proposal?.ratedLoad ?? ""}
                    emptyRed={incomplete}
                    className={inputClass}
                  />
                </label>
              </>
            ) : null}
            {section.id === "cabine" && !fill ? (
              <ProposalNotes items={proposalItems("cabine", proposal)} />
            ) : null}
            {section.id === "portes-cabine" && fill ? (
              <>
                <p className="mt-5 text-[13px] font-semibold text-navy">
                  Dimensions proposées (mm)
                </p>
                <MmInputs
                  names={["doorWidth", "doorHeight"]}
                  proposal={proposal}
                  emptyRed={incomplete}
                />
                <div className="mt-4 grid max-w-xl gap-2 sm:grid-cols-2">
                  <label className="grid gap-1 text-[12px] font-semibold text-navy">
                    Marque de porte
                    <TextInput
                      name="doorBrand"
                      defaultValue={proposal?.doorBrand ?? ""}
                      emptyRed={incomplete}
                      className={inputClass}
                    />
                  </label>
                  <label className="grid gap-1 text-[12px] font-semibold text-navy sm:col-span-2">
                    Type de porte
                    <SelectInput
                      name="doorKind"
                      defaultValue={proposal?.doorKind ?? ""}
                      options={DOOR_KINDS}
                      emptyRed={incomplete}
                      className="h-8 w-full max-w-md rounded-md border bg-white px-2 text-[13px] font-normal outline-none focus:border-brand"
                    />
                  </label>
                </div>
              </>
            ) : null}
            {section.id === "portes-cabine" && !fill ? (
              <ProposalNotes items={proposalItems("portes-cabine", proposal)} />
            ) : null}
            {section.id === "traction" && fill ? (
              <div className="mt-3 grid max-w-xl gap-2 sm:grid-cols-2">
                {section.clauses.every((clause) => clause.id !== "trac-7") ? (
                  <div className="sm:col-span-2">
                    <TractionFillFields
                      proposal={proposal}
                      emptyRed={incomplete}
                    />
                  </div>
                ) : null}
                {section.clauses.every(
                  (clause) => !MACHINE_LOCATION_CLAUSES.has(clause.id),
                ) ? (
                  <label className="grid gap-1 text-[12px] font-semibold text-navy">
                    Emplacement de la machine
                    <MachineLocationSelect
                      defaultValue={proposal?.machineLocation}
                      emptyRed={incomplete}
                    />
                  </label>
                ) : null}
              </div>
            ) : null}
            {section.id === "traction" && !fill ? (
              <ProposalNotes items={proposalItems("traction", proposal)} />
            ) : null}
            {section.id === "delais" && fill ? (
              <div className="mt-3 grid max-w-xl gap-2 sm:grid-cols-2">
                <label className="grid gap-1 text-[12px] font-semibold text-navy">
                  Délai de livraison (semaines)
                  <DigitInput
                    name="deliveryWeeks"
                    defaultValue={proposal?.deliveryWeeks ?? ""}
                    emptyRed={incomplete}
                    className={inputClass}
                  />
                </label>
                <label className="grid gap-1 text-[12px] font-semibold text-navy">
                  Durée des travaux (jours ouvrables)
                  <DigitInput
                    name="workDays"
                    defaultValue={proposal?.workDays ?? ""}
                    emptyRed={incomplete}
                    className={inputClass}
                  />
                </label>
              </div>
            ) : null}
            {section.id === "delais" && !fill ? (
              <ProposalNotes items={proposalItems("delais", proposal)} />
            ) : null}
            {section.id === "infos" && fill ? (
              <div className="mt-3 grid max-w-xl gap-2 sm:grid-cols-2">
                <label className="grid gap-1 text-[12px] font-semibold text-navy">
                  Échafaudages de montage
                  <TextInput
                    name="scaffolds"
                    defaultValue={proposal?.scaffolds ?? ""}
                    emptyRed={incomplete}
                    className={inputClass}
                  />
                </label>
                <label className="grid gap-1 text-[12px] font-semibold text-navy">
                  Logement machines à modifier
                  <TextInput
                    name="machineHousing"
                    defaultValue={proposal?.machineHousing ?? ""}
                    emptyRed={incomplete}
                    className={inputClass}
                  />
                </label>
              </div>
            ) : null}
            {section.id === "infos" && !fill ? (
              <ProposalNotes items={proposalItems("infos", proposal)} />
            ) : null}
          </section>
        ))}

        {proCta ? null : (
          <SpecificationMedia
            documents={documents}
            mediaIds={spec?.mediaIds}
          />
        )}

        {!proCta && spec?.importantNotes?.trim() ? (
          <section className="rounded-3xl bg-navy p-6 text-white">
            <h2 className="text-lg font-semibold">
              Points importants à prendre en compte
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-[15px] leading-7 text-white/85">
              {spec.importantNotes.trim()}
            </p>
          </section>
        ) : null}
      </div>
    </div>
  );
}
