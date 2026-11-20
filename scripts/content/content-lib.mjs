// Loads and validates PyTrek lesson content from content/.
// Format: docs/decisions.md §9 and content/README.md.
// Plain JavaScript so build scripts can run it with plain Node.

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { parse as parseYaml } from "yaml";
import { marked } from "marked";
import { z } from "zod";

const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "use lowercase-words-with-dashes");
const pyName = z.string().regex(/^[A-Za-z_][A-Za-z0-9_]*$/, "must be a Python name");

// ---- Schemas ----
const SourceCatalog = z.strictObject({
  course: z.string(),
  sources: z.array(
    z.strictObject({
      id: z.string().regex(/^[a-z]+\/[a-z0-9-]+$/, 'like "rq/hyperlinks"'),
      label: z.string(),
      due: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      parts: z.array(z.string().regex(/^[A-Za-z0-9-]+$/)).default([]),
    }),
  ),
});

const Expedition = z.strictObject({
  id: slug,
  title: z.string(),
  summary: z.string(),
  story: z.string().optional(),
  site: z.string().optional(), // folder of simulated web pages
  harness: z.string().optional(), // Python loaded before every activity
  characters: z
    .strictObject({
      mentor: z.strictObject({ name: z.string(), role: z.string() }),
      agent: z.strictObject({ name: z.string() }),
    })
    .optional(),
  briefing: z.string().optional(), // Markdown file: the mentor's opening note
  reviews: z.string().optional(), // YAML file: lost-hiker reviews shown after the briefing
  lessons: z.array(slug).min(1),
});

const Briefing = z.strictObject({
  title: z.string(),
  signoff: z.string(),
});

const Reviews = z.strictObject({
  site: z.string(),
  tagline: z.string(),
  reviews: z
    .array(
      z.strictObject({
        author: z.string(),
        rating: z.int().min(1).max(5),
        trail: z.string(),
        date: z.string(),
        text: z.string(),
      }),
    )
    .min(1),
});

const Lesson = z.strictObject({
  id: slug,
  title: z.string(),
  topic: slug,
  summary: z.string(),
  // Ranger notes (Markdown): shown when the lesson first opens / when it's complete.
  intro: z.string().optional(),
  outro: z.string().optional(),
  // Revealed when the Milestone is passed; must follow from what the code found.
  clue: z.strictObject({ title: z.string(), text: z.string() }).optional(),
  activities: z.array(slug).default([]),
});

const ActivityHeader = z.strictObject({
  id: slug,
  version: z.int().min(1),
  title: z.string(),
  stage: z.enum(["checkpoint", "milestone"]),
  type: z.enum(["example", "tweak", "fix", "finish", "concept", "puzzle"]),
  difficulty: z.enum(["easy", "medium", "hard"]),
  sources: z.array(z.string()).min(1, "cite at least one CS 111 source"),
  provides: z.array(pyName).default([]),
  uses: z.array(pyName).default([]),
  choices: z
    .array(
      z.strictObject({
        text: z.string(),
        correct: z.boolean().default(false),
        feedback: z.string().optional(),
      }),
    )
    .optional(),
});

const SECTIONS = { Story: "story", Agent: "agent", Learn: "learn", Task: "task", Hints: "hints" };

// Text fields are Markdown in the files and HTML in the build output.
// Content is ours (reviewed in git), so its HTML is trusted.
const block = (md) => (md ? marked.parse(md, { async: false }).trim() : null);
const inline = (md) => marked.parseInline(md, { async: false });
const CODE_BLOCKS = ["starter", "check"];

// ---- Helpers ----
function zodMessages(err) {
  return err.issues.map((i) => `${i.path.join(".") || "(top level)"}: ${i.message}`);
}

function readYaml(file, schema, errors) {
  try {
    const result = schema.safeParse(parseYaml(readFileSync(file, "utf8")));
    if (!result.success) {
      for (const m of zodMessages(result.error)) errors.push(`${file}: ${m}`);
      return null;
    }
    return result.data;
  } catch (e) {
    errors.push(`${file}: ${e.message}`);
    return null;
  }
}

/** Split an activity Markdown file into its YAML header, sections, and code blocks. */
export function parseActivityMarkdown(text) {
  const src = text.replace(/\r\n/g, "\n");
  const m = src.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new Error("must start with a YAML header between --- lines");
  const header = parseYaml(m[1]);
  let body = m[2];

  const code = {};
  const problems = [];
  body = body.replace(/^```python[ \t]+(\w+)[ \t]*\n([\s\S]*?)^```[ \t]*$/gm, (_, kind, codeText) => {
    if (!CODE_BLOCKS.includes(kind)) problems.push(`unknown code block "python ${kind}" (use ${CODE_BLOCKS.join(", ")})`);
    else if (code[kind] !== undefined) problems.push(`more than one "python ${kind}" block`);
    else code[kind] = codeText;
    return "";
  });

  const sections = {};
  const parts = body.split(/^## +(.+?)[ \t]*$/m);
  if (parts[0].trim()) problems.push("text before the first ## section");
  for (let i = 1; i < parts.length; i += 2) {
    const key = SECTIONS[parts[i]];
    if (!key) problems.push(`unknown section "## ${parts[i]}" (use ${Object.keys(SECTIONS).join(", ")})`);
    else if (sections[key] !== undefined) problems.push(`section "## ${parts[i]}" appears twice`);
    else sections[key] = parts[i + 1].trim();
  }
  return { header, sections, code, problems };
}

function listFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? listFiles(full) : [full];
  });
}

/** Simulated site: site/index.html → "/", site/trails/index.html → "/trails/". */
function loadSite(dir) {
  const site = {};
  for (const file of listFiles(dir).sort()) {
    const rel = relative(dir, file).split(sep).join("/");
    const path = "/" + rel.replace(/(^|\/)index\.html$/, "$1");
    site[path] = readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  }
  return site;
}

// ---- Main loader ----
/**
 * Load every expedition under contentDir.
 * Returns { expeditions, catalog, errors, warnings }; errors should fail the build.
 */
export function loadContent(contentDir) {
  const errors = [];
  const warnings = [];

  const catalogFile = join(contentDir, "sources", "cs111-web.yaml");
  const catalog = readYaml(catalogFile, SourceCatalog, errors);
  const sourceParts = new Map((catalog?.sources ?? []).map((s) => [s.id, new Set(s.parts)]));

  const expeditions = [];
  const seenActivityIds = new Map();
  const expDir = join(contentDir, "expeditions");

  for (const expName of readdirSync(expDir).sort()) {
    const dir = join(expDir, expName);
    if (!statSync(dir).isDirectory()) continue;
    const expFile = join(dir, "expedition.yaml");
    const exp = readYaml(expFile, Expedition, errors);
    if (!exp) continue;
    if (exp.id !== expName) errors.push(`${expFile}: id "${exp.id}" must match its folder name "${expName}"`);

    const site = exp.site ? (existsSync(join(dir, exp.site)) ? loadSite(join(dir, exp.site)) : (errors.push(`${expFile}: site folder "${exp.site}" not found`), {})) : {};
    let harness = "";
    if (exp.harness) {
      if (existsSync(join(dir, exp.harness))) harness = readFileSync(join(dir, exp.harness), "utf8").replace(/\r\n/g, "\n");
      else errors.push(`${expFile}: harness file "${exp.harness}" not found`);
    }

    const provided = new Map(); // python name → activity id that provides it
    const preloadOf = new Map(); // activity id → activity ids to run first
    const order = new Map(); // activity id → position in the expedition
    const lessons = [];
    for (const lessonId of exp.lessons) {
      const lessonFile = join(dir, lessonId, "lesson.yaml");
      if (!existsSync(lessonFile)) {
        errors.push(`${expFile}: lesson "${lessonId}" has no ${lessonId}/lesson.yaml`);
        continue;
      }
      const lesson = readYaml(lessonFile, Lesson, errors);
      if (!lesson) continue;
      if (lesson.id !== lessonId) errors.push(`${lessonFile}: id "${lesson.id}" must match its folder name "${lessonId}"`);

      const activities = [];
      for (const actName of lesson.activities) {
        const file = join(dir, lessonId, `${actName}.md`);
        if (!existsSync(file)) {
          errors.push(`${lessonFile}: activity "${actName}" has no ${actName}.md`);
          continue;
        }
        let parsed;
        try {
          parsed = parseActivityMarkdown(readFileSync(file, "utf8"));
        } catch (e) {
          errors.push(`${file}: ${e.message}`);
          continue;
        }
        for (const p of parsed.problems) errors.push(`${file}: ${p}`);
        const result = ActivityHeader.safeParse(parsed.header);
        if (!result.success) {
          for (const m of zodMessages(result.error)) errors.push(`${file}: ${m}`);
          continue;
        }
        const a = result.data;
        const where = `${file}`;

        if (seenActivityIds.has(a.id)) errors.push(`${where}: id "${a.id}" is also used by ${seenActivityIds.get(a.id)}`);
        seenActivityIds.set(a.id, file);

        if (!parsed.sections.task) errors.push(`${where}: needs a "## Task" section`);
        if (a.type === "concept") {
          if (!a.choices?.length) errors.push(`${where}: concept activities need "choices" in the header`);
          else if (!a.choices.some((c) => c.correct)) errors.push(`${where}: mark at least one choice "correct: true"`);
        } else {
          if (a.choices) errors.push(`${where}: only concept activities have "choices"`);
          if (parsed.code.starter === undefined) errors.push(`${where}: needs a "python starter" code block`);
          if (parsed.code.check === undefined) errors.push(`${where}: needs a "python check" code block`);
          else if (!/^def check\(/m.test(parsed.code.check)) errors.push(`${where}: the check block must define check(ns, out)`);
        }

        for (const ref of a.sources) {
          const [id, part] = ref.split("#");
          if (!sourceParts.has(id)) errors.push(`${where}: unknown source "${id}" (see content/sources/cs111-web.yaml)`);
          else if (part !== undefined && !sourceParts.get(id).has(part)) errors.push(`${where}: source "${id}" has no part "${part}"`);
        }
        // preload: every earlier activity whose passing code must run first, in
        // order, including what those activities use themselves (crawl needs
        // get_links and is_allowed, so anything using crawl needs all three).
        const preload = new Set();
        for (const name of a.uses) {
          if (!provided.has(name)) {
            errors.push(`${where}: uses ${name}() but no earlier activity provides it`);
            continue;
          }
          const dep = provided.get(name);
          for (const id of preloadOf.get(dep)) preload.add(id);
          preload.add(dep);
        }
        preloadOf.set(a.id, [...preload].sort((x, y) => order.get(x) - order.get(y)));
        order.set(a.id, order.size);
        for (const name of a.provides) {
          if (provided.has(name)) errors.push(`${where}: ${name}() is already provided by ${provided.get(name)}`);
          provided.set(name, a.id);
        }

        const hints = parsed.sections.hints
          ? parsed.sections.hints.split(/^- /m).map((h) => h.trim()).filter(Boolean)
          : [];
        activities.push({
          ...a,
          lessonId,
          preload: preloadOf.get(a.id),
          story: block(parsed.sections.story),
          agent: block(parsed.sections.agent),
          learn: block(parsed.sections.learn),
          task: block(parsed.sections.task) ?? "",
          hints: hints.map(block),
          starter: parsed.code.starter ?? null,
          check: parsed.code.check ?? null,
          choices: a.choices?.map((c) => ({ ...c, text: inline(c.text), feedback: c.feedback ? inline(c.feedback) : undefined })) ?? null,
        });
      }

      if (activities.length === 0) warnings.push(`${lessonFile}: no activities yet`);
      else {
        const milestones = activities.filter((x) => x.stage === "milestone");
        if (milestones.length !== 1 || activities.at(-1).stage !== "milestone")
          warnings.push(`${lessonFile}: should end with exactly one milestone (has ${milestones.length})`);
      }
      if (!lesson.intro) warnings.push(`${lessonFile}: no intro note yet`);
      if (activities.some((x) => x.stage === "milestone") && !lesson.clue) warnings.push(`${lessonFile}: milestone has no clue yet`);
      lessons.push({
        ...lesson,
        intro: block(lesson.intro),
        outro: block(lesson.outro),
        clue: lesson.clue ? { title: lesson.clue.title, text: block(lesson.clue.text) } : null,
        activities,
      });
    }
    let briefing = null;
    if (exp.briefing) {
      const file = join(dir, exp.briefing);
      if (!existsSync(file)) errors.push(`${expFile}: briefing file "${exp.briefing}" not found`);
      else {
        const m = readFileSync(file, "utf8").replace(/\r\n/g, "\n").match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
        const head = m ? Briefing.safeParse(parseYaml(m[1])) : null;
        if (!m) errors.push(`${file}: must start with a YAML header (title, signoff)`);
        else if (!head.success) for (const msg of zodMessages(head.error)) errors.push(`${file}: ${msg}`);
        else briefing = { ...head.data, body: block(m[2].trim()) };
      }
    }
    let reviews = null;
    if (exp.reviews) {
      const file = join(dir, exp.reviews);
      if (!existsSync(file)) errors.push(`${expFile}: reviews file "${exp.reviews}" not found`);
      else {
        const r = readYaml(file, Reviews, errors);
        if (r) reviews = { ...r, reviews: r.reviews.map((x) => ({ ...x, text: inline(x.text) })) };
      }
    }
    expeditions.push({
      ...exp,
      story: exp.story ?? null,
      characters: exp.characters ?? null,
      briefing,
      reviews,
      lessons,
      site,
      harness,
    });
  }
  return { expeditions, catalog, errors, warnings };
}
