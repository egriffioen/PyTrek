---
# Graded-work caution: this is close to HW05's can_follow_link. Keep it
# simpler than HW05 (no user-agent groups, no same-domain check) and confirm
# with the professor before the pilot.
id: robots-01
version: 1
title: Check the ranger rules
stage: checkpoint
type: finish
difficulty: medium
sources:
  - rq/robots-txt#robots-structure
  - rq/robots-txt#matching-rules
  - rq/hyperlinks#urlparse
  - hw/05#part-2-task-1
  - lecture/l23
provides: [is_allowed]
---

## Story

The rangers posted rules at the trailhead. Polite explorers (and polite
programs) follow them.

## Learn

Sites list the places bots shouldn't go in `/robots.txt`. Each
`Disallow: /some/path/` line means "don't visit any URL whose path starts with
this." `urlparse(url).path` gives you the path part of a URL.

## Task

Write `is_allowed(url)` that downloads `https://trailnet.test/robots.txt` and
returns `False` if the URL's path starts with any disallowed path, otherwise
`True`.

```python starter
import requests
from urllib.parse import urlparse

def is_allowed(url):
    """Return True if robots.txt lets us visit url."""
    rules = requests.get("https://trailnet.test/robots.txt").text
    path = urlparse(url).path
    # TODO: check each "Disallow:" line in rules
    return True

print(is_allowed("https://trailnet.test/trails/"))          # should be True
print(is_allowed("https://trailnet.test/ranger/log.html"))  # should be False
```

```python check
def check(ns, out):
    f = ns.get("is_allowed")
    if not callable(f):
        return False, "Define a function named is_allowed(url)."
    before = len(LOG)
    cases = [("/", True), ("/trails/", True), ("/trails/aspen-loop.html", True),
             ("/ranger/log.html", False), ("/ranger/", False), ("/drafts/new-trail.html", False)]
    for path, expected in cases:
        result = f(B + path)
        if result != expected:
            return False, f"is_allowed('{B}{path}') returned {result!r}, but it should be {expected}."
    if not any(u.endswith("/robots.txt") for u in LOG[before:]):
        return False, "Right answers, but read the rules from robots.txt instead of typing them into your code."
    return True, "You follow the ranger rules: /ranger/ and /drafts/ are off-limits."
```

## Hints

- Use `rules.splitlines()` and look at lines that start with `"Disallow:"`.
- Take the part after the colon, `.strip()` it, and check `path.startswith(...)`.
