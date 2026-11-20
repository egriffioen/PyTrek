"use client";

import { useState } from "react";
import type { Activity } from "@/lib/content";
import { markDone } from "@/lib/local-progress";

/** Multiple-choice concept check: pick an answer, see feedback, try again if needed. */
export function ConceptActivity({ activity, onPassed }: { activity: Activity; onPassed: () => void }) {
  const choices = activity.choices ?? [];
  const [picked, setPicked] = useState<number | null>(null);
  const [checked, setChecked] = useState<number | null>(null);
  const [tries, setTries] = useState(0);

  const answer = checked === null ? null : choices[checked];

  function check() {
    if (picked === null) return;
    setChecked(picked);
    setTries((t) => t + 1);
    if (choices[picked].correct) {
      onPassed();
      markDone(activity.id, activity.version);
    }
  }

  return (
    <div>
      <fieldset>
        <legend className="sr-only">Choose an answer</legend>
        <ul className="space-y-2">
          {choices.map((choice, i) => {
            const isChecked = checked === i;
            const tone = isChecked
              ? choice.correct
                ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950"
                : "border-red-400 bg-red-50 dark:bg-red-950"
              : picked === i
                ? "border-emerald-600"
                : "border-stone-300 dark:border-neutral-700";
            return (
              <li key={i}>
                <label className={`flex cursor-pointer gap-3 rounded-lg border-2 px-4 py-3 ${tone}`}>
                  <input
                    type="radio"
                    name={`choice-${activity.id}`}
                    checked={picked === i}
                    onChange={() => setPicked(i)}
                    className="mt-1 accent-emerald-700"
                  />
                  <span dangerouslySetInnerHTML={{ __html: choice.text }} />
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={check}
          disabled={picked === null || (answer?.correct ?? false)}
          className="rounded-lg bg-emerald-700 px-5 py-2 font-medium text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Check answer
        </button>
        {picked === null && <span className="text-sm text-neutral-500">Pick an answer first.</span>}
      </div>

      {answer && (
        <div
          role="status"
          className={`mt-4 rounded-lg px-4 py-3 ${
            answer.correct
              ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"
              : "bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-100"
          }`}
        >
          <p className="font-semibold">{answer.correct ? (tries === 1 ? "Correct, first try!" : "Correct!") : "Not quite. Try again."}</p>
          {answer.feedback && <p className="mt-1" dangerouslySetInnerHTML={{ __html: answer.feedback }} />}
        </div>
      )}
    </div>
  );
}
