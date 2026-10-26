import "server-only";

import { desc } from "drizzle-orm";
import { ADMIN_EMAILS } from "./constants";
import { db } from "./db";
import { contactMessage } from "./db/schema";
import { notifyByEmail } from "./notices";

const origin = () => process.env.BETTER_AUTH_URL || "http://localhost:3000";

export async function saveContactMessage(input: {
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
}) {
  const id = crypto.randomUUID();
  await db.insert(contactMessage).values({
    id,
    ...input,
    createdAt: new Date(),
  });
  const url = `${origin()}/espace`;
  for (const to of ADMIN_EMAILS) {
    await notifyByEmail(to, `Contact — ${input.subject}`, url);
  }
  return id;
}

export async function listContactMessages() {
  return db
    .select()
    .from(contactMessage)
    .orderBy(desc(contactMessage.createdAt));
}
