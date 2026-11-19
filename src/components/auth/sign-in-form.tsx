"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Field, Notice, SubmitButton } from "./form-ui";

export function SignInForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<React.ReactNode>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    setBusy(true);
    const { error } = await authClient.signIn.email({
      email: String(form.get("email") || "").trim(),
      password: String(form.get("password") || ""),
      callbackURL: "/account",
    });
    setBusy(false);

    if (!error) {
      router.push("/account");
      router.refresh();
      return;
    }
    if (error.code === "EMAIL_NOT_VERIFIED") {
      return setError("Please confirm your email first. We just sent you a new confirmation link.");
    }
    if (error.status === 429) {
      return setError("Too many attempts. Wait a minute and try again.");
    }
    setError(error.message || "Couldn't sign you in. Check your email and password.");
  }

  return (
    <form onSubmit={onSubmit}>
      {error && <Notice kind="error">{error}</Notice>}
      <Field label="Email" name="email" type="email" required autoComplete="email" />
      <Field label="Password" name="password" type="password" required autoComplete="current-password" />
      <p className="-mt-2 mb-4 text-right text-sm">
        <Link href="/forgot-password" className="text-emerald-700 hover:underline dark:text-emerald-400">
          Forgot your password?
        </Link>
      </p>
      <SubmitButton busy={busy}>Sign in</SubmitButton>
    </form>
  );
}
