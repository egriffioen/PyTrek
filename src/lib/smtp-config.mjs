// SMTP settings from environment variables, shared by the app (src/lib/email.ts)
// and the test script (scripts/send-test-email.mjs) so they can't drift apart.
// Plain JavaScript (not TypeScript) so the script can run with plain Node.

const REQUIRED = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS", "EMAIL_FROM"];

/** Names of required SMTP settings that are missing or empty. */
export function missingSmtpSettings(env = process.env) {
  return REQUIRED.filter((name) => !env[name]);
}

/**
 * Nodemailer SMTP options from the environment.
 * SMTP_SECURE accepts true/false, 1/0, yes/no (any case); if it's unset or
 * empty, TLS-on-connect is used for port 465 and STARTTLS for other ports.
 * @returns {{ host: string, port: number, secure: boolean, auth: { user: string, pass: string } }}
 */
export function smtpOptionsFromEnv(env = process.env) {
  const missing = missingSmtpSettings(env);
  if (missing.length) {
    throw new Error(`Missing email settings: ${missing.join(", ")} (needed when EMAIL_PROVIDER=smtp).`);
  }
  const port = Number(env.SMTP_PORT || 465);
  const raw = (env.SMTP_SECURE || "").trim().toLowerCase();
  const secure = raw === "" ? port === 465 : ["true", "1", "yes"].includes(raw);
  return {
    host: env.SMTP_HOST,
    port,
    secure,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  };
}
