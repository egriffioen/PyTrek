import Link from "next/link";
import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/form-ui";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = { title: "Sign in · PyTrek" };

export default function SignInPage() {
  return (
    <AuthCard
      title="Welcome back, ranger"
      footer={<>New to PyTrek? <Link href="/sign-up" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">Create an account</Link></>}
    >
      <SignInForm />
    </AuthCard>
  );
}
