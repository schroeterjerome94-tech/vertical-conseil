import "server-only";

import { and, desc, eq, or, like } from "drizzle-orm";
import { db } from "./db";
import {
  auditLog,
  elevatorInstallation,
  installationAssignment,
  user,
} from "./db/schema";
import type { UserRole } from "./constants";
import { dateSortDirection } from "./list-sort";
import { parseExtraFields } from "./norms";
import { displayAddress } from "./installation-display";

export const INSTALLATION_FIELDS = [
  { name: "buildingAddress", label: "Adresse du bâtiment", section: "general" },
  { name: "internalRef", label: "Référence interne", section: "general" },
  { name: "ownerName", label: "Propriétaire", section: "general" },
  { name: "propertyManagerName", label: "Gérance", section: "general" },
  { name: "buildingAccess", label: "Accès au bâtiment", section: "general" },
  { name: "elevatorType", label: "Type d’installation", section: "technique", required: true },
  { name: "manufacturer", label: "Marque", section: "technique", required: true },
  { name: "installationNumber", label: "N° installation", section: "technique", required: true },
  { name: "currentContractor", label: "Ascensoriste actuel", section: "technique", required: true },
  { name: "controlType", label: "Manœuvre", section: "technique", required: true },
  { name: "tractionType", label: "Entraînement", section: "technique", required: true },
  { name: "commissioningYear", label: "Année de construction", section: "technique", required: true },
  { name: "ratedLoad", label: "Charge utile", section: "technique", unit: "kg", required: true },
  { name: "ratedSpeed", label: "Vitesse", section: "technique", unit: "m/s", required: true },
  { name: "stopCount", label: "Arrêts", section: "technique", required: true },
  { name: "landingAccess", label: "Accès", section: "technique", required: true },
  {
    name: "machineRoomLocation",
    label: "Emplacement du local machines",
    section: "technique",
    input: "select",
    required: true,
  },
  { name: "cabinWidth", label: "Largeur", section: "technique", group: "cabine", required: true },
  { name: "cabinDepth", label: "Profondeur", section: "technique", group: "cabine", required: true },
  { name: "doorWidth", label: "Largeur", section: "technique", group: "porteCabine" },
  { name: "doorHeight", label: "Hauteur", section: "technique", group: "porteCabine" },
  { name: "doorType", label: "Type de porte", section: "technique", group: "porteCabine", input: "select" },
  { name: "landingDoorWidth", label: "Largeur", section: "technique", group: "portePaliere" },
  { name: "landingDoorHeight", label: "Hauteur", section: "technique", group: "portePaliere" },
  {
    name: "landingDoorType",
    label: "Type de porte",
    section: "technique",
    group: "portePaliere",
    input: "select",
  },
  { name: "shaftWidth", label: "Largeur", section: "technique", group: "gaine" },
  { name: "shaftDepth", label: "Profondeur", section: "technique", group: "gaine" },
  { name: "travel", label: "Course", section: "technique", group: "gaine" },
  { name: "shaftConstruction", label: "Construction de la cage", section: "technique" },
  { name: "headroom", label: "Dépassement supérieur (mm)", section: "technique" },
  { name: "pitDepth", label: "Profondeur de fosse (mm)", section: "technique" },
  { name: "implantation", label: "Implantation", section: "technique" },
  { name: "safetyInfo", label: "Informations de sécurité", section: "securite" },
  { name: "modernizations", label: "Modernisations effectuées", section: "securite" },
] as const;

export type InstallationFieldName = (typeof INSTALLATION_FIELDS)[number]["name"];

export type InstallationRecord = typeof elevatorInstallation.$inferSelect;

function emptyToNull(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length ? text : null;
}

export async function nextInternalRef() {
  const rows = await db
    .select({ internalRef: elevatorInstallation.internalRef })
    .from(elevatorInstallation);
  let max = 0;
  for (const row of rows) {
    const match = String(row.internalRef ?? "").match(/(\d+)\s*$/);
    if (match) max = Math.max(max, Number(match[1]));
  }
  return String(max + 1).padStart(4, "0");
}

export function parseInstallationForm(formData: FormData) {
  const data: Record<InstallationFieldName, string | null> = {
    internalRef: null,
    buildingAddress: emptyToNull(formData.get("buildingAddress")),
    ownerName: emptyToNull(formData.get("ownerName")),
    propertyManagerName: emptyToNull(formData.get("propertyManagerName")),
    installationNumber: emptyToNull(formData.get("installationNumber")),
    currentContractor: emptyToNull(formData.get("currentContractor")),
    manufacturer: emptyToNull(formData.get("manufacturer")),
    commissioningYear: emptyToNull(formData.get("commissioningYear")),
    elevatorType: emptyToNull(formData.get("elevatorType")),
    stopCount: emptyToNull(formData.get("stopCount")),
    ratedLoad: emptyToNull(formData.get("ratedLoad")),
    buildingAccess: emptyToNull(formData.get("buildingAccess")),
    ratedSpeed: emptyToNull(formData.get("ratedSpeed")),
    tractionType: emptyToNull(formData.get("tractionType")),
    controlType: emptyToNull(formData.get("controlType")),
    landingAccess: emptyToNull(formData.get("landingAccess")),
    machineRoomLocation: emptyToNull(formData.get("machineRoomLocation")),
    cabinWidth: emptyToNull(formData.get("cabinWidth")),
    cabinDepth: emptyToNull(formData.get("cabinDepth")),
    shaftWidth: emptyToNull(formData.get("shaftWidth")),
    shaftDepth: emptyToNull(formData.get("shaftDepth")),
    shaftConstruction: emptyToNull(formData.get("shaftConstruction")),
    doorWidth: emptyToNull(formData.get("doorWidth")),
    doorHeight: emptyToNull(formData.get("doorHeight")),
    doorType: emptyToNull(formData.get("doorType")),
    landingDoorWidth: emptyToNull(formData.get("landingDoorWidth")),
    landingDoorHeight: emptyToNull(formData.get("landingDoorHeight")),
    landingDoorType: emptyToNull(formData.get("landingDoorType")),
    travel: emptyToNull(formData.get("travel")),
    pitDepth: emptyToNull(formData.get("pitDepth")),
    headroom: emptyToNull(formData.get("headroom")),
    implantation: emptyToNull(formData.get("implantation")),
    safetyInfo: emptyToNull(formData.get("safetyInfo")),
    modernizations: emptyToNull(formData.get("modernizations")),
  };
  const assigneeIds = formData.getAll("assigneeIds").map(String).filter(Boolean);
  return { data, assigneeIds };
}

export async function logAudit(
  actorId: string,
  action: string,
  entityId: string,
  detail?: string,
) {
  await db.insert(auditLog).values({
    id: crypto.randomUUID(),
    actorId,
    action,
    entityType: "installation",
    entityId,
    detail: detail ?? null,
    createdAt: new Date(),
  });
}

export type GeranceContact = {
  id: string;
  name: string;
  email: string;
  organizationName: string | null;
  phone: string | null;
  address: string | null;
};

export async function listGeranceAccounts() {
  return db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      organizationName: user.organizationName,
      phone: user.phone,
      address: user.address,
    })
    .from(user)
    .where(and(eq(user.role, "gerance"), eq(user.status, "approved")));
}

export async function getAssignedGeranceContacts(installationId: string) {
  return db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      organizationName: user.organizationName,
      phone: user.phone,
      address: user.address,
    })
    .from(installationAssignment)
    .innerJoin(user, eq(installationAssignment.userId, user.id))
    .where(eq(installationAssignment.installationId, installationId));
}

export async function listInstallationsForUser(input: {
  role: UserRole;
  userId: string;
  query?: string;
}) {
  const q = input.query?.trim().replaceAll("%", "").replaceAll("_", "");
  const search = q
    ? or(
        like(elevatorInstallation.internalRef, `%${q}%`),
        like(elevatorInstallation.buildingAddress, `%${q}%`),
        like(elevatorInstallation.installationNumber, `%${q}%`),
        like(elevatorInstallation.currentContractor, `%${q}%`),
        like(elevatorInstallation.ownerName, `%${q}%`),
        like(elevatorInstallation.propertyManagerName, `%${q}%`),
        like(elevatorInstallation.buildingAccess, `%${q}%`),
      )
    : undefined;

  if (input.role === "admin") {
    if (search) {
      return db
        .select()
        .from(elevatorInstallation)
        .where(search)
        .orderBy(desc(elevatorInstallation.updatedAt));
    }
    return db
      .select()
      .from(elevatorInstallation)
      .orderBy(desc(elevatorInstallation.updatedAt));
  }

  const assigned = eq(installationAssignment.userId, input.userId);
  const rows = await db
    .select({ installation: elevatorInstallation })
    .from(installationAssignment)
    .innerJoin(
      elevatorInstallation,
      eq(installationAssignment.installationId, elevatorInstallation.id),
    )
    .where(search ? and(assigned, search) : assigned)
    .orderBy(desc(elevatorInstallation.updatedAt));

  return rows.map((row) => row.installation);
}

export async function getInstallationById(id: string) {
  const [row] = await db
    .select()
    .from(elevatorInstallation)
    .where(eq(elevatorInstallation.id, id))
    .limit(1);
  return row ?? null;
}

export async function getAssignmentUserIds(installationId: string) {
  const rows = await db
    .select({ userId: installationAssignment.userId })
    .from(installationAssignment)
    .where(eq(installationAssignment.installationId, installationId));
  return rows.map((row) => row.userId);
}

export async function userCanViewInstallation(
  role: UserRole,
  userId: string,
  installationId: string,
) {
  if (role === "admin") return true;
  if (role !== "gerance") return false;
  const [row] = await db
    .select({ id: installationAssignment.id })
    .from(installationAssignment)
    .where(
      and(
        eq(installationAssignment.installationId, installationId),
        eq(installationAssignment.userId, userId),
      ),
    )
    .limit(1);
  return Boolean(row);
}

export async function replaceAssignments(
  installationId: string,
  assigneeIds: string[],
) {
  await db
    .delete(installationAssignment)
    .where(eq(installationAssignment.installationId, installationId));
  if (!assigneeIds.length) return;
  await db.insert(installationAssignment).values(
    assigneeIds.map((userId) => ({
      id: crypto.randomUUID(),
      installationId,
      userId,
      createdAt: new Date(),
    })),
  );
}

export { displayAddress, displayReference } from "./installation-display";

export function displayTitle(item: InstallationRecord) {
  return displayAddress(item);
}

export function applyInstallationFilters(
  items: InstallationRecord[],
  input: {
    workTypes?: string | string[];
    sort?: string | string[];
  },
) {
  const types = (Array.isArray(input.workTypes)
    ? input.workTypes
    : input.workTypes
      ? [input.workTypes]
      : []
  ).filter((item) => item === "remplacement" || item === "modernisation");
  const direction = dateSortDirection(input.sort);
  const filtered = types.length
    ? items.filter((item) => {
        const purpose = parseExtraFields(item.extraFields).specification?.purpose;
        return types.includes(purpose ?? "");
      })
    : items;
  return [...filtered].sort((a, b) => {
    const left = new Date(a.updatedAt).getTime();
    const right = new Date(b.updatedAt).getTime();
    return (left - right) * direction;
  });
}

export { specificationWorkType } from "./dossier";

export function displayParties(item: InstallationRecord) {
  const owner = item.ownerName?.trim() || "";
  const manager = item.propertyManagerName?.trim() || "";
  if (owner && manager && owner !== manager) {
    return { primary: owner, secondary: manager };
  }
  return { primary: owner || manager || "—", secondary: null };
}
