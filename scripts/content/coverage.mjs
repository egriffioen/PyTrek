// Which CS 111 sources does PyTrek cover? Lists every item in
// content/sources/cs111-web.yaml with the activities that cite it.
//   npm run content:coverage            all items
//   npm run content:coverage -- --gaps  only items nothing covers yet

import { join } from "node:path";
import { loadContent } from "./content-lib.mjs";

const gapsOnly = process.argv.includes("--gaps");
const { expeditions, catalog, errors } = loadContent(join(process.cwd(), "content"));
if (errors.length) {
  console.error("Fix content errors first (npm run content:build).");
  process.exit(1);
}

// "rq/hyperlinks#urljoin" → activity ids; a bare "rq/hyperlinks" counts for the whole item.
const cited = new Map();
for (const exp of expeditions)
  for (const lesson of exp.lessons)
    for (const a of lesson.activities)
      for (const ref of a.sources) {
        if (!cited.has(ref)) cited.set(ref, []);
        cited.get(ref).push(a.id);
      }

let items = 0;
let covered = 0;
for (const s of catalog.sources) {
  const whole = cited.get(s.id) ?? [];
  const rows = s.parts.length
    ? s.parts.map((p) => [`#${p}`, [...whole, ...(cited.get(`${s.id}#${p}`) ?? [])]])
    : [["", whole]];
  const shown = gapsOnly ? rows.filter(([, ids]) => ids.length === 0) : rows;
  items += rows.length;
  covered += rows.filter(([, ids]) => ids.length).length;
  if (!shown.length) continue;
  console.log(`\n${s.id}  ${s.label}${s.due ? `  (due ${s.due})` : ""}`);
  for (const [part, ids] of shown) {
    const mark = ids.length ? "✓" : "·";
    console.log(`  ${mark} ${s.id}${part}${ids.length ? "  ← " + [...new Set(ids)].join(", ") : ""}`);
  }
}
console.log(`\nCovered ${covered} of ${items} source items (${Math.round((100 * covered) / items)}%).`);
