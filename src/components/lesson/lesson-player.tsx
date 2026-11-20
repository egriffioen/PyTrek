"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Activity, Lesson } from "@/lib/content";
import { useLocalProgress } from "@/lib/local-progress";
import { PythonRunner } from "@/lib/python-runner";
import { ProgressBar } from "./progress-bar";
import { CodingActivity } from "./coding-activity";
import { ConceptActivity } from "./concept-activity";

export type ExpeditionInfo = {
  id: string;
  title: string;
  harness: string;
  site: Record<string, string>;
};

export type Prerequisite = { id: string; title: string; lessonId: string };

const TYPE_LABELS: Record<Activity["type"], string> = {
  example: "Run it",
  tweak: "Tweak it",
  fix: "Fix the bug",
  finish: "Finish the code",
  concept: "Concept check",
  puzzle: "Puzzle",
};

const noSubscribe = () => () => {};

export function LessonPlayer({
  expedition,
  lesson,
  lessonNumber,
  lessonCount,
  prerequisites,
  nextLesson,
}: {
  expedition: ExpeditionInfo;
  lesson: Lesson;
  lessonNumber: number;
  lessonCount: number;
  prerequisites: Prerequisite[];
  nextLesson: { id: string; title: string } | null;
}) {
  const progress = useLocalProgress();
  // Progress lives in the browser, so wait until we're in the browser to show activities.
  const hydrated = useSyncExternalStore(noSubscribe, () => true, () => false);
  const [selected, setSelected] = useState<number | null>(null);

  const runnerRef = useRef<PythonRunner | null>(null);
  useEffect(() => () => runnerRef.current?.stop(), []);
  const getRunner = useCallback(() => (runnerRef.current ??= new PythonRunner()), []);

  const activities = lesson.activities;
  const isDone = (a: Activity) => Boolean(progress.done[a.id]);
  const firstOpen = activities.findIndex((a) => !isDone(a));
  const current = selected ?? (firstOpen === -1 ? 0 : firstOpen);
  const activity = activities[current];
  const allDone = activities.every(isDone);
  const steps = activities.map((a) => ({ id: a.id, title: a.title, milestone: a.stage === "milestone", done: isDone(a) }));

  // Finishing an activity changes which one is "first unfinished"; pin the
  // current one so the student sees their feedback instead of jumping ahead.
  const stayHere = () => setSelected(current);
  const goNext = () => setSelected(Math.min(current + 1, activities.length - 1));
  const lessonHref = (id: string) => `/expeditions/${expedition.id}/${id}`;

  return (
    <main className="flex flex-1 flex-col bg-sand dark:bg-stone-950">
      <header className="bg-emerald-900 px-4 pb-6 pt-5 text-paper dark:bg-emerald-950">
        <div className="mx-auto max-w-4xl">
          <nav className="text-sm text-emerald-200">
            <Link href="/" className="font-semibold uppercase tracking-widest text-emerald-300">
              PyTrek
            </Link>
            <span className="mx-2">›</span>
            <Link href={`/expeditions/${expedition.id}`} className="hover:underline">
              {expedition.title}
            </Link>
          </nav>
          <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-emerald-200">
            Lesson {lessonNumber} of {lessonCount}
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">{lesson.title}</h1>
          <p className="mt-2 text-emerald-50">{lesson.summary}</p>
        </div>
      </header>

      <div className="mx-auto w-full max-w-4xl px-4 py-6">
        <div className="pt-4">
          <ProgressBar steps={steps} current={current} onSelect={setSelected} />
        </div>

        {!hydrated ? (
          <p className="mt-8 text-sm text-neutral-500">Loading the trail…</p>
        ) : (
          <article key={activity.id} className="mt-6 rounded-xl border border-stone-300 bg-paper p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide">
              <span
                className={`rounded-full px-2.5 py-1 ${
                  activity.stage === "milestone"
                    ? "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
                    : "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
                }`}
              >
                {activity.stage === "milestone" ? "⛳ Milestone" : `Checkpoint ${current + 1}`}
              </span>
              <span className="text-neutral-500">{TYPE_LABELS[activity.type]}</span>
              {isDone(activity) && <span className="text-emerald-700 dark:text-emerald-400">✓ Done</span>}
            </div>
            <h2 className="mt-3 text-2xl font-bold tracking-tight">{activity.title}</h2>

            {activity.story && (
              <div
                className="prose-pytrek mt-4 rounded-lg border-l-4 border-amber-500 bg-amber-50 px-4 py-3 font-ranger text-lg leading-relaxed text-amber-950 dark:bg-amber-950/40 dark:text-amber-100"
                dangerouslySetInnerHTML={{ __html: activity.story }}
              />
            )}
            {activity.learn && (
              <section className="mt-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Learn</h3>
                <div className="prose-pytrek mt-1 leading-relaxed" dangerouslySetInnerHTML={{ __html: activity.learn }} />
              </section>
            )}
            <section className="mt-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">Your task</h3>
              <div className="prose-pytrek mt-1 font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: activity.task }} />
            </section>

            <div className="mt-5">
              {activity.type === "concept" ? (
                <ConceptActivity activity={activity} onPassed={stayHere} />
              ) : (
                <CodingActivity
                  activity={activity}
                  expedition={expedition}
                  prerequisites={prerequisites.filter((p) => activity.preload.includes(p.id))}
                  passingCode={progress.passingCode}
                  draft={progress.drafts[activity.id]}
                  getRunner={getRunner}
                  lessonHref={lessonHref}
                  onPassed={stayHere}
                />
              )}
            </div>

            {isDone(activity) && (
              <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-stone-200 pt-4 dark:border-neutral-800">
                {current < activities.length - 1 ? (
                  <button type="button" onClick={goNext} className="rounded-lg bg-emerald-700 px-5 py-2 font-medium text-white hover:bg-emerald-800">
                    Next: {activities[current + 1].title} →
                  </button>
                ) : !allDone ? (
                  <button
                    type="button"
                    onClick={() => setSelected(firstOpen)}
                    className="rounded-lg bg-emerald-700 px-5 py-2 font-medium text-white hover:bg-emerald-800"
                  >
                    Back to {activities[firstOpen].title} →
                  </button>
                ) : null}
              </div>
            )}
          </article>
        )}

        {hydrated && allDone && (
          <section className="mt-6 rounded-xl border-2 border-emerald-600 bg-emerald-50 p-5 dark:bg-emerald-950">
            <p className="text-lg font-bold text-emerald-900 dark:text-emerald-200">Lesson complete! 🎉</p>
            <p className="mt-1 text-emerald-900 dark:text-emerald-100">You finished every checkpoint and the milestone in {lesson.title}.</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {nextLesson && (
                <Link href={lessonHref(nextLesson.id)} className="rounded-lg bg-emerald-700 px-5 py-2 font-medium text-white hover:bg-emerald-800">
                  Next lesson: {nextLesson.title} →
                </Link>
              )}
              <Link
                href={`/expeditions/${expedition.id}`}
                className="rounded-lg border-2 border-emerald-700 px-5 py-2 font-medium text-emerald-800 hover:bg-emerald-100 dark:text-emerald-200"
              >
                All lessons
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
