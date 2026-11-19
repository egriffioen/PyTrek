import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = { title: "Your account · PyTrek" };

async function AccountDetails() {
  const { user } = await requireSession(); // redirects to /sign-in if signed out
  const rows: [string, string][] = [
    ["Display username", user.name],
    ["Email", user.email],
    ["Time zone", user.timeZone || "Not set"],
    ["Role", user.role || "student"],
  ];
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight">Hi, {user.name}!</h1>
      <p className="mt-1 text-neutral-600 dark:text-neutral-400">You&apos;re signed in to PyTrek.</p>
      <dl className="mt-6 divide-y divide-neutral-200 rounded-xl border border-neutral-200 bg-white dark:divide-neutral-800 dark:border-neutral-800 dark:bg-neutral-900">
        {rows.map(([label, value]) => (
          <div key={label} className="flex flex-wrap justify-between gap-2 px-4 py-3 text-sm">
            <dt className="text-neutral-600 dark:text-neutral-400">{label}</dt>
            <dd className="font-medium">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-6">
        <SignOutButton />
      </div>
    </>
  );
}

export default function AccountPage() {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-12">
      <Link href="/" className="text-sm font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
        PyTrek
      </Link>
      <div className="mt-6">
        <Suspense fallback={<p className="text-sm text-neutral-500">Loading your account…</p>}>
          <AccountDetails />
        </Suspense>
      </div>
    </main>
  );
}
