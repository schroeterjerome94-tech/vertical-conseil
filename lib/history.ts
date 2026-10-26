import "server-only";

import { desc, eq } from "drizzle-orm";
import { db } from "./db";
import { auditLog, installationDocument, tenderCall } from "./db/schema";

export type HistoryEvent = {
  id: string;
  at: Date;
  label: string;
};

const AUDIT_LABEL: Record<string, string> = {
  create: "Fiche créée",
  update: "Fiche mise à jour",
  delete: "Fiche supprimée",
};

export async function listInstallationHistory(installationId: string) {
  const [audits, documents, tenders] = await Promise.all([
    db
      .select()
      .from(auditLog)
      .where(eq(auditLog.entityId, installationId))
      .orderBy(desc(auditLog.createdAt)),
    db
      .select()
      .from(installationDocument)
      .where(eq(installationDocument.installationId, installationId))
      .orderBy(desc(installationDocument.createdAt)),
    db
      .select()
      .from(tenderCall)
      .where(eq(tenderCall.installationId, installationId))
      .orderBy(desc(tenderCall.createdAt)),
  ]);

  const events: HistoryEvent[] = [
    ...audits.map((row) => ({
      id: `audit-${row.id}`,
      at: new Date(row.createdAt),
      label: AUDIT_LABEL[row.action] ?? row.action,
    })),
    ...documents.map((row) => ({
      id: `doc-${row.id}`,
      at: new Date(row.createdAt),
      label: `Document : ${row.originalName}`,
    })),
    ...tenders.map((row) => ({
      id: `tender-${row.id}`,
      at: new Date(row.createdAt),
      label: `Appel d’offres : ${row.title}${row.status === "closed" ? " (clôturé)" : ""}`,
    })),
  ];

  events.sort((a, b) => b.at.getTime() - a.at.getTime());
  return events;
}
