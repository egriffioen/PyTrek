"use client";

import { CairnMark } from "@/components/story/marks";

export type ProgressStep = { id: string; title: string; milestone: boolean; done: boolean };

/**
 * The lesson's trail: one segment per activity (Checkpoints, then the
 * Milestone cairn at the end). Click a segment to jump to that activity.
 */
export function ProgressBar({
  steps,
  current,
  onSelect,
}: {
  steps: ProgressStep[];
  current: number;
  onSelect: (index: number) => void;
}) {
  const doneCount = steps.filter((s) => s.done).length;
  return (
    <nav aria-label="Lesson progress">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold">
          {doneCount} of {steps.length} done
        </span>
        <span className="text-neutral-600 dark:text-neutral-400">
          {doneCount === steps.length ? "Lesson complete!" : `${steps.length - doneCount} to go`}
        </span>
      </div>
      <ol className="mt-6 flex items-center gap-1.5">
        {steps.map((step, i) => {
          const isCurrent = i === current;
          const color = step.done
            ? "bg-emerald-600 border-emerald-600"
            : "bg-stone-200 border-stone-300 dark:bg-neutral-800 dark:border-neutral-700";
          return (
            <li key={step.id} className={step.milestone ? "flex-[1.6]" : "flex-1"}>
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-current={isCurrent ? "step" : undefined}
                aria-label={`${step.milestone ? "Milestone" : `Checkpoint ${i + 1}`}: ${step.title}${step.done ? " (done)" : ""}`}
                title={step.title}
                className={`relative flex h-3 w-full items-center rounded-full border ${color} ${
                  isCurrent ? "ring-2 ring-emerald-700 ring-offset-2 ring-offset-sand dark:ring-emerald-400 dark:ring-offset-stone-950" : ""
                }`}
              >
                {step.milestone && (
                  <span aria-hidden className="absolute -top-6 right-0 text-amber-800 dark:text-amber-300">
                    <CairnMark className="h-5 w-5" />
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
