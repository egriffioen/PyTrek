/**
 * Small hand-drawn marks used instead of emojis (docs/decisions.md §10).
 * Drawn with round pencil-like strokes; they inherit the text color.
 */

type MarkProps = { className?: string; title?: string };

function svgProps(title?: string) {
  return title ? { role: "img" as const, "aria-label": title } : { "aria-hidden": true as const };
}

/** A cairn: stacked trail-marker stones. Marks Milestones. */
export function CairnMark({ className = "h-5 w-5", title }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" {...svgProps(title)}>
      <path d="M4.5 20.5c0-2 2.6-3.2 7.4-3.2s7.6 1.1 7.6 3.1c0 .9-3.3 1.3-7.5 1.3s-7.5-.3-7.5-1.2Z" fill="currentColor" fillOpacity={0.18} />
      <path d="M6.8 16.9c-.2-1.8 2-3 5.3-3s5.3 1.1 5.1 2.8" fill="currentColor" fillOpacity={0.18} />
      <path d="M8.6 13.7c-.1-1.6 1.5-2.5 3.6-2.5s3.6.9 3.4 2.4" fill="currentColor" fillOpacity={0.18} />
      <path d="M10 11.1c0-1.3 1-2.1 2.2-2.1s2.1.8 2 2" fill="currentColor" fillOpacity={0.18} />
      <path d="M11.2 8.9c.1-.9.6-1.5 1.1-1.5s.9.6.9 1.4" />
    </svg>
  );
}

/** A quick pencil check mark. */
export function CheckMark({ className = "h-4 w-4", title }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" {...svgProps(title)}>
      <path d="M4.5 12.8c1.6 1.2 3 2.7 4.3 4.6 2.6-4.9 6-8.6 10.7-11.6" />
    </svg>
  );
}

/** Play triangle for Run buttons. */
export function PlayMark({ className = "h-3.5 w-3.5" }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M7 4.8c0-.9 1-1.4 1.7-.9l11 7.2c.7.4.7 1.4 0 1.8l-11 7.2c-.7.5-1.7 0-1.7-.9Z" />
    </svg>
  );
}

/** A five-point star, filled or outlined (for review ratings). */
export function StarMark({ filled, className = "h-4 w-4" }: MarkProps & { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" aria-hidden>
      <path d="m12 3.2 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 17l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8Z" />
    </svg>
  );
}
