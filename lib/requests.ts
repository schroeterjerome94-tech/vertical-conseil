import "server-only";

import { desc, eq } from "drizzle-orm";
import { INFO_EMAIL } from "./constants";
import { db } from "./db";
import { clientRequest, elevatorInstallation, user } from "./db/schema";
import { sendMail } from "./mail";
import { REQUEST_KIND_LABEL, type RequestKind } from "./requests-ui";

export type { RequestKind } from "./requests-ui";
export { REQUEST_KIND_LABEL, isRequestKind } from "./requests-ui";

export async function getClientRequestById(id: string) {
  const [row] = await db
    .select()
    .from(clientRequest)
    .where(eq(clientRequest.id, id))
    .limit(1);
  return row ?? null;
}

export async function createClientRequest(input: {
  userId: string;
  kind: RequestKind;
  message: string;
}) {
  const id = crypto.randomUUID();
  await db.insert(clientRequest).values({
    id,
    userId: input.userId,
    installationId: null,
    kind: input.kind,
    message: input.message,
    status: "open",
    createdAt: new Date(),
  });
  const [account] = await db
    .select()
    .from(user)
    .where(eq(user.id, input.userId))
    .limit(1);
  const kindLabel = REQUEST_KIND_LABEL[input.kind];
  const lines = [
    "Nouvelle demande depuis l’espace gérance.",
    "",
    `Type : ${kindLabel}`,
    account?.organizationName ? `Société : ${account.organizationName}` : null,
    account?.email ? `E-mail : ${account.email}` : null,
    account?.phone ? `Téléphone : ${account.phone}` : null,
    "",
    input.message,
  ].filter((line): line is string => line !== null);
  await sendMail({
    to: INFO_EMAIL,
    subject: `Demande ${kindLabel}${account?.organizationName ? ` — ${account.organizationName}` : ""}`,
    text: lines.join("\n"),
    replyTo: account?.email ?? undefined,
    href: "/espace/admin/demandes",
  });
  return { ok: true as const, id };
}

export async function listRequestsForUser(userId: string) {
  return db
    .select({
      request: clientRequest,
      installation: elevatorInstallation,
    })
    .from(clientRequest)
    .leftJoin(
      elevatorInstallation,
      eq(clientRequest.installationId, elevatorInstallation.id),
    )
    .where(eq(clientRequest.userId, userId))
    .orderBy(desc(clientRequest.createdAt));
}

export async function listAllClientRequests() {
  return db
    .select({
      request: clientRequest,
      installation: elevatorInstallation,
      account: user,
    })
    .from(clientRequest)
    .leftJoin(
      elevatorInstallation,
      eq(clientRequest.installationId, elevatorInstallation.id),
    )
    .innerJoin(user, eq(clientRequest.userId, user.id))
    .orderBy(desc(clientRequest.createdAt));
}

export async function setRequestStatus(id: string, status: "open" | "done") {
  await db
    .update(clientRequest)
    .set({ status })
    .where(eq(clientRequest.id, id));
}

export async function attachRequestToInstallation(
  requestId: string,
  installationId: string,
) {
  await db
    .update(clientRequest)
    .set({ installationId, status: "done" })
    .where(eq(clientRequest.id, requestId));
}

export async function deleteClientRequest(id: string) {
  const row = await getClientRequestById(id);
  if (!row) return;
  if (row.purchaseOrderStored) {
    const { unlink } = await import("node:fs/promises");
    const { purchaseOrderPath } = await import("./purchase-order");
    try {
      await unlink(purchaseOrderPath(row.purchaseOrderStored));
    } catch {
      /* ignore missing file */
    }
  }
  await db.delete(clientRequest).where(eq(clientRequest.id, id));
}
