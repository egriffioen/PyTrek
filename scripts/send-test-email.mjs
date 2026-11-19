// Sends one test email using the SMTP settings in .env.local.
// Usage:  npm run email:test -- you@example.com
// Prints only success or the error type; never prints settings or passwords.
// Uses the same settings parser as the app (src/lib/smtp-config.mjs).
import nodemailer from "nodemailer";
import { missingSmtpSettings, smtpOptionsFromEnv } from "../src/lib/smtp-config.mjs";

const to = process.argv[2];
if (!to) {
  console.log("Usage: npm run email:test -- you@example.com");
  process.exit(1);
}

const missing = missingSmtpSettings();
if (missing.length) {
  console.log("Missing in .env.local:", missing.join(", "));
  process.exit(1);
}

const transport = nodemailer.createTransport(smtpOptionsFromEnv());

try {
  await transport.verify();
  await transport.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "PyTrek test email",
    text: "If you can read this, PyTrek's email settings work.",
  });
  console.log(`Sent a test email to ${to} via ${process.env.SMTP_HOST}.`);
} catch (err) {
  console.log("Email FAILED:", err?.code || err?.name || "error", "| response code:", err?.responseCode ?? "n/a");
  process.exit(1);
}
