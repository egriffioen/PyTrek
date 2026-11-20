import "server-only";
// Lesson content, built from content/ by scripts/content/build-content.mjs
// (runs before `npm run dev` and `npm run build`). Format: content/README.md.
import data from "@/generated/content.json";

export type Stage = "checkpoint" | "milestone";
export type ActivityType = "example" | "tweak" | "fix" | "finish" | "concept" | "puzzle";
export type Difficulty = "easy" | "medium" | "hard";

/** `text` and `feedback` are inline HTML. */
export type Choice = { text: string; correct: boolean; feedback?: string };

export type Activity = {
  id: string;
  version: number;
  title: string;
  stage: Stage;
  type: ActivityType;
  difficulty: Difficulty;
  /** CS 111 source IDs, e.g. "lab/hyperlinks#Q8" (content/sources/cs111-web.yaml). */
  sources: string[];
  /** Python functions this activity defines for later activities. */
  provides: string[];
  /** Python functions from earlier activities that this activity calls. */
  uses: string[];
  /** Earlier activity IDs whose passing code runs first, in order (includes what those use). */
  preload: string[];
  lessonId: string;
  /** HTML (converted from the Markdown in content/ at build time). */
  story: string | null;
  /** HTML: a message from the rogue agent (shown in its terminal font). */
  agent: string | null;
  learn: string | null;
  task: string;
  hints: string[];
  /** Python; null for concept checks. */
  starter: string | null;
  /** Python defining check(ns, out) -> (passed, message); null for concept checks. */
  check: string | null;
  choices: Choice[] | null;
};

export type Lesson = {
  id: string;
  title: string;
  topic: string;
  summary: string;
  /** HTML ranger notes: when the lesson first opens / when it's complete. */
  intro: string | null;
  outro: string | null;
  /** Revealed when the Milestone is passed (text is HTML). */
  clue: { title: string; text: string } | null;
  activities: Activity[];
};

export type Characters = {
  mentor: { name: string; role: string };
  agent: { name: string };
};

export type Briefing = { title: string; signoff: string; /** HTML */ body: string };

export type Review = { author: string; rating: number; trail: string; date: string; /** inline HTML */ text: string };
export type Reviews = { site: string; tagline: string; reviews: Review[] };

export type Expedition = {
  id: string;
  title: string;
  summary: string;
  story: string | null;
  characters: Characters | null;
  briefing: Briefing | null;
  reviews: Reviews | null;
  lessons: Lesson[];
  /** Simulated website: path → file text. */
  site: Record<string, string>;
  /** Python loaded before every activity (fake requests, check helpers). */
  harness: string;
};

const expeditions = (data as { expeditions: Expedition[] }).expeditions;

export function getExpeditions(): Expedition[] {
  return expeditions;
}

export function getExpedition(id: string): Expedition | undefined {
  return expeditions.find((e) => e.id === id);
}

export function getLesson(expeditionId: string, lessonId: string): Lesson | undefined {
  return getExpedition(expeditionId)?.lessons.find((l) => l.id === lessonId);
}

/** Every activity in an expedition, in recommended order (for progress bars). */
export function getActivities(expeditionId: string): Activity[] {
  return getExpedition(expeditionId)?.lessons.flatMap((l) => l.activities) ?? [];
}
