"use client";

import { useEffect, useRef } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { Prec } from "@codemirror/state";
import { keymap } from "@codemirror/view";

const RUN_EVENT = "pytrek-run";

// Highest precedence so Ctrl/Cmd+Enter runs the code instead of inserting a
// new line. The key handler announces a DOM event; the wrapper calls onRun.
const extensions = [
  python(),
  Prec.highest(
    keymap.of([
      {
        key: "Mod-Enter",
        run: (view) => {
          view.dom.dispatchEvent(new CustomEvent(RUN_EVENT, { bubbles: true }));
          return true;
        },
      },
    ]),
  ),
];

/** Python editor (CodeMirror). Ctrl/Cmd+Enter calls onRun. */
export function CodeEditor({
  value,
  onChange,
  onRun,
  fileName,
}: {
  value: string;
  onChange: (value: string) => void;
  onRun: () => void;
  fileName: string;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    el.addEventListener(RUN_EVENT, onRun);
    return () => el.removeEventListener(RUN_EVENT, onRun);
  }, [onRun]);

  return (
    <div
      ref={wrapperRef}
      className="overflow-hidden rounded-lg border-2 border-neutral-300 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-600/20 dark:border-neutral-700"
    >
      <div className="flex items-center justify-between border-b border-neutral-300 bg-neutral-100 px-3 py-1.5 text-xs dark:border-neutral-700 dark:bg-neutral-800">
        <span className="font-mono font-semibold text-neutral-700 dark:text-neutral-200">{fileName}</span>
        <span className="text-neutral-500">Ctrl+Enter to run</span>
      </div>
      <CodeMirror
        value={value}
        onChange={onChange}
        extensions={extensions}
        theme="light"
        minHeight="10rem"
        basicSetup={{ foldGutter: false, highlightActiveLine: true, autocompletion: false }}
        aria-label="Python code editor"
        className="text-sm"
      />
    </div>
  );
}
