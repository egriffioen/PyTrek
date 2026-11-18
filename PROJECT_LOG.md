# PyTrek Project Log

| Date | What | Hours |
|------|------|-------|
| 11/11/2026 | Brainstormed the project idea (gamified, puzzle-based Python learning site), looked into Pyodide for running Python in the browser, sketched a puzzle map/storyline, and built a quick single-page Pyodide prototype | 1 |
| 11/12/2026 | Named the project (PyTrek), created the GitHub repo, met with professor (~30 min) about CS 111, researched the CS 111 course materials and structure, decided to start with the web unit, and built a quick prototype of web-scraping checkpoints | 2 |
| 11/16/2026 | Read the CS 452 Final Project requirements. Made core design decisions: web unit scope (all 7 topics), users and FERPA-safe grading (Canvas screenshots, anonymous section stats with a minimum group of 5), activity types, story (trail-marker mystery with a rogue AI agent), puzzles, boss fight, warm-ups, badges, and progress bar. Compared and priced databases and hosting; chose Next.js + MongoDB Atlas + Pyodide + Docker on Google Cloud Run, with Better Auth email + password sign-in. Drafted the data model and system design docs | 4.25 |
| 11/17/2026 | Finished the Initial Design doc (TL;DR, summary with prototype screenshot, embedded ERD and system design, daily goals schedule). Started building: scaffolded the Next.js app (TypeScript, Tailwind) with a Docker standalone build; set up MongoDB Atlas and connected it with a shared client and `/api/health` check; set up Google Cloud (Cloud Run, Cloud Build, Artifact Registry, Secret Manager for the database URI) and deployed the first live version to Cloud Run; allowed Cloud Run through Atlas network access; added an image cleanup policy | 2 |

**Total:** 9.25
