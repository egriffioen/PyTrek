"use client";

/**
 * Runs lesson activities in Pyodide inside a Web Worker, so a runaway loop
 * can't freeze the page: past the time limit the worker is stopped and a
 * fresh one starts on the next run. Pyodide (~10 MB) downloads on first use.
 *
 * Each run, in one fresh namespace:
 *   1. the expedition harness (fake `requests`, check helpers)
 *   2. `preload`: the student's passing code from earlier activities
 *   3. the student's code (output captured)
 *   4. the activity's check(ns, out) -> (passed, message)
 */

const PYODIDE_URL = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js";

const RUNNER_PY = String.raw`
import json, io, contextlib, traceback, linecache

def _register(name, code):
    linecache.cache[name] = (len(code), None, code.splitlines(True), name)

def _trim(e):
    # Keep only frames from the student's own code, so errors stay readable.
    items = traceback.format_exception(type(e), e, e.__traceback__)
    keep = [items[0]] + [i for i in items[1:-1] if '"<your code>"' in i or '"<earlier activity' in i] + [items[-1]]
    return "".join(keep)

def pytrek_run(payload_json):
    p = json.loads(payload_json)
    hg = {"__name__": "pytrek_harness", "SITE_JSON": p["siteJson"]}
    if p["harness"]:
        exec(compile(p["harness"], "<harness>", "exec"), hg)
    ns = {"__name__": "__main__"}
    for i, code in enumerate(p["preload"]):
        name = f"<earlier activity {i + 1}>"
        _register(name, code)
        try:
            with contextlib.redirect_stdout(io.StringIO()):
                exec(compile(code, name, "exec"), ns)
        except Exception:
            pass
    if "LOG" in hg:
        hg["LOG"].clear()
    _register("<your code>", p["code"])
    buf = io.StringIO()
    try:
        with contextlib.redirect_stdout(buf):
            exec(compile(p["code"], "<your code>", "exec"), ns)
    except SyntaxError as e:
        return json.dumps({"output": buf.getvalue(), "error": "".join(traceback.format_exception_only(type(e), e)), "passed": False, "message": "Fix the error above, then run again."})
    except Exception as e:
        return json.dumps({"output": buf.getvalue(), "error": _trim(e), "passed": False, "message": "Fix the error above, then run again."})
    out = buf.getvalue()
    if not p["check"]:
        return json.dumps({"output": out, "error": None, "passed": None, "message": None})
    cg = dict(hg)
    try:
        exec(compile(p["check"], "<check>", "exec"), cg)
        with contextlib.redirect_stdout(io.StringIO()):
            passed, message = cg["check"](ns, out)
    except Exception as e:
        passed, message = False, "Your code ran, but crashed while being checked:\n" + _trim(e)
    return json.dumps({"output": out, "error": None, "passed": bool(passed), "message": str(message)})
`;

const WORKER_SOURCE = `
importScripts(${JSON.stringify(PYODIDE_URL)});
const ready = (async () => {
  const py = await loadPyodide();
  await py.loadPackage(["beautifulsoup4"]);
  py.runPython(${JSON.stringify(RUNNER_PY)});
  return py;
})();
ready.then(() => postMessage({ type: "ready" }), (err) => postMessage({ type: "load-error", message: String(err) }));
self.onmessage = async (event) => {
  const py = await ready;
  try {
    const run = py.globals.get("pytrek_run");
    const json = run(JSON.stringify(event.data));
    run.destroy();
    postMessage({ type: "result", result: JSON.parse(json) });
  } catch (err) {
    postMessage({ type: "result", result: { output: "", error: String(err && err.message || err), passed: false, message: "PyTrek had a problem running your code." } });
  }
};
`;

export type RunRequest = {
  code: string;
  check: string | null;
  harness: string;
  site: Record<string, string>;
  preload: string[];
};

export type RunResult = {
  output: string;
  error: string | null;
  /** null when the activity has no check. */
  passed: boolean | null;
  message: string | null;
};

export type RunOutcome =
  | { kind: "done"; result: RunResult }
  | { kind: "timeout"; seconds: number }
  | { kind: "load-error" };

export class PythonRunner {
  private worker: Worker | null = null;
  private ready: Promise<void> | null = null;

  constructor(private timeLimitMs = 10_000) {}

  /** Start downloading Python early (e.g. when a coding activity opens). */
  warmUp(): Promise<void> {
    if (!this.worker) this.start();
    return this.ready!;
  }

  private start() {
    const url = URL.createObjectURL(new Blob([WORKER_SOURCE], { type: "text/javascript" }));
    const worker = new Worker(url);
    URL.revokeObjectURL(url);
    this.worker = worker;
    this.ready = new Promise((resolve, reject) => {
      const onMessage = (event: MessageEvent) => {
        if (event.data?.type === "ready") resolve();
        else if (event.data?.type === "load-error") reject(new Error(event.data.message));
        else return;
        worker.removeEventListener("message", onMessage);
      };
      worker.addEventListener("message", onMessage);
      worker.addEventListener("error", () => reject(new Error("Python couldn't start.")), { once: true });
    });
    this.ready.catch(() => this.stop());
  }

  stop() {
    this.worker?.terminate();
    this.worker = null;
    this.ready = null;
  }

  async run(request: RunRequest): Promise<RunOutcome> {
    try {
      await this.warmUp();
    } catch {
      return { kind: "load-error" };
    }
    const worker = this.worker!;
    const payload = {
      code: request.code,
      check: request.check,
      harness: request.harness,
      siteJson: JSON.stringify(request.site),
      preload: request.preload,
    };
    return new Promise<RunOutcome>((resolve) => {
      const timer = setTimeout(() => {
        worker.removeEventListener("message", onMessage);
        this.stop(); // the only way to stop a runaway loop
        resolve({ kind: "timeout", seconds: this.timeLimitMs / 1000 });
      }, this.timeLimitMs);
      const onMessage = (event: MessageEvent) => {
        if (event.data?.type !== "result") return;
        clearTimeout(timer);
        worker.removeEventListener("message", onMessage);
        resolve({ kind: "done", result: event.data.result as RunResult });
      };
      worker.addEventListener("message", onMessage);
      worker.postMessage(payload);
    });
  }
}
