# PyTrek: project status and next steps

*Last updated: Thursday 11/19/2026 · Hours logged: **13** (target 30–40)*

## Where things stand

### Class deliverables
| Assignment | Due | Status |
|---|---|---|
| Final Project Log | Tue 11/17 | ✅ Submitted |
| Signup for in-class presentation | Tue 11/17 | ✅ Done (presenting **Wed 12/2**) |
| Final Project Pitch | Thu 11/19 | ✅ Graded |
| Project Initial Design | Thu 11/19 | ✅ Submitted ([docs/initial-design.md](initial-design.md)) |
| Live Data Modeling Interview | Thu 11/19 | ✅ Submitted |
| System Design Interview | Thu 11/19 | ✅ Submitted |
| **Final Project and Report** (60 pts) | **Thu 12/10** | ⬜ Not started |
| **Collaboration and Reviews** PDF (40 pts) | **Thu 12/10** | ⬜ Not started (needs 3+ collaborative hours) |

### Built and working
| Area | What exists | Live on Cloud Run? |
|---|---|---|
| Planning docs | [decisions.md](decisions.md), [data-model.md](data-model.md), [system-design.md](system-design.md), [initial-design.md](initial-design.md), [fonts.md](fonts.md) | n/a |
| App foundation | Next.js 16 (TypeScript, Tailwind), Docker standalone build | ✅ Yes (first version) |
| Database | MongoDB Atlas (free tier) with shared client + `/api/health` | ✅ Yes |
| Hosting | Google Cloud Run, project `pytrek`, secret `mongodb-uri` in Secret Manager, old-image cleanup policy | ✅ Yes |
| Email | Project Gmail over SMTP; swappable by changing settings only ([src/lib/email.ts](../src/lib/email.ts)) | ✅ Yes (11/19) |
| Sign-in | Better Auth email + password: sign-up with required verification, sign-in, forgot/reset password, account page, sign-out; rate limits; code review fixes applied | ✅ Yes (11/19) |
| Fonts | Work Sans, Architects Daughter (`font-ranger`), Space Mono (`font-agent`), JetBrains Mono (`font-mono`) | ✅ Yes (11/19) |
| Homepage | Forest-green banner on a sand page, big sign-up/sign-in buttons, no-sign-in "Hello World" Python demo (Pyodide in a Web Worker, 5-second loop guard) | ✅ Yes (11/19) |
| Prototype | Web-unit prototype with 5 scraping/crawling checkpoints (temporary folder, not in the repo) | n/a |

**Live site:** https://pytrek-102065497723.us-central1.run.app (redeployed 11/19 with sign-in, email, fonts, and the new homepage)

### Not built yet
- Lessons: the lesson page, CodeMirror editor, lesson content files, the simulated park website
- Saving progress and attempts; the progress bar
- Boss fight and the completion page (the Canvas screenshot)
- Sections with join codes and enrollments
- Daily warm-up and streaks, badges, anonymous teacher stats
- Story content for *The Case of the Missing Trail Markers*

## Next steps

### 1. Deploy what's built (done 11/19 except the sign-in test)
- [x] Add 2 secrets to Secret Manager: `BETTER_AUTH_SECRET` and the Gmail app password (`SMTP_PASS`)
- [x] Set Cloud Run settings: `BETTER_AUTH_URL` (the run.app address), `EMAIL_PROVIDER=smtp`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `EMAIL_FROM`
- [x] Redeploy (command in the [README](../README.md)); fixed a build failure (pages connected to MongoDB while prerendering)
- [x] Live checks: `/api/health` ok, homepage and Python demo run, `/account` redirects to sign-in when signed out
- [ ] **You:** test sign-up, email verification, sign-in, and password reset on the live site with a real inbox
- [x] Rate limit sees each visitor's real IP on Cloud Run (a spoofed `X-Forwarded-For` was ignored; checked 11/19)

### 2. Build the core lesson experience (11/21–11/24)
- [x] Lesson content format (11/19): Markdown activity files + YAML in [content/](../content/README.md), validated at build; every activity cites CS 111 sources ([decisions.md §9](decisions.md#9-lesson-content-format-and-cs-111-sources-11192026))
- [x] Eight lessons laid out (added **Images**); prototype's 5 activities ported + 1 concept check; checks verified against reference solutions
- [ ] Test `byuimage` in Pyodide (needs Pillow 12; ours ships older) before writing the Images lesson
- [ ] CodeMirror editor + Pyodide worker (reuse the homepage demo's worker approach) + the simulated web (`requests` + BeautifulSoup)
- [ ] Lesson page with the progress bar (reads `src/lib/content.ts`; runs each activity's `preload`, then the student's code, then `check`)
- [ ] API + MongoDB writes for `attempts` and `progress` (per [data-model.md](data-model.md))
- [ ] Sections: create with a join code, join, `enrollments`, `activeSectionId`

### 3. Content over Thanksgiving (light, 11/25–11/28; off Thursday)
- [ ] Fill gaps shown by `npm run content:coverage -- --gaps` (27 of 133 CS 111 items covered on 11/19); each lesson needs a Milestone
- [ ] Write the story beats for *The Case of the Missing Trail Markers*
- [ ] Lessons for all 8 web-unit topics: HTTP, HTML + BeautifulSoup, URLs, `robots.txt`, crawling, images, charts, regex
- [ ] Activities: run examples, one-change tweaks, fix the bug / finish the code, concept checks, and the chosen puzzles

### 4. Pilot launch (Mon 11/30 – Tue 12/1)
- [ ] Boss fight: timed questions, easy/medium/hard, health, restart on loss, best score
- [ ] Completion page: display username, unit, best score, server timestamp
- [ ] Full end-to-end test on Cloud Run
- [ ] **Confirm the pilot setup with the professor**, including that activities don't give away HW05 / Project 04 answers (`robots-01` is close to HW05's `can_follow_link`) (and ideally BYU's Registrar's Office) before real students use it
- [ ] **Pilot live Tuesday 12/1**; share the link with CS 111 students

### 5. After the pilot (12/2–12/7)
- [ ] **Wed 12/2: in-class presentation**; collect feedback (counts toward collaboration)
- [ ] Fix pilot feedback
- [ ] Stretch, in this order: daily warm-up + weekday streak → badges → anonymous teacher stats (groups under 5 hidden) → start the Python basics unit
- [ ] If behind, simplify the game (cut order in [initial-design.md](initial-design.md#daily-goals))

### 6. Final deliverables (12/8–12/10)
- [ ] Demo video or GIF
- [ ] Final report in the repo: summary, diagrams, demo, 3+ key learnings, AI integration and how AI was used to build it, why this project, failover/scaling/performance/auth/concurrency
- [ ] Class channel post (a few sentences, why it interests you, repo link, demo) and link it in the report
- [ ] Say "yes, share" or "no, don't share" for future students
- [ ] Collaboration and Reviews PDF (3+ hours: pitch feedback, presentation, pilot feedback, helping classmates)
- [ ] Keep [PROJECT_LOG.md](../PROJECT_LOG.md) updated through the end

## Smaller to-dos and open questions
- [x] Activity names decided 11/19: Expedition → Lesson → Checkpoints ending in a Milestone; data model renamed to `expeditionId` + `stage` ([decisions.md §8](decisions.md#8-names-for-practice-activities-11192026))
- [x] One lesson per topic: the web expedition has 7 lessons, 7 Milestones, then the boss fight
- [ ] Narrow the Atlas database user to `readWrite` on `pytrek` only (Atlas → Database Access)
- [ ] Delete local test accounts from the shared database when testing is done (`+pytrek1` test user)
- [ ] Ask the CS 111 professor about recruiting students and reusing course problems
- [ ] Holiday dates list for streaks (BYU academic calendar)
- [ ] Later: custom domain via Firebase Hosting; Resend + domain for email; BYU sign-in (needs BYU IT)
- [x] Web-unit prototype copied to [prototype/web-trail/](../prototype/web-trail/index.html)

## Running it locally
```bash
npm run dev
```
Open http://localhost:3000. Settings and secrets live in `.env.local` (never committed; template in `.env.example`).

- Don't run `npm run build` while `npm run dev` is running; they share the `.next` folder and the dev server starts serving stale styles. Restart `npm run dev` after a build.
- Changes to `src/lib/auth.ts` need a dev server restart (the auth setup is cached).
