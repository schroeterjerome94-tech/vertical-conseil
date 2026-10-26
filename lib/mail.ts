import "server-only";

import { INFO_EMAIL } from "./constants";
import { saveDevMail } from "./dev-mailbox";

export async function sendMail(input: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  cc?: string | string[];
  replyTo?: string;
  href?: string;
}) {
  const url = input.href
    ? `${process.env.BETTER_AUTH_URL || "http://localhost:3000"}${input.href}`
    : "";
  saveDevMail({
    to: input.to,
    subject: input.subject,
    url,
    body: input.text,
    replyTo: input.replyTo,
  });

  const host = process.env.SMTP_HOST?.trim();
  if (!host) return;

  try {
    const nodemailer = await import("nodemailer");
    const port = Number(process.env.SMTP_PORT || 587);
    const transport = nodemailer.createTransport({
      host,
      port,
      secure: process.env.SMTP_SECURE === "true" || port === 465,
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            }
          : undefined,
    });
    await transport.sendMail({
      from: process.env.SMTP_FROM || INFO_EMAIL,
      to: input.to,
      cc: input.cc,
      subject: input.subject,
      text: input.text,
      html: input.html,
      replyTo: input.replyTo,
    });
  } catch (error) {
    console.error("[e-mail] envoi impossible", error);
  }
}
