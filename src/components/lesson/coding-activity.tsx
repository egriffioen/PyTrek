"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Activity } from "@/lib/content";
import { clearDraft, markDone, saveDraft } from "@/lib/local-progress";
import type { PythonRunner, RunOutcome } from "@/lib/python-runner";
import { CodeEditor } from "./code-editor";
import type { ExpeditionInfo, Prerequisite } from "./lesson-player";

type Feedback = { tone: "success" | "retry" | "error"; title: string; body?: string };

/** Keep only the part of a Python traceback about the student's own code. */
function friendlyError(error: string): string {
  return error.replace(/^Traceback \(most recent call last\):\n/, "").trim();
}

/** Coding activity: editor, Run & check, output, feedback, and hints one at a time. */
export function CodingActivity({
  activity,
  expedition,
  prerequisites,
  passingCode,
  draft,
  getRunner,
  lessonHref,
  onPassed,
}: {
  activity: Activity;
  expedition: ExpeditionInfo;
  prerequisites: Prerequisite[];
  passingCode: Record<string, string>;
  draft: string | undefined;
  getRunner: () => PythonRunner;
  lessonHref: (lessonId: string) => string;
  onPassed: () => void;
}) {
  const starter = activity.starter ?? "";
  const [code, setCode] = useState(draft ?? starter);
  const [status, setStatus] = useState<"idle" | "running">("idle");
  const [output, setOutput] = useState<{ text: string; isError: boolean } | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [hintsShown, setHintsShown] = useState(0);
  const [firstRun, setFirstRun] = useState(true);
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Start downloading Python as soon as a coding activity opens.
  useEffect(() => {
    getRunner()
      .warmUp()
      .catch(() => {});
  }, [getRunner]);
  useEffect(() => () => {
    if (draftTimer.current) clearTimeout(draftTimer.current);
  }, []);

  const missing = prerequisites.filter((p) => passingCode[p.id] === undefined);

  function onChange(value: string) {
    setCode(value);
    if (draftTimer.current) clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => saveDraft(activity.id, value), 500);
  }

  function reset() {
    setCode(starter);
    clearDraft(activity.id);
    setOutput(null);
    setFeedback(null);
  }

  async function run() {
    if (status === "running") return;
    setStatus("running");
    setOutput(null);
    setFeedback(null);
    const outcome: RunOutcome = await getRunner().run({
      code,
      check: activity.check,
      harness: expedition.harness,
      site: expedition.site,
      preload: activity.preload.map((id) => passingCode[id]).filter((c): c is string => c !== undefined),
    });
    setStatus("idle");
    setFirstRun(false);

    if (outcome.kind === "load-error") {
      setFeedback({ tone: "error", title: "Python couldn't load.", body: "Check your internet connection and try again." });
      return;
    }
    if (outcome.kind === "timeout") {
      setFeedback({ tone: "error", title: `Stopped after ${outcome.seconds} seconds.`, body: "Is there a loop that never ends?" });
      return;
    }
    const { result } = outcome;
    if (result.error) {
      setOutput({ text: (result.output ? result.output + "\n" : "") + friendlyError(result.error), isError: true });
      setFeedback({ tone: "error", title: "Your code hit an error.", body: result.message ?? undefined });
      return;
    }
    setOutput({ text: result.output || "(Your code ran, but didn't print anything.)", isError: false });
    if (result.passed) {
      onPassed();
      markDone(activity.id, activity.version, code);
      setFeedback({ tone: "success", title: activity.stage === "milestone" ? "Milestone reached! ⛳" : "Checkpoint passed! ✓", body: result.message ?? undefined });
    } else {
      setFeedback({ tone: "retry", title: "Not yet.", body: result.message ?? undefined });
    }
  }

  const feedbackStyle = {
    success: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100",
    retry: "bg-amber-100 text-amber-950 dark:bg-amber-950 dark:text-amber-100",
    error: "bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100",
  };

  return (
    <div>
      {missing.length > 0 && (
        <div className="mb-4 rounded-lg border border-amber-400 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:bg-amber-950/40 dark:text-amber-100">
          This activity reuses your code from{" "}
          {missing.map((p, i) => (
            <span key={p.id}>
              {i > 0 && (i === missing.length - 1 ? " and " : ", ")}
              <Link href={lessonHref(p.lessonId)} className="font-semibold underline">
                {p.title}
              </Link>
            </span>
          ))}
          . Finish {missing.length === 1 ? "it" : "those"} first so your functions are loaded here.
        </div>
      )}

      <CodeEditor value={code} onChange={onChange} onRun={() => void run()} fileName={`${activity.id}.py`} />

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void run()}
          disabled={status === "running"}
          className="rounded-lg bg-emerald-700 px-5 py-2 font-medium text-white hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60"
        >
          {status === "running" ? (firstRun ? "Starting Python…" : "Running…") : "▶ Run & check"}
        </button>
        {activity.hints.length > 0 && (
          <button
            type="button"
            onClick={() => setHintsShown((n) => Math.min(n + 1, activity.hints.length))}
            disabled={hintsShown >= activity.hints.length}
            className="rounded-lg border-2 border-emerald-700 px-4 py-1.5 font-medium text-emerald-800 hover:bg-emerald-50 disabled:opacity-50 dark:text-emerald-200 dark:hover:bg-emerald-950"
          >
            {hintsShown === 0 ? "Show a hint" : hintsShown < activity.hints.length ? "Another hint" : "No more hints"}
          </button>
        )}
        <button type="button" onClick={reset} className="text-sm text-neutral-600 underline hover:text-neutral-900 dark:text-neutral-400">
          Reset code
        </button>
        {status === "running" && firstRun && <span className="text-xs text-neutral-500">The first run downloads Python (a few seconds).</span>}
      </div>

      {hintsShown > 0 && (
        <ol className="mt-4 space-y-2">
          {activity.hints.slice(0, hintsShown).map((hint, i) => (
            <li key={i} className="prose-pytrek rounded-lg bg-sky-50 px-4 py-2 text-sm text-sky-950 dark:bg-sky-950/40 dark:text-sky-100">
              <span className="font-semibold">Hint {i + 1}: </span>
              <span dangerouslySetInnerHTML={{ __html: hint.replace(/^<p>|<\/p>$/g, "") }} />
            </li>
          ))}
        </ol>
      )}

      {/* Output first, then the verdict on it ("Fix the error above" refers to the output). */}
      {output && (
        <div className="mt-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">{output.isError ? "Error" : "Output"}</p>
          <pre
            className={`overflow-x-auto whitespace-pre-wrap rounded-lg p-3 text-sm ${
              output.isError ? "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200" : "bg-neutral-900 text-emerald-300"
            }`}
          >
            {output.text}
          </pre>
        </div>
      )}

      {feedback && (
        <div role="status" className={`mt-4 rounded-lg px-4 py-3 ${feedbackStyle[feedback.tone]}`}>
          <p className="font-semibold">{feedback.title}</p>
          {feedback.body && <p className="mt-1 whitespace-pre-wrap">{feedback.body}</p>}
        </div>
      )}
    </div>
  );
}
