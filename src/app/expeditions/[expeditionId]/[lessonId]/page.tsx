import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getActivities, getExpedition, getExpeditions } from "@/lib/content";
import { LessonPlayer } from "@/components/lesson/lesson-player";
import { PageHeaderSkeleton } from "@/components/lesson/page-skeleton";

type Params = PageProps<"/expeditions/[expeditionId]/[lessonId]">["params"];

export function generateStaticParams() {
  return getExpeditions().flatMap((e) =>
    e.lessons.filter((l) => l.activities.length).map((l) => ({ expeditionId: e.id, lessonId: l.id })),
  );
}

export async function generateMetadata({ params }: PageProps<"/expeditions/[expeditionId]/[lessonId]">): Promise<Metadata> {
  const { expeditionId, lessonId } = await params;
  const lesson = getExpedition(expeditionId)?.lessons.find((l) => l.id === lessonId);
  return { title: lesson ? `${lesson.title} · PyTrek` : "PyTrek" };
}

/**
 * One lesson: its Checkpoints and Milestone, with a progress bar.
 * The URL (params) is read inside <Suspense> so navigation can show the
 * page shell instantly (Next.js 16 instant navigation).
 */
export default function LessonPage({ params }: PageProps<"/expeditions/[expeditionId]/[lessonId]">) {
  return (
    <Suspense fallback={<PageHeaderSkeleton />}>
      <Lesson params={params} />
    </Suspense>
  );
}

async function Lesson({ params }: { params: Params }) {
  const { expeditionId, lessonId } = await params;
  const expedition = getExpedition(expeditionId);
  const index = expedition?.lessons.findIndex((l) => l.id === lessonId) ?? -1;
  if (!expedition || index === -1 || !expedition.lessons[index].activities.length) notFound();
  const lesson = expedition.lessons[index];

  // Earlier activities whose code this lesson preloads (they may be in other lessons).
  const neededIds = new Set(lesson.activities.flatMap((a) => a.preload));
  const prerequisites = getActivities(expedition.id)
    .filter((a) => neededIds.has(a.id))
    .map((a) => ({ id: a.id, title: a.title, lessonId: a.lessonId }));

  const next = expedition.lessons.slice(index + 1).find((l) => l.activities.length);

  return (
    <LessonPlayer
      expedition={{
        id: expedition.id,
        title: expedition.title,
        harness: expedition.harness,
        site: expedition.site,
        mentorName: expedition.characters?.mentor.name ?? null,
      }}
      lesson={lesson}
      lessonNumber={index + 1}
      lessonCount={expedition.lessons.length}
      prerequisites={prerequisites}
      nextLesson={next ? { id: next.id, title: next.title } : null}
    />
  );
}
