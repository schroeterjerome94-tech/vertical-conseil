import "server-only";

import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "./db";
import {
  elevatorInstallation,
  installationAssignment,
  tenderCall,
  tenderInvite,
  tenderOffer,
  user,
} from "./db/schema";
import { specificationWorkType } from "./dossier";
import { parseExtraFields } from "./norms";
import { notifyByEmail } from "./notices";
import { isOfferComplete, parseProposal } from "./offer-proposal";
import { displayTitle, logAudit } from "./installations";
import type { UserRole } from "./constants";
import { dateSortDirection } from "./list-sort";
import { TENDER_STATUS_LABEL } from "./tenders-ui";

export type TenderRecord = typeof tenderCall.$inferSelect;

function origin() {
  return process.env.BETTER_AUTH_URL || "http://localhost:3000";
}

export async function listAscensoristeAccounts() {
  return db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      organizationName: user.organizationName,
    })
    .from(user)
    .where(and(eq(user.role, "ascensoriste"), eq(user.status, "approved")));
}

export async function listTendersForUser(input: {
  role: UserRole;
  userId: string;
}) {
  const rows = await db
    .select({
      tender: tenderCall,
      installation: elevatorInstallation,
    })
    .from(tenderCall)
    .innerJoin(
      elevatorInstallation,
      eq(tenderCall.installationId, elevatorInstallation.id),
    )
    .orderBy(desc(tenderCall.createdAt));

  if (input.role === "admin") return rows;

  if (input.role === "ascensoriste") {
    const invites = await db
      .select({ tenderId: tenderInvite.tenderId })
      .from(tenderInvite)
      .where(eq(tenderInvite.userId, input.userId));
    const ids = new Set(invites.map((row) => row.tenderId));
    return rows.filter((row) => ids.has(row.tender.id));
  }

  const assigned = await db
    .select({ installationId: installationAssignment.installationId })
    .from(installationAssignment)
    .where(eq(installationAssignment.userId, input.userId));
  const ids = new Set(assigned.map((row) => row.installationId));
  return rows.filter((row) => ids.has(row.tender.installationId));
}

function asFilterList(value?: string | string[]) {
  return (Array.isArray(value) ? value : value ? [value] : [])
    .flatMap((item) => item.split(","))
    .map((item) => item.trim())
    .filter(Boolean);
}

export function applyTenderFilters(
  rows: Awaited<ReturnType<typeof listTendersForUser>>,
  input: {
    query?: string;
    workTypes?: string | string[];
    sort?: string | string[];
  },
) {
  const q = input.query?.trim().toLowerCase();
  const workTypes = asFilterList(input.workTypes).filter(
    (item) => item === "remplacement" || item === "modernisation",
  );

  const filtered = rows.filter(({ tender, installation }) => {
    const purpose = parseExtraFields(installation.extraFields).specification
      ?.purpose;
    if (workTypes.length && !workTypes.includes(purpose ?? "")) return false;

    if (!q) return true;
    const hay = [
      tender.title,
      displayTitle(installation),
      installation.internalRef,
      installation.buildingAddress,
      specificationWorkType(installation.extraFields),
      TENDER_STATUS_LABEL[tender.status],
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });

  const direction = dateSortDirection(input.sort);
  return [...filtered].sort((a, b) => {
    const left = new Date(a.tender.deadline).getTime();
    const right = new Date(b.tender.deadline).getTime();
    return (left - right) * direction;
  });
}

export async function listTendersForInstallation(installationId: string) {
  return db
    .select()
    .from(tenderCall)
    .where(eq(tenderCall.installationId, installationId))
    .orderBy(desc(tenderCall.createdAt));
}

export async function getTenderById(id: string) {
  const [row] = await db
    .select({
      tender: tenderCall,
      installation: elevatorInstallation,
    })
    .from(tenderCall)
    .innerJoin(
      elevatorInstallation,
      eq(tenderCall.installationId, elevatorInstallation.id),
    )
    .where(eq(tenderCall.id, id))
    .limit(1);
  return row ?? null;
}

export async function getTenderInvites(tenderId: string) {
  return db
    .select({
      id: tenderInvite.id,
      userId: tenderInvite.userId,
      name: user.name,
      email: user.email,
      organizationName: user.organizationName,
    })
    .from(tenderInvite)
    .innerJoin(user, eq(tenderInvite.userId, user.id))
    .where(eq(tenderInvite.tenderId, tenderId));
}

export async function getTenderOffers(tenderId: string) {
  const rows = await db
    .select({
      id: tenderOffer.id,
      userId: tenderOffer.userId,
      amount: tenderOffer.amount,
      message: tenderOffer.message,
      proposal: tenderOffer.proposal,
      createdAt: tenderOffer.createdAt,
      updatedAt: tenderOffer.updatedAt,
      name: user.name,
      organizationName: user.organizationName,
    })
    .from(tenderOffer)
    .innerJoin(user, eq(tenderOffer.userId, user.id))
    .where(eq(tenderOffer.tenderId, tenderId))
    .orderBy(desc(tenderOffer.updatedAt));
  const [dossier] = await db
    .select({ extraFields: elevatorInstallation.extraFields })
    .from(tenderCall)
    .innerJoin(
      elevatorInstallation,
      eq(tenderCall.installationId, elevatorInstallation.id),
    )
    .where(eq(tenderCall.id, tenderId))
    .limit(1);
  const clauses = parseExtraFields(dossier?.extraFields).specification
    ?.selectedClauses;
  return rows.filter((row) => {
    const proposal = parseProposal(row.proposal);
    return (
      proposal.acknowledged === "oui" &&
      isOfferComplete(row.amount, proposal, clauses)
    );
  });
}

export async function userIsInvitedOnInstallation(
  userId: string,
  installationId: string,
) {
  const [row] = await db
    .select({ id: tenderInvite.id })
    .from(tenderInvite)
    .innerJoin(tenderCall, eq(tenderInvite.tenderId, tenderCall.id))
    .where(
      and(
        eq(tenderInvite.userId, userId),
        eq(tenderCall.installationId, installationId),
      ),
    )
    .limit(1);
  return Boolean(row);
}

export async function listOffersForUser(userId: string) {
  return db
    .select({
      id: tenderOffer.id,
      amount: tenderOffer.amount,
      message: tenderOffer.message,
      proposal: tenderOffer.proposal,
      updatedAt: tenderOffer.updatedAt,
      title: tenderCall.title,
      deadline: tenderCall.deadline,
      status: tenderCall.status,
      awardedOfferId: tenderCall.awardedOfferId,
      tenderId: tenderCall.id,
      buildingAddress: elevatorInstallation.buildingAddress,
      internalRef: elevatorInstallation.internalRef,
    })
    .from(tenderOffer)
    .innerJoin(tenderCall, eq(tenderOffer.tenderId, tenderCall.id))
    .innerJoin(
      elevatorInstallation,
      eq(tenderCall.installationId, elevatorInstallation.id),
    )
    .where(eq(tenderOffer.userId, userId))
    .orderBy(desc(tenderOffer.updatedAt));
}

export async function getOwnOffer(tenderId: string, userId: string) {
  const [row] = await db
    .select()
    .from(tenderOffer)
    .where(and(eq(tenderOffer.tenderId, tenderId), eq(tenderOffer.userId, userId)))
    .limit(1);
  return row ?? null;
}

export async function userCanViewTender(
  role: UserRole,
  userId: string,
  tenderId: string,
) {
  if (role === "admin") return true;

  const [tender] = await db
    .select()
    .from(tenderCall)
    .where(eq(tenderCall.id, tenderId))
    .limit(1);
  if (!tender) return false;

  if (role === "ascensoriste") {
    const [invite] = await db
      .select({ id: tenderInvite.id })
      .from(tenderInvite)
      .where(
        and(eq(tenderInvite.tenderId, tenderId), eq(tenderInvite.userId, userId)),
      )
      .limit(1);
    return Boolean(invite);
  }

  if (role === "gerance") {
    const [row] = await db
      .select({ id: installationAssignment.id })
      .from(installationAssignment)
      .where(
        and(
          eq(installationAssignment.installationId, tender.installationId),
          eq(installationAssignment.userId, userId),
        ),
      )
      .limit(1);
    return Boolean(row);
  }

  return false;
}

export function parseTenderForm(formData: FormData) {
  const installationId = String(formData.get("installationId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const deadlineRaw = String(formData.get("deadline") ?? "").trim();
  const inviteeIds = formData.getAll("inviteeIds").map(String).filter(Boolean);
  const deadline = deadlineRaw ? new Date(`${deadlineRaw}T23:59:00`) : null;
  return { installationId, title, description, deadline, inviteeIds };
}

export function isTenderOpen(tender: TenderRecord) {
  const deadline = new Date(tender.deadline).getTime();
  return tender.status === "open" && deadline >= Date.now();
}

async function notifyInvites(
  tenderId: string,
  title: string,
  inviteeIds: string[],
  installationId: string,
) {
  const url = `${origin()}/espace/appels-doffres/${tenderId}`;
  if (inviteeIds.length) {
    const companies = await db
      .select({ email: user.email })
      .from(user)
      .where(inArray(user.id, inviteeIds));
    for (const company of companies) {
      await notifyByEmail(
        company.email,
        `Appel d’offres — ${title}`,
        url,
      );
    }
  }

  const assigned = await db
    .select({ email: user.email })
    .from(installationAssignment)
    .innerJoin(user, eq(installationAssignment.userId, user.id))
    .where(eq(installationAssignment.installationId, installationId));
  for (const account of assigned) {
    await notifyByEmail(
      account.email,
      `Nouvel appel d’offres — ${title}`,
      url,
    );
  }
}

export async function createTender(input: {
  actorId: string;
  installationId: string;
  title: string;
  description: string;
  deadline: Date;
  inviteeIds: string[];
}) {
  const id = crypto.randomUUID();
  const now = new Date();
  await db.insert(tenderCall).values({
    id,
    installationId: input.installationId,
    title: input.title,
    description: input.description,
    deadline: input.deadline,
    status: "open",
    createdBy: input.actorId,
    createdAt: now,
    updatedAt: now,
  });
  if (input.inviteeIds.length) {
    await db.insert(tenderInvite).values(
      input.inviteeIds.map((userId) => ({
        id: crypto.randomUUID(),
        tenderId: id,
        userId,
        createdAt: now,
      })),
    );
  }
  await logAudit(input.actorId, "create_tender", id, input.title);
  await notifyInvites(
    id,
    input.title,
    input.inviteeIds,
    input.installationId,
  );
  return id;
}

export async function closeTender(id: string, actorId: string) {
  await db
    .update(tenderCall)
    .set({ status: "closed", updatedAt: new Date() })
    .where(eq(tenderCall.id, id));
  await logAudit(actorId, "close_tender", id);
}

export async function deleteTender(id: string, actorId: string) {
  await db.delete(tenderInvite).where(eq(tenderInvite.tenderId, id));
  await db.delete(tenderOffer).where(eq(tenderOffer.tenderId, id));
  await db.delete(tenderCall).where(eq(tenderCall.id, id));
  await logAudit(actorId, "delete_tender", id);
}

export async function awardTender(
  tenderId: string,
  offerId: string,
  actorId: string,
) {
  const row = await getTenderById(tenderId);
  if (!row) throw new Error("Appel d’offres introuvable.");
  const [offer] = await db
    .select()
    .from(tenderOffer)
    .where(and(eq(tenderOffer.id, offerId), eq(tenderOffer.tenderId, tenderId)))
    .limit(1);
  if (!offer) throw new Error("Offre introuvable.");

  await db
    .update(tenderCall)
    .set({
      status: "awarded",
      awardedOfferId: offerId,
      updatedAt: new Date(),
    })
    .where(eq(tenderCall.id, tenderId));
  await logAudit(actorId, "award_tender", tenderId, offerId);

  const url = `${origin()}/espace/appels-doffres/${tenderId}`;
  const submitted = await db
    .select({
      userId: tenderOffer.userId,
      email: user.email,
    })
    .from(tenderOffer)
    .innerJoin(user, eq(tenderOffer.userId, user.id))
    .where(eq(tenderOffer.tenderId, tenderId));
  const place = displayTitle(row.installation) || row.tender.title;
  const notRetainedTitle = `Nous vous remercions d’avoir répondu au cahier des charges de « ${place} ». Votre offre n’a pas été retenue.`;
  for (const account of submitted) {
    if (account.userId === offer.userId) continue;
    await notifyByEmail(account.email, notRetainedTitle, url);
  }

  const assigned = await db
    .select({ email: user.email })
    .from(installationAssignment)
    .innerJoin(user, eq(installationAssignment.userId, user.id))
    .where(eq(installationAssignment.installationId, row.tender.installationId));
  for (const account of assigned) {
    await notifyByEmail(
      account.email,
      `Offre retenue — ${place}`,
      url,
    );
  }
}

export async function notifyAscensoristesOfSpecificationChange(
  installationId: string,
) {
  const [installation] = await db
    .select()
    .from(elevatorInstallation)
    .where(eq(elevatorInstallation.id, installationId))
    .limit(1);
  const place = installation
    ? displayTitle(installation)
    : "installation";
  const tenders = await db
    .select({ id: tenderCall.id, title: tenderCall.title })
    .from(tenderCall)
    .where(
      and(
        eq(tenderCall.installationId, installationId),
        eq(tenderCall.status, "open"),
      ),
    );
  const notified = new Set<string>();
  for (const tender of tenders) {
    const invites = await getTenderInvites(tender.id);
    const href = `${origin()}/espace/appels-doffres/${tender.id}`;
    for (const invite of invites) {
      const key = invite.email.trim().toLowerCase();
      if (notified.has(key)) continue;
      notified.add(key);
      await notifyByEmail(
        invite.email,
        `Cahier des charges modifié — ${place}`,
        href,
      );
    }
  }
}

export async function addTenderInvites(
  tenderId: string,
  inviteeIds: string[],
  actorId: string,
) {
  const row = await getTenderById(tenderId);
  if (!row || row.tender.status !== "open") {
    throw new Error("Cette consultation n’accepte plus d’invitations.");
  }
  const existing = await getTenderInvites(tenderId);
  const already = new Set(existing.map((item) => item.userId));
  const fresh = inviteeIds.filter((id) => !already.has(id));
  if (!fresh.length) return;
  const now = new Date();
  await db.insert(tenderInvite).values(
    fresh.map((userId) => ({
      id: crypto.randomUUID(),
      tenderId,
      userId,
      createdAt: now,
    })),
  );
  await logAudit(actorId, "invite_tender", tenderId);
  const url = `${origin()}/espace/appels-doffres/${tenderId}`;
  const companies = await db
    .select({ email: user.email })
    .from(user)
    .where(inArray(user.id, fresh));
  for (const company of companies) {
    await notifyByEmail(
      company.email,
      `Appel d’offres — ${displayTitle(row.installation) || row.tender.title}`,
      url,
    );
  }
}

export async function upsertOffer(input: {
  tenderId: string;
  userId: string;
  amount: string;
  message: string | null;
  proposal: string | null;
}) {
  const now = new Date();
  const existing = await getOwnOffer(input.tenderId, input.userId);
  if (existing) {
    await db
      .update(tenderOffer)
      .set({
        amount: input.amount,
        message: input.message,
        proposal: input.proposal,
        updatedAt: now,
      })
      .where(eq(tenderOffer.id, existing.id));
    return existing.id;
  }
  const id = crypto.randomUUID();
  await db.insert(tenderOffer).values({
    id,
    tenderId: input.tenderId,
    userId: input.userId,
    amount: input.amount,
    message: input.message,
    proposal: input.proposal,
    createdAt: now,
    updatedAt: now,
  });
  return id;
}

export { displayTitle };
