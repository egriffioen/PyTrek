import { HelloPython } from "@/components/home/hello-python";
import { AuthButtons, INTRO_TEXT } from "@/components/home/home-content";

/**
 * PyTrek homepage: deep forest-green banner (intro on the left, sign-up
 * buttons on the right) over a light sand page, then the "Try it" demo with
 * Challenge 1 beside the editor. (Chosen over layout B on 11/18/2026.)
 */
export default function Home() {
  return (
    <main className="flex flex-1 flex-col bg-sand dark:bg-stone-950">
      <section className="bg-emerald-900 px-4 py-12 text-paper dark:bg-emerald-950">
        <div className="mx-auto grid max-w-5xl items-center gap-8 md:grid-cols-[3fr_2fr]">
          <div>
            {/* No `uppercase` class here, so "PyTrek" keeps its capitalization. */}
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Welcome to <span className="text-emerald-300">PyTrek</span>!
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-emerald-50">{INTRO_TEXT}</p>
          </div>
          <div className="w-full">
            <AuthButtons onDark stacked />
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <HelloPython challengeBeside />
      </div>
    </main>
  );
}
