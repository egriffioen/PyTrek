---
id: crawling-01
version: 1
title: Map the whole park
stage: checkpoint
type: finish
difficulty: hard
sources:
  - rq/web-scraping#crawling-multiple-pages
  - rq/web-scraping#filtering-scope
  - rq/intro-to-www#status-codes
  - lab/web-scraping#Q1
  - project/04#part-4-task-1
  - project/04#part-4-task-3
  - lecture/l24
uses: [get_links, is_allowed]
provides: [crawl]
---

## Story

Time to map every public trail page, starting from the homepage and following
signposts.

## Learn

A **crawler** keeps a list of pages *to visit* and a set of pages *already
visited*. Take a URL off the list, skip it if you've seen it, fetch it, then
add its links to the to-visit list. Your `get_links()` and `is_allowed()` from
earlier checkpoints are already loaded, so reuse them!

## Task

Write `crawl(start)` that returns a **set** of every page it successfully
visited. Only visit pages that are on `trailnet.test`, allowed by robots.txt,
and return `status_code == 200`.

```python starter
import requests
from urllib.parse import urlparse
# get_links(url) and is_allowed(url) from earlier checkpoints are already loaded.

def crawl(start):
    to_visit = [start]
    visited = set()
    while to_visit:
        url = to_visit.pop()
        # TODO: skip pages you've seen, other websites, and disallowed pages
        # TODO: fetch the page; only keep it if status_code is 200
        # TODO: add its links to to_visit
    return visited

pages = crawl("https://trailnet.test/")
print(len(pages), "pages found")
for page in sorted(pages):
    print(page)
```

```python check
def check(ns, out):
    f = ns.get("crawl")
    if not callable(f):
        return False, "Define a function named crawl(start)."
    before = len(LOG)
    got = f(B + "/")
    if not isinstance(got, (set, list, tuple)):
        return False, f"crawl should return a set, but it returned a {type(got).__name__}."
    got = {norm(u) for u in got}
    exp = {B + "/", B + "/about.html", B + "/trails/", B + "/trails/aspen-loop.html",
           B + "/trails/cedar-ridge.html", B + "/trails/hidden-falls.html"}
    bad = sorted(u for u in got if "/ranger/" in u or "/drafts/" in u)
    if bad:
        return False, f"Your crawler went into {short(bad[0])}, which robots.txt disallows. Check is_allowed() before fetching."
    if any("old-trail" in u for u in got):
        return False, "old-trail.html is closed (404), but it's in your results. Only keep pages whose status_code is 200."
    if got != exp:
        missing = ", ".join(short(u) for u in sorted(exp - got))
        return False, f"You found {len(got)} of {len(exp)} public pages. Missing: {missing}."
    n = len(LOG) - before
    return True, f"Park mapped: all {len(exp)} public pages, using {n} requests."
```

## Hints

- Start the loop with `if url in visited: continue`.
- Check `urlparse(url).hostname == "trailnet.test"` and `is_allowed(url)` before fetching.
- If `requests.get(url).status_code == 200`, add the URL to `visited` and
  `to_visit.extend(get_links(url))`.
