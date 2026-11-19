import Link from "next/link";

/**
 * Homepage text and sign-up buttons (used by src/app/page.tsx). The buttons
 * have a light-background variant too, for reuse on other pages.
 */

export const INTRO_TEXT =
  "Want to learn to code? Don't know where to start? PyTrek teaches you python through interactive coding puzzles, stories, and games, so that you stay engaged, and learning stays fun!";

/** "Create an account" + "Sign in". `onDark` = white buttons for a dark banner. */
export function AuthButtons({ onDark = false, stacked = false }: { onDark?: boolean; stacked?: boolean }) {
  const layout = stacked ? "flex flex-col gap-3" : "flex flex-col gap-3 sm:flex-row";
  // Both buttons get a 2px border (transparent on this one) so they're the same height.
  // On dark banners the buttons use warm off-white ("paper") instead of pure white.
  const primary = onDark
    ? "border-2 border-paper bg-paper text-emerald-800 hover:bg-emerald-50"
    : "border-2 border-emerald-700 bg-emerald-700 text-white hover:bg-emerald-800";
  const secondary = onDark
    ? "border-paper text-paper hover:bg-white/10"
    : "border-emerald-700 bg-white text-emerald-800 hover:bg-emerald-50 dark:bg-transparent dark:text-emerald-300 dark:hover:bg-emerald-950";
  return (
    <div className={`${layout} w-full`}>
      <Link href="/sign-up" className={`rounded-xl px-6 py-4 text-center text-lg font-semibold shadow-sm sm:flex-1 ${primary}`}>
        Create an account
      </Link>
      <Link href="/sign-in" className={`rounded-xl border-2 px-6 py-4 text-center text-lg font-semibold sm:flex-1 ${secondary}`}>
        Sign in
      </Link>
    </div>
  );
}
