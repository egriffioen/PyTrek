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
  **no authoring UI**. Content is written as files and loaded into the database.
- **Independent learners:** anyone can use PyTrek without belonging to a class.
- **Classes are preferred:** students can be tied to teachers and class sections.

## 3. Grades, privacy, and teacher visibility (11/16/2026)

**Decision:** PyTrek is never a gradebook. Grades live only in Canvas.
- Students create an account with any username they want (no limits on
  nicknames) and can join a class section.
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
