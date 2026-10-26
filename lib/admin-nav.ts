import "server-only";

import { and, count, eq, ne, or } from "drizzle-orm";
import { db } from "./db";
import { clientRequest, user } from "./db/schema";

export async function getAdminNavCounts() {
  const attention = or(
    eq(user.status, "pending"),
    and(eq(user.planRequested, true), ne(user.plan, "pro")),
  );
  const [inscriptions] = await db
    .select({ n: count() })
    .from(user)
    .where(and(ne(user.role, "admin"), attention));
  const [demandes] = await db
    .select({ n: count() })
    .from(clientRequest)
    .where(eq(clientRequest.status, "open"));
  return {
    "/espace/admin/inscriptions": inscriptions?.n ?? 0,
    "/espace/admin/demandes": demandes?.n ?? 0,
  };
}
