import Link from "next/link";
import { HelloPython } from "@/components/home/hello-python";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-4 py-16">
      {/* No `uppercase` class here, so "PyTrek" keeps its capitalization. */}
      <h1 className="text-4xl font-bold tracking-tight text-emerald-700 sm:text-5xl dark:text-emerald-400">
        Welcome to PyTrek
      </h1>
      <p className="text-lg leading-relaxed">
        Fun, hands-on Python practice for BYU CS 111. Solve{" "}
        <em>The Case of the Missing Trail Markers</em> by scraping, crawling,
        and decoding a park website, all in your browser.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/sign-up"
          className="rounded-xl bg-emerald-700 px-6 py-4 text-center text-lg font-semibold text-white shadow-sm hover:bg-emerald-800 sm:flex-1"
        >
          Create an account
        </Link>
        <Link
          href="/sign-in"
          className="rounded-xl border-2 border-emerald-700 px-6 py-4 text-center text-lg font-semibold text-emerald-800 hover:bg-emerald-50 sm:flex-1 dark:text-emerald-300 dark:hover:bg-emerald-950"
        >
          Sign in
        </Link>
      </div>

      <HelloPython />

      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        Starting with the web scraping unit. More of the CS 111 curriculum to
        follow.
      </p>
    </main>
  );
}
