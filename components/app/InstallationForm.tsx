import { INSTALLATION_FIELDS } from "@/lib/installations";
import {
  CABIN_DOOR_KINDS,
  LANDING_DOOR_KINDS,
  MACHINE_ROOM_LOCATIONS,
} from "@/lib/installation-options";
import { AssignmentPicker } from "./AssignmentPicker";
import { SelectInput } from "./DigitInput";

const GROUP_TITLE: Record<string, string> = {
  cabine: "Dimensions de cabine",
  gaine: "Dimensions de la gaine",
  porteCabine: "Porte de cabine",
  portePaliere: "Portes palières",
};

const SELECT_OPTIONS: Record<string, readonly string[]> = {
  machineRoomLocation: MACHINE_ROOM_LOCATIONS,
  doorType: CABIN_DOOR_KINDS,
  landingDoorType: LANDING_DOOR_KINDS,
};

function groupFields(fields: (typeof INSTALLATION_FIELDS)[number][]) {
  const blocks: {
    group?: string;
    fields: typeof fields;
  }[] = [];
  for (const field of fields) {
    const group = "group" in field ? field.group : undefined;
    const last = blocks.at(-1);
    if (group && last?.group === group) {
      last.fields.push(field);
    } else {
      blocks.push({ group, fields: [field] });
    }
  }
  return blocks;
}

const inputClass =
  "h-11 w-full rounded-2xl border border-line px-4 text-[15px] outline-none transition focus:border-brand";
const areaClass =
  "min-h-24 w-full rounded-2xl border border-line px-4 py-3 text-[15px] outline-none transition focus:border-brand";

type Values = Record<string, string | Date | null | undefined>;
type Field = (typeof INSTALLATION_FIELDS)[number];

function isSelect(field: Field) {
  return "input" in field && field.input === "select";
}

function isRequired(field: Field) {
  return "required" in field && field.required;
}

function fieldLabel(field: Field) {
  const required = isRequired(field) ? " *" : "";
  const unit = "unit" in field && field.unit ? ` (${field.unit})` : "";
  const mm = "group" in field && field.group && !isSelect(field) ? " (mm)" : "";
  return `${field.label}${unit}${mm}${required}`;
}

export function InstallationForm({
  action,
  values,
  gerances,
  selectedIds,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  values?: Values;
  gerances: {
    id: string;
    name: string;
    email: string;
    organizationName: string | null;
  }[];
  selectedIds?: string[];
  submitLabel: string;
}) {
  const long = new Set(["buildingAccess"]);
  const generalClass: Record<string, string> = {
    propertyManagerName: "sm:row-span-2",
  };

  function renderControl(field: Field) {
    const required = isRequired(field);
    const select = isSelect(field);
    if (select) {
      return (
        <SelectInput
          name={field.name}
          required={required}
          defaultValue={String(values?.[field.name] ?? "")}
          options={SELECT_OPTIONS[field.name] ?? []}
          className={inputClass}
        />
      );
    }
    if (long.has(field.name)) {
      return (
        <textarea
          name={field.name}
          required={required}
          defaultValue={String(values?.[field.name] ?? "")}
          className={areaClass}
        />
      );
    }
    return (
      <input
        name={field.name}
        required={required}
        defaultValue={String(values?.[field.name] ?? "")}
        inputMode={"unit" in field || "group" in field ? "decimal" : undefined}
        className={inputClass}
      />
    );
  }

  return (
    <form action={action} className="grid gap-8">
      {values?.requestId ? (
        <input type="hidden" name="requestId" value={String(values.requestId)} />
      ) : null}
      <section className="rounded-2xl border border-line bg-white p-6">
        <h2 className="text-lg font-semibold text-navy">Informations générales</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {groupFields(
            INSTALLATION_FIELDS.filter((field) => field.section === "general"),
          ).map((block) =>
            block.group ? (
              <div key={block.group} className="grid gap-3 sm:col-span-2">
                <p className="text-[16px] font-bold text-navy">
                  {GROUP_TITLE[block.group] ?? block.group}
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {block.fields.map((field) => (
                    <label
                      key={field.name}
                      className={`grid gap-2 text-[13px] font-semibold text-navy ${
                        long.has(field.name) ? "sm:col-span-2" : ""
                      }`}
                    >
                      {field.label}
                      {renderControl(field)}
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              block.fields.map((field) => (
                <label
                  key={field.name}
                  className={`grid gap-2 text-[13px] font-semibold text-navy ${
                    generalClass[field.name] ?? ""
                  }`}
                >
                  {field.label}
                  {field.name === "internalRef" ? (
                    <input
                      readOnly
                      defaultValue={String(values?.[field.name] ?? "")}
                      className={`${inputClass} cursor-default bg-soft text-muted`}
                    />
                  ) : (
                    renderControl(field)
                  )}
                </label>
              ))
            ),
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-white p-6">
        <h2 className="text-lg font-semibold text-navy">
          Informations techniques existantes
        </h2>
        <p className="mt-1 text-[13px] text-muted">
          Les cotes sont indiquées en millimètres (mm).
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {groupFields(
            INSTALLATION_FIELDS.filter((field) => field.section === "technique"),
          ).map((block) =>
            block.group ? (
              <div key={block.group} className="grid gap-3 sm:col-span-2">
                <p className="text-[16px] font-bold text-navy">
                  {GROUP_TITLE[block.group] ?? block.group}
                  {block.group === "cabine" || block.group === "gaine"
                    ? " (mm)"
                    : ""}
                  {block.fields.some(isRequired)
                    ? " *"
                    : ""}
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {block.fields.map((field) => (
                    <label
                      key={field.name}
                      className={`grid gap-2 text-[13px] font-semibold text-navy ${
                        isSelect(field) ? "sm:col-span-2" : ""
                      }`}
                    >
                      {fieldLabel(field)}
                      {renderControl(field)}
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              block.fields.map((field) => (
                <label
                  key={field.name}
                  className={`grid gap-2 text-[13px] font-semibold text-navy ${
                    long.has(field.name) ? "sm:col-span-2" : ""
                  }`}
                >
                  {fieldLabel(field)}
                  {renderControl(field)}
                </label>
              ))
            ),
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-white p-6">
        <h2 className="text-lg font-semibold text-navy">Attribution</h2>
        <p className="mt-1 text-[14px] text-muted">
          Comptes gérance / propriétaire qui pourront consulter cette fiche.
          L’adresse, l’e-mail et le téléphone affichés viennent du compte
          d’inscription.
        </p>
        <AssignmentPicker gerances={gerances} selectedIds={selectedIds} />
      </section>

      <button
        type="submit"
        className="inline-flex h-12 w-fit items-center rounded-full bg-logo px-7 text-[15px] font-semibold text-white"
      >
        {submitLabel}
      </button>
    </form>
  );
}
