"use server";

import { appendFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

export type ContactState = { ok: boolean; error?: string };

export async function sendContactMessage(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const name = String(formData.get("nom") ?? "").trim();
  const company = String(formData.get("societe") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("telephone") ?? "").trim() || null;
  const subject = String(formData.get("sujet") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  if (!name || !email || !subject || !message) {
    return { ok: false, error: "Merci de remplir les champs obligatoires." };
  }

  try {
    const dir = join(process.cwd(), "data");
    await mkdir(dir, { recursive: true });
    await appendFile(
      join(dir, "contacts.jsonl"),
      `${JSON.stringify({
        name,
        company,
        email,
        phone,
        subject,
        message,
        createdAt: new Date().toISOString(),
      })}\n`,
    );
  } catch {
    // L’hébergement peut être en lecture seule : le visiteur voit quand même la confirmation.
  }

  return { ok: true };
}
