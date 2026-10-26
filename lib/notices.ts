import "server-only";

import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "./db";
import { notice, user } from "./db/schema";
import { ADMIN_EMAILS } from "./constants";
import { saveDevMail } from "./dev-mailbox";

export async function notifyByEmail(to: string, title: string, href: string) {
  saveDevMail({ to, subject: title, url: href });
  const [account] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, to.trim().toLowerCase()))
    .limit(1);
  if (!account) return;
  await db.insert(notice).values({
    id: crypto.randomUUID(),
    userId: account.id,
    title,
    href,
    createdAt: new Date(),
  });
}

export async function notifyAdmins(title: string, href: string) {
  const admins = await db
    .select({ id: user.id, email: user.email })
    .from(user)
    .where(eq(user.role, "admin"));
  const emails = new Set(
    [...ADMIN_EMAILS, ...admins.map((item) => item.email)].map((email) =>
      email.trim().toLowerCase(),
    ),
  );
  for (const email of emails) {
    await notifyByEmail(email, title, href);
  }
}

export async function listNotices(userId: string) {
  return db
    .select()
    .from(notice)
    .where(eq(notice.userId, userId))
    .orderBy(desc(notice.createdAt));
}

export async function countUnreadNotices(userId: string) {
  const rows = await db
    .select({ id: notice.id })
    .from(notice)
    .where(and(eq(notice.userId, userId), isNull(notice.readAt)));
  return rows.length;
}

export async function markNoticeRead(userId: string, id: string) {
  await db
    .update(notice)
    .set({ readAt: new Date() })
    .where(and(eq(notice.id, id), eq(notice.userId, userId)));
}
