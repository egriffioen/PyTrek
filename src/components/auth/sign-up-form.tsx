"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { MAX_NAME_LENGTH } from "@/lib/profile-rules";
import { Field, Notice, SubmitButton } from "./form-ui";

export function SignUpForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    const confirm = String(form.get("confirm") || "");

    if (password !== confirm) return setError("Those passwords don't match.");

    setBusy(true);
    const { error } = await authClient.signUp.email({
      name,
      email,
      password,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      callbackURL: "/account", // where the verification link lands
    });
    setBusy(false);

    if (error) return setError(error.message || "Couldn't create your account. Try again.");
    setSentTo(email);
  }

  if (sentTo) {
    return (
      <Notice kind="success">
        Check your email! We sent a confirmation link to <strong>{sentTo}</strong>. Click it to
        start using PyTrek. (Don&apos;t see it? Check your spam folder.)
      </Notice>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate={false}>
      {error && <Notice kind="error">{error}</Notice>}
      <Field label="Display username" name="name" required maxLength={MAX_NAME_LENGTH} autoComplete="nickname"
        hint="Any name you like. It shows on your completion page." />
      <Field label="Email" name="email" type="email" required autoComplete="email"
        hint="Your BYU email works great." />
      <Field label="Password" name="password" type="password" required minLength={8} maxLength={128}
        autoComplete="new-password" hint="At least 8 characters. A short phrase is easy to remember." />
      <Field label="Confirm password" name="confirm" type="password" required minLength={8} maxLength={128}
        autoComplete="new-password" />
      <SubmitButton busy={busy}>Create account</SubmitButton>
    </form>
  );
}
