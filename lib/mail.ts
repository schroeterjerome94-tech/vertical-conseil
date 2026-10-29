export const INFO_EMAIL = "info@vertical-conseil.ch";

export async function sendMail(input: {
  to?: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}) {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  if (!host || !user || !pass) {
    throw new Error("SMTP_NOT_CONFIGURED");
  }

  const nodemailer = await import("nodemailer");
  const port = Number(process.env.SMTP_PORT || 587);
  const transport = nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
    requireTLS: port === 587,
    auth: { user, pass },
  });

  await transport.sendMail({
    from: process.env.SMTP_FROM?.trim() || INFO_EMAIL,
    to: input.to?.trim() || process.env.CONTACT_TO?.trim() || INFO_EMAIL,
    subject: input.subject,
    text: input.text,
    html: input.html,
    replyTo: input.replyTo,
  });
}
