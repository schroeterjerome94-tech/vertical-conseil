"use server";

import { saveContactMessage } from "@/lib/contacts";

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
  await saveContactMessage({
    name,
    company,
    email,
    phone,
    subject,
    message,
  });
  return { ok: true };
}
