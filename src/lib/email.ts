import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

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

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set (needed when EMAIL_PROVIDER=smtp).`);
  return value;
}

const globalForEmail = globalThis as unknown as { _pytrekMailer?: Transporter };

function smtpTransport(): Transporter {
  if (!globalForEmail._pytrekMailer) {
    const port = Number(process.env.SMTP_PORT || 465);
    globalForEmail._pytrekMailer = nodemailer.createTransport({
      host: required("SMTP_HOST"),
      port,
      // 465 = TLS from the start; 587 = STARTTLS upgrade.
      secure: (process.env.SMTP_SECURE ?? String(port === 465)) === "true",
      auth: { user: required("SMTP_USER"), pass: required("SMTP_PASS") },
    });
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
  await smtpTransport().sendMail({
    from: required("EMAIL_FROM"),
    to: email.to,
    subject: email.subject,
    text: email.text,
    html: email.html,
  });
}
