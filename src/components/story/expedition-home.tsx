"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import type { Briefing, Characters, Reviews } from "@/lib/content";
import { markSeen, useLocalProgress } from "@/lib/local-progress";
import { CheckMark, StarMark } from "./marks";
import { ClueCard, RangerNote } from "./story-pieces";
import { TrailMap, type MapStop } from "./trail-map";

export type LessonSummary = {
  id: string;
  title: string;
  summary: string;
  activityIds: string[];
  milestoneId: string | null;
  clue: { title: string; text: string } | null;
};

type Screen = "note" | "reviews" | "map";
const noSubscribe = () => () => {};

/**
 * The expedition's home: on the first visit, the senior ranger's briefing and
 * the hiker reviews; after that, the sketch map, trail log, and case board.
 */
export function ExpeditionHome({
  expedition,
  lessons,
}: {
  expedition: {
    id: string;
    title: string;
    characters: Characters | null;
    briefing: Briefing | null;
    reviews: Reviews | null;
  };
  lessons: LessonSummary[];
}) {
  const progress = useLocalProgress();
  const hydrated = useSyncExternalStore(noSubscribe, () => true, () => false);
  const [chosen, setChosen] = useState<Screen | null>(null);
  const seenKey = `briefing:${expedition.id}`;
  const screen: Screen = chosen ?? (expedition.briefing && !progress.seen[seenKey] ? "note" : "map");

  const takeCase = () => {
    markSeen(seenKey);
    setChosen("map");
    window.scrollTo({ top: 0 });
  };
  const show = (s: Screen) => {
    setChosen(s);
    window.scrollTo({ top: 0 });
  };

  if (!hydrated) return <p className="mx-auto w-full max-w-5xl px-4 py-10 text-sm text-neutral-500">Unfolding the map…</p>;

  if (screen === "note" && expedition.briefing) {
    const mentor = expedition.characters?.mentor;
    return (
      <div className="px-4 py-10">
        <RangerNote
          from={mentor ? `From the desk of ${mentor.name}, ${mentor.role}` : undefined}
          heading={expedition.briefing.title}
          html={expedition.briefing.body}
          signoff={expedition.briefing.signoff}
        >
          <div className="flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={() => (expedition.reviews ? show("reviews") : takeCase())}
              className="rounded-lg bg-emerald-700 px-5 py-2.5 font-medium text-white hover:bg-emerald-800"
            >
              {expedition.reviews ? "Read the hiker reviews" : "Take the case"}
            </button>
          </div>
        </RangerNote>
      </div>
    );
  }

  if (screen === "reviews" && expedition.reviews) {
    return (
      <div className="px-4 py-10">
        <ReviewSite reviews={expedition.reviews} />
        <div className="mx-auto mt-6 flex max-w-2xl flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={() => show("note")} className="text-sm text-neutral-600 underline hover:text-neutral-900 dark:text-neutral-400">
            Back to Ruth&apos;s note
          </button>
          <button type="button" onClick={takeCase} className="rounded-lg bg-emerald-700 px-6 py-2.5 font-medium text-white hover:bg-emerald-800">
            Take the case
          </button>
        </div>
      </div>
    );
  }

  // ---- Map ----
  const isDone = (id: string) => Boolean(progress.done[id]);
  const firstOpen = lessons.findIndex((l) => l.activityIds.length && !l.activityIds.every(isDone));
  const stops: MapStop[] = lessons.map((l, i) => ({
    id: l.id,
    number: i + 1,
    title: l.title,
    href: l.activityIds.length ? `/expeditions/${expedition.id}/${l.id}` : null,
    state: !l.activityIds.length ? "soon" : l.activityIds.every(isDone) ? "done" : i === firstOpen ? "next" : "open",
  }));
  const clues = lessons.filter((l) => l.clue);
  const found = clues.filter((l) => l.milestoneId && isDone(l.milestoneId));
  const agentName = expedition.characters?.agent.name ?? "the culprit";

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:items-start">
        <TrailMap stops={stops} summitLabel={`Confront ${agentName} (coming soon)`} />

        <div className="space-y-8">
          <section>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-ranger text-2xl text-emerald-900 dark:text-emerald-300">Trail log</h2>
              {expedition.briefing && (
                <button type="button" onClick={() => show("note")} className="text-sm text-emerald-800 underline hover:text-emerald-950 dark:text-emerald-300">
                  Read the briefing again
                </button>
              )}
            </div>
            <ol className="mt-3 space-y-2">
              {lessons.map((l, i) => {
                const done = l.activityIds.filter(isDone).length;
                const total = l.activityIds.length;
                const body = (
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-8 w-8 flex-none items-center justify-center rounded-full border-2 font-ranger text-lg ${
                        total && done === total
                          ? "border-emerald-800 bg-emerald-800 text-white"
                          : total
                            ? "border-stone-700 text-stone-800 dark:border-stone-300 dark:text-stone-200"
                            : "border-dashed border-stone-400 text-stone-400"
                      }`}
                    >
                      {total && done === total ? <CheckMark className="h-4 w-4" title="done" /> : i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`font-semibold ${total ? "" : "text-stone-400"}`}>{l.title}</p>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">
                        {total ? `${done} of ${total} done` : "Coming soon"}
                      </p>
                    </div>
                  </div>
                );
                return (
                  <li key={l.id}>
                    {total ? (
                      <Link
                        href={`/expeditions/${expedition.id}/${l.id}`}
                        className="block rounded-lg border border-stone-300 bg-paper px-3 py-2 hover:border-emerald-700 dark:border-neutral-800 dark:bg-neutral-900"
                      >
                        {body}
                      </Link>
                    ) : (
                      <div className="rounded-lg border border-dashed border-stone-300 px-3 py-2 dark:border-neutral-700">{body}</div>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>

          <section>
            <h2 className="font-ranger text-2xl text-emerald-900 dark:text-emerald-300">Case board</h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              {found.length ? `${found.length} of ${clues.length} clues found.` : "Finish a lesson's Milestone to pin its clue here."}
            </p>
            <div className="mt-3 space-y-3">
              {found.map((l) => (
                <ClueCard key={l.id} label={`Clue from ${l.title}`} title={l.clue!.title} html={l.clue!.text} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/** The fake hiker-review site shown after the briefing. */
function ReviewSite({ reviews }: { reviews: Reviews }) {
  const avg = reviews.reviews.reduce((n, r) => n + r.rating, 0) / reviews.reviews.length;
  return (
    <div className="mx-auto max-w-2xl overflow-hidden rounded-xl border border-stone-300 bg-white shadow-md dark:border-neutral-700 dark:bg-neutral-900">
      <div className="flex items-center gap-2 border-b border-stone-200 bg-stone-100 px-3 py-2 dark:border-neutral-800 dark:bg-neutral-800">
        <span className="flex gap-1" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-stone-300 dark:bg-neutral-600" />
          <span className="h-2.5 w-2.5 rounded-full bg-stone-300 dark:bg-neutral-600" />
          <span className="h-2.5 w-2.5 rounded-full bg-stone-300 dark:bg-neutral-600" />
        </span>
        <span className="min-w-0 flex-1 truncate rounded bg-white px-2 py-0.5 font-mono text-xs text-stone-600 dark:bg-neutral-900 dark:text-neutral-300">
          https://{reviews.site.toLowerCase()}.test/parks/pythonia
        </span>
      </div>
      <div className="bg-sky-800 px-5 py-4 text-white">
        <p className="text-2xl font-bold tracking-tight">{reviews.site}</p>
        <p className="text-sm text-sky-100">{reviews.tagline}</p>
      </div>
      <div className="px-5 py-4">
        <h2 className="text-lg font-semibold">Pythonia National Park</h2>
        <div className="mt-1 flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
          <Stars rating={Math.round(avg)} />
          <span>
            {avg.toFixed(1)} average from {reviews.reviews.length} recent reviews
          </span>
        </div>
        <ul className="mt-4 divide-y divide-stone-200 dark:divide-neutral-800">
          {reviews.reviews.map((r, i) => (
            <li key={i} className="py-4">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-semibold">{r.author}</span>
                <Stars rating={r.rating} />
                <span className="text-xs text-neutral-500">
                  {r.trail} · {r.date}
                </span>
              </div>
              <p className="mt-1.5 leading-relaxed text-neutral-800 dark:text-neutral-200" dangerouslySetInnerHTML={{ __html: r.text }} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex text-amber-500" role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <StarMark key={n} filled={n <= rating} />
      ))}
    </span>
  );
}
