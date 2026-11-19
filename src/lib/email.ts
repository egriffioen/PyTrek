import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { smtpOptionsFromEnv } from "./smtp-config.mjs";

/**
 * Sends PyTrek's emails (account verification, password resets).
 *
 * The provider is chosen entirely by environment variables, so switching from
 * the pilot's project Gmail to a real provider (Resend, Brevo, Mailgun, SES...)
 * means changing settings only, not code. Almost every provider offers SMTP:
 *
 *   EMAIL_PROVIDER=smtp
 *   SMTP_HOST=smtp.gmail.com   (Resend: smtp.resend.com)
 *   SMTP_PORT=465
 *   SMTP_SECURE=true
 *   SMTP_USER=...              (Gmail: the full address; Resend: "resend")
 *   SMTP_PASS=...              (Gmail: app password; Resend: API key)
 *   EMAIL_FROM="PyTrek <...>"
 *
 * EMAIL_PROVIDER=console prints a short notice to the server log instead of
 * sending (handy for local development without email settings).
 */

export type Email = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

type Provider = "smtp" | "console";

function provider(): Provider {
  const value = (process.env.EMAIL_PROVIDER || "console").toLowerCase();
  if (value !== "smtp" && value !== "console") {
    throw new Error(`Unknown EMAIL_PROVIDER "${value}". Use "smtp" or "console".`);
  }
  return value;
}

const globalForEmail = globalThis as unknown as { _pytrekMailer?: Transporter };

function smtpTransport(): Transporter {
  if (!globalForEmail._pytrekMailer) {
    globalForEmail._pytrekMailer = nodemailer.createTransport(smtpOptionsFromEnv());
  }
  return globalForEmail._pytrekMailer;
}

/** Send one email using whichever provider the environment selects. */
export async function sendEmail(email: Email): Promise<void> {
  if (provider() === "console") {
    // Don't print the body: it may contain one-time links or codes.
    console.info(`[email:console] would send "${email.subject}" to ${email.to}`);
    return;
  }
  const transport = smtpTransport(); // validates the SMTP_* / EMAIL_FROM settings
  await transport.sendMail({
    from: process.env.EMAIL_FROM,
    to: email.to,
    subject: email.subject,
    text: email.text,
    html: email.html,
  });
}
