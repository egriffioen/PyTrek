// Validates content/ and writes src/generated/content.json for the app.
// Runs automatically before `npm run dev` and `npm run build`.
// Any error fails the build; warnings (e.g. a lesson without a milestone yet) don't.

import { mkdirSync, writeFileSync } from "node:fs";
import { join, sep } from "node:path";
import { loadContent } from "./content-lib.mjs";

const root = process.cwd();
const { expeditions, errors, warnings } = loadContent(join(root, "content"));
const rel = (msg) => msg.replaceAll(root + sep, "").replaceAll(sep, "/");

for (const w of warnings) console.warn(`content warning: ${rel(w)}`);
if (errors.length) {
  console.error(`\nContent has ${errors.length} error(s):`);
  for (const e of errors) console.error(`  - ${rel(e)}`);
  process.exit(1);
}

const outDir = join(root, "src", "generated");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "content.json"), JSON.stringify({ expeditions }, null, 2) + "\n");

const count = expeditions.reduce((n, e) => n + e.lessons.reduce((m, l) => m + l.activities.length, 0), 0);
console.log(`content: ${expeditions.length} expedition(s), ${count} activities → src/generated/content.json`);
