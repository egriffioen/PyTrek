import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { Auth } from "./auth";

/** Browser-side Better Auth client (same origin, so no baseURL needed). */
export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<Auth>()],
});
