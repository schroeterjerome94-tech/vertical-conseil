import { ProLockedValue } from "./ProLockedValue";
import { INSTALLATION_FIELDS } from "@/lib/installations";
import type { GeranceContact, InstallationRecord } from "@/lib/installations";
import { formatAreaM2, formatLxH, formatLxP } from "@/lib/dimensions";

const SECTIONS = [
  { id: "general", title: "Informations générales" },
  { id: "technique", title: "Informations techniques existantes" },
] as const;

const SKIP = new Set([
  "cabinDepth",
  "shaftDepth",
  "doorHeight",
  "doorType",
  "landingDoorHeight",
  "landingDoorType",
]);

function withUnit(value: string | null | undefined, unit: string) {
  const text = String(value ?? "").trim();
  if (!text) return "—";
  if (text.toLowerCase().includes(unit.toLowerCase())) return text;
  return `${text} ${unit}`;
}

function dimensionValue(
  item: InstallationRecord,
  kind: "cabine" | "gaine",
) {
  if (kind === "cabine") {
    const text =
      formatLxP(item.cabinWidth, item.cabinDepth) || item.cabinDimensions;
    const area = formatAreaM2(item.cabinWidth, item.cabinDepth);
    if (!text && !area) return "—";
    return area ? `${text} · ${area}` : text;
  }
  return (
    formatLxP(item.shaftWidth, item.shaftDepth) || item.shaftDimensions || "—"
  );
}

function geranceValue(
  item: InstallationRecord,
  contacts: GeranceContact[],
) {
  const contact = contacts[0];
  const lines = [
    item.propertyManagerName?.trim() ||
      contact?.organizationName?.trim() ||
      contact?.name?.trim() ||
      "",
    contact?.address?.trim() || item.propertyManagerAddress?.trim() || "",
    contact?.email?.trim() || item.propertyManagerEmail?.trim() || "",
    contact?.phone?.trim() || item.propertyManagerPhone?.trim() || "",
  ].filter(Boolean);
  for (const extra of contacts.slice(1)) {
    const more = [
      extra.organizationName?.trim() || extra.name?.trim() || "",
      extra.address?.trim() || "",
      extra.email?.trim() || "",
      extra.phone?.trim() || "",
    ].filter(Boolean);
    if (more.length) lines.push("", ...more);
  }
  return lines.join("\n") || "—";
}

function doorValue(
  width?: string | null,
  height?: string | null,
  kind?: string | null,
) {
  const size = formatLxH(width, height);
  const type = kind?.trim() || "";
  if (!size && !type) return "—";
  return [size, type].filter(Boolean).join(" · ");
}

export function InstallationView({
  item,
  geranceContacts = [],
  sections,
  lockExisting = false,
}: {
  item: InstallationRecord;
  geranceContacts?: GeranceContact[];
  sections?: (typeof SECTIONS)[number]["id"][];
  lockExisting?: boolean;
}) {
  const visible = sections
    ? SECTIONS.filter((section) => sections.includes(section.id))
    : SECTIONS;
  return (
    <div className="grid gap-6">
      {visible.map((section) => {
        const fields = INSTALLATION_FIELDS.filter(
          (field) => field.section === section.id && !SKIP.has(field.name),
        );
        return (
          <section
            key={section.id}
            className="rounded-2xl border border-line bg-white p-6"
          >
            <h2 className="text-lg font-semibold text-navy">{section.title}</h2>
            {section.id === "technique" ? (
              <p className="mt-1 text-[13px] text-muted">
                {lockExisting
                  ? "Les données existantes font partie de la version Pro."
                  : "Les cotes sont indiquées en millimètres (mm)."}
              </p>
            ) : null}
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              {fields.map((field) => {
                const grouped =
                  field.name === "propertyManagerName"
                    ? "gerance"
                    : field.name === "cabinWidth"
                    ? "cabine"
                    : field.name === "shaftWidth"
                      ? "gaine"
                      : field.name === "doorWidth"
                        ? "porteCabine"
                        : field.name === "landingDoorWidth"
                          ? "portePaliere"
                          : null;
                const unit = "unit" in field ? field.unit : undefined;
                const raw = item[field.name as keyof InstallationRecord];
                const value =
                  grouped === "gerance"
                    ? geranceValue(item, geranceContacts)
                    : grouped === "cabine"
                    ? dimensionValue(item, "cabine")
                    : grouped === "gaine"
                      ? dimensionValue(item, "gaine")
                      : grouped === "porteCabine"
                        ? doorValue(item.doorWidth, item.doorHeight, item.doorType)
                        : grouped === "portePaliere"
                          ? doorValue(
                              item.landingDoorWidth,
                              item.landingDoorHeight,
                              item.landingDoorType,
                            )
                          : unit
                            ? withUnit(String(raw ?? ""), unit)
                            : raw || "—";
                return (
                  <div
                    key={field.name}
                    className={
                      grouped === "gerance" ? "sm:row-span-2" : undefined
                    }
                  >
                    <dt className="text-[12px] font-semibold uppercase tracking-wide text-muted">
                      {grouped === "gerance"
                        ? "Gérance"
                        : grouped === "cabine"
                        ? "Dimensions de cabine"
                        : grouped === "gaine"
                          ? "Dimensions de la gaine"
                          : grouped === "porteCabine"
                            ? "Porte de cabine"
                            : grouped === "portePaliere"
                              ? "Portes palières"
                              : field.label}
                    </dt>
                    <dd className="mt-1 whitespace-pre-wrap text-[15px] text-navy">
                      <ProLockedValue
                        locked={lockExisting && section.id === "technique"}
                        value={String(value || "—")}
                      />
                    </dd>
                  </div>
                );
              })}
            </dl>
          </section>
        );
      })}
    </div>
  );
}
