"use client";

import { useSyncExternalStore } from "react";

/**
 * TEMPORARY: lesson progress kept in this browser's localStorage until the
 * attempts/progress API saves it to MongoDB (docs/status.md, step 2). Keeps
 * which activities are done, each one's passing code (later activities
 * preload it), and unsent drafts.
 */

export type LocalProgress = {
  done: Record<string, { version: number; at: string }>;
  /** Passing code per activity id (used as `preload` by later activities). */
  passingCode: Record<string, string>;
  drafts: Record<string, string>;
  /** Story notes already read, e.g. "briefing:web" or "intro:web/http". */
  seen: Record<string, string>;
};

const KEY = "pytrek:progress:v1";
const EVENT = "pytrek-progress";
const EMPTY: LocalProgress = { done: {}, passingCode: {}, drafts: {}, seen: {} };

let cachedRaw: string | null | undefined;
let cachedValue: LocalProgress = EMPTY;

function read(): LocalProgress {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    // Storage blocked (private mode, etc.): progress just won't persist.
  }
  if (raw === cachedRaw) return cachedValue;
  cachedRaw = raw;
  try {
    const parsed = raw ? JSON.parse(raw) : {};
    cachedValue = { ...EMPTY, ...parsed };
  } catch {
    cachedValue = EMPTY;
  }
  return cachedValue;
}

function write(update: (p: LocalProgress) => LocalProgress) {
  const next = update(read());
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    cachedRaw = undefined;
    cachedValue = next; // keep it for this page visit at least
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Current progress; empty during server rendering. */
export function useLocalProgress(): LocalProgress {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function markDone(id: string, version: number, passingCode?: string) {
  write((p) => ({
    ...p,
    done: { ...p.done, [id]: { version, at: new Date().toISOString() } },
    passingCode: passingCode === undefined ? p.passingCode : { ...p.passingCode, [id]: passingCode },
  }));
}

/** Remember that a story note was read (so it isn't forced on the next visit). */
export function markSeen(key: string) {
  write((p) => ({ ...p, seen: { ...p.seen, [key]: new Date().toISOString() } }));
}

export function saveDraft(id: string, code: string) {
  write((p) => ({ ...p, drafts: { ...p.drafts, [id]: code } }));
}

export function clearDraft(id: string) {
  write((p) => {
    const drafts = { ...p.drafts };
    delete drafts[id];
    return { ...p, drafts };
  });
}
