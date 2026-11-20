import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getExpedition, getExpeditions } from "@/lib/content";
import { ExpeditionHome } from "@/components/story/expedition-home";
import { PageHeaderSkeleton } from "@/components/lesson/page-skeleton";

type Params = PageProps<"/expeditions/[expeditionId]">["params"];

export function generateStaticParams() {
  return getExpeditions().map((e) => ({ expeditionId: e.id }));
}

export async function generateMetadata({ params }: PageProps<"/expeditions/[expeditionId]">): Promise<Metadata> {
  const { expeditionId } = await params;
  const expedition = getExpedition(expeditionId);
  return { title: expedition ? `${expedition.title} · PyTrek` : "PyTrek" };
}

/**
 * Expedition home: the briefing on the first visit, then the trail map.
 * The URL (params) is read inside <Suspense> for instant navigation.
 */
export default function ExpeditionPage({ params }: PageProps<"/expeditions/[expeditionId]">) {
  return (
    <Suspense fallback={<PageHeaderSkeleton />}>
      <Expedition params={params} />
    </Suspense>
  );
}

async function Expedition({ params }: { params: Params }) {
  const { expeditionId } = await params;
  const expedition = getExpedition(expeditionId);
  if (!expedition) notFound();

  const lessons = expedition.lessons.map((l) => ({
    id: l.id,
    title: l.title,
    summary: l.summary,
    activityIds: l.activities.map((a) => a.id),
    milestoneId: l.activities.find((a) => a.stage === "milestone")?.id ?? null,
    clue: l.clue,
  }));

  return (
    <main className="flex flex-1 flex-col bg-sand dark:bg-stone-950">
      <section className="bg-emerald-900 px-4 py-8 text-paper dark:bg-emerald-950">
        <div className="mx-auto max-w-5xl">
          <Link href="/" className="text-sm font-semibold uppercase tracking-widest text-emerald-300">
            PyTrek
          </Link>
          <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-emerald-200">Expedition</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">{expedition.title}</h1>
          {expedition.story && <p className="mt-3 max-w-3xl text-emerald-50">{expedition.story}</p>}
        </div>
      </section>
      <ExpeditionHome
        expedition={{
          id: expedition.id,
          title: expedition.title,
          characters: expedition.characters,
          briefing: expedition.briefing,
          reviews: expedition.reviews,
        }}
        lessons={lessons}
      />
    </main>
  );
}
