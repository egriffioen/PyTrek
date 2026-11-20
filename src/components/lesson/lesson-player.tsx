"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Activity, Lesson } from "@/lib/content";
import { markSeen, useLocalProgress } from "@/lib/local-progress";
import { PythonRunner } from "@/lib/python-runner";
import { CairnMark, CheckMark } from "@/components/story/marks";
import { AgentLog, ClueCard, RangerNote } from "@/components/story/story-pieces";
import { ProgressBar } from "./progress-bar";
import { CodingActivity } from "./coding-activity";
import { ConceptActivity } from "./concept-activity";

export type ExpeditionInfo = {
  id: string;
  title: string;
  harness: string;
  site: Record<string, string>;
  /** Senior ranger's name, for "A note from ..." headings. */
  mentorName: string | null;
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
  const [showIntro, setShowIntro] = useState<boolean | null>(null);

  const runnerRef = useRef<PythonRunner | null>(null);
  useEffect(() => () => runnerRef.current?.stop(), []);
  const getRunner = useCallback(() => (runnerRef.current ??= new PythonRunner()), []);

  const activities = lesson.activities;
  const isDone = (a: Activity) => Boolean(progress.done[a.id]);
  const firstOpen = activities.findIndex((a) => !isDone(a));
  const current = selected ?? (firstOpen === -1 ? 0 : firstOpen);
  const activity = activities[current];
  const allDone = activities.every(isDone);
  const milestone = activities.find((a) => a.stage === "milestone");
  const clueFound = Boolean(lesson.clue && milestone && isDone(milestone));
  const steps = activities.map((a) => ({ id: a.id, title: a.title, milestone: a.stage === "milestone", done: isDone(a) }));

  // The ranger's intro note opens the lesson on the first visit.
  const introKey = `intro:${expedition.id}/${lesson.id}`;
  const introOpen = Boolean(lesson.intro) && (showIntro ?? !progress.seen[introKey]);
  const startLesson = () => {
    markSeen(introKey);
    setShowIntro(false);
  };

  // Finishing an activity changes which one is "first unfinished"; pin the
  // current one so the student sees their feedback instead of jumping ahead.
  const stayHere = () => setSelected(current);
  const goNext = () => setSelected(Math.min(current + 1, activities.length - 1));
  const lessonHref = (id: string) => `/expeditions/${expedition.id}/${id}`;
  const noteFrom = expedition.mentorName ? `A note from ${expedition.mentorName}` : "A note from the ranger station";
  const signoff = expedition.mentorName?.split(" ")[0];
  const numbers = checkpointNumbers(activities);

  return (
    <main className="flex flex-1 flex-col bg-sand dark:bg-stone-950">
      <header className="bg-emerald-900 px-4 pb-6 pt-5 text-paper dark:bg-emerald-950">
        <div className="mx-auto max-w-4xl">
          <nav className="text-sm text-emerald-200">
            <Link href="/" className="font-semibold uppercase tracking-widest text-emerald-300">
              PyTrek
            </Link>
            <span className="mx-2">/</span>
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
        {!hydrated ? (
          <p className="mt-8 text-sm text-neutral-500">Loading the trail…</p>
        ) : introOpen ? (
          <div className="py-4">
            <RangerNote from={noteFrom} heading={`Lesson ${lessonNumber}: ${lesson.title}`} html={lesson.intro!} signoff={signoff}>
              <div className="flex justify-end">
                <button type="button" onClick={startLesson} className="rounded-lg bg-emerald-700 px-5 py-2.5 font-medium text-white hover:bg-emerald-800">
                  {progress.seen[introKey] ? "Back to the lesson" : "Start the lesson"}
                </button>
              </div>
            </RangerNote>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <span />
              {lesson.intro && (
                <button type="button" onClick={() => setShowIntro(true)} className="text-sm text-emerald-800 underline hover:text-emerald-950 dark:text-emerald-300">
                  Reread {expedition.mentorName ? `${expedition.mentorName.split(" ")[0]}'s` : "the ranger's"} note
                </button>
              )}
            </div>
            <div className="pt-2">
              <ProgressBar steps={steps} current={current} onSelect={setSelected} />
            </div>

            <article key={activity.id} className="mt-6 rounded-xl border border-stone-300 bg-paper p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide">
                <span
                  className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 ${
                    activity.stage === "milestone"
                      ? "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
                      : "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
                  }`}
                >
                  {activity.stage === "milestone" ? (
                    <>
                      <CairnMark className="h-4 w-4" /> Milestone
                    </>
                  ) : (
                    `Checkpoint ${numbers[current]}`
                  )}
                </span>
                <span className="text-neutral-500">{TYPE_LABELS[activity.type]}</span>
                {isDone(activity) && (
                  <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                    <CheckMark className="h-3.5 w-3.5" /> Done
                  </span>
                )}
              </div>
              <h2 className="mt-3 text-2xl font-bold tracking-tight">{activity.title}</h2>

              {activity.story && (
                <div
                  className="prose-pytrek mt-4 rounded-lg border-l-4 border-amber-500 bg-amber-50 px-4 py-3 leading-relaxed text-amber-950 dark:bg-amber-950/40 dark:text-amber-100"
                  dangerouslySetInnerHTML={{ __html: activity.story }}
                />
              )}
              {activity.agent && (
                <div className="mt-4">
                  <AgentLog html={activity.agent} />
                </div>
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

              {isDone(activity) && activity.stage === "milestone" && lesson.clue && (
                <div className="mt-6">
                  <ClueCard title={lesson.clue.title} html={lesson.clue.text} label="New clue for the case board" />
                </div>
              )}

              {isDone(activity) && (
                <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-stone-200 pt-4 dark:border-neutral-800">
                  {current < activities.length - 1 ? (
                    <button type="button" onClick={goNext} className="rounded-lg bg-emerald-700 px-5 py-2 font-medium text-white hover:bg-emerald-800">
                      Next: {activities[current + 1].title}
                    </button>
                  ) : !allDone ? (
                    <button type="button" onClick={() => setSelected(firstOpen)} className="rounded-lg bg-emerald-700 px-5 py-2 font-medium text-white hover:bg-emerald-800">
                      Back to {activities[firstOpen].title}
                    </button>
                  ) : null}
                </div>
              )}
            </article>

            {allDone && (
              <section className="mt-8 space-y-4">
                <p className="text-center text-sm font-semibold uppercase tracking-widest text-emerald-800 dark:text-emerald-300">Lesson complete</p>
                {lesson.outro ? (
                  <RangerNote from={noteFrom} heading="Back at the ranger station" html={lesson.outro} signoff={signoff}>
                    <LessonEndLinks expeditionId={expedition.id} nextLesson={nextLesson} lessonHref={lessonHref} />
                  </RangerNote>
                ) : (
                  <LessonEndLinks expeditionId={expedition.id} nextLesson={nextLesson} lessonHref={lessonHref} />
                )}
                {clueFound && <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">Your clue is pinned to the case board on the map.</p>}
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}

/** Checkpoints are numbered 1, 2, 3...; the Milestone isn't. */
function checkpointNumbers(activities: Activity[]) {
  let n = 0;
  return activities.map((a) => (a.stage === "checkpoint" ? ++n : 0));
}

function LessonEndLinks({
  expeditionId,
  nextLesson,
  lessonHref,
}: {
  expeditionId: string;
  nextLesson: { id: string; title: string } | null;
  lessonHref: (id: string) => string;
}) {
  return (
    <div className="flex flex-wrap justify-end gap-3">
      <Link
        href={`/expeditions/${expeditionId}`}
        className="rounded-lg border-2 border-emerald-700 px-5 py-2 font-medium text-emerald-800 hover:bg-emerald-50 dark:text-emerald-200 dark:hover:bg-emerald-950"
      >
        Back to the map
      </Link>
      {nextLesson && (
        <Link href={lessonHref(nextLesson.id)} className="rounded-lg bg-emerald-700 px-5 py-2 font-medium text-white hover:bg-emerald-800">
          Next lesson: {nextLesson.title}
        </Link>
      )}
    </div>
  );
}
