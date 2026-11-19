// Sends one test email using the SMTP settings in .env.local.
// Usage:  npm run email:test -- you@example.com
// Prints only success or the error type; never prints settings or passwords.
import nodemailer from "nodemailer";

const to = process.argv[2];
if (!to) {
  console.log("Usage: npm run email:test -- you@example.com");
  process.exit(1);
}

const need = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS", "EMAIL_FROM"];
const missing = need.filter((name) => !process.env[name]);
if (missing.length) {
  console.log("Missing in .env.local:", missing.join(", "));
  process.exit(1);
}

const port = Number(process.env.SMTP_PORT || 465);
const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port,
  secure: (process.env.SMTP_SECURE ?? String(port === 465)) === "true",
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

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
