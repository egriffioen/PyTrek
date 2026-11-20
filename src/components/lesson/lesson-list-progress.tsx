"use client";

import { useLocalProgress } from "@/lib/local-progress";

/** "3 of 6 done" under a lesson on the expedition page. */
export function LessonListProgress({ activityIds }: { activityIds: string[] }) {
  const progress = useLocalProgress();
  const done = activityIds.filter((id) => progress.done[id]).length;
  const pct = Math.round((100 * done) / activityIds.length);
  return (
    <div className="mt-3 flex items-center gap-3 pl-13">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-200 dark:bg-neutral-800" aria-hidden>
        <div className="h-full rounded-full bg-emerald-600" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-neutral-600 dark:text-neutral-400">
        {done} of {activityIds.length} done
      </span>
    </div>
  );
}
