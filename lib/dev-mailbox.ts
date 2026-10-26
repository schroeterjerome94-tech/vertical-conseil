import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export type DevMail = {
  to: string;
  subject: string;
  url: string;
  body?: string;
  replyTo?: string;
  sentAt: string;
};

const file = join(process.cwd(), "data", "dev-mailbox.json");

function readAll(): DevMail[] {
  try {
    const parsed = JSON.parse(readFileSync(file, "utf8")) as DevMail | DevMail[];
    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === "object" && "to" in parsed) return [parsed];
    return [];
  } catch {
    return [];
  }
}

export function saveDevMail(mail: Omit<DevMail, "sentAt">) {
  mkdirSync(join(process.cwd(), "data"), { recursive: true });
  const payload: DevMail = { ...mail, sentAt: new Date().toISOString() };
  const all = [...readAll(), payload];
  writeFileSync(file, JSON.stringify(all, null, 2), "utf8");
  console.info(
    `[e-mail local] ${payload.subject} → ${payload.to}${payload.replyTo ? ` (réponse : ${payload.replyTo})` : ""}\n${payload.body || payload.url}`,
  );
  return payload;
}

export function readDevMails() {
  return readAll();
}

export function readDevMail(): DevMail | null {
  const all = readAll();
  return (
    [...all]
      .reverse()
      .find((mail) => mail.url.includes("verify-email") || mail.subject.includes("Vérifiez")) ??
    all.at(-1) ??
    null
  );
}
