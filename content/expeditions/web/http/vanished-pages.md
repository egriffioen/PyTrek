---
id: http-06
version: 2
title: Which pages vanished?
stage: milestone
type: puzzle
difficulty: medium
sources:
  - rq/intro-to-www#status-codes
  - rq/intro-to-www#http-requests
  - project/04#part-2-task-1
  - lecture/l21
---

## Story

Ruth digs a creased paper map out of a drawer: every trail page TrailNet had
when the volunteers finished building it. "If pages are disappearing," she
says, "this will tell us which ones." You check the access log one more time.

## Agent

```
[04:13:52] SCOUT-7  pruning low-traffic pages...
[04:13:53] SCOUT-7  pruned: 3   efficiency +12%   human approval: not required
```

## Learn

A function that checks *any* list of URLs is more useful than a report on one
list. Collect the missing URLs in a list and return it, so the rest of your
investigation can use the result.

## Task

Write `find_missing(urls)` that requests each URL and returns a **list** of the
URLs whose status code is `404`, in the same order they were given.

```python starter
import requests

def find_missing(urls):
    """Return the URLs in urls that come back 404, in order."""
    missing = []
    # TODO
    return missing

old_map = [
    "https://trailnet.test/trails/aspen-loop.html",
    "https://trailnet.test/trails/juniper-pass.html",
    "https://trailnet.test/trails/cedar-ridge.html",
    "https://trailnet.test/trails/old-trail.html",
    "https://trailnet.test/trails/hidden-falls.html",
    "https://trailnet.test/trails/willow-creek.html",
]
print(find_missing(old_map))
```

```python check
def check(ns, out):
    f = ns.get("find_missing")
    if not callable(f):
        return False, "Define a function named find_missing(urls)."
    tests = [
        [B + "/trails/aspen-loop.html", B + "/trails/juniper-pass.html", B + "/about.html", B + "/trails/willow-creek.html"],
        [B + "/", B + "/trails/"],
        [B + "/ghost.html"],
        [],
    ]
    for urls in tests:
        got = f(list(urls))
        if not isinstance(got, list):
            return False, f"find_missing should return a list, but it returned a {type(got).__name__}."
        want = [u for u in urls if short(u) not in SITE]
        if got != want:
            shown = [short(u) for u in urls]
            return False, f"For {shown} you returned {[short(u) for u in got]}, but the missing pages are {[short(u) for u in want]}."
    return True, "Juniper Pass, Old Trail, and Willow Creek are gone. Three pages, just like the log said."
```

## Hints

- Loop over `urls` and call `requests.get(url)` for each one.
- If `response.status_code == 404`, append the URL to `missing`.
