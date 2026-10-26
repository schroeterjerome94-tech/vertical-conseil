import "server-only";

import { and, eq, sql } from "drizzle-orm";
import { asceCdcHt } from "./asce-pro-pricing";
import { COMPANY, INFO_EMAIL } from "./constants";
import { db } from "./db";
import { asceProPurchase, elevatorInstallation, user } from "./db/schema";
import { logAudit } from "./installations";
import { sendMail } from "./mail";
import { formatChf, vatFromHt } from "./money";
import { notifyAdmins } from "./notices";
import { getTenderById, userCanViewTender } from "./tenders";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function formatChDate(value: Date) {
  return value.toLocaleDateString("fr-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function normalizeAddress(value: string | null | undefined) {
  return (value ?? "").trim().replace(/\s+/g, " ");
}

export async function countInstallationsAtAddress(address: string | null | undefined) {
  const normalized = normalizeAddress(address).toLowerCase();
  if (!normalized) return 1;
  const rows = await db
    .select({ buildingAddress: elevatorInstallation.buildingAddress })
    .from(elevatorInstallation);
  const count = rows.filter(
    (item) => normalizeAddress(item.buildingAddress).toLowerCase() === normalized,
  ).length;
  return Math.max(1, count);
}

export async function userHasAsceProForTender(userId: string, tenderId: string) {
  const [row] = await db
    .select({ id: asceProPurchase.id })
    .from(asceProPurchase)
    .where(
      and(
        eq(asceProPurchase.userId, userId),
        eq(asceProPurchase.tenderId, tenderId),
      ),
    )
    .limit(1);
  return Boolean(row);
}

export async function userHasAsceProForInstallation(
  userId: string,
  installationId: string,
) {
  const [row] = await db
    .select({ id: asceProPurchase.id })
    .from(asceProPurchase)
    .where(
      and(
        eq(asceProPurchase.userId, userId),
        eq(asceProPurchase.installationId, installationId),
      ),
    )
    .limit(1);
  return Boolean(row);
}

async function nextInvoiceNumber() {
  const year = new Date().getFullYear();
  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(asceProPurchase);
  const n = Number(row?.count ?? 0) + 1;
  return `FAC-${year}-${String(n).padStart(4, "0")}`;
}

function invoiceTexts(input: {
  invoiceNumber: string;
  issuedAt: Date;
  dueAt: Date;
  organization: string;
  name: string;
  address: string;
  email: string;
  siteAddress: string;
  installationCount: number;
  ht: string;
  vat: string;
  ttc: string;
}) {
  const countLabel =
    input.installationCount === 1
      ? "1 installation"
      : `${input.installationCount} installations à la même adresse`;
  const site = input.siteAddress || "Adresse non indiquée";
  const subject = `Facture ${input.invoiceNumber} — version Pro, cahier des charges`;
  const text = [
    `Facture ${input.invoiceNumber}`,
    "",
    COMPANY.name,
    COMPANY.street,
    COMPANY.city,
    INFO_EMAIL,
    "",
    `Date : ${formatChDate(input.issuedAt)}`,
    `Échéance : ${formatChDate(input.dueAt)} (30 jours net)`,
    "",
    "Destinataire",
    input.organization,
    input.name,
    input.address,
    input.email,
    "",
    "Prestation",
    `Accès version Pro aux données du cahier des charges — ${site} (${countLabel})`,
    "",
    `Montant HT : ${input.ht} CHF`,
    `TVA 8,1 % : ${input.vat} CHF`,
    `Total TTC : ${input.ttc} CHF`,
    "",
    "Conditions de paiement : 30 jours net.",
    "Aucune autorisation n’est requise : l’accès aux données de ce cahier des charges est ouvert dès confirmation.",
    "Merci d’indiquer le numéro de facture en communication lors du règlement.",
    "",
    `${COMPANY.name} · ${INFO_EMAIL}`,
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,Helvetica,sans-serif;color:#071d44;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #d9e0ee;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:24px 28px;background:#071d44;color:#ffffff;">
              <p style="margin:0;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;opacity:.7;">Facture</p>
              <p style="margin:8px 0 0;font-size:22px;font-weight:700;">${input.invoiceNumber}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 28px;">
              <p style="margin:0 0 4px;font-weight:700;">${COMPANY.name}</p>
              <p style="margin:0;color:#5b6b86;font-size:14px;line-height:22px;">
                ${COMPANY.street}<br />${COMPANY.city}<br />${INFO_EMAIL}
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
                <tr>
                  <td style="font-size:14px;color:#5b6b86;">Date</td>
                  <td align="right" style="font-size:14px;">${formatChDate(input.issuedAt)}</td>
                </tr>
                <tr>
                  <td style="padding-top:6px;font-size:14px;color:#5b6b86;">Échéance</td>
                  <td align="right" style="padding-top:6px;font-size:14px;font-weight:700;">${formatChDate(input.dueAt)} · 30 jours net</td>
                </tr>
              </table>
              <p style="margin:24px 0 4px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#5b6b86;">Destinataire</p>
              <p style="margin:0;font-size:14px;line-height:22px;">
                ${escapeHtml(input.organization)}<br />${escapeHtml(input.name)}<br />${escapeHtml(input.address)}<br />${escapeHtml(input.email)}
              </p>
              <p style="margin:24px 0 8px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#5b6b86;">Prestation</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #d9e0ee;border-radius:12px;">
                <tr>
                  <td style="padding:14px 16px;font-size:14px;line-height:22px;">
                    Accès version Pro aux données du cahier des charges<br />
                    <span style="color:#5b6b86;">${escapeHtml(site)} · ${escapeHtml(countLabel)}</span>
                  </td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
                <tr>
                  <td style="padding:4px 0;font-size:14px;color:#5b6b86;">Montant HT</td>
                  <td align="right" style="padding:4px 0;font-size:14px;">${input.ht} CHF</td>
                </tr>
                <tr>
                  <td style="padding:4px 0;font-size:14px;color:#5b6b86;">TVA 8,1 %</td>
                  <td align="right" style="padding:4px 0;font-size:14px;">${input.vat} CHF</td>
                </tr>
                <tr>
                  <td style="padding:10px 0 0;font-size:16px;font-weight:700;">Total TTC</td>
                  <td align="right" style="padding:10px 0 0;font-size:16px;font-weight:700;">${input.ttc} CHF</td>
                </tr>
              </table>
              <p style="margin:24px 0 0;font-size:14px;line-height:22px;color:#5b6b86;">
                Conditions de paiement : 30 jours net. L’accès aux données de ce cahier des charges est ouvert dès confirmation, sans autorisation préalable. Merci d’indiquer le numéro de facture en communication lors du règlement.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, text, html };
}

export async function purchaseAsceProForTender(input: {
  userId: string;
  name: string;
  email: string;
  tenderId: string;
}) {
  const allowed = await userCanViewTender(
    "ascensoriste",
    input.userId,
    input.tenderId,
  );
  if (!allowed) return { ok: false as const, reason: "forbidden" };

  const existing = await userHasAsceProForTender(input.userId, input.tenderId);
  if (existing) return { ok: true as const, already: true };

  const row = await getTenderById(input.tenderId);
  if (!row) return { ok: false as const, reason: "missing" };

  const [account] = await db
    .select({
      organizationName: user.organizationName,
      address: user.address,
    })
    .from(user)
    .where(eq(user.id, input.userId))
    .limit(1);

  const address = normalizeAddress(row.installation.buildingAddress);
  const installationCount = await countInstallationsAtAddress(address);
  const money = vatFromHt(String(asceCdcHt(installationCount)));
  const issuedAt = new Date();
  const dueAt = new Date(issuedAt.getTime() + 30 * 24 * 60 * 60 * 1000);
  const invoiceNumber = await nextInvoiceNumber();
  const ht = formatChf(money.net);
  const vat = formatChf(money.vat);
  const ttc = formatChf(money.ttc);

  try {
    await db.insert(asceProPurchase).values({
      id: crypto.randomUUID(),
      userId: input.userId,
      tenderId: input.tenderId,
      installationId: row.installation.id,
      address,
      installationCount,
      invoiceNumber,
      ht,
      vat,
      ttc,
      dueAt,
      createdAt: issuedAt,
    });
  } catch {
    return { ok: true as const, already: true };
  }
  await logAudit(input.userId, "asce_pro_invoice", input.tenderId);

  const mail = invoiceTexts({
    invoiceNumber,
    issuedAt,
    dueAt,
    organization: account?.organizationName?.trim() || input.name,
    name: input.name,
    address: account?.address?.trim() || "—",
    email: input.email,
    siteAddress: address,
    installationCount,
    ht,
    vat,
    ttc,
  });

  await sendMail({
    to: input.email,
    cc: INFO_EMAIL,
    subject: mail.subject,
    text: mail.text,
    html: mail.html,
    href: `/espace/appels-doffres/${input.tenderId}`,
  });
  await notifyAdmins(
    `Facture ${invoiceNumber} — version Pro, ${account?.organizationName || input.name}`,
    `/espace/appels-doffres/${input.tenderId}`,
  );

  return { ok: true as const, already: false, invoiceNumber };
}
