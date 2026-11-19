import Link from "next/link";
import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/form-ui";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = { title: "Reset your password · PyTrek" };

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a link to choose a new one."
      footer={<Link href="/sign-in" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">Back to sign in</Link>}
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
