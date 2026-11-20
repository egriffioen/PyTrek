# PyTrek lesson content

Everything students practice with lives here, versioned in git (not in
MongoDB). Decisions behind this format: [docs/decisions.md §8–9](../docs/decisions.md).

```
content/
  sources/cs111-web.yaml        every CS 111 item activities can cite
  expeditions/web/              one expedition (unit)
    expedition.yaml             title, story, lesson order, site, harness
    harness.py                  Python loaded before every activity (fake requests)
    site/                       the simulated park website (https://trailnet.test)
    <lesson>/lesson.yaml        lesson title, topic, activity order
    <lesson>/<activity>.md      one activity
```

**Hierarchy:** an Expedition has Lessons (one per topic); each Lesson is a run
of **Checkpoints** that ends in one **Milestone**. The boss fight ends the
expedition.

## Commands
```bash
npm run content:build
```
Validates everything and writes `src/generated/content.json` (also runs
automatically before `npm run dev` and `npm run build`; errors fail the build).

```bash
npm run content:coverage -- --gaps
```
Lists CS 111 items that no activity covers yet (drop `-- --gaps` to see all).

## Writing an activity

Add `<name>.md` to a lesson folder and list `<name>` in that lesson's
`lesson.yaml` under `activities` (order matters; the milestone goes last).

```markdown
---
id: urls-02            # unique forever; never reuse or rename once students use it
version: 1             # bump when the task or check changes meaningfully
title: Follow the detour
stage: checkpoint      # checkpoint | milestone
type: finish           # example | tweak | fix | finish | concept | puzzle
difficulty: easy       # easy | medium | hard
sources:               # CS 111 items this practices (IDs from sources/cs111-web.yaml)
  - rq/hyperlinks#urljoin
  - lab/hyperlinks#Q7
provides: [resolve]    # functions later activities may reuse (optional)
uses: [get_links]      # functions from earlier activities, preloaded (optional)
---

## Story
One or two sentences of the mystery.

## Learn
The minimum teaching needed, in Markdown.

## Task
What to do.

(code fence: python starter)
...starter code...

(code fence: python check)
def check(ns, out):
    # ns = the student's variables/functions, out = everything printed
    # Harness helpers: B (base URL), LOG (URLs requested), norm(u), short(u)
    return True, "Message shown to the student"

## Hints
- First hint (shown one at a time)
- Second hint
```

Write the two code fences as ```` ```python starter ```` and
```` ```python check ````. **Concept checks** (`type: concept`) have no code:
put `choices` in the header instead:

```yaml
choices:
  - text: "The right answer"
    correct: true
    feedback: "Why it's right"
  - text: "A tempting wrong answer"
    feedback: "Nudge toward the right idea"
```

## Rules
- Cite at least one source. Use only IDs and PyTrek's own words: the CS 111
  course repo is private, so never copy its quiz, lab, or assignment text.
- Don't publish working answers to graded functions (HW05 `parse_robots` /
  `can_follow_link`, the Project 04 crawler). Teach the skill on the park site.
- Simulated pages go in `site/`: `site/index.html` is served at `/`,
  `site/trails/index.html` at `/trails/`, other files at their own path.
