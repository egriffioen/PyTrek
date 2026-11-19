import "server-only";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { getDb, getMongoClient } from "./mongodb";
import { sendEmail } from "./email";
import { resetPasswordEmail, verificationEmail } from "./email-templates";

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
        await sendEmail(resetPasswordEmail(user.email, user.name, url));
      },
    },

    emailVerification: {
      sendOnSignUp: true,
      sendOnSignIn: true, // re-send if an unverified user tries to sign in
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }) => {
        await sendEmail(verificationEmail(user.email, user.name, url));
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
      customRules: {
        "/sign-in/email": { window: 60, max: 5 },
        "/sign-up/email": { window: 60, max: 5 },
        "/request-password-reset": { window: 60, max: 3 },
        "/send-verification-email": { window: 60, max: 3 },
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
