import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard, Notice } from "@/components/auth/form-ui";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = { title: "Choose a new password · PyTrek" };

// The reset link redirects here with ?token=... (or ?error=INVALID_TOKEN).
async function ResetContent({ searchParams }: { searchParams: PageProps<"/reset-password">["searchParams"] }) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : null;

  if (!token || params.error) {
    return (
      <Notice kind="error">
        This reset link is invalid or has expired.{" "}
        <Link href="/forgot-password" className="font-medium underline">Request a new one</Link>.
      </Notice>
    );
  }
  return <ResetPasswordForm token={token} />;
}

export default function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  return (
    <AuthCard title="Choose a new password">
      <Suspense fallback={<p className="text-sm text-neutral-500">Loading…</p>}>
        <ResetContent searchParams={searchParams} />
      </Suspense>
    </AuthCard>
  );
}
