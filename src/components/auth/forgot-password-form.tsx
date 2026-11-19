"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Field, Notice, SubmitButton } from "./form-ui";

export function ForgotPasswordForm() {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    setBusy(true);
    const { error } = await authClient.requestPasswordReset({
      email: String(form.get("email") || "").trim(),
      redirectTo: "/reset-password",
    });
    setBusy(false);
    if (error?.status === 429) return setError("Too many requests. Wait a minute and try again.");
    if (error) {
      // The server answers the same for real and unknown accounts, so an error
      // here means the request itself failed (network or server problem).
      return setError("Something went wrong sending the reset link. Try again in a few minutes.");
    }
    // Same message whether or not the account exists, so emails can't be guessed.
    setDone(true);
  }

  if (done) {
    return (
      <Notice kind="success">
        If there&apos;s a PyTrek account for that email, we sent a link to reset your password.
        It expires in 1 hour. (Check your spam folder too.)
      </Notice>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      {error && <Notice kind="error">{error}</Notice>}
      <Field label="Email" name="email" type="email" required autoComplete="email" />
      <SubmitButton busy={busy}>Send reset link</SubmitButton>
    </form>
  );
}
