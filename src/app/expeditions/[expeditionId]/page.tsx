import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getExpedition, getExpeditions } from "@/lib/content";
import { LessonListProgress } from "@/components/lesson/lesson-list-progress";
import { PageHeaderSkeleton } from "@/components/lesson/page-skeleton";

export function generateStaticParams() {
  return getExpeditions().map((e) => ({ expeditionId: e.id }));
}

export async function generateMetadata({ params }: PageProps<"/expeditions/[expeditionId]">): Promise<Metadata> {
  const { expeditionId } = await params;
  const expedition = getExpedition(expeditionId);
  return { title: expedition ? `${expedition.title} · PyTrek` : "PyTrek" };
}

/**
 * Expedition overview: the story and its lessons in recommended order.
 * The URL (params) is read inside <Suspense> for instant navigation.
 */
export default function ExpeditionPage({ params }: PageProps<"/expeditions/[expeditionId]">) {
  return (
    <Suspense fallback={<PageHeaderSkeleton />}>
      <Expedition params={params} />
    </Suspense>
  );
}

async function Expedition({ params }: { params: PageProps<"/expeditions/[expeditionId]">["params"] }) {
  const { expeditionId } = await params;
  const expedition = getExpedition(expeditionId);
  if (!expedition) notFound();

  return (
    <main className="flex flex-1 flex-col bg-sand dark:bg-stone-950">
      <section className="bg-emerald-900 px-4 py-10 text-paper dark:bg-emerald-950">
        <div className="mx-auto max-w-4xl">
          <Link href="/" className="text-sm font-semibold uppercase tracking-widest text-emerald-300">
            PyTrek
          </Link>
          <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-emerald-200">Expedition</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">{expedition.title}</h1>
          {expedition.story && <p className="mt-4 max-w-3xl text-lg leading-relaxed text-emerald-50">{expedition.story}</p>}
        </div>
      </section>

      <div className="mx-auto w-full max-w-4xl px-4 py-8">
        <h2 className="text-lg font-semibold">Lessons</h2>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Recommended order, but you can open any lesson.
        </p>
        <ol className="mt-4 space-y-3">
          {expedition.lessons.map((lesson, i) => (
            <li key={lesson.id}>
              {lesson.activities.length ? (
                <Link
                  href={`/expeditions/${expedition.id}/${lesson.id}`}
                  className="block rounded-xl border border-stone-300 bg-paper p-4 shadow-sm hover:border-emerald-600 dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <LessonRow index={i} title={lesson.title} summary={lesson.summary} />
                  <LessonListProgress activityIds={lesson.activities.map((a) => a.id)} />
                </Link>
              ) : (
                <div className="rounded-xl border border-dashed border-stone-300 p-4 opacity-70 dark:border-neutral-700">
                  <LessonRow index={i} title={lesson.title} summary={lesson.summary} />
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Coming soon</p>
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}

function LessonRow({ index, title, summary }: { index: number; title: string; summary: string }) {
  return (
    <div className="flex gap-4">
      <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-emerald-700 font-semibold text-white">
        {index + 1}
      </span>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">{summary}</p>
      </div>
    </div>
  );
}
