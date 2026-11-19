import Link from "next/link";
import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/form-ui";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = { title: "Create an account · PyTrek" };

export default function SignUpPage() {
  return (
    <AuthCard
      title="Create your PyTrek account"
      subtitle="Free, no installs. Python runs right in your browser."
      footer={<>Already have an account? <Link href="/sign-in" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">Sign in</Link></>}
    >
      <SignUpForm />
    </AuthCard>
  );
}
