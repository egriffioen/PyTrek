"use client";

import { useRouter } from "next/navigation";

/**
 * The ranger's sketch map of one expedition: pencil contour lines, a dashed
 * trail winding uphill through each lesson's stop, and the summit (the boss
 * fight) at the top. Hand-drawn look comes from an SVG "pencil wobble" filter.
 */

export type MapStop = {
  id: string;
  number: number;
  title: string;
  href: string | null; // null = coming soon
  state: "done" | "next" | "open" | "soon";
};

const W = 640;
const H = 960;
const TRAILHEAD = { x: 320, y: 925 };
// Stops zig-zag uphill; labels sit on the outer side of each stop.
const STOP_POINTS = [
  { x: 205, y: 842 },
  { x: 440, y: 760 },
  { x: 215, y: 672 },
  { x: 445, y: 585 },
  { x: 205, y: 497 },
  { x: 440, y: 410 },
  { x: 220, y: 325 },
  { x: 425, y: 240 },
];
const SUMMIT = { x: 322, y: 92 };

/** Smooth curve through points (Catmull-Rom converted to cubic Béziers). */
function smoothPath(points: { x: number; y: number }[]) {
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C ${c1.x.toFixed(1)} ${c1.y.toFixed(1)}, ${c2.x.toFixed(1)} ${c2.y.toFixed(1)}, ${p2.x} ${p2.y}`;
  }
  return d;
}

/** A wobbly closed loop, like a hand-drawn contour line. */
function contour(cx: number, cy: number, rx: number, ry: number, seed: number) {
  const pts = [];
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    const wobble = 1 + 0.06 * Math.sin(a * 3 + seed) + 0.04 * Math.sin(a * 5 + seed * 2);
    pts.push({ x: cx + Math.cos(a) * rx * wobble, y: cy + Math.sin(a) * ry * wobble });
  }
  pts.push(pts[0], pts[1]);
  return smoothPath(pts);
}

/** Split a title into short lines for the map labels. */
function wrap(text: string, max = 17) {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    if (line && (line + " " + word).length > max) {
      lines.push(line);
      line = word;
    } else line = line ? `${line} ${word}` : word;
  }
  if (line) lines.push(line);
  return lines;
}

const TREES = [
  [70, 900], [100, 880], [560, 880], [590, 850], [60, 560], [88, 585], [585, 520],
  [560, 690], [70, 420], [95, 395], [580, 330], [600, 300], [110, 250], [540, 160],
];

export function TrailMap({ stops, summitLabel }: { stops: MapStop[]; summitLabel: string }) {
  const router = useRouter();
  const points = stops.map((_, i) => STOP_POINTS[i] ?? STOP_POINTS[STOP_POINTS.length - 1]);
  const trail = smoothPath([TRAILHEAD, ...points, SUMMIT]);
  const doneCount = stops.filter((s) => s.state === "done").length;
  // The walked part of the trail: from the trailhead to the last finished stop in a row.
  let walked = 0;
  while (walked < stops.length && stops[walked].state === "done") walked++;
  const walkedPath = walked ? smoothPath([TRAILHEAD, ...points.slice(0, walked)]) : null;

  return (
    <figure className="overflow-hidden rounded-md border border-stone-300 bg-[#fbf5e6] shadow-md">
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="group" aria-label={`Trail map: ${doneCount} of ${stops.length} lessons done`}>
        <defs>
          <filter id="pencil" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" />
            <feDisplacementMap in="SourceGraphic" scale="2.6" />
          </filter>
          <pattern id="paper" width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.5" fill="#b9a77f" opacity="0.18" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#paper)" />

        {/* Pencil sketch layer: contours, mountain, lake, trees, compass */}
        <g filter="url(#pencil)" fill="none" stroke="#8b7a5c" strokeLinecap="round" strokeLinejoin="round">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <path key={i} d={contour(322, 250 + i * 12, 110 + i * 62, 90 + i * 55, i * 1.7)} strokeWidth={0.9} opacity={0.45 - i * 0.04} />
          ))}
          <path d="M 150 250 L 228 158 L 262 182 L 322 76 L 368 140 L 398 118 L 462 196" strokeWidth={1.8} stroke="#6b5b45" />
          <path d="M 300 116 L 322 76 L 345 108 L 333 104 L 324 114 L 312 104 Z" strokeWidth={1.2} stroke="#6b5b45" fill="#fffdf8" />
          <path d="M 228 158 l 14 30 M 262 182 l -8 34 M 368 140 l 10 40 M 398 118 l -6 36" strokeWidth={1} opacity={0.6} />
          <path d={contour(110, 760, 58, 30, 3)} strokeWidth={1.3} stroke="#5d7f8c" fill="#dbe9ea" fillOpacity={0.6} />
          <path d="M 80 760 q 8 -5 16 0 t 16 0 M 104 772 q 8 -5 16 0 t 16 0" strokeWidth={1} stroke="#5d7f8c" />
          {TREES.map(([x, y], i) => (
            <path key={i} d={`M ${x} ${y} l -9 18 h 18 Z M ${x} ${y + 8} l -11 18 h 22 Z M ${x} ${y + 26} v 7`} strokeWidth={1.2} stroke="#5f7a52" fill="#cfdcc2" fillOpacity={0.7} />
          ))}
          <g transform="translate(70 90)" stroke="#6b5b45">
            <circle r="26" strokeWidth={1} opacity={0.7} />
            <path d="M 0 -34 L 7 0 L 0 34 L -7 0 Z" strokeWidth={1.3} />
            <path d="M 0 -34 L 7 0 L -7 0 Z" fill="#6b5b45" />
          </g>
        </g>
        <text x="70" y="44" textAnchor="middle" className="font-ranger" fontSize="20" fill="#6b5b45">N</text>

        {/* The trail: faint dashed whole route, darker dashes where you've walked */}
        <path d={trail} fill="none" stroke="#a0522d" strokeWidth={3} strokeDasharray="2 11" strokeLinecap="round" opacity={0.55} />
        {walkedPath && <path d={walkedPath} fill="none" stroke="#7a3410" strokeWidth={3.5} strokeDasharray="2 9" strokeLinecap="round" />}

        <text x={TRAILHEAD.x} y={TRAILHEAD.y + 26} textAnchor="middle" className="font-ranger" fontSize="18" fill="#6b5b45">
          Ranger station
        </text>

        {/* Summit */}
        <g filter="url(#pencil)" stroke="#7a3410" strokeLinecap="round" strokeLinejoin="round">
          <path d={`M ${SUMMIT.x} ${SUMMIT.y - 18} v -36`} strokeWidth={2} fill="none" />
          <path d={`M ${SUMMIT.x} ${SUMMIT.y - 54} l 26 8 l -26 9 Z`} strokeWidth={1.5} fill="#c2410c" fillOpacity={0.75} />
        </g>
        <text x={SUMMIT.x + 34} y={SUMMIT.y - 36} className="font-ranger" fontSize="20" fill="#3f3a2e">
          Summit
        </text>
        <text x={SUMMIT.x + 34} y={SUMMIT.y - 14} className="font-ranger" fontSize="15" fill="#6b5b45">
          {summitLabel}
        </text>

        {stops.map((stop, i) => {
          const p = points[i];
          const left = p.x < W / 2;
          const lines = wrap(stop.title);
          const labelX = left ? p.x - 32 : p.x + 32;
          const soon = stop.state === "soon";
          const marker = (
            <g>
              {stop.state === "next" && <circle cx={p.x} cy={p.y} r={29} fill="none" stroke="#d97706" strokeWidth={2.5} strokeDasharray="5 5" />}
              <circle
                cx={p.x}
                cy={p.y}
                r={21}
                fill={stop.state === "done" ? "#065f46" : soon ? "#fbf5e6" : "#fffdf8"}
                stroke={stop.state === "done" ? "#064e3b" : soon ? "#a8a29e" : "#3f3a2e"}
                strokeWidth={2.2}
                strokeDasharray={soon ? "4 4" : undefined}
              />
              {stop.state === "done" ? (
                <path d={`M ${p.x - 9} ${p.y + 1} c 3 2 5 5 7 8 c 4 -8 8 -13 13 -17`} fill="none" stroke="#fffdf8" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <text x={p.x} y={p.y + 7} textAnchor="middle" className="font-ranger" fontSize="21" fill={soon ? "#a8a29e" : "#3f3a2e"}>
                  {stop.number}
                </text>
              )}
              <text x={labelX} y={p.y - (lines.length - 1) * 10 + 5} textAnchor={left ? "end" : "start"} className="font-ranger" fontSize="18" fill={soon ? "#a8a29e" : "#2f2a20"}>
                {lines.map((line, j) => (
                  <tspan key={j} x={labelX} dy={j === 0 ? 0 : 20}>
                    {line}
                  </tspan>
                ))}
                {soon && (
                  <tspan x={labelX} dy={19} fontSize="14">
                    (coming soon)
                  </tspan>
                )}
                {stop.state === "next" && (
                  <tspan x={labelX} dy={19} fontSize="14" fill="#b45309">
                    next stop
                  </tspan>
                )}
              </text>
            </g>
          );
          if (!stop.href) return <g key={stop.id}>{marker}</g>;
          const href = stop.href;
          return (
            <a
              key={stop.id}
              href={href}
              aria-label={`Lesson ${stop.number}: ${stop.title}${stop.state === "done" ? " (done)" : ""}`}
              className="cursor-pointer focus:outline-none [&:focus-visible_circle]:stroke-amber-600 [&:hover_circle]:stroke-amber-700"
              onClick={(e) => {
                e.preventDefault();
                router.push(href);
              }}
            >
              {marker}
            </a>
          );
        })}
      </svg>
    </figure>
  );
}
