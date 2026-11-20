import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "./auth";

/** The signed-in user's session, or null. Call from server components/actions. */
export async function getSession() {
  // Read the request first: during the build this pauses prerendering here,
  // before getAuth() opens a database connection the build machine can't make.
  const requestHeaders = await headers();
  return getAuth().api.getSession({ headers: requestHeaders });
}

/** Like getSession, but sends signed-out visitors to the sign-in page. */
export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  return session;
}
