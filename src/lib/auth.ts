import "server-only";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { getDb, getMongoClient } from "./mongodb";
import { sendEmail } from "./email";
import { resetPasswordEmail, verificationEmail } from "./email-templates";
import { cleanProfile } from "./profile-validation";

const DAY = 60 * 60 * 24;

/**
 * Better Auth configuration (email + password sign-in).
 * Rules come from docs/decisions.md:
 *  - email verification required before sign-in
 *  - sessions last 30 days, renewed once a day when used
 *  - a password reset signs out every device
 *  - passwords 8–128 characters, sign-in attempts rate-limited
 *
 * Emails are awaited (not fire-and-forget) because Cloud Run may pause a
 * container's CPU once the response is sent, which could drop the email.
 */
function createAuth() {
  return betterAuth({
    appName: "PyTrek",
    database: mongodbAdapter(getDb(), { client: getMongoClient() }),

    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      revokeSessionsOnPasswordReset: true,
      resetPasswordTokenExpiresIn: 60 * 60, // 1 hour
      sendResetPassword: async ({ user, url }) => {
        // Never throw: an email failure must look the same as "no such
        // account" (the route also pads response time; see api/auth route).
        try {
          await sendEmail(resetPasswordEmail(user.email, user.name, url));
        } catch (err) {
          console.error("Password reset email failed:", err instanceof Error ? err.name : err);
        }
      },
    },

    emailVerification: {
      sendOnSignUp: true,
      // Don't email on every sign-in attempt by an unverified account (anyone
      // could spam that inbox); students can ask for a resend instead, which
      // is rate-limited.
      sendOnSignIn: false,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }) => {
        await sendEmail(verificationEmail(user.email, url));
      },
    },

    databaseHooks: {
      user: {
        create: { before: async (user) => ({ data: cleanProfile(user) }) },
        update: { before: async (user) => ({ data: cleanProfile(user) }) },
      },
    },

    session: {
      expiresIn: 30 * DAY,
      updateAge: DAY,
    },

    user: {
      // Better Auth's built-in `name` field is the student's free-form display
      // username (shown on completion pages).
      additionalFields: {
        role: {
          type: ["student", "teacher"],
          required: false,
          defaultValue: "student",
          input: false, // only the server can change roles
        },
        timeZone: {
          type: "string",
          required: false,
          input: true, // detected in the browser at sign-up, e.g. "America/Denver"
        },
        activeSectionId: {
          type: "string",
          required: false,
          input: false, // set by joining a section, not by the client directly
        },
      },
    },

    rateLimit: {
      enabled: true,
      storage: "database", // shared across Cloud Run copies (memory isn't)
      window: 60,
      max: 100,
      // Limits are per client IP. A whole classroom on campus Wi-Fi can share
      // one public IP, so sign-up/sign-in allow a class's worth per minute.
      customRules: {
        "/sign-in/email": { window: 60, max: 60 },
        "/sign-up/email": { window: 60, max: 60 },
        "/request-password-reset": { window: 60, max: 10 },
        "/send-verification-email": { window: 60, max: 10 },
      },
    },

    advanced: {
      ipAddress: {
        // Cloud Run's front end appends the real client IP to X-Forwarded-For
        // (after anything the client sent). Skipping Google's load-balancer
        // ranges from the right gives the real client instead of falling back
        // to one shared rate-limit bucket for everyone.
        trustedProxies: ["35.191.0.0/16", "130.211.0.0/22"],
      },
    },

    plugins: [nextCookies()], // must stay last
  });
}

export type Auth = ReturnType<typeof createAuth>;

const globalForAuth = globalThis as unknown as { _pytrekAuth?: Auth };

/** The shared Better Auth instance (created on first use, not at build time). */
export function getAuth(): Auth {
  if (!globalForAuth._pytrekAuth) globalForAuth._pytrekAuth = createAuth();
  return globalForAuth._pytrekAuth;
}
