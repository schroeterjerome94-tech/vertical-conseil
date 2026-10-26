import { ClausePicker } from "./ClausePicker";
import { CABIN_FIELDS, SPEC_FIELDS } from "@/lib/specification";

const inputClass =
  "h-11 w-full rounded-2xl border border-line px-4 text-[15px] font-normal outline-none transition focus:border-brand";
const areaClass =
  "min-h-28 w-full rounded-2xl border border-line px-4 py-3 text-[15px] font-normal outline-none transition focus:border-brand";

export function SpecificationForm({
  values,
  selectedClauses,
}: {
  values: Record<string, string>;
  selectedClauses?: string[];
}) {
  const long = new Set(["floorDesignation", "doorType", "ratedLoad"]);

  return (
    <>
      <section className="rounded-2xl border border-line bg-white p-6">
        <h2 className="text-lg font-semibold text-navy">
          Caractéristiques de la nouvelle installation
        </h2>
        <p className="mt-1 text-[13px] text-muted">
          Les cotes sont indiquées en millimètres (mm). Course, cage,
          dépassement supérieur et fosse peuvent rester « existante » si elles
          sont à vérifier sur place.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {SPEC_FIELDS.map((field) => (
            <label
              key={field.name}
              className={`grid gap-2 text-[13px] font-semibold text-navy ${
                long.has(field.name) ? "sm:col-span-2" : ""
              }`}
            >
              {field.label}
              <input
                name={field.name}
                defaultValue={values[field.name] ?? ""}
                className={inputClass}
              />
            </label>
          ))}
          <label className="grid gap-2 text-[13px] font-semibold text-navy sm:col-span-2">
            Notes
            <textarea
              name="notes"
              defaultValue={values.notes ?? ""}
              className={areaClass}
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-white p-6">
        <h2 className="text-lg font-semibold text-navy">Dimensions de la cabine</h2>
        <p className="mt-1 text-[13px] text-muted">
          Cotes en millimètres (mm). L’entrée de cabine et le décrochement des
          portes ne font pas partie de la profondeur.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {CABIN_FIELDS.filter((field) =>
            ["cabinWidth", "cabinDepth", "cabinHeight"].includes(field.name),
          ).map((field) => (
            <label
              key={field.name}
              className="grid gap-2 text-[13px] font-semibold text-navy"
            >
              {field.label} (mm)
              <input
                name={field.name}
                defaultValue={values[field.name] ?? ""}
                inputMode="decimal"
                className={inputClass}
              />
            </label>
          ))}
        </div>
        <p className="mt-5 text-[13px] font-semibold text-navy">
          Portes de cabine (mm)
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {CABIN_FIELDS.filter((field) =>
            ["cabinDoorWidth", "cabinDoorHeight"].includes(field.name),
          ).map((field) => (
            <label
              key={field.name}
              className="grid gap-2 text-[13px] font-semibold text-navy"
            >
              {field.label} (mm)
              <input
                name={field.name}
                defaultValue={values[field.name] ?? ""}
                inputMode="decimal"
                className={inputClass}
              />
            </label>
          ))}
        </div>
      </section>

      <ClausePicker selectedIds={selectedClauses} />
    </>
  );
}
