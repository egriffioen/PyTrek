# PyTrek design decisions

A running record of decisions made for the project, newest last. Feeds the
Initial Design doc.

## 1. Scope of the first version (11/16/2026)

**Decision:** Build the CS 111 **web unit** first, with the system designed so
more units can plug in later. More units are a stretch goal, not a commitment.

**Priority:** A working version of everything in the web unit comes first.

**Why:**
- Students are doing HW05 Robots and Project 04 Webcrawler (Dec 4–7) and
  Exam 4 (Dec 10) right when testing is planned, so the content is timely.
- The quick prototype already proved the hardest technical part: a simulated
  website lets students scrape and crawl entirely in the browser.
- Designing for pluggable units keeps the data model general enough for a
  fundamentals unit (or others) later.

**Trade-offs accepted:** narrower audience at first; more content work per
pretend website; practice must stay separate from graded assignments.

**Topics included (decided 11/16/2026):** all of CS 111 Lectures 20–24, the full
Exam 4 range:
1. HTML + BeautifulSoup
2. URLs / hyperlinks (`urljoin`, `urlparse`)
3. robots.txt
4. Web scraping / crawling
5. Data visualization (matplotlib)
6. Regular expressions
7. Intro to the WWW (HTTP requests/responses, client-server)

Topics 1–5 are what HW05 and Project 04 use; 6–7 complete Exam 4 coverage.

## 2. Who uses it (11/16/2026, in progress)

**Decided:**
- Content rarely changes (beyond adding a Python basics unit later), so there is
  **no authoring UI**. Content is written as files in the repo and served
  as **static files with the app** (decided 11/16/2026; not stored in MongoDB).
  MongoDB holds only user data (accounts, progress, attempts, streaks, badges),
  which references activities by a stable ID plus a version number. Attempts
  also store copies of the activity's topic, lesson, and difficulty
  (denormalized) so stats can be grouped without a content catalog. Trade-off
  accepted: stats can't show activities nobody has attempted, and old attempts
  keep the topic they had when they were made.
- **Independent learners:** anyone can use PyTrek without belonging to a class.
- **Classes are preferred:** students can be tied to teachers and class sections.

## 3. Grades, privacy, and teacher visibility (11/16/2026)

**Decision:** PyTrek is never a gradebook. Grades live only in Canvas.
- Students sign in with their **email** (see decision 5), so PyTrek stores
  their **email address**. They also choose a free-form **display username**
  (no limits on nicknames), which is what appears on completion pages. They can
  join a class section.
- PyTrek stores their progress/scores. Attempts are unlimited.
- When a student finishes a section, a completion page clearly shows their
  **username, the section, their score, and a timestamp**. Students screenshot
  it and submit the screenshot to Canvas for credit.
- Professors/TAs see an **anonymous aggregate view** per class section only,
  never individual students or grades.
- Any aggregate statistic based on **fewer than 5 students is hidden**, so no
  individual can be singled out.

**Why:** gives classes the credit they want now while keeping student
education records in Canvas (which BYU already manages under FERPA), not in
PyTrek.

**Future (Level 3):** the schema includes teachers, sections, and enrollments
now, so named rosters and individual progress could be turned on later, but
only after BYU approval.

**Known risks accepted:**
- Screenshots can be faked or shared; no verification code for now, only the
  clear username and timestamp for spot checks.
- Usernames are unrestricted, so a student could choose an identifying name.
- PyTrek stores students' email addresses, so its data is
  identifiable and the database must be secured accordingly. Mention this when
  confirming the setup with the professor.
- Unlimited attempts mean the score reflects completion, not first-try skill
  (same model as CS 111 reading quizzes).

**Still to do before real students use it (grades/privacy):** confirm the setup with the
professor (and ideally BYU's Registrar's Office); store passwords hashed;
reliable hosting and backups.

## 4. What a student does (11/16/2026, in progress)

**Activity types decided:**
- **Minimal reading:** short explanations only.
- **Runnable examples:** example code students can run and edit.
- **Tweak it:** change one thing in an example to get a different output.
- **Fix the bug / finish the code:** hands-on, checked by hidden tests.
- **Concept checks:** quick no-code questions, made game-like so they aren't boring.

**Story/theme:** a detective mystery set on park trails, combining the park
ranger trail guide (the prototype's setting) with a small-town detective
mystery.

**Premise: The Case of the Missing Trail Markers** (decided 11/16/2026).
Someone has been quietly tampering with the park's website: trail pages point
the wrong way, pages have vanished, and hikers are getting lost. The student is
a junior ranger-detective. **Twist:** the culprit is a **rogue AI agent** that
ignored `robots.txt` and crawled/edited the site; the student, the "good
crawler," must find it and shut it down. Every web-unit topic has a role:
- HTTP: why pages now return 404
- HTML/BeautifulSoup: inspect pages for tampered tags and hidden notes
- URLs: follow suspicious links to fake look-alike pages
- robots.txt: the evidence locker is off-limits; follow the rules the agent broke
- Crawling: map the site to find every altered page
- Charts: plot the edit log to see when the changes happened
- Regex: decode the agent's signature in change notes
- Boss: shut down the rogue AI agent

**Puzzle types:**
1. One-Change Challenge: change exactly one thing to get a target output.
2. Regex Lock: pattern must match all "green" strings and none of the "red".
3. Broken Scraper: the site changed; update the scraper to fit the new HTML.
4. Scattered Message: a secret split across alt text, attributes, link text,
   and HTML comments.
5. Link Maze: crawl from page A to page B (harder: shortest path).
6. Messy Table: clean scraped data (commas, units, blanks) to compute an answer.
7. Finish the Crawler: one missing piece (visited check, same-domain check,
   404 handling) per puzzle.

**Game elements:**
- **Boss challenge** (end of section): correct answers damage the boss, wrong
  answers damage the student. Students choose an easy, medium, or hard question
  each turn; harder questions do more damage.
- **Optional daily warm-up** with a streak that counts **weekdays only**.
- **Badges** that document and reward progress.
- **Progress bar** throughout lessons, with clear checkpoints showing how much
  is left.

**Boss challenge rules:**
- Losing all health restarts the fight from the beginning. Fights are short and
  not too hard. Unlimited attempts.
- **Timer on each question**, to discourage looking answers up with AI (it
  slows AI use rather than preventing it).
- Score = **percent correct on the best attempt** (shown on the completion page).
- Questions mix concept checks and code puzzles; harder questions include the
  puzzles.
- Can be attempted at any time.

**Section flow:** lessons have a recommended fixed order, but students can open
any lesson and the boss fight at any time. The progress bar shows what's done
and what's left.

**Daily warm-up:** optional; 5 questions (3 conceptual, 2 simple coding
questions/puzzles). Streak counts weekdays; weekends and holidays don't break it
(holiday dates stored in the database). Questions come only from lessons the
student has opened **and every lesson before them** in the recommended order:
if they skipped ahead, they're expected to know the earlier material too.

## 5. Tech stack (11/16/2026, in progress)

**Database: MongoDB Atlas** (document database). Chosen over Firebase for
long-term flexibility: rich aggregation queries for anonymous section stats,
natural username/password login, a future path to Level 3 rosters and Canvas
grade passback, and portability (could run on university-controlled servers).

- Student Python runs in the browser with **Pyodide**, so there are no server
  costs for running code.
- Pilot cost: $0 on the Atlas free tier (512 MB, up to 100 ops/sec).
  At ~10,000 active students: Atlas Flex ($8–30/month) plus app hosting is about
  $0.005 per student per month (prices checked 11/16/2026).
- Data model: progress and attempts live in their own documents/collections,
  not embedded in section documents; sections hold member IDs only.

**Full stack (decided 11/16/2026):**
- **Frontend + backend: Next.js (React).** API routes serve as the backend.
  (The user built a React + Node/Express + MongoDB Atlas app in CS 260.)
- **Database: MongoDB Atlas** (free tier for the pilot).
- **Student code: Pyodide** in the browser.
- **Packaging: Docker.** The Dockerfile is the single source of truth for how
  the app builds and runs, so the same image can move between hosts.
- **Hosting: Google Cloud Run** (free tier; scales to zero, so a few seconds of
  cold start after idle). Pilot uses the free `*.run.app` address. Requires a
  Google Cloud billing account (card on file); set a budget alert.

**Login (decided 11/16/2026): Better Auth**, using its official MongoDB adapter.
- **Email sign-in** (updated 11/16/2026). Google sign-in was dropped because
  BYU may not allow requiring Google accounts; students can use any email,
  including their BYU email. Requiring an email is accepted as standard
  practice. Needs an **email-sending service** (verification and recovery).
- Students pick a free-form display username after first sign-in.
- **Later, as needed:** Google or other providers for independent learners;
  BYU's own sign-in (NetID) through Better Auth's SSO plugin, which would need
  BYU IT approval.
- **Email + password** (decided 11/16/2026). Passwords are hashed by Better
  Auth; email is used to verify the account and reset forgotten passwords.
  Passwords: at least 8 characters, long passphrases allowed; sign-in attempts
  rate-limited.
- **Sign-in rules (decided 11/18/2026):** email verification is **required
  before sign-in**; sessions last **30 days** (renewed when used); a password
  reset **signs out every device**; passwords 8–128 characters; sign-in
  attempts rate-limited per client IP (60/minute for sign-in and sign-up,
  since a classroom on campus Wi-Fi can share one public IP; 10/minute for
  reset and verification emails). Unverified accounts are not re-emailed on
  sign-in attempts (a rate-limited "send a new link" button instead), and
  verification emails never include user-typed text. Display usernames are
  checked on the server (1–40 characters).
- **Email sending (decided 11/18/2026):** a **dedicated project Gmail account**
  for the pilot ($0, no domain, ~500 emails/day), sent over SMTP with an app
  password. The code uses **generic SMTP settings in environment variables**,
  so switching to a real provider (e.g. Resend + a custom domain, ~$10–20/year;
  Resend supports SMTP) means changing settings only, not code. Considered:
  Resend (needs a domain; 100/day free cap), Amazon SES (sandbox + production
  approval), SocketLabs (no lasting free plan).
- Chosen over Auth.js (in security-only maintenance since Sept 2025, with
  Better Auth recommended for new projects) and over iron-session/DIY (sessions
  only, and no Google sign-in).

**Build setup (decided 11/17/2026):** **TypeScript**, **Tailwind CSS**, the
**plain MongoDB Node driver** (no Mongoose), and the Next.js app at the
**repo root** (App Router, `src/` folder).

**Pretend website (decided 11/16/2026):** keep the prototype's approach. Each
lesson's simulated web pages (HTML, `robots.txt`, data tables) are content
files. When a lesson opens, the browser loads them into a fake `requests`
module inside Pyodide, so student code looks like real CS 111 code with no
internet access needed. The park site can change between lessons as the case
unfolds. No extra server or database pieces.

**Later / optional:**
- **Custom domain via Firebase Hosting** in front of Cloud Run ($0 at pilot
  scale; Hosting only, not the Firebase database). Set it up before real
  students use PyTrek so logins aren't reset by a domain change. Buy the domain
  from an independent registrar.
- **Paid exits:** Railway (~$5/mo) or Render Starter ($7/mo) for no cold
  starts; a Google load balancer (~$18–19/mo) once commercial.

**Portability rules:** read the port from `PORT`; keep secrets and settings in
environment variables; avoid Google-only services inside the app; keep Cloud Run
and the Atlas cluster in the same region (us-central1).

**Considered and rejected:** Firebase/Firestore as the database (weak grouped
stats, email-based login); Vercel Hobby (non-commercial only, no Docker);
Cloudflare Workers (MongoDB driver support too new); load balancer for the
pilot (fixed ~$18/mo).

## 6. Data model (11/16/2026, in progress)

MongoDB collections: Better Auth's `user`/`session`/`account` (plus PyTrek
profile fields on `user`), `sections`, `progress`, `attempts`, `bossRuns`,
`warmups`, `holidays`. Units, lessons, activities, boss questions, badge
definitions, and pretend web pages are static content files, not in MongoDB.
The teacher view is a grouping query over `attempts`, hiding groups under 5.

**Decided:**
- **Student code is not saved** in attempts by default. An activity can opt in
  (a per-activity flag) only if it requires code for review.
- **Progress: one document per student**, organized by unit inside the
  document so it can be split into one document per student per unit later if
  it grows too large.
- **Teachers and TAs have the same permissions** for now (a role on the user).
- **Streaks use each student's own time zone**, detected from the browser and
  stored on the user.

- **Section membership:** each user stores one `activeSectionId` (the single
  source of truth for their current section), plus an **`enrollments`**
  collection (user, section, joined date, left date) that keeps history for
  retakes and supports future Level 3 rosters. Sections do not store member
  lists; members are found by querying users (indexed on `activeSectionId`).
- **Each attempt stores the `sectionId` it was made in**, so stats stay correct
  when a student retakes the course in a new section. The teacher view groups
  attempts by `sectionId` and topic, counting distinct students, and hides any
  group under 5.

## 7. Database reconfirmed (11/18/2026)

The professor prefers Firebase. Reconsidered and **kept MongoDB Atlas**: the
anonymous section stats (group by section and topic, count distinct students,
hide groups under 5) are a single aggregation in MongoDB but awkward in
Firestore (no group-by or distinct counts; would need counters or Cloud
Functions). Noted fairly: since moving to email + password, Firebase Auth would
handle accounts and reset emails for free, and the "no backend" benefit no
longer applies because PyTrek has a Next.js backend either way. A hybrid
(Firebase Auth + MongoDB) was considered and not chosen.

## 8. Names for practice activities (11/19/2026)

Practice activities outside the games (such as the boss fight) use a
trail-themed hierarchy, so each level has a clear purpose:

- **Expedition**: a full unit, such as the web scraping unit.
- **Milestone**: a larger activity partway through an expedition, in the
  middle or at about 1/3 and 2/3 of the way.
- **Checkpoint**: a short activity along the way, such as the first coding
  exercise.

The boss fight and the daily warm-up are games, not part of this hierarchy.

**Lessons stay** as a level inside an expedition: each lesson is a run of
Checkpoints that **ends in a Milestone**, so an expedition has one Milestone
per lesson. The boss fight ends the expedition.

**One lesson per topic** (decided 11/19/2026): the web expedition has 7
lessons (one per topic), so 7 Milestones, then the boss fight. Each lesson has
several Checkpoints mixing the activity types above.

**Data model renamed to match (11/19/2026):** `unitId` → `expeditionId`
(in `attempts` and `bossRuns`), `progress.units` → `progress.expeditions`, and
a new `stage` field (`checkpoint` | `milestone`) on attempts, copied from
content. `lessonId` and `activityType` are unchanged. Renamed now because no
progress or attempts are stored yet, so there is nothing to migrate. Earlier
sections of this file still say "unit"; read it as "expedition". The
submitted [initial-design.md](initial-design.md) is left as submitted.

## 9. Lesson content format and CS 111 sources (11/19/2026)

**Eight lessons.** The web expedition adds an **Images** lesson, because
Project 04 Part 3 (find, download, filter, and save images with BYU's
`byuimage` library) and Lecture 24 rely on it. `byuimage` is one pure-Python
file on top of Pillow, which Pyodide includes, so it can run in the browser
(it asks for Pillow 12; install it without that version check or bundle the
file, and test when the lesson is built). Lesson order lives in one file, so
it is easy to change; the first draft follows the story: HTTP → HTML +
BeautifulSoup → URLs → robots.txt → Crawling → Images → Charts → Regex.

**Format (may still be adjusted).** Content lives in `content/`, versioned in
git, never in MongoDB:
- `content/expeditions/<id>/expedition.yaml`: title, story, lesson order, and
  the simulated site folder.
- `content/expeditions/<id>/<lesson>/lesson.yaml`: lesson title, topic, and
  activity order (Checkpoints, then one Milestone last).
- One **Markdown file per activity** with a YAML header (id, version, stage,
  type, difficulty, sources, functions it provides or uses) and sections for
  the story, the short teaching text, the task, starter code, the hidden check,
  and hints. Python stays readable (no escaping, unlike JSON).
- A build step validates every file (missing or misspelled fields fail the
  build) and turns the content into one JSON file the app imports.

**Every activity cites its CS 111 sources.** `content/sources/cs111-web.yaml`
lists every source item by ID: reading quiz sections, lab problems, lectures,
HW05, P04, and PC4 parts. Activities reference those IDs (for example
`lab/hyperlinks#Q8`), and the build rejects unknown IDs. `npm run
content:coverage` lists each source item with the activities that cover it, so
gaps are visible. The public repo holds only these IDs and PyTrek's own short
labels, never CS 111's quiz or assignment text (the course repo is private).

**Graded-work caution.** The pilot (12/1) comes just before HW05 (12/4), P04
(12/7), PC4 (12/9), and Exam 4 (12/10). Activities teach the same skills on the
park site but should not hand out working answers to graded functions
(`parse_robots`, `can_follow_link`, the P04 crawler). Confirm with the
professor before the pilot.

## 10. Story presentation and maps (11/19/2026)

- **No emojis anywhere** in the interface or content (they look tacky and
  read as AI-made). Markers like the Milestone flag are custom drawn SVGs.
- **Expedition page = a ranger's sketch map**: hand-drawn look on paper,
  pencil contour lines, a dashed trail winding uphill through the lesson
  stops to the summit (the boss fight), labels in the ranger handwriting font.
  (Later: the home page becomes a map of all expeditions joined by a dashed
  line up to a summit.)
- **Opening story, first visit only, re-readable from the map:**
  1. A note from a **warm veteran mentor** (the senior ranger) giving the
     background and the hook.
  2. Then a screen of **humorous reviews** from hikers who got lost, from a
     fake review site. Idea for later: students scrape that review site to
     measure the damage, and again after the fix to see the reviews recover.
- **Each lesson** opens with a short ranger note (first visit, re-readable)
  and ends with an outro note.
- **Clue at each Milestone**: finishing it reveals a clue for the case board.
  Clues must follow from what the student's code just found (e.g. lesson 1's
  404 checks show pages were removed, not broken).
- **Rogue AI messages**: the agent leaves occasional notes in its own terminal
  font, so the villain feels present.
- **Activity stories advance the mystery**, not just set the scene.
- **Multiple-choice wrong answers are plausible misconceptions**, so choosing
  one teaches something.
- Character names are placeholders until the user picks: senior ranger
  **Ruth Calloway**, rogue agent **SCOUT-7**, review site **TrailTalk**.
