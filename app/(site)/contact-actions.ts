"use server";

import { headers } from "next/headers";
import { sendMail } from "@/lib/mail";

export type ContactState = { ok: boolean; error?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX = {
  name: 120,
  company: 160,
  email: 180,
  phone: 40,
  subject: 80,
  message: 4000,
} as const;

const hits = new Map<string, { count: number; resetAt: number }>();

function clientIp(headerList: Headers) {
  const forwarded = headerList.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return headerList.get("x-real-ip")?.trim() || "unknown";
}

function tooMany(ip: string) {
  const now = Date.now();
  const current = hits.get(ip);
  if (!current || now > current.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return false;
  }
  current.count += 1;
  return current.count > 8;
}

function clip(value: string, max: number) {
  return value.slice(0, max);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function sendContactMessage(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  if (String(formData.get("website") ?? "").trim()) {
    return { ok: true };
  }

  const name = clip(String(formData.get("nom") ?? "").trim(), MAX.name);
  const company =
    clip(String(formData.get("societe") ?? "").trim(), MAX.company) || null;
  const email = clip(String(formData.get("email") ?? "").trim(), MAX.email);
  const phone =
    clip(String(formData.get("telephone") ?? "").trim(), MAX.phone) || null;
  const subject = clip(String(formData.get("sujet") ?? "").trim(), MAX.subject);
  const message = clip(
    String(formData.get("message") ?? "").trim(),
    MAX.message,
  );

  if (!name || !email || !subject || !message) {
    return { ok: false, error: "Merci de remplir les champs obligatoires." };
  }
  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: "Merci d’indiquer une adresse e-mail valide." };
  }

  const ip = clientIp(await headers());
  if (tooMany(ip)) {
    return {
      ok: false,
      error: "Trop de messages ont été envoyés. Merci de réessayer plus tard.",
    };
  }

  const text = [
    `Nom : ${name}`,
    `Société : ${company || "—"}`,
    `E-mail : ${email}`,
    `Téléphone : ${phone || "—"}`,
    `Sujet : ${subject}`,
    "",
    message,
  ].join("\n");

  const html = `
    <p><strong>Nom :</strong> ${escapeHtml(name)}</p>
    <p><strong>Société :</strong> ${escapeHtml(company || "—")}</p>
    <p><strong>E-mail :</strong> ${escapeHtml(email)}</p>
    <p><strong>Téléphone :</strong> ${escapeHtml(phone || "—")}</p>
    <p><strong>Sujet :</strong> ${escapeHtml(subject)}</p>
    <p>${escapeHtml(message).replaceAll("\n", "<br />")}</p>
  `;

  try {
    await sendMail({
      subject: `Contact site — ${subject} — ${name}`,
      text,
      html,
      replyTo: email,
    });
  } catch {
    return {
      ok: false,
      error:
        "L’envoi n’a pas abouti. Merci de nous écrire à info@vertical-conseil.ch.",
    };
  }

  return { ok: true };
}
