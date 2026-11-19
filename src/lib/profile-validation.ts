import "server-only";
import { APIError } from "better-auth/api";
import { isValidTimeZone, MAX_NAME_LENGTH } from "./profile-rules";

/**
 * Server-side checks for user-editable profile fields (the browser's
 * maxLength is only a hint). Used by Better Auth's create/update hooks.
 * - name: trimmed, 1–40 characters (rejects the request otherwise)
 * - timeZone: kept only if it's a real IANA zone (dropped otherwise, so a bad
 *   browser value never blocks sign-up)
 */
export function cleanProfile<T extends Record<string, unknown>>(data: T): T {
  const out: Record<string, unknown> = { ...data };
  if ("name" in out) {
    const name = typeof out.name === "string" ? out.name.trim() : "";
    if (name.length < 1 || name.length > MAX_NAME_LENGTH) {
      throw new APIError("BAD_REQUEST", {
        message: `Display username must be 1–${MAX_NAME_LENGTH} characters.`,
      });
    }
    out.name = name;
  }
  if ("timeZone" in out && out.timeZone != null && !isValidTimeZone(out.timeZone)) {
    // Set to null (not delete): Better Auth merges hook data over the original.
    out.timeZone = null;
  }
  return out as T;
}
