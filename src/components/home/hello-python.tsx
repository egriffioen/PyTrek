"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A tiny "try Python" box for the homepage: no sign-in needed.
 *
 * Python (Pyodide) runs in a Web Worker so a runaway loop can't freeze the
 * page: if code runs longer than RUN_LIMIT_MS, the worker is stopped and a
 * fresh one is made next time. Pyodide (~10 MB) only downloads when the
 * visitor first clicks Run, so the homepage itself stays fast.
 */

const PYODIDE_URL = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js";
const RUN_LIMIT_MS = 5000;
const STARTER = 'name = "ranger"\nprint("Hello, World!")\nprint(f"Welcome to the trail, {name}!")\n';

// The worker's code, as a string so it needs no extra build setup.
const WORKER_SOURCE = `
importScripts(${JSON.stringify(PYODIDE_URL)});
let pyodideReady = loadPyodide();
pyodideReady.then(() => postMessage({ type: "ready" }), (err) => postMessage({ type: "load-error", message: String(err) }));
self.onmessage = async (event) => {
  const py = await pyodideReady;
  const out = [];
  py.setStdout({ batched: (s) => out.push(s) });
  py.setStderr({ batched: (s) => out.push(s) });
  try {
    await py.runPythonAsync(event.data.code);
    postMessage({ type: "result", ok: true, output: out.join("\\n") });
  } catch (err) {
    postMessage({ type: "result", ok: false, output: out.join("\\n"), error: String(err && err.message || err) });
  }
};
`;

type Status = "idle" | "loading" | "running";

/** Keep only the part of a Python traceback about the visitor's own code. */
function trimTraceback(message: string): string {
  const lines = message.trim().split("\n");
  const start = lines.findIndex((line) => line.includes('File "<exec>"'));
  return (start === -1 ? lines.slice(-1) : lines.slice(start)).join("\n");
}

/** `challengeBeside`: put Challenge 1 next to the editor instead of above it. */
export function HelloPython({ challengeBeside = false }: { challengeBeside?: boolean }) {
  const [code, setCode] = useState(STARTER);
  const [status, setStatus] = useState<Status>("idle");
  const [output, setOutput] = useState<{ text: string; isError: boolean } | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const readyRef = useRef<Promise<void> | null>(null);

  useEffect(() => () => workerRef.current?.terminate(), []);

  function startWorker() {
    const url = URL.createObjectURL(new Blob([WORKER_SOURCE], { type: "text/javascript" }));
    const worker = new Worker(url);
    URL.revokeObjectURL(url);
    workerRef.current = worker;
    readyRef.current = new Promise((resolve, reject) => {
      const onMessage = (event: MessageEvent) => {
        if (event.data?.type === "ready") resolve();
        if (event.data?.type === "load-error") reject(new Error(event.data.message));
        if (event.data?.type !== "result") worker.removeEventListener("message", onMessage);
      };
      worker.addEventListener("message", onMessage);
      worker.addEventListener("error", () => reject(new Error("Python couldn't start.")), { once: true });
    });
  }

  function stopWorker() {
    workerRef.current?.terminate();
    workerRef.current = null;
    readyRef.current = null;
  }

  async function run() {
    if (!workerRef.current) startWorker();
    const worker = workerRef.current!;
    setOutput(null);

    try {
      setStatus("loading");
      await readyRef.current;
    } catch {
      stopWorker();
      setStatus("idle");
      setOutput({ text: "Python couldn't load. Check your internet connection and try again.", isError: true });
      return;
    }

    setStatus("running");
    const result = await new Promise<{ ok: boolean; output: string; error?: string } | "timeout">((resolve) => {
      const timer = setTimeout(() => resolve("timeout"), RUN_LIMIT_MS);
      const onMessage = (event: MessageEvent) => {
        if (event.data?.type !== "result") return;
        clearTimeout(timer);
        worker.removeEventListener("message", onMessage);
        resolve(event.data);
      };
      worker.addEventListener("message", onMessage);
      worker.postMessage({ code });
    });
    setStatus("idle");

    if (result === "timeout") {
      stopWorker(); // the only way to stop a runaway loop
      setOutput({ text: `Stopped after ${RUN_LIMIT_MS / 1000} seconds. Is there a loop that never ends?`, isError: true });
      return;
    }
    if (result.ok) {
      setOutput({ text: result.output || "(Your code ran, but didn't print anything.)", isError: false });
    } else {
      const printed = result.output ? result.output + "\n" : "";
      setOutput({ text: printed + trimTraceback(result.error || "Error"), isError: true });
    }
  }

  const busy = status !== "idle";

  return (
    <section
      aria-labelledby="try-python"
      className="rounded-xl border border-stone-300 bg-paper p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
    >
      <h2 id="try-python" className="text-lg font-semibold">Try it: your first line of Python</h2>
      <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
        No sign-in needed. Python runs right here in your browser. Edit the code, then press Run.
      </p>

      {/* Stacked: challenge above the editor. Beside: challenge on the left,
          editor on the right (side by side on wider screens, stacked on phones). */}
      <div className={challengeBeside ? "mt-4 grid gap-4 md:grid-cols-[2fr_3fr] md:items-start" : ""}>
      <div className={`${challengeBeside ? "" : "mt-4 "}rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm dark:border-emerald-900 dark:bg-emerald-950`}>
        <p className="font-semibold text-emerald-800 dark:text-emerald-300">Challenge 1</p>
        <ol className="mt-1 list-decimal space-y-1 pl-5">
          <li>Press Run and observe the output.</li>
          <li>
            Replace the name{" "}
            <code className="rounded border border-emerald-300 bg-white px-1.5 py-0.5 font-semibold text-emerald-900 dark:border-emerald-700 dark:bg-neutral-900 dark:text-emerald-200">&quot;ranger&quot;</code>{" "}
            with
            your own name.
          </li>
          <li>Run again and notice the change!</li>
        </ol>
      </div>

      <div>
      <div className={`${challengeBeside ? "" : "mt-4 "}overflow-hidden rounded-lg border-2 border-neutral-300 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/20 dark:border-neutral-700`}>
        <div className="flex items-center justify-between border-b border-neutral-300 bg-neutral-100 px-3 py-1.5 text-xs dark:border-neutral-700 dark:bg-neutral-800">
          <span className="font-mono font-semibold text-neutral-700 dark:text-neutral-200">hello.py</span>
          <span className="text-neutral-500">✎ click to edit</span>
        </div>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            if (!busy) void run();
          }
        }}
        spellCheck={false}
        rows={4}
        aria-label="Python code"
        className="block w-full resize-y bg-white p-3 font-mono text-sm leading-relaxed outline-none dark:bg-neutral-950"
      />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void run()}
          disabled={busy}
          className="rounded-lg bg-emerald-700 px-5 py-2 font-medium text-white hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60"
        >
          {status === "loading" ? "Starting Python…" : status === "running" ? "Running…" : "▶ Run"}
        </button>
        <span className="text-xs text-neutral-500">
          {status === "loading" ? "First run downloads Python (a few seconds)." : "Ctrl+Enter also runs it."}
        </span>
      </div>

      {output && (
        <div className="mt-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            {output.isError ? "Error" : "Output"}
          </p>
          <pre
            aria-live="polite"
            className={`overflow-x-auto whitespace-pre-wrap rounded-lg p-3 text-sm ${
              output.isError
                ? "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200"
                : "bg-neutral-900 text-emerald-300"
            }`}
          >
            {output.text}
          </pre>
        </div>
      )}
      </div>
      </div>
    </section>
  );
}
