import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/lib/auth";

// All Better Auth endpoints live under /api/auth/* (sign-up, sign-in,
// sign-out, verify-email, request-password-reset, reset-password, ...).

// Built once, on first request (not at build time: needs database settings).
let handlers: ReturnType<typeof toNextJsHandler> | undefined;
const getHandlers = () => (handlers ??= toNextJsHandler(getAuth()));

// Password-reset requests always take at least this long, so response time
// can't reveal whether an account exists (a real account waits on email).
const RESET_MIN_MS = 3000;

export async function GET(request: Request) {
  return getHandlers().GET(request);
}

export async function POST(request: Request) {
  if (!new URL(request.url).pathname.endsWith("/request-password-reset")) {
    return getHandlers().POST(request);
  }
  const started = Date.now();
  const response = await getHandlers().POST(request);
  const wait = RESET_MIN_MS - (Date.now() - started);
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
  return response;
}
