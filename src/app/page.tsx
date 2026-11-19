import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-4 py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
        Coming soon
      </p>
      <h1 className="text-4xl font-bold tracking-tight">PyTrek</h1>
      <p className="text-lg leading-relaxed">
        Fun, hands-on Python practice for BYU CS 111. Solve{" "}
        <em>The Case of the Missing Trail Markers</em> by scraping, crawling,
        and decoding a park website, all in your browser.
      </p>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">
        Starting with the web scraping unit. More of the CS 111 curriculum to
        follow.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link href="/sign-up" className="rounded-lg bg-emerald-700 px-4 py-2.5 font-medium text-white hover:bg-emerald-800">
          Create an account
        </Link>
        <Link href="/sign-in" className="rounded-lg border border-neutral-300 px-4 py-2.5 font-medium hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800">
          Sign in
        </Link>
      </div>
    </main>
  );
}
