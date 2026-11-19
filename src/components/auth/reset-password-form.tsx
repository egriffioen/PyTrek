"use client";

import Link from "next/link";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Field, Notice, SubmitButton } from "./form-ui";

export function ResetPasswordForm({ token }: { token: string }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const newPassword = String(form.get("password") || "");
    if (newPassword !== String(form.get("confirm") || "")) return setError("Those passwords don't match.");

    setBusy(true);
    const { error } = await authClient.resetPassword({ newPassword, token });
    setBusy(false);
    if (error) {
      return setError(error.message || "That reset link is invalid or expired. Request a new one.");
    }
    setDone(true);
  }

  if (done) {
    return (
      <Notice kind="success">
        Your password was changed, and you&apos;ve been signed out everywhere.{" "}
        <Link href="/sign-in" className="font-medium underline">Sign in</Link> with your new password.
      </Notice>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      {error && <Notice kind="error">{error}</Notice>}
      <Field label="New password" name="password" type="password" required minLength={8} maxLength={128}
        autoComplete="new-password" hint="At least 8 characters." />
      <Field label="Confirm new password" name="confirm" type="password" required minLength={8} maxLength={128}
        autoComplete="new-password" />
      <SubmitButton busy={busy}>Change password</SubmitButton>
    </form>
  );
}
