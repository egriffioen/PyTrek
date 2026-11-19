import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/lib/auth";

// All Better Auth endpoints live under /api/auth/* (sign-up, sign-in,
// sign-out, verify-email, request-password-reset, reset-password, ...).
export async function GET(request: Request) {
  return toNextJsHandler(getAuth()).GET(request);
}

export async function POST(request: Request) {
  return toNextJsHandler(getAuth()).POST(request);
}
