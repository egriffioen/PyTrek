---
id: http-03
version: 2
title: Knock on the door
stage: checkpoint
type: tweak
difficulty: easy
sources:
  - rq/intro-to-www#http-requests
  - rq/intro-to-www#status-codes
  - rq/html-tags-and-attributes#using-requests
  - project/04#part-2-task-1
  - lecture/l21
---

## Story

Trail Mix Tom's review says the website called Old Trail *open* while the
trailhead sign said *closed*. Start with a page nobody has complained about,
Aspen Loop, so you know what a healthy answer looks like. Then knock on Old
Trail's door.

## Learn

`requests.get(url)` sends a request and gives back a **response** object.
`response.status_code` is the server's status code, and `response.text` is
the page it sent back.

## Task

Run the code to see Aspen Loop's status code. Then change **one thing** so it
requests `https://trailnet.test/trails/old-trail.html` instead, and run it
again.

```python starter
import requests

response = requests.get("https://trailnet.test/trails/aspen-loop.html")
print(response.status_code)
```

```python check
def check(ns, out):
    asked = [short(u) for u in LOG]
    if "/trails/old-trail.html" not in asked:
        return False, "That's the healthy answer from Aspen Loop. Now change the URL to the Old Trail page."
    if "404" not in out:
        return False, "You requested the Old Trail page; now print its status_code."
    return True, "404. TrailNet answered you, but it has nothing at that address anymore."
```

## Hints

- Only the URL inside `requests.get(...)` needs to change.
- Replace `aspen-loop.html` with `old-trail.html`.
