import type { ReactNode } from "react";

/**
 * Story building blocks shared by the briefing, lesson notes, and clues.
 * Long notes use the normal reading font (Work Sans); the handwriting font is
 * only for short bits like headings and signatures (docs/fonts.md).
 */

/** A note from the senior ranger, on paper with a strip of tape. */
export function RangerNote({
  heading,
  from,
  html,
  signoff,
  children,
}: {
  heading: string;
  from?: string;
  html: string;
  signoff?: string;
  children?: ReactNode;
}) {
  return (
    <div className="relative mx-auto max-w-2xl">
      <div aria-hidden className="absolute -top-3 left-1/2 z-10 h-6 w-28 -translate-x-1/2 -rotate-2 bg-amber-200/80 shadow-sm dark:bg-amber-300/40" />
      <article className="relative rotate-[-0.4deg] rounded-sm border border-stone-300 bg-paper px-6 pb-6 pt-8 shadow-md dark:border-neutral-700 dark:bg-neutral-900 sm:px-10">
        {from && <p className="text-xs font-semibold uppercase tracking-widest text-stone-500">{from}</p>}
        <h2 className="mt-1 font-ranger text-2xl text-emerald-900 dark:text-emerald-300 sm:text-3xl">{heading}</h2>
        <div className="prose-pytrek mt-4 space-y-3 leading-relaxed text-stone-800 dark:text-stone-200" dangerouslySetInnerHTML={{ __html: html }} />
        {signoff && <p className="mt-5 text-right font-ranger text-2xl text-emerald-900 dark:text-emerald-300">{signoff}</p>}
        {children && <div className="mt-6">{children}</div>}
      </article>
    </div>
  );
}

/** A message from the rogue agent, as lines in a terminal / access log. */
export function AgentLog({ html, label = "TrailNet access log" }: { html: string; label?: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950 text-sm">
      <p className="border-b border-neutral-800 px-3 py-1.5 font-agent text-xs uppercase tracking-widest text-red-400">{label}</p>
      <div
        className="agent-log overflow-x-auto px-3 py-2 font-agent text-lime-300 [&_pre]:m-0 [&_pre]:whitespace-pre-wrap [&_pre]:font-agent"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

/** A clue card for the case board. */
export function ClueCard({ title, html, label = "New clue" }: { title: string; html: string; label?: string }) {
  return (
    <div className="rounded-sm border border-stone-300 bg-[#fdf6e3] p-4 shadow-sm dark:border-neutral-700 dark:bg-stone-900">
      <p className="text-xs font-semibold uppercase tracking-widest text-red-700 dark:text-red-400">{label}</p>
      <p className="mt-1 font-ranger text-xl text-stone-900 dark:text-stone-100">{title}</p>
      <div className="prose-pytrek mt-2 text-sm leading-relaxed text-stone-700 dark:text-stone-300" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
