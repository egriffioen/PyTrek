/** Profile rules shared by the browser forms and the server checks. */

/** Display usernames are short labels, not messages. */
export const MAX_NAME_LENGTH = 40;

/** True if `zone` is a real IANA time zone, e.g. "America/Denver". */
export function isValidTimeZone(zone: unknown): zone is string {
  if (typeof zone !== "string" || zone.length === 0 || zone.length > 64) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: zone });
    return true;
  } catch {
    return false;
  }
}
