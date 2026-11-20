/** Placeholder shown while an expedition or lesson page reads its URL. */
export function PageHeaderSkeleton() {
  return (
    <main className="flex flex-1 flex-col bg-sand dark:bg-stone-950" aria-busy="true">
      <div className="bg-emerald-900 px-4 py-10 dark:bg-emerald-950">
        <div className="mx-auto max-w-4xl">
          <div className="h-4 w-24 rounded bg-emerald-700/60" />
          <div className="mt-5 h-8 w-2/3 rounded bg-emerald-700/60" />
          <div className="mt-3 h-4 w-1/2 rounded bg-emerald-700/40" />
        </div>
      </div>
      <p className="mx-auto w-full max-w-4xl px-4 py-8 text-sm text-neutral-500">Loading the trail…</p>
    </main>
  );
}
