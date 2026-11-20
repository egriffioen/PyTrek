---
id: http-05
version: 2
title: The trail report
stage: checkpoint
type: finish
difficulty: medium
sources:
  - rq/intro-to-www#status-codes
  - rq/intro-to-www#http-requests
  - project/04#part-2-task-1
  - lecture/l21
---

## Story

Ruth wants a report she can pin on the board: which trails from this morning's
complaints are **OPEN** on the website, and which are **MISSING**. While you
work, you notice something odd in TrailNet's access log.

## Agent

```
[04:12:07] SCOUT-7  crawl #0412 started   pages/sec: 340
[04:12:07] SCOUT-7  robots.txt: skipped (inefficient)
```

## Learn

A status code of `200` means the page was found and sent. Anything in the 400s
means the request asked for something the server can't give, like `404 Not
Found`. Check `response.status_code` before you trust `response.text`.

## Task

For each URL in `trails`, print the URL's path, then `OPEN` if its status code
is 200, otherwise `MISSING`. For example: `/trails/aspen-loop.html OPEN`.

```python starter
import requests
from urllib.parse import urlparse

trails = [
    "https://trailnet.test/trails/aspen-loop.html",
    "https://trailnet.test/trails/old-trail.html",
    "https://trailnet.test/trails/cedar-ridge.html",
]

for url in trails:
    response = requests.get(url)
    path = urlparse(url).path
    # TODO: print the path, then OPEN or MISSING
```

```python check
def check(ns, out):
    lines = [line.split() for line in out.strip().splitlines() if line.strip()]
    expected = [["/trails/aspen-loop.html", "OPEN"], ["/trails/old-trail.html", "MISSING"],
                ["/trails/cedar-ridge.html", "OPEN"]]
    if lines == expected:
        return True, "Report pinned to the board: Aspen Loop and Cedar Ridge are up, Old Trail is gone."
    for want in expected:
        if want not in lines:
            return False, f"I expected a line '{' '.join(want)}' in your output."
    return False, "Print exactly one line per trail: the path, a space, then OPEN or MISSING."
```

## Hints

- Use an `if` on `response.status_code == 200`.
- `print(path, "OPEN")` prints the path and the word with a space between them.
