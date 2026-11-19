import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "./auth";

/** The signed-in user's session, or null. Call from server components/actions. */
export async function getSession() {
  return getAuth().api.getSession({ headers: await headers() });
}

/** Like getSession, but sends signed-out visitors to the sign-in page. */
export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  return session;
}
